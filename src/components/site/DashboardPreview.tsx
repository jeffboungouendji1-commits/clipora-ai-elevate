import { Sparkles, TrendingUp, Zap, FileText } from "lucide-react";
import { useI18n } from "@/lib/i18n";

/** Realistic in-product preview used on the landing page (pure presentation). */
export function DashboardPreview() {
  const { lang } = useI18n();
  const fr = lang === "fr";

  const workflows = [
    { name: fr ? "Script YouTube · 8 min" : "YouTube script · 8 min", state: fr ? "Terminé" : "Done", pct: 100 },
    { name: fr ? "Découpage shorts ×12" : "Shorts repurpose ×12", state: fr ? "En cours" : "Running", pct: 64 },
    { name: fr ? "Posts LinkedIn ×5" : "LinkedIn posts ×5", state: fr ? "Terminé" : "Done", pct: 100 },
    { name: fr ? "Newsletter hebdo" : "Weekly newsletter", state: fr ? "En file" : "Queued", pct: 12 },
  ];

  const bars = [38, 52, 44, 71, 63, 88, 76, 94, 82, 61, 90, 100];

  return (
    <div className="glass relative overflow-hidden rounded-3xl p-3 shadow-elevated sm:p-4">
      <div className="rounded-2xl border border-border bg-background/70 p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="size-3.5" />
            </span>
            <span className="text-sm font-semibold">Clipora Studio</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5">
            <Zap className="size-3.5 text-primary" />
            <span className="text-xs font-semibold">
              412 / 500 <span className="font-normal text-muted-foreground">{fr ? "crédits" : "credits"}</span>
            </span>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.15fr_1fr]">
          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground">
              {fr ? "WORKFLOWS IA" : "AI WORKFLOWS"}
            </p>
            {workflows.map((w) => (
              <div key={w.name} className="rounded-xl border border-border bg-surface/60 p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate text-sm">{w.name}</span>
                  <span
                    className={
                      w.pct === 100
                        ? "rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success"
                        : "rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary"
                    }
                  >
                    {w.state}
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${w.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-surface/60 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold tracking-wider text-muted-foreground">
                  {fr ? "PRODUCTION / 12 SEMAINES" : "OUTPUT / 12 WEEKS"}
                </p>
                <span className="flex items-center gap-1 text-xs font-semibold text-success">
                  <TrendingUp className="size-3.5" /> +214%
                </span>
              </div>
              <div className="mt-4 flex h-24 items-end gap-1.5">
                {bars.map((b, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm bg-primary/70"
                    style={{ height: `${b}%`, opacity: 0.35 + (i / bars.length) * 0.65 }}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface/60 p-4">
              <p className="text-xs font-semibold tracking-wider text-muted-foreground">
                {fr ? "CONTENU GÉNÉRÉ" : "GENERATED CONTENT"}
              </p>
              <div className="mt-3 space-y-2">
                {[
                  fr ? "Hook : « 3 erreurs qui tuent… »" : "Hook: “3 mistakes killing your…”",
                  fr ? "Légende Instagram · v2" : "Instagram caption · v2",
                  fr ? "Description SEO · 148 mots" : "SEO description · 148 words",
                ].map((c) => (
                  <div key={c} className="flex items-center gap-2 rounded-lg bg-background/60 px-3 py-2">
                    <FileText className="size-3.5 shrink-0 text-primary" />
                    <span className="truncate text-xs text-muted-foreground">{c}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
