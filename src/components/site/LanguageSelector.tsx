import { useI18n, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageSelector({ className }: { className?: string }) {
  const { lang, setLang } = useI18n();

  const options: { code: Lang; flag: string; label: string }[] = [
    { code: "fr", flag: "🇫🇷", label: "FR" },
    { code: "en", flag: "🇬🇧", label: "EN" },
  ];

  return (
    <div
      className={cn(
        "flex items-center gap-0.5 rounded-full border border-border bg-surface/60 p-0.5 backdrop-blur",
        className,
      )}
      role="group"
      aria-label="Language"
    >
      {options.map((o) => (
        <button
          key={o.code}
          type="button"
          onClick={() => setLang(o.code)}
          aria-pressed={lang === o.code}
          className={cn(
            "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-all duration-200",
            lang === o.code
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <span aria-hidden>{o.flag}</span>
          {o.label}
        </button>
      ))}
    </div>
  );
}
