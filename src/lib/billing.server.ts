/**
 * Server-only billing domain logic. Never imported from client code.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Json } from "@/integrations/supabase/types";
import {
  initiatePayment,
  readFlwConfig,
  requireFlwConfig,
  verifyTransactionById,
  verifyTransactionByReference,
  type FlwTransaction,
} from "./flutterwave.server";

export type BillingInterval = "monthly" | "yearly";

export function isPaymentsConfigured(): boolean {
  return readFlwConfig() !== null;
}

export function periodEndFrom(start: Date, interval: BillingInterval): Date {
  const end = new Date(start.getTime());
  if (interval === "yearly") end.setUTCFullYear(end.getUTCFullYear() + 1);
  else end.setUTCMonth(end.getUTCMonth() + 1);
  return end;
}

export function makeTxRef(userId: string): string {
  const rand = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  return `clipora_${userId.slice(0, 8)}_${Date.now()}_${rand}`;
}

export async function getPlanByCode(code: string) {
  const { data, error } = await supabaseAdmin
    .from("subscription_plans")
    .select("*")
    .eq("code", code)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

/**
 * Creates a pending payment row and a Flutterwave checkout link.
 * The amount and currency come from the DATABASE, never from the browser.
 */
export async function createCheckoutSession(args: {
  userId: string;
  email: string;
  fullName: string | null;
  planCode: string;
  interval: BillingInterval;
  origin: string;
}) {
  const cfg = requireFlwConfig();
  const plan = await getPlanByCode(args.planCode);
  if (!plan) throw new Error("PLAN_NOT_FOUND");

  const amount = Number(args.interval === "yearly" ? plan.yearly_price : plan.monthly_price);
  const currency = plan.currency;
  const paymentPlanId =
    args.interval === "yearly" ? plan.flw_plan_id_yearly : plan.flw_plan_id_monthly;

  const txRef = makeTxRef(args.userId);

  const { error: insertError } = await supabaseAdmin.from("payments").insert({
    user_id: args.userId,
    plan_id: plan.id,
    tx_ref: txRef,
    amount,
    currency,
    billing_interval: args.interval,
    status: "pending",
  });
  if (insertError) throw new Error(insertError.message);

  const { link } = await initiatePayment(cfg, {
    txRef,
    amount,
    currency,
    redirectUrl: `${args.origin}/payment/callback`,
    customerEmail: args.email,
    customerName: args.fullName,
    paymentPlanId,
    title: "Clipora AI",
    description: `${plan.name} — ${args.interval === "yearly" ? "yearly" : "monthly"}`,
    meta: {
      user_id: args.userId,
      plan_code: plan.code,
      billing_interval: args.interval,
    },
  });

  return { link, txRef, amount, currency, environment: cfg.environment };
}

type ActivationOutcome = {
  status: "successful" | "failed" | "pending";
  txRef: string;
};

/**
 * Single source of truth for turning a verified Flutterwave transaction into
 * subscription + credits. Idempotent: re-running for an already successful
 * payment is a no-op.
 */
