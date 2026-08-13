import { createFileRoute, Link } from "@tanstack/react-router";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/site/Navbar";
import { useI18n } from "@/lib/i18n";

type Search = { reason?: string | undefined };

export const Route = createFileRoute("/payment/failed")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    reason: typeof s["reason"] === "string" ? s["reason"].slice(0, 120) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Paiement échoué — Clipora AI" },
      {
        name: "description",
        content: "La transaction n'a pas abouti. Vous pouvez réessayer en toute sécurité.",
      },
      { property: "og:title", content: "Paiement échoué — Clipora AI" },
      { property: "og:description", content: "Aucun montant n'a été débité définitivement." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: FailedPage,
});

function FailedPage() {
  const { t } = useI18n();
  const { reason } = Route.useSearch();

  return (
    <div className="bg-hero-aura min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-lg px-5 pt-36 pb-24">
        <div className="glass rounded-3xl p-8 text-center shadow-elevated">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-destructive/15 text-destructive">
            <XCircle className="size-7" />
          </span>
          <h1 className="mt-6 text-2xl font-bold tracking-tight">{t("payment.failed.title")}</h1>
          <p className="mt-3 text-sm text-muted-foreground">{t("payment.failed.body")}</p>
          {reason && (
            <p className="mt-4 font-mono text-[11px] break-all text-muted-foreground/70">{reason}</p>
          )}
          <div className="mt-8 flex flex-col gap-3">
            <Button variant="hero" asChild>
              <Link to="/pricing">{t("payment.retry")}</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/pricing">{t("payment.toPricing")}</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
