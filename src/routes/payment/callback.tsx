import { useEffect, useRef } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { useI18n } from "@/lib/i18n";
import { verifyPayment } from "@/lib/billing.functions";

type Search = {
  tx_ref?: string | undefined;
  transaction_id?: string | undefined;
  status?: string | undefined;
};

export const Route = createFileRoute("/payment/callback")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>): Search => ({
    tx_ref: typeof s["tx_ref"] === "string" ? s["tx_ref"] : undefined,
    transaction_id: typeof s["transaction_id"] === "string" ? s["transaction_id"] : undefined,
    status: typeof s["status"] === "string" ? s["status"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Vérification du paiement — Clipora AI" },
      {
        name: "description",
        content: "Vérification sécurisée de votre transaction Flutterwave en cours.",
      },
      { property: "og:title", content: "Vérification du paiement — Clipora AI" },
      { property: "og:description", content: "Nous confirmons votre paiement côté serveur." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CallbackPage,
});

function CallbackPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const txRef = search.tx_ref;
    const transactionId = search.transaction_id;

    // The browser can never grant access: the server re-verifies with Flutterwave.
    (async () => {
      if (!txRef && !transactionId) {
        navigate({ to: "/payment/failed", search: { reason: "missing_reference" }, replace: true });
        return;
      }
      try {
        const res = await verifyPayment({
          data: {
            ...(txRef ? { txRef } : {}),
            ...(transactionId ? { transactionId } : {}),
          },
        });
        if (res.status === "successful") {
          navigate({ to: "/payment/success", search: { tx: res.txRef }, replace: true });
        } else if (res.status === "pending") {
          navigate({ to: "/payment/pending", search: { tx: res.txRef }, replace: true });
        } else {
          navigate({ to: "/payment/failed", search: { reason: "declined" }, replace: true });
        }
      } catch (e) {
        const reason = e instanceof Error ? e.message.slice(0, 80) : "verification_error";
        navigate({ to: "/payment/failed", search: { reason }, replace: true });
      }
    })();
  }, [navigate, search.transaction_id, search.tx_ref]);

  return (
    <div className="bg-hero-aura min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto flex max-w-lg flex-col items-center px-5 pt-44 pb-24 text-center">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="mt-6 text-sm text-muted-foreground">{t("payment.verifying")}</p>
      </main>
    </div>
  );
}
