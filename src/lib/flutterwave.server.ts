/**
 * Flutterwave server-side integration.
 *
 * SECURITY: this module is server-only (`*.server.ts` is blocked from client
 * bundles). FLW_SECRET_KEY is never read outside of it.
 *
 * Required environment variables (Project Settings → Secrets):
 *   FLW_PUBLIC_KEY            - Flutterwave public key
 *   FLW_SECRET_KEY            - Flutterwave secret key (NEVER exposed)
 *   FLW_WEBHOOK_SECRET_HASH   - value configured as the webhook "secret hash"
 *   FLW_ENVIRONMENT           - "sandbox" | "production"
 */

const FLW_API_BASE = "https://api.flutterwave.com/v3";

export type FlwEnvironment = "sandbox" | "production";

export type FlwConfig = {
  publicKey: string;
  secretKey: string;
  webhookSecretHash: string;
  environment: FlwEnvironment;
};

export function readFlwConfig(): FlwConfig | null {
  const publicKey = process.env["FLW_PUBLIC_KEY"];
  const secretKey = process.env["FLW_SECRET_KEY"];
  const webhookSecretHash = process.env["FLW_WEBHOOK_SECRET_HASH"] ?? "";
  const environment = (process.env["FLW_ENVIRONMENT"] ?? "sandbox") as FlwEnvironment;
  if (!publicKey || !secretKey) return null;
  return { publicKey, secretKey, webhookSecretHash, environment };
}

export function requireFlwConfig(): FlwConfig {
  const cfg = readFlwConfig();
  if (!cfg) {
    throw new Error(
      "FLUTTERWAVE_NOT_CONFIGURED: add FLW_PUBLIC_KEY, FLW_SECRET_KEY, FLW_WEBHOOK_SECRET_HASH and FLW_ENVIRONMENT in Project Settings → Secrets.",
    );
  }
  return cfg;
}

async function flwFetch<T>(
  path: string,
  init: RequestInit & { secretKey: string },
): Promise<T> {
  const { secretKey, ...rest } = init;
  const res = await fetch(`${FLW_API_BASE}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${secretKey}`,
      ...(rest.headers ?? {}),
    },
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const message =
      (json["message"] as string | undefined) ?? `Flutterwave request failed (${res.status})`;
    throw new Error(`FLW_API_ERROR: ${message}`);
  }
  return json as T;
}

export type FlwInitiateParams = {
  txRef: string;
  amount: number;
  currency: string;
  redirectUrl: string;
  customerEmail: string;
  customerName?: string | null;
  /** Flutterwave Payment Plan id for recurring billing (optional). */
  paymentPlanId?: string | null;
  meta?: Record<string, unknown>;
  title: string;
  description: string;
};

export type FlwInitiateResult = { link: string };

/** Creates a Flutterwave Standard checkout session. */
export async function initiatePayment(
  cfg: FlwConfig,
  params: FlwInitiateParams,
): Promise<FlwInitiateResult> {
  const body: Record<string, unknown> = {
    tx_ref: params.txRef,
    amount: params.amount,
    currency: params.currency,
    redirect_url: params.redirectUrl,
    customer: {
      email: params.customerEmail,
      name: params.customerName ?? undefined,
    },
    meta: params.meta ?? {},
    customizations: {
      title: params.title,
      description: params.description,
    },
  };
  if (params.paymentPlanId) body["payment_plan"] = params.paymentPlanId;

  const json = await flwFetch<{ status: string; data?: { link?: string }; message?: string }>(
    "/payments",
    { method: "POST", body: JSON.stringify(body), secretKey: cfg.secretKey },
  );

  const link = json.data?.link;
  if (json.status !== "success" || !link) {
    throw new Error(`FLW_API_ERROR: ${json.message ?? "no checkout link returned"}`);
  }
  return { link };
}

export type FlwTransaction = {
  id: number;
  tx_ref: string;
  status: string;
  amount: number;
  currency: string;
  charged_amount?: number;
  customer?: { email?: string; name?: string };
  payment_plan?: number | string | null;
  created_at?: string;
};

export async function verifyTransactionById(
  cfg: FlwConfig,
  transactionId: string | number,
): Promise<FlwTransaction> {
  const json = await flwFetch<{ status: string; data: FlwTransaction }>(
    `/transactions/${transactionId}/verify`,
    { method: "GET", secretKey: cfg.secretKey },
  );
  return json.data;
}

export async function verifyTransactionByReference(
  cfg: FlwConfig,
  txRef: string,
): Promise<FlwTransaction> {
  const json = await flwFetch<{ status: string; data: FlwTransaction }>(
    `/transactions/verify_by_reference?tx_ref=${encodeURIComponent(txRef)}`,
    { method: "GET", secretKey: cfg.secretKey },
  );
  return json.data;
}

/** Cancels a Flutterwave subscription (used when a user cancels immediately). */
export async function cancelFlwSubscription(cfg: FlwConfig, subscriptionId: string) {
  return flwFetch(`/subscriptions/${subscriptionId}/cancel`, {
    method: "PUT",
    secretKey: cfg.secretKey,
  });
}

/**
 * Validates a Flutterwave webhook request.
 * Flutterwave sends the configured secret hash in the `verif-hash` header.
 */
export function isValidWebhookSignature(headerValue: string | null, cfg: FlwConfig): boolean {
  if (!cfg.webhookSecretHash) return false;
  if (!headerValue) return false;
  const a = new TextEncoder().encode(headerValue);
  const b = new TextEncoder().encode(cfg.webhookSecretHash);
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  return diff === 0;
}
