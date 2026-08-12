import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/site/Navbar";
import { useI18n } from "@/lib/i18n";
import { listPlans, getPaymentsStatus, startCheckout } from "@/lib/billing.functions";
import { formatMoney } from "@/lib/billing-config";

type Search = { plan?: string | undefined; interval?: "monthly" | "yearly" | undefined };

export const Route = createFileRoute("/_authenticated/checkout")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    plan: typeof s["plan"] === "string" ? s["plan"] : undefined,
    interval: s["interval"] === "yearly" ? "yearly" : "monthly",
  }),
  head: () => ({
    meta: [
      { title: "Paiement — Clipora AI" },
      { name: "description", content: "Finalisez votre abonnement Clipora AI en paiement sécurisé." },
      { property: "og:title", content: "Paiement — Clipora AI" },
      { property: "og:description", content: "Paiement sécurisé traité par Flutterwave." },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { t, lang } = useI18n();
  const { plan: planCode, interval = "monthly" } = Route.useSearch();
  const [submitting, setSubmitting] = useState(false);

  const { data: plans } = useQuery({ queryKey: ["plans"], queryFn: () => listPlans() });
  const { data: status } = useQuery({ queryKey: ["payments-status"], queryFn: () => getPaymentsStatus() });

  const plan = (plans ?? []).find((p) => p.code === planCode);
  const amount = plan ? Number(interval === "yearly" ? plan.yearly_price : plan.monthly_price) : 0;

  async function pay() {
    if (!plan) return;
    setSubmitting(true);
    try {
      const res = await startCheckout({
        data: { planCode: plan.code as "starter" | "pro" | "business", interval },
      });
      window.location.href = res.link;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "error";
      toast.error(msg.includes("FLUTTERWAVE_NOT_CONFIGURED") ? t("checkout.notConfigured") : msg);
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-hero-aura min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-lg px-5 pt-36 pb-24">
        <div className="glass rounded-3xl p-8 shadow-elevated">
          <h1 className="text-2xl font-bold tracking-tight">{t("checkout.title")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("checkout.subtitle")}</p>

          {!plan ? (
            <div className="mt-8 space-y-4">
              <p className="text-sm text-muted-foreground">{t("checkout.noPlan")}</p>
              <Button variant="hero" asChild>
                <Link to="/pricing">{t("checkout.choosePlan")}</Link>
              </Button>
            </div>
          ) : (
            <>
              <dl className="mt-7 space-y-3 rounded-2xl border border-border bg-background/50 p-5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">{t("checkout.plan")}</dt>
                  <dd className="font-semibold">{plan.name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">{t("checkout.interval")}</dt>
                  <dd className="font-semibold">
                    {t(interval === "yearly" ? "pricing.yearly" : "pricing.monthly")}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">{t("pricing.credits")}</dt>
                  <dd className="font-semibold">{plan.monthly_credits}</dd>
                </div>
                <div className="flex justify-between border-t border-border pt-3 text-base">
                  <dt className="font-semibold">{t("checkout.total")}</dt>
                  <dd className="font-bold text-primary">
                    {formatMoney(amount, plan.currency, lang)}
                  </dd>
                </div>
              </dl>

              {status && !status.configured && (
                <p className="mt-4 rounded-xl border border-warning/30 bg-warning/10 p-3 text-xs text-warning">
                  {t("checkout.notConfigured")}
                </p>
              )}

              <Button
                variant="hero"
                size="lg"
                className="mt-6 w-full"
                onClick={pay}
                disabled={submitting}
              >
                {submitting && <Loader2 className="size-4 animate-spin" />}
                {t("checkout.pay")}
              </Button>
              <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="size-3.5 text-primary" /> {t("checkout.securedBy")}
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
