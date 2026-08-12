import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-border bg-surface/30">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="size-4" />
            </span>
            <span className="text-base font-bold">
              Clipora<span className="text-primary"> AI</span>
            </span>
          </div>
          <p className="max-w-xs text-sm text-muted-foreground">{t("footer.blurb")}</p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">{t("footer.product")}</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <a href="/#features" className="transition-colors hover:text-primary">
                {t("nav.features")}
              </a>
            </li>
            <li>
              <Link to="/pricing" className="transition-colors hover:text-primary">
                {t("nav.pricing")}
              </Link>
            </li>
            <li>
              <a href="/#faq" className="transition-colors hover:text-primary">
                {t("nav.faq")}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">{t("footer.company")}</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <a href="/#how" className="transition-colors hover:text-primary">
                {t("footer.about")}
              </a>
            </li>
            <li>
              <a href="mailto:hello@clipora.ai" className="transition-colors hover:text-primary">
                {t("footer.contact")}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">{t("footer.legal")}</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>{t("footer.terms")}</li>
            <li>{t("footer.privacy")}</li>
            <li>{t("footer.refund")}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border px-5 py-6">
        <p className="mx-auto max-w-6xl text-xs text-muted-foreground">
          © {new Date().getFullYear()} Clipora AI. {t("footer.rights")}
        </p>
      </div>
    </footer>
  );
}
