/**
 * Client-safe generation policy for the Clipora AI engine.
 * Credit costs are re-read from this module server-side before any deduction —
 * the browser never chooses a price.
 */

export type GenerationKind = "script" | "video";

export type VideoResolution = "720p" | "1080p";
export type VideoAspect = "16:9" | "9:16";

export const SCRIPT_MODEL = "google/gemini-3.7-flash";
export const VIDEO_MODEL = "google/gemini-omni-1.1-flash";

/** Credits charged per action. Video is far more expensive than text. */
export const CREDIT_COSTS = {
  script: 1,
  /** base cost for an 8s 720p clip */
  video: 25,
} as const;

export const VIDEO_DURATIONS = [5, 8] as const;
export type VideoDuration = (typeof VIDEO_DURATIONS)[number];

export function videoCreditCost(duration: number, resolution: VideoResolution): number {
  const perSecond = CREDIT_COSTS.video / 8;
  const multiplier = resolution === "1080p" ? 2 : 1;
  return Math.ceil(perSecond * duration * multiplier);
}

export type GenerationJob = {
  id: string;
  kind: GenerationKind;
  status: "queued" | "running" | "completed" | "failed" | "refunded";
  prompt: string;
  model: string | null;
  credits_cost: number;
  credits_refunded: boolean;
  result_text: string | null;
  storage_path: string | null;
  duration_seconds: number | null;
  resolution: string | null;
  aspect_ratio: string | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
};
