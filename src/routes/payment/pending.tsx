import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/site/Navbar";
import { useI18n } from "@/lib/i18n";
import { verifyPayment } from "@/lib/billing.functions";

type Search = { tx?: string | undefined };

export const Route = createFileRoute("/payment/pending")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>): Search => ({
    tx: typeof s["tx"] === "string" ? s["tx"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Paiement en attente — Clipora AI" },
      {
        name: "description",
        content: "Votre paiement est en cours de confirmation par Flutterwave.",
      },
      { property: "og:title", content: "Paiement en attente — Clipora AI" },
      { property: "og:description", content: "Confirmation bancaire en cours." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PendingPage,
});

function PendingPage() {
  const { t } = useI18n();
  const { tx } = Route.useSearch();

  // Poll the server (which re-verifies with Flutterwave) until it settles.
  const { data } = useQuery({
    queryKey: ["payment-pending", tx],
    enabled: !!tx,
    refetchInterval: 8000,
    queryFn: () => verifyPayment({ data: { txRef: tx as string } }),
  });

  return (
    <div className="bg-hero-aura min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-lg px-5 pt-36 pb-24">
        <div className="glass rounded-3xl p-8 text-center shadow-elevated">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-warning/15 text-warning">
            <Clock className="size-7" />
          </span>
          <h1 className="mt-6 text-2xl font-bold tracking-tight">
            {data?.status === "successful" ? t("payment.success.title") : t("payment.pending.title")}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {data?.status === "successful" ? t("payment.success.body") : t("payment.pending.body")}
          </p>
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
