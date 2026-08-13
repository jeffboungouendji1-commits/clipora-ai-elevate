import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/site/Navbar";
import { useI18n } from "@/lib/i18n";

type Search = { tx?: string | undefined };

export const Route = createFileRoute("/payment/success")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    tx: typeof s["tx"] === "string" ? s["tx"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Paiement confirmé — Clipora AI" },
      {
        name: "description",
        content: "Votre abonnement Clipora AI est actif et vos crédits sont disponibles.",
      },
      { property: "og:title", content: "Paiement confirmé — Clipora AI" },
      { property: "og:description", content: "Abonnement activé, crédits attribués." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SuccessPage,
});

function SuccessPage() {
  const { t } = useI18n();
  const { tx } = Route.useSearch();

  return (
    <div className="bg-hero-aura min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-lg px-5 pt-36 pb-24">
        <div className="glass rounded-3xl p-8 text-center shadow-elevated">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <CheckCircle2 className="size-7" />
          </span>
          <h1 className="mt-6 text-2xl font-bold tracking-tight">{t("payment.success.title")}</h1>
          <p className="mt-3 text-sm text-muted-foreground">{t("payment.success.body")}</p>
          {tx && (
            <p className="mt-4 font-mono text-[11px] break-all text-muted-foreground/70">{tx}</p>
          )}
          <div className="mt-8 flex flex-col gap-3">
            <Button variant="hero" asChild>
              <Link to="/dashboard">{t("payment.toDashboard")}</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/billing">{t("billing.title")}</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
