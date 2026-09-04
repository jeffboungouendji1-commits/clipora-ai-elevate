/**
 * Server-only Clipora generation engine.
 *
 * Real providers only:
 *  - text/script  -> Lovable AI Gateway chat completions
 *  - video        -> Lovable AI Gateway async video jobs (/v1/videos)
 *
 * Nothing is simulated: when the gateway is not reachable or returns an error,
 * the job is marked failed and the credits are refunded.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { SCRIPT_MODEL, VIDEO_MODEL } from "./generation-config";

const GATEWAY = "https://ai.gateway.lovable.dev/v1";

export class GatewayError extends Error {
  status: number;
  retryable: boolean;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.retryable = status === 429 || status >= 500;
  }
}

function apiKey(): string {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new GatewayError(401, "AI_NOT_CONFIGURED");
  return key;
}

async function gatewayFetch(path: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(`${GATEWAY}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string } | null;
    throw new GatewayError(res.status, body?.message ?? `Gateway error ${res.status}`);
  }
  return res;
}

/* ------------------------------------------------------------------ script */

export async function generateScript(prompt: string, lang: "fr" | "en"): Promise<string> {
  const system =
    lang === "fr"
      ? "Tu es le moteur de script de Clipora AI. Produis un script de short vidéo prêt à tourner : un hook de 1 ligne, 3 à 5 beats avec indications visuelles, une conclusion et un appel à l'action. Réponds uniquement en français, sans préambule."
      : "You are the Clipora AI script engine. Produce a ready-to-shoot short-form video script: a 1-line hook, 3 to 5 beats with visual directions, an outro and a call to action. Answer in English only, no preamble.";

  const res = await gatewayFetch("/chat/completions", {
    method: "POST",
    body: JSON.stringify({
      model: SCRIPT_MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
    }),
  });
  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = json.choices?.[0]?.message?.content?.trim();
  if (!text) throw new GatewayError(502, "EMPTY_COMPLETION");
  return text;
}

/* ------------------------------------------------------------------- video */

export async function createVideoJob(args: {
  prompt: string;
  duration: number;
  resolution: string;
  aspectRatio: string;
}): Promise<string> {
  const res = await gatewayFetch("/videos", {
    method: "POST",
    body: JSON.stringify({
      model: VIDEO_MODEL,
      input: args.prompt,
      response_format: {
        type: "video",
        resolution: args.resolution,
        duration: `${args.duration}s`,
        aspect_ratio: args.aspectRatio,
      },
    }),
  });
  const job = (await res.json()) as { id?: string };
  if (!job.id) throw new GatewayError(502, "NO_JOB_ID");
  return job.id;
}

type ProviderJob = {
  id: string;
  status: "queued" | "in_progress" | "completed" | "failed";
  progress?: number;
  error?: { code?: string; message?: string };
};

export async function readVideoJob(id: string): Promise<ProviderJob> {
  const res = await gatewayFetch(`/videos/${id}`);
  return (await res.json()) as ProviderJob;
}

/** Downloads the finished MP4 and stores it permanently in Supabase Storage. */
export async function storeVideo(providerJobId: string, userId: string): Promise<string> {
  const res = await gatewayFetch(`/videos/${providerJobId}/content`);
  const bytes = await res.arrayBuffer();
  const path = `${userId}/${providerJobId}.mp4`;

  const { error } = await supabaseAdmin.storage
    .from("generations")
    .upload(path, bytes, { contentType: "video/mp4", upsert: true });
  if (error) throw new Error(error.message);
  return path;
}

export async function signedVideoUrl(path: string, seconds = 3600): Promise<string | null> {
  const { data } = await supabaseAdmin.storage
    .from("generations")
    .createSignedUrl(path, seconds);
  return data?.signedUrl ?? null;
}

/* ------------------------------------------------------------------ credits */

export async function deductCredits(userId: string, amount: number, reason: string) {
  const { data, error } = await supabaseAdmin.rpc("deduct_credits", {
    _user_id: userId,
    _amount: amount,
    _reason: reason,
  });
  if (error) throw new Error(error.message);
  return data as unknown as { ok: boolean; balance: number };
}

/** Refunds a job exactly once. */
export async function refundJob(jobId: string, userId: string, amount: number, reason: string) {
  const { data: job } = await supabaseAdmin
    .from("generation_jobs")
    .select("credits_refunded")
    .eq("id", jobId)
    .maybeSingle();
  if (!job || job.credits_refunded || amount <= 0) return;

  const { error } = await supabaseAdmin.rpc("refund_credits", {
    _user_id: userId,
    _amount: amount,
    _reason: reason,
  });
  if (error) {
    console.error("[generation] refund failed", jobId, error.message);
    return;
  }
  await supabaseAdmin
    .from("generation_jobs")
    .update({ credits_refunded: true, status: "refunded" })
    .eq("id", jobId);
}

/** True when the user currently has an active (or cancelling) paid period. */
export async function hasActiveAccess(userId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from("subscriptions")
    .select("status, current_period_end")
    .eq("user_id", userId)
    .maybeSingle();
  if (!data?.current_period_end) return false;
  return (
    ["active", "canceled"].includes(data.status) &&
    new Date(data.current_period_end).getTime() > Date.now()
  );
}
