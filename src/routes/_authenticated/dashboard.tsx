import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Sparkles, Zap, Calendar, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Navbar } from "@/components/site/Navbar";
import { useI18n } from "@/lib/i18n";
import { getMyBilling, consumeCredits } from "@/lib/billing.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Tableau de bord — Clipora AI" },
      { name: "description", content: "Vos workflows IA, crédits et production dans un seul écran." },
      { property: "og:title", content: "Tableau de bord — Clipora AI" },
      { property: "og:description", content: "Pilotez votre production de contenu IA." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState<string[]>([]);

  const { data, isLoading } = useQuery({ queryKey: ["billing"], queryFn: () => getMyBilling() });

  async function run() {
    try {
      const res = await consumeCredits({ data: { amount: 1, reason: "generate" } });
      if (!res.ok) {
        toast.error(t("dashboard.run.noCredits"));
        return;
      }
      setOutput((o) => [prompt || "—", ...o].slice(0, 8));
      setPrompt("");
      toast.success(t("dashboard.run.success"));
      qc.invalidateQueries({ queryKey: ["billing"] });
    } catch {
      toast.error(t("common.error"));
    }
  }

  const credits = data?.credits;
  const sub = data?.subscription;
  const locale = lang === "en" ? "en-US" : "fr-FR";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-5 pt-32 pb-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("dashboard.title")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("dashboard.welcome")}
              {data?.profile?.full_name ? `, ${data.profile.full_name}` : ""}.
            </p>
          </div>
          <Button variant="glass" asChild>
            <Link to="/billing">
              <CreditCard className="size-4" /> {t("nav.billing")}
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <p className="mt-10 text-sm text-muted-foreground">{t("common.loading")}</p>
        ) : !data?.hasAccess ? (
          <div className="glass mt-10 rounded-3xl p-10 text-center">
            <h2 className="text-xl font-semibold">{t("dashboard.noSub.title")}</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              {t("dashboard.noSub.body")}
            </p>
            <Button variant="hero" size="lg" className="mt-6" asChild>
              <Link to="/pricing">{t("dashboard.noSub.cta")}</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Zap, label: t("dashboard.credits"), value: credits?.balance ?? 0 },
                { icon: Sparkles, label: t("dashboard.used"), value: credits?.used_this_period ?? 0 },
                { icon: Sparkles, label: t("dashboard.allowance"), value: credits?.monthly_allowance ?? 0 },
                {
                  icon: Calendar,
                  label: t("dashboard.reset"),
                  value: credits?.reset_at
                    ? new Date(credits.reset_at).toLocaleDateString(locale)
                    : t("common.none"),
                },
              ].map((c) => (
                <div key={c.label} className="glass rounded-2xl p-5">
                  <c.icon className="size-4 text-primary" />
                  <p className="mt-3 text-2xl font-bold">{c.value}</p>
                  <p className="text-xs text-muted-foreground">{c.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
              <div className="glass rounded-3xl p-6">
                <h2 className="text-lg font-semibold">{t("dashboard.run.title")}</h2>
                <Textarea
                  className="mt-4 min-h-32"
                  placeholder={t("dashboard.run.placeholder")}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
                <Button variant="hero" className="mt-4" onClick={run}>
                  {t("dashboard.run.button")}
                </Button>
              </div>
              <div className="glass rounded-3xl p-6">
                <h2 className="text-lg font-semibold">{t("dashboard.activity")}</h2>
                {output.length === 0 ? (
                  <p className="mt-4 text-sm text-muted-foreground">{t("dashboard.noActivity")}</p>
                ) : (
                  <ul className="mt-4 space-y-2">
                    {output.map((o, i) => (
                      <li
                        key={i}
                        className="truncate rounded-xl border border-border bg-background/50 px-3 py-2 text-sm text-muted-foreground"
                      >
                        {o}
                      </li>
                    ))}
                  </ul>
                )}
                {sub && (
                  <p className="mt-6 text-xs text-muted-foreground">
                    {t("dashboard.plan")}: <span className="font-semibold text-foreground">
                      {sub.subscription_plans?.name}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
