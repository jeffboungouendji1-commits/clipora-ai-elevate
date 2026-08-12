import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/site/Navbar";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

type Search = { plan?: string | undefined; interval?: "monthly" | "yearly" | undefined };

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    plan: typeof s["plan"] === "string" ? s["plan"] : undefined,
    interval: s["interval"] === "yearly" ? "yearly" : s["interval"] === "monthly" ? "monthly" : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Connexion — Clipora AI" },
      { name: "description", content: "Connectez-vous à votre studio Clipora AI." },
      { property: "og:title", content: "Connexion — Clipora AI" },
      { property: "og:description", content: "Accédez à votre studio de production IA." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (search.plan) {
      navigate({ to: "/checkout", search: { plan: search.plan, interval: search.interval ?? "monthly" } });
    } else {
      navigate({ to: "/dashboard" });
    }
  }

  return (
    <div className="bg-hero-aura min-h-screen bg-background">
      <Navbar />
      <main className="flex min-h-screen items-center justify-center px-5 py-32">
        <div className="glass w-full max-w-md rounded-3xl p-8 shadow-elevated">
          <h1 className="text-2xl font-bold tracking-tight">{t("auth.login.title")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("auth.login.subtitle")}</p>
          <form className="mt-7 space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
              {loading ? t("common.loading") : t("auth.login.button")}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t("auth.noAccount")}{" "}
            <Link to="/signup" search={search} className="font-semibold text-primary">
              {t("nav.start")}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
