import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  CREDIT_COSTS,
  SCRIPT_MODEL,
  VIDEO_MODEL,
  videoCreditCost,
} from "@/lib/generation-config";

const CreateInput = z.object({
  kind: z.enum(["script", "video"]),
  prompt: z.string().min(8).max(2000),
  lang: z.enum(["fr", "en"]).default("fr"),
  duration: z.union([z.literal(5), z.literal(8)]).default(8),
  resolution: z.enum(["720p", "1080p"]).default("720p"),
  aspectRatio: z.enum(["16:9", "9:16"]).default("9:16"),
});

/** Starts a real generation. Credits are deducted atomically BEFORE any provider call. */
export const createGeneration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => CreateInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const engine = await import("@/lib/generation.server");
    const userId = context.userId;

    if (!(await engine.hasActiveAccess(userId))) {
      return { ok: false as const, error: "NO_SUBSCRIPTION" };
    }

    const cost =
      data.kind === "script"
        ? CREDIT_COSTS.script
        : videoCreditCost(data.duration, data.resolution);

    const deducted = await engine.deductCredits(userId, cost, `generation:${data.kind}`);
    if (!deducted?.ok) {
      return { ok: false as const, error: "INSUFFICIENT_CREDITS", balance: deducted?.balance ?? 0 };
    }

    const { data: job, error } = await supabaseAdmin
      .from("generation_jobs")
      .insert({
        user_id: userId,
        kind: data.kind,
        status: "running",
        prompt: data.prompt,
        model: data.kind === "script" ? SCRIPT_MODEL : VIDEO_MODEL,
        credits_cost: cost,
        duration_seconds: data.kind === "video" ? data.duration : null,
        resolution: data.kind === "video" ? data.resolution : null,
        aspect_ratio: data.kind === "video" ? data.aspectRatio : null,
      })
      .select("id")
      .single();

    if (error || !job) {
      await engine.refundJob("", userId, 0, "noop");
      throw new Error(error?.message ?? "JOB_CREATE_FAILED");
    }

    try {
      if (data.kind === "script") {
        const text = await engine.generateScript(data.prompt, data.lang);
        await supabaseAdmin
          .from("generation_jobs")
          .update({
            status: "completed",
            result_text: text,
            completed_at: new Date().toISOString(),
          })
          .eq("id", job.id);
        return { ok: true as const, jobId: job.id, status: "completed" as const };
      }

      const providerJobId = await engine.createVideoJob({
        prompt: data.prompt,
        duration: data.duration,
        resolution: data.resolution,
        aspectRatio: data.aspectRatio,
      });
      await supabaseAdmin
        .from("generation_jobs")
        .update({ provider_job_id: providerJobId })
        .eq("id", job.id);
      return { ok: true as const, jobId: job.id, status: "running" as const };
    } catch (e) {
      const message = e instanceof Error ? e.message : "UNKNOWN_ERROR";
      await supabaseAdmin
        .from("generation_jobs")
        .update({ status: "failed", error_message: message })
        .eq("id", job.id);
      await engine.refundJob(job.id, userId, cost, `refund:${data.kind}`);
      return { ok: false as const, error: message, jobId: job.id };
    }
  });

/** Polls a video job at the provider, stores the MP4 on completion. Idempotent. */
export const pollGeneration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ jobId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const engine = await import("@/lib/generation.server");

    const { data: job } = await supabaseAdmin
      .from("generation_jobs")
      .select("*")
      .eq("id", data.jobId)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (!job) throw new Error("JOB_NOT_FOUND");

    if (job.status !== "running" || job.kind !== "video" || !job.provider_job_id) {
      return {
        status: job.status,
        url: job.storage_path ? await engine.signedVideoUrl(job.storage_path) : null,
        error: job.error_message,
      };
    }

    try {
      const provider = await engine.readVideoJob(job.provider_job_id);

      if (provider.status === "failed") {
        const message = provider.error?.message ?? provider.error?.code ?? "PROVIDER_FAILED";
        await supabaseAdmin
          .from("generation_jobs")
          .update({ status: "failed", error_message: message })
          .eq("id", job.id);
        await engine.refundJob(job.id, context.userId, job.credits_cost, "refund:video");
        return { status: "failed" as const, url: null, error: message };
      }

      if (provider.status !== "completed") {
        await supabaseAdmin
          .from("generation_jobs")
          .update({ attempts: job.attempts + 1 })
          .eq("id", job.id);
        return { status: "running" as const, url: null, error: null, progress: provider.progress ?? null };
      }

      const path = job.storage_path ?? (await engine.storeVideo(job.provider_job_id, context.userId));
      await supabaseAdmin
        .from("generation_jobs")
        .update({
          status: "completed",
          storage_path: path,
          completed_at: new Date().toISOString(),
        })
        .eq("id", job.id);

      return { status: "completed" as const, url: await engine.signedVideoUrl(path), error: null };
    } catch (e) {
      const message = e instanceof Error ? e.message : "UNKNOWN_ERROR";
      const retryable = typeof e === "object" && e !== null && "retryable" in e && Boolean((e as { retryable: unknown }).retryable);
      if (retryable && job.attempts < 40) {
        await supabaseAdmin
          .from("generation_jobs")
          .update({ attempts: job.attempts + 1, error_message: message })
          .eq("id", job.id);
        return { status: "running" as const, url: null, error: null };
      }
      await supabaseAdmin
        .from("generation_jobs")
        .update({ status: "failed", error_message: message })
        .eq("id", job.id);
      await engine.refundJob(job.id, context.userId, job.credits_cost, "refund:video");
      return { status: "failed" as const, url: null, error: message };
    }
  });

export const listGenerations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const engine = await import("@/lib/generation.server");

    const { data, error } = await supabaseAdmin
      .from("generation_jobs")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(30);
    if (error) throw new Error(error.message);

    return Promise.all(
      (data ?? []).map(async (j) => ({
        ...j,
        url: j.storage_path && j.status === "completed" ? await engine.signedVideoUrl(j.storage_path) : null,
      })),
    );
  });

/** Whether the AI engine has its provider key configured (no value is exposed). */
export const getEngineStatus = createServerFn({ method: "GET" }).handler(async () => ({
  configured: Boolean(process.env["LOVABLE_API_KEY"]),
  videoModel: VIDEO_MODEL,
  scriptModel: SCRIPT_MODEL,
}));