export async function applyVerifiedTransaction(tx: FlwTransaction): Promise<ActivationOutcome> {
  const txRef = tx.tx_ref;

  const { data: payment, error } = await supabaseAdmin
    .from("payments")
    .select("*")
    .eq("tx_ref", txRef)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!payment) throw new Error("PAYMENT_NOT_FOUND");

  const normalized = (tx.status ?? "").toLowerCase();

  if (normalized !== "successful") {
    const status = normalized === "pending" ? "pending" : "failed";
    if (payment.status !== "successful") {
      await supabaseAdmin
        .from("payments")
        .update({
          status,
          flw_transaction_id: String(tx.id ?? ""),
          failure_reason: status === "failed" ? `Flutterwave status: ${tx.status}` : null,
          raw_response: tx as unknown as Json,
        })
        .eq("id", payment.id);
    }
    return { status: status as "failed" | "pending", txRef };
  }

  // amount/currency must match what WE recorded from the database
  if (
    Number(tx.amount) < Number(payment.amount) ||
    (tx.currency ?? "").toUpperCase() !== payment.currency.toUpperCase()
  ) {
    await supabaseAdmin
      .from("payments")
      .update({
        status: "failed",
        failure_reason: "AMOUNT_OR_CURRENCY_MISMATCH",
        flw_transaction_id: String(tx.id ?? ""),
        raw_response: tx as unknown as Json,
      })
      .eq("id", payment.id);
    return { status: "failed", txRef };
  }

  if (payment.status === "successful") {
    return { status: "successful", txRef }; // idempotent replay
  }

  const { data: plan } = await supabaseAdmin
    .from("subscription_plans")
    .select("*")
    .eq("id", payment.plan_id!)
    .maybeSingle();
  if (!plan) throw new Error("PLAN_NOT_FOUND");

  const interval = (payment.billing_interval as BillingInterval) ?? "monthly";
  const start = new Date();
  const end = periodEndFrom(start, interval);

  const { data: existing } = await supabaseAdmin
    .from("subscriptions")
    .select("id")
    .eq("user_id", payment.user_id!)
    .maybeSingle();

  const subPayload = {
    user_id: payment.user_id!,
    plan_id: plan.id,
    status: "active",
    billing_interval: interval,
    currency: payment.currency,
    amount: payment.amount,
    current_period_start: start.toISOString(),
    current_period_end: end.toISOString(),
    cancel_at_period_end: false,
    canceled_at: null,
    flw_plan_id: interval === "yearly" ? plan.flw_plan_id_yearly : plan.flw_plan_id_monthly,
    flw_customer_email: tx.customer?.email ?? null,
  };

  let subscriptionId: string;
  if (existing) {
    const { error: upErr } = await supabaseAdmin
      .from("subscriptions")
      .update(subPayload)
      .eq("id", existing.id);
    if (upErr) throw new Error(upErr.message);
    subscriptionId = existing.id;
  } else {
    const { data: inserted, error: insErr } = await supabaseAdmin
      .from("subscriptions")
      .insert(subPayload)
      .select("id")
      .single();
    if (insErr) throw new Error(insErr.message);
    subscriptionId = inserted.id;
  }

  await supabaseAdmin
    .from("payments")
    .update({
      status: "successful",
      flw_transaction_id: String(tx.id ?? ""),
      subscription_id: subscriptionId,
      raw_response: tx as unknown as Json,
    })
    .eq("id", payment.id);

  // reset the credit allowance for the new period
  await supabaseAdmin.from("user_credits").upsert(
    {
      user_id: payment.user_id!,
      balance: plan.monthly_credits,
      monthly_allowance: plan.monthly_credits,
      used_this_period: 0,
      reset_at: end.toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  await supabaseAdmin.from("credit_ledger").insert({
    user_id: payment.user_id!,
    delta: plan.monthly_credits,
    reason: "subscription_activated",
    metadata: { tx_ref: txRef, plan: plan.code, interval },
  });

  return { status: "successful", txRef };
}

/** Verifies with Flutterwave (never trusting the browser) then applies the result. */
export async function verifyAndApply(args: {
  txRef?: string | null;
  transactionId?: string | null;
}): Promise<ActivationOutcome> {
  const cfg = requireFlwConfig();
  let tx: FlwTransaction;
  if (args.transactionId) tx = await verifyTransactionById(cfg, args.transactionId);
  else if (args.txRef) tx = await verifyTransactionByReference(cfg, args.txRef);
  else throw new Error("MISSING_TRANSACTION_REFERENCE");
  return applyVerifiedTransaction(tx);
}

/** Records a webhook event exactly once. Returns false when already seen. */
export async function recordWebhookEvent(args: {
  eventKey: string;
  eventType: string | null;
  txRef: string | null;
  payload: unknown;
}): Promise<boolean> {
  const { error } = await supabaseAdmin.from("payment_events").insert({
    event_key: args.eventKey,
    event_type: args.eventType,
    tx_ref: args.txRef,
    payload: args.payload as Json,
  });
  if (error) {
    if (error.code === "23505") return false; // duplicate → already handled
    throw new Error(error.message);
  }
  return true;
}

export async function markWebhookProcessed(eventKey: string, err?: string) {
  await supabaseAdmin
    .from("payment_events")
    .update({ processed: !err, processing_error: err ?? null })
    .eq("event_key", eventKey);
}

export async function markSubscriptionPastDue(txRef: string) {
  const { data: payment } = await supabaseAdmin
    .from("payments")
    .select("user_id")
    .eq("tx_ref", txRef)
    .maybeSingle();
  if (!payment?.user_id) return;
  await supabaseAdmin
    .from("subscriptions")
    .update({ status: "past_due" })
    .eq("user_id", payment.user_id)
    .eq("status", "active");
}
