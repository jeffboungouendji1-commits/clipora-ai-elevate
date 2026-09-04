import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Film, FileText, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Navbar } from "@/components/site/Navbar";
import { useI18n } from "@/lib/i18n";
import { getMyBilling } from "@/lib/billing.functions";
import {
  createGeneration,
  getEngineStatus,
  listGenerations,
  pollGeneration,
} from "@/lib/generation.functions";
import { CREDIT_COSTS, videoCreditCost } from "@/lib/generation-config";
import type { VideoAspect, VideoResolution } from "@/lib/generation-config";

export const Route = createFileRoute("/_authenticated/studio")({
  head: () => ({
    meta: [
      { title: "Studio IA — Clipora AI" },
      {
        name: "description",
        content: "Générez scripts et vidéos courtes avec le moteur IA de Clipora.",
      },
      { property: "og:title", content: "Studio IA — Clipora AI" },
      { property: "og:description", content: "Le moteur de génération de contenu de Clipora AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StudioPage,
});

type Kind = "script" | "video";

function StudioPage() {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const [kind, setKind] = useState<Kind>("script");
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState<5 | 8>(8);
  const [resolution, setResolution] = useState<VideoResolution>("720p");
  const [aspectRatio, setAspectRatio] = useState<VideoAspect>("9:16");
  const [activeJob, setActiveJob] = useState<string | null>(null);

  const billing = useQuery({ queryKey: ["billing"], queryFn: () => getMyBilling() });
  const engine = useQuery({ queryKey: ["engine"], queryFn: () => getEngineStatus() });
  const jobs = useQuery({ queryKey: ["generations"], queryFn: () => listGenerations() });

  const cost = kind === "script" ? CREDIT_COSTS.script : videoCreditCost(duration, resolution);

  const run = useMutation({
    mutationFn: () =>
      createGeneration({
        data: { kind, prompt, lang, duration, resolution, aspectRatio },
      }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["billing"] });
      qc.invalidateQueries({ queryKey: ["generations"] });
      if (!res.ok) {
        toast.error(
          res.error === "INSUFFICIENT_CREDITS"
            ? t("studio.err.credits")
            : res.error === "NO_SUBSCRIPTION"
              ? t("dashboard.noSub.title")
              : `${t("studio.err.engine")} (${res.error})`,
        );
        return;
      }
      setPrompt("");
      if (res.status === "running") {
        setActiveJob(res.jobId);
        toast.success(t("studio.started"));
      } else {
        toast.success(t("studio.done"));
      }
    },
    onError: () => toast.error(t("common.error")),
  });

  // Poll the running video job until the provider finishes.
  useEffect(() => {
    if (!activeJob) return;
    let cancelled = false;
    const timer = setInterval(async () => {
      try {
        const res = await pollGeneration({ data: { jobId: activeJob } });
        if (cancelled) return;
        if (res.status === "completed" || res.status === "failed" || res.status === "refunded") {
          setActiveJob(null);
          qc.invalidateQueries({ queryKey: ["generations"] });
          qc.invalidateQueries({ queryKey: ["billing"] });
          if (res.status === "completed") toast.success(t("studio.done"));
          else toast.error(`${t("studio.err.engine")}${res.error ? ` (${res.error})` : ""}`);
        }
      } catch {
        /* transient — the next tick retries */
      }
    }, 8000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [activeJob, qc, t]);

  const hasAccess = billing.data?.hasAccess;
  const balance = billing.data?.credits?.balance ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-5 pt-32 pb-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("studio.title")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t("studio.subtitle")}</p>
          </div>
          <p className="text-sm text-muted-foreground">
            {t("dashboard.credits")}: <span className="font-semibold text-foreground">{balance}</span>
          </p>
        </div>

        {engine.data && !engine.data.configured && (
          <div className="glass mt-6 flex items-start gap-3 rounded-2xl p-4 text-sm text-muted-foreground">
            <AlertTriangle className="mt-0.5 size-4 text-primary" />
            <span>{t("studio.notConfigured")}</span>
          </div>
        )}

        {billing.isLoading ? (
          <p className="mt-10 text-sm text-muted-foreground">{t("common.loading")}</p>
        ) : !hasAccess ? (
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
          <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_1fr]">
            <div className="glass rounded-3xl p-6">
              <div className="flex gap-2">
                {(
                  [
                    { k: "script" as const, icon: FileText, label: t("studio.kind.script") },
                    { k: "video" as const, icon: Film, label: t("studio.kind.video") },
                  ]
                ).map((o) => (
                  <button
                    key={o.k}
                    type="button"
                    onClick={() => setKind(o.k)}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors ${
                      kind === o.k
                        ? "bg-primary text-primary-foreground"
                        : "border border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <o.icon className="size-4" />
                    {o.label}
                  </button>
                ))}
              </div>

              <Textarea
                className="mt-4 min-h-36"
                placeholder={t("studio.placeholder")}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />

              {kind === "video" && (
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <Selector
                    label={t("studio.duration")}
                    value={String(duration)}
                    options={["5", "8"]}
                    onChange={(v) => setDuration(Number(v) as 5 | 8)}
                    suffix="s"
                  />
                  <Selector
                    label={t("studio.resolution")}
                    value={resolution}
                    options={["720p", "1080p"]}
                    onChange={(v) => setResolution(v as VideoResolution)}
                  />
                  <Selector
                    label={t("studio.format")}
                    value={aspectRatio}
                    options={["9:16", "16:9"]}
                    onChange={(v) => setAspectRatio(v as VideoAspect)}
                  />
                </div>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button
                  variant="hero"
                  onClick={() => run.mutate()}
                  disabled={
                    run.isPending || !!activeJob || prompt.trim().length < 8 || balance < cost
                  }
                >
                  {(run.isPending || activeJob) && <Loader2 className="size-4 animate-spin" />}
                  {t("studio.generate")} ({cost} {t("studio.credits")})
                </Button>
                {activeJob && (
                  <span className="text-xs text-muted-foreground">{t("studio.inProgress")}</span>
                )}
              </div>
            </div>

            <div className="glass rounded-3xl p-6">
              <h2 className="text-lg font-semibold">{t("studio.history")}</h2>
              {jobs.isLoading ? (
                <p className="mt-4 text-sm text-muted-foreground">{t("common.loading")}</p>
              ) : (jobs.data ?? []).length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">{t("dashboard.noActivity")}</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {(jobs.data ?? []).map((j) => (
                    <li key={j.id} className="rounded-2xl border border-border bg-background/50 p-3">
                      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                        <span className="uppercase tracking-wide">
                          {j.kind === "video" ? t("studio.kind.video") : t("studio.kind.script")}
                        </span>
                        <span>{t(`studio.status.${j.status}`)}</span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm">{j.prompt}</p>
                      {j.result_text && (
                        <pre className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap rounded-xl bg-background/60 p-3 text-xs text-muted-foreground">
                          {j.result_text}
                        </pre>
                      )}
                      {j.url && (
                        <video
                          className="mt-2 w-full rounded-xl"
                          src={j.url}
                          controls
                          preload="metadata"
                        />
                      )}
                      {j.error_message && (
                        <p className="mt-2 text-xs text-destructive">{j.error_message}</p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function Selector({
  label,
  value,
  options,
  onChange,
  suffix = "",
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  suffix?: string;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-1 flex gap-2">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            className={`rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
              value === o
                ? "bg-primary text-primary-foreground"
                : "border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {o}
            {suffix}
          </button>
        ))}
      </div>
    </div>
  );
}
