import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/site/Navbar";
import { useI18n } from "@/lib/i18n";
import { getMyBilling, cancelSubscription } from "@/lib/billing.functions";
import { formatMoney } from "@/lib/billing-config";

export const Route = createFileRoute("/_authenticated/billing")({
  head: () => ({
    meta: [
      { title: "Facturation — Clipora AI" },
      { name: "description", content: "Gérez votre plan, vos crédits et votre historique de paiement." },
      { property: "og:title", content: "Facturation — Clipora AI" },
      { property: "og:description", content: "Plan, crédits, prochaine échéance et paiements." },
    ],
  }),
  component: BillingPage,
});

function BillingPage() {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const [confirming, setConfirming] = useState(false);
  const { data, isLoading } = useQuery({ queryKey: ["billing"], queryFn: () => getMyBilling() });
  const locale = lang === "en" ? "en-US" : "fr-FR";

  async function doCancel() {
    try {
      await cancelSubscription();
      toast.success(t("billing.canceled"));
      setConfirming(false);
      qc.invalidateQueries({ queryKey: ["billing"] });
    } catch {
      toast.error(t("common.error"));
    }
  }

  const sub = data?.subscription;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-5 pt-32 pb-24">
        <h1 className="text-3xl font-bold tracking-tight">{t("billing.title")}</h1>

        {isLoading ? (
          <p className="mt-8 text-sm text-muted-foreground">{t("common.loading")}</p>
        ) : (
          <>
            <div className="glass mt-8 rounded-3xl p-6">
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <Field label={t("billing.currentPlan")} value={sub?.subscription_plans?.name ?? t("common.none")} />
                <Field
                  label={t("billing.status")}
                  value={sub ? t(`status.${sub.status}`) : t("common.none")}
                />
                <Field
                  label={t("billing.nextBilling")}
                  value={
                    sub?.current_period_end
                      ? new Date(sub.current_period_end).toLocaleDateString(locale)
                      : t("common.none")
                  }
                />
                <Field
                  label={t("billing.credits")}
                  value={`${data?.credits?.balance ?? 0} / ${data?.credits?.monthly_allowance ?? 0}`}
                />
              </div>

              {sub?.cancel_at_period_end && (
                <p className="mt-5 rounded-xl border border-warning/30 bg-warning/10 p-3 text-xs text-warning">
                  {t("billing.cancelScheduled")}
                </p>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <Button variant="hero" asChild>
                  <Link to="/pricing">{t("billing.changePlan")}</Link>
                </Button>
                {sub && !sub.cancel_at_period_end && sub.status === "active" && (
                  <Button variant="outline" onClick={() => setConfirming(true)}>
                    {t("billing.cancel")}
                  </Button>
                )}
                {data?.isAdmin && (
                  <Button variant="ghost" asChild>
                    <Link to="/admin">{t("admin.title")}</Link>
                  </Button>
                )}
              </div>

              {confirming && (
                <div className="mt-5 rounded-2xl border border-border bg-background/60 p-5">
                  <h3 className="text-sm font-semibold">{t("billing.cancelConfirm.title")}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t("billing.cancelConfirm.body")}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Button variant="destructive" size="sm" onClick={doCancel}>
                      {t("billing.cancelConfirm.confirm")}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
                      {t("billing.cancelConfirm.back")}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="glass mt-6 rounded-3xl p-6">
              <h2 className="text-lg font-semibold">{t("billing.history")}</h2>
              {(data?.payments ?? []).length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">{t("billing.noPayments")}</p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-muted-foreground">
                        <th className="pb-2">{t("billing.date")}</th>
                        <th className="pb-2">{t("billing.amount")}</th>
                        <th className="pb-2">{t("billing.status")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data?.payments ?? []).map((p) => (
                        <tr key={p.id} className="border-t border-border">
                          <td className="py-2 text-muted-foreground">
                            {new Date(p.created_at).toLocaleDateString(locale)}
                          </td>
                          <td className="py-2 font-medium">
                            {formatMoney(Number(p.amount), p.currency, lang)}
                          </td>
                          <td className="py-2">{t(`status.${p.status}`)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
