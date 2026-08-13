import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/site/Navbar";
import { useI18n } from "@/lib/i18n";
import { getAdminOverview, adminUpdatePlan } from "@/lib/billing.functions";
import { formatMoney } from "@/lib/billing-config";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Administration — Clipora AI" },
      {
        name: "description",
        content: "Pilotage des utilisateurs, abonnements, revenus et plans Clipora AI.",
      },
      { property: "og:title", content: "Administration — Clipora AI" },
      { property: "og:description", content: "Tableau de bord administrateur Clipora AI." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { t, lang } = useI18n();
  const locale = lang === "en" ? "en-US" : "fr-FR";
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => getAdminOverview(),
    retry: false,
  });

  if (isLoading) {
    return (
      <Shell>
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      </Shell>
    );
  }

  if (isError || !data) {
    return (
      <Shell>
        <p className="glass rounded-2xl p-6 text-sm text-destructive">{t("admin.denied")}</p>
      </Shell>
    );
  }

  const m = data.metrics;

  return (
    <Shell>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Metric label={t("admin.users")} value={String(m.users)} />
        <Metric label={t("admin.activeSubs")} value={String(m.activeSubs)} />
        <Metric label={t("admin.revenue")} value={formatMoney(m.revenue, "EUR", lang)} />
        <Metric label={t("admin.failed")} value={String(m.failed)} />
        <Metric label={t("admin.cancellations")} value={String(m.cancellations)} />
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight">{t("admin.plans")}</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {data.plans.map((p) => (
            <PlanCard key={p.id} plan={p} />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold tracking-tight">{t("admin.payments")}</h2>
        <div className="glass mt-4 overflow-x-auto rounded-2xl">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr className="border-b border-border/60">
                <th className="px-4 py-3 font-medium">tx_ref</th>
                <th className="px-4 py-3 font-medium">{t("billing.amount")}</th>
                <th className="px-4 py-3 font-medium">{t("billing.status")}</th>
                <th className="px-4 py-3 font-medium">{t("billing.date")}</th>
              </tr>
            </thead>
            <tbody>
              {data.payments.slice(0, 50).map((p) => (
                <tr key={p.id} className="border-b border-border/40 last:border-0">
                  <td className="px-4 py-3 font-mono text-[11px]">{p.tx_ref}</td>
                  <td className="px-4 py-3">
                    {formatMoney(Number(p.amount), p.currency, lang)}
                  </td>
                  <td className="px-4 py-3">{t(`status.${p.status}`)}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(p.created_at).toLocaleDateString(locale)}
                  </td>
                </tr>
              ))}
              {data.payments.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-muted-foreground">
                    {t("common.none")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-5 pt-32 pb-24">
        <h1 className="text-3xl font-bold tracking-tight">{t("admin.title")}</h1>
        <div className="mt-8">{children}</div>
      </main>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-2xl p-5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
    </div>
  );
}

type PlanRow = {
  id: string;
  code: string;
  name: string;
  monthly_price: number;
  yearly_price: number;
  monthly_credits: number;
  flw_plan_id_monthly: string | null;
  flw_plan_id_yearly: string | null;
};

function PlanCard({ plan }: { plan: PlanRow }) {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    monthly_price: String(plan.monthly_price),
    yearly_price: String(plan.yearly_price),
    monthly_credits: String(plan.monthly_credits),
    flw_plan_id_monthly: plan.flw_plan_id_monthly ?? "",
    flw_plan_id_yearly: plan.flw_plan_id_yearly ?? "",
  });

  const mutation = useMutation({
    mutationFn: () =>
      adminUpdatePlan({
        data: {
          id: plan.id,
          monthly_price: Number(form.monthly_price),
          yearly_price: Number(form.yearly_price),
          monthly_credits: Number(form.monthly_credits),
          flw_plan_id_monthly: form.flw_plan_id_monthly.trim() || null,
          flw_plan_id_yearly: form.flw_plan_id_yearly.trim() || null,
        },
      }),
    onSuccess: () => {
      toast.success(t("admin.saved"));
      qc.invalidateQueries({ queryKey: ["admin-overview"] });
      qc.invalidateQueries({ queryKey: ["plans"] });
    },
    onError: () => toast.error(t("common.error")),
  });

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-baseline justify-between">
        <h3 className="font-semibold">{plan.name}</h3>
        <span className="font-mono text-[11px] text-muted-foreground">{plan.code}</span>
      </div>
      <div className="mt-4 space-y-3">
        <Field
          label={t("admin.plan.monthly")}
          value={form.monthly_price}
          onChange={(v) => setForm((f) => ({ ...f, monthly_price: v }))}
        />
        <Field
          label={t("admin.plan.yearly")}
          value={form.yearly_price}
          onChange={(v) => setForm((f) => ({ ...f, yearly_price: v }))}
        />
        <Field
          label={t("admin.plan.credits")}
          value={form.monthly_credits}
          onChange={(v) => setForm((f) => ({ ...f, monthly_credits: v }))}
        />
        <Field
          label={t("admin.plan.flwMonthly")}
          value={form.flw_plan_id_monthly}
          onChange={(v) => setForm((f) => ({ ...f, flw_plan_id_monthly: v }))}
        />
        <Field
          label={t("admin.plan.flwYearly")}
          value={form.flw_plan_id_yearly}
          onChange={(v) => setForm((f) => ({ ...f, flw_plan_id_yearly: v }))}
        />
      </div>
      <Button
        variant="hero"
        size="sm"
        className="mt-5 w-full"
        disabled={mutation.isPending}
        onClick={() => mutation.mutate()}
      >
        {t("admin.save")}
      </Button>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <Input className="mt-1" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}
