/**
 * Flutterwave webhook receiver.
 *
 * Security:
 *  - authenticity is validated with the `verif-hash` header against
 *    FLW_WEBHOOK_SECRET_HASH (constant-time compare)
 *  - every event is stored once (unique event_key) => idempotent processing
 *  - the payload is NEVER trusted: the transaction is re-verified against the
 *    Flutterwave API before any subscription is activated
 */
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/webhooks/flutterwave")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { readFlwConfig, isValidWebhookSignature, verifyTransactionById } = await import(
          "@/lib/flutterwave.server"
        );
        const {
          recordWebhookEvent,
          markWebhookProcessed,
          applyVerifiedTransaction,
          markSubscriptionPastDue,
        } = await import("@/lib/billing.server");

        const cfg = readFlwConfig();
        if (!cfg) {
          return new Response(JSON.stringify({ error: "not_configured" }), {
            status: 503,
            headers: { "content-type": "application/json" },
          });
        }

        const raw = await request.text();
        if (!isValidWebhookSignature(request.headers.get("verif-hash"), cfg)) {
          return new Response(JSON.stringify({ error: "invalid_signature" }), {
            status: 401,
            headers: { "content-type": "application/json" },
          });
        }

        let payload: { event?: string; data?: Record<string, unknown> };
        try {
          payload = JSON.parse(raw);
        } catch {
          return new Response(JSON.stringify({ error: "invalid_json" }), { status: 400 });
        }

        const eventType = payload.event ?? "unknown";
        const data = payload.data ?? {};
        const flwId = data["id"] ? String(data["id"]) : null;
        const txRef = (data["tx_ref"] as string | undefined) ?? null;
        const eventKey = `${eventType}:${flwId ?? txRef ?? crypto.randomUUID()}`;

        const isNew = await recordWebhookEvent({ eventKey, eventType, txRef, payload });
        if (!isNew) {
          return new Response(JSON.stringify({ status: "duplicate_ignored" }), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        }

        try {
          if (eventType === "charge.completed" || eventType === "subscription.charge.completed") {
            if (!flwId) throw new Error("MISSING_TRANSACTION_ID");
            const tx = await verifyTransactionById(cfg, flwId);
            await applyVerifiedTransaction(tx);
          } else if (eventType === "charge.failed" && txRef) {
            await markSubscriptionPastDue(txRef);
          }
          await markWebhookProcessed(eventKey);
        } catch (e) {
          const message = e instanceof Error ? e.message : "unknown_error";
          console.error("[flutterwave webhook]", eventKey, message);
          await markWebhookProcessed(eventKey, message);
          return new Response(JSON.stringify({ status: "error", message }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ status: "ok" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});
