import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

/** Public: active plans, read straight from the database. */
export const listPlans = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("subscription_plans")
    .select(
      "id, code, name, description_en, description_fr, currency, monthly_price, yearly_price, monthly_credits, is_popular, sort_order",
    )
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw new Error(error.message);
  return data ?? [];
});

/** Public: whether Flutterwave credentials are present (no secret values leak). */
export const getPaymentsStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { isPaymentsConfigured } = await import("@/lib/billing.server");
  const { readFlwConfig } = await import("@/lib/flutterwave.server");
  const cfg = readFlwConfig();
  return { configured: isPaymentsConfigured(), environment: cfg?.environment ?? "sandbox" };
});

export const getMyBilling = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [profile, sub, credits, payments, roles] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase
        .from("subscriptions")
        .select("*, subscription_plans(*)")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase.from("user_credits").select("*").eq("user_id", userId).maybeSingle(),
      supabase
        .from("payments")
        .select("id, amount, currency, status, billing_interval, created_at, tx_ref")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);

    const now = Date.now();
    const subscription = sub.data ?? null;
    const periodEnd = subscription?.current_period_end
      ? new Date(subscription.current_period_end).getTime()
      : null;
    const hasAccess =
      !!subscription &&
      ["active", "canceled"].includes(subscription.status) &&
      periodEnd !== null &&
      periodEnd > now;

    return {
      profile: profile.data ?? null,
      subscription,
      credits: credits.data ?? null,
      payments: payments.data ?? [],
      isAdmin: (roles.data ?? []).some((r) => r.role === "admin"),
      hasAccess,
    };
  });

export const startCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        planCode: z.enum(["starter", "pro", "business"]),
        interval: z.enum(["monthly", "yearly"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { createCheckoutSession } = await import("@/lib/billing.server");
    const request = getRequest();
    const origin = new URL(request.url).origin;

    const { data: profile } = await context.supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", context.userId)
      .maybeSingle();

    const email = (context.claims["email"] as string | undefined) ?? profile?.email ?? "";
    if (!email) throw new Error("MISSING_EMAIL");

    return createCheckoutSession({
      userId: context.userId,
      email,
      fullName: profile?.full_name ?? null,
      planCode: data.planCode,
      interval: data.interval,
      origin,
    });
  });

/** Server-side verification. The browser can never grant itself access. */
export const verifyPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        txRef: z.string().min(4).max(200).optional(),
        transactionId: z.string().min(1).max(64).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { verifyAndApply } = await import("@/lib/billing.server");
    return verifyAndApply({
      txRef: data.txRef ?? null,
      transactionId: data.transactionId ?? null,
    });
  });

export const cancelSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: sub } = await supabaseAdmin
      .from("subscriptions")
      .select("id, flw_subscription_id, status")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (!sub) throw new Error("NO_SUBSCRIPTION");

    if (sub.flw_subscription_id) {
      try {
        const { readFlwConfig, cancelFlwSubscription } = await import("@/lib/flutterwave.server");
        const cfg = readFlwConfig();
        if (cfg) await cancelFlwSubscription(cfg, sub.flw_subscription_id);
      } catch (e) {
        console.error("Flutterwave cancel failed", e);
      }
    }

    const { error } = await supabaseAdmin
      .from("subscriptions")
      .update({
        cancel_at_period_end: true,
        status: "canceled",
        canceled_at: new Date().toISOString(),
      })
      .eq("id", sub.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Deducts credits for an AI action. Refuses when the balance is insufficient. */
export const consumeCredits = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ amount: z.number().int().min(1).max(100), reason: z.string().max(60) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: result, error } = await supabaseAdmin.rpc("deduct_credits", {
      _user_id: context.userId,
      _amount: data.amount,
      _reason: data.reason,
    });
    if (error) throw new Error(error.message);
    return result as { ok: boolean; balance: number };
  });

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("FORBIDDEN");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [plans, subs, payments, profiles] = await Promise.all([
      supabaseAdmin.from("subscription_plans").select("*").order("sort_order"),
      supabaseAdmin.from("subscriptions").select("*, subscription_plans(name, code)"),
      supabaseAdmin
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200),
      supabaseAdmin.from("profiles").select("id, email, full_name, created_at"),
    ]);

    const allPayments = payments.data ?? [];
    const revenue = allPayments
      .filter((p) => p.status === "successful")
      .reduce((sum, p) => sum + Number(p.amount), 0);

    return {
      plans: plans.data ?? [],
      subscriptions: subs.data ?? [],
      payments: allPayments,
      profiles: profiles.data ?? [],
      metrics: {
        users: (profiles.data ?? []).length,
        activeSubs: (subs.data ?? []).filter((s) => s.status === "active").length,
        revenue,
        failed: allPayments.filter((p) => p.status === "failed").length,
        cancellations: (subs.data ?? []).filter((s) => s.cancel_at_period_end).length,
      },
    };
  });

export const adminUpdatePlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        monthly_price: z.number().min(0).max(100000),
        yearly_price: z.number().min(0).max(1000000),
        monthly_credits: z.number().int().min(0).max(1000000),
        flw_plan_id_monthly: z.string().max(120).nullable(),
        flw_plan_id_yearly: z.string().max(120).nullable(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("FORBIDDEN");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { id, ...patch } = data;
    const { error } = await supabaseAdmin.from("subscription_plans").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
