import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { listPlans } from "@/lib/billing.functions";
import { PLAN_FEATURES, formatMoney } from "@/lib/billing-config";
import { cn } from "@/lib/utils";

export function PricingSection({ compact = false }: { compact?: boolean }) {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [interval, setInterval] = useState<"monthly" | "yearly">("monthly");

  const { data: plans, isLoading } = useQuery({
    queryKey: ["plans"],
    queryFn: () => listPlans(),
  });

  const sorted = useMemo(() => (plans ?? []).slice().sort((a, b) => a.sort_order - b.sort_order), [plans]);

  function choose(code: string) {
    const search = { plan: code, interval };
    if (!user) {
      navigate({ to: "/signup", search });
    } else {
      navigate({ to: "/checkout", search });
    }
  }

  return (
    <section id="pricing" className={cn("relative px-5", compact ? "py-16" : "py-24")}>
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold tracking-[0.2em] text-primary">
            {t("pricing.eyebrow")}
          </p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            {t("pricing.title")}
          </h2>
          <p className="mt-4 text-muted-foreground">{t("pricing.subtitle")}</p>
        </div>

        <div className="mt-8 flex items-center justify-center">
          <div className="glass flex items-center gap-1 rounded-full p-1">
            {(["monthly", "yearly"] as const).map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setInterval(i)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                  interval === i
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t(i === "monthly" ? "pricing.monthly" : "pricing.yearly")}
                {i === "yearly" && (
                  <span className="ml-2 rounded-full bg-success/20 px-2 py-0.5 text-[10px] font-semibold text-success">
                    {t("pricing.save")}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <p className="mt-12 text-center text-sm text-muted-foreground">{t("pricing.loading")}</p>
        ) : (
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {sorted.map((plan) => {
              const price = interval === "yearly" ? plan.yearly_price : plan.monthly_price;
              const popular = plan.is_popular;
              return (
                <div
                  key={plan.id}
                  className={cn(
                    "relative flex flex-col rounded-3xl border border-border p-7 transition-all duration-300 hover:-translate-y-1",
                    popular
                      ? "bg-surface-strong shadow-glow lg:scale-[1.04]"
                      : "glass hover:border-primary/30",
                  )}
                >
                  {popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[10px] font-bold tracking-wider text-primary-foreground">
                      {t("pricing.popular")}
                    </span>
                  )}
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {lang === "en" ? plan.description_en : plan.description_fr}
                  </p>
                  <div className="mt-6 flex items-end gap-1">
                    <span className="text-5xl font-bold tracking-tight">
                      {formatMoney(Number(price), plan.currency, lang)}
                    </span>
                    <span className="pb-2 text-sm text-muted-foreground">
                      {t(interval === "yearly" ? "pricing.perYear" : "pricing.perMonth")}
                    </span>
                  </div>
                  {interval === "yearly" && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t("pricing.billedYearly")}
                    </p>
                  )}
                  <div className="mt-5 flex items-center gap-2 rounded-xl border border-border bg-background/40 px-3 py-2">
                    <Sparkles className="size-4 text-primary" />
                    <span className="text-sm font-semibold">
                      {plan.monthly_credits.toLocaleString(lang === "en" ? "en-US" : "fr-FR")}{" "}
                      <span className="font-normal text-muted-foreground">
                        {t("pricing.credits")}
                      </span>
                    </span>
                  </div>
                  <ul className="mt-6 flex-1 space-y-3">
                    {(PLAN_FEATURES[plan.code] ?? []).map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                        <span className="text-muted-foreground">{t(f)}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="mt-7 w-full"
                    size="lg"
                    variant={popular ? "hero" : "glass"}
                    onClick={() => choose(plan.code)}
                  >
                    {t("pricing.cta")}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
