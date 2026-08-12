import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Play,
  Clock,
  Workflow,
  Rocket,
  Wand2,
  BarChart3,
  Coins,
  Quote,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { DashboardPreview } from "@/components/site/DashboardPreview";
import { PricingSection } from "@/components/site/PricingSection";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Clipora AI — Transformez votre contenu avec l'IA" },
      {
        name: "description",
        content:
          "Clipora AI automatise vos workflows de contenu : génération, découpage et publication. Abonnement payant à partir de 9 €/mois.",
      },
      { property: "og:title", content: "Clipora AI — Transformez votre contenu avec l'IA" },
      {
        property: "og:description",
        content:
          "Automatisez la production de contenu avec l'IA. Starter, Pro et Business à partir de 9 €/mois.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { t } = useI18n();

  const problems = [
    { icon: Clock, k: "card1" },
    { icon: Workflow, k: "card2" },
    { icon: Rocket, k: "card3" },
  ];

  const features = [
    { icon: Wand2, k: "f1" },
    { icon: Workflow, k: "f2" },
    { icon: BarChart3, k: "f3" },
    { icon: Coins, k: "f4" },
  ];

  const testimonials = [
    { k: "t1", name: "Camille Moreau", role: "Head of Content, Northlane" },
    { k: "t2", name: "Daniel Okoye", role: "Founder, Studio Bright" },
    { k: "t3", name: "Sofia Marchetti", role: "Marketing Lead, Velora" },
  ];

  const faqs = ["1", "2", "3", "4", "5", "6"];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* HERO */}
      <section className="bg-hero-aura relative overflow-hidden px-5 pt-36 pb-16 sm:pt-44">
        <div className="grid-lines pointer-events-none absolute inset-0 opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-4xl text-center">
          <span className="glass animate-rise-in inline-flex items-center rounded-full px-4 py-1.5 text-[11px] font-semibold tracking-[0.18em] text-primary">
            {t("hero.badge")}
          </span>
          <h1 className="animate-rise-in mt-7 text-5xl leading-[1.05] font-bold tracking-tight sm:text-6xl lg:text-7xl">
            {t("hero.title.a")} <span className="text-gradient-lime">{t("hero.title.b")}</span>{" "}
            {t("hero.title.c")}
            <span className="text-gradient-lime">{t("hero.title.d")}</span>.
          </h1>
          <p className="animate-rise-in mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
            {t("hero.subtitle")}
          </p>
          <div className="animate-rise-in mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" variant="hero" asChild>
              <Link to="/pricing">
                {t("hero.cta.primary")} <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="glass" asChild>
              <a href="#how">
                <Play className="size-4" /> {t("hero.cta.secondary")}
              </a>
            </Button>
          </div>
          <p className="mt-5 text-xs text-muted-foreground">{t("hero.note")}</p>
        </div>

        <div className="animate-float-soft relative mx-auto mt-16 max-w-5xl">
          <DashboardPreview />
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="border-y border-border bg-surface/30 px-5 py-14">
        <div className="mx-auto max-w-6xl">
          <p className="text-center text-xs font-semibold tracking-[0.2em] text-muted-foreground">
            {t("social.title")}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-50">
            {["NORTHLANE", "VELORA", "STUDIO BRIGHT", "AXIOM", "MERIDIAN", "KOVA"].map((n) => (
              <span key={n} className="text-sm font-bold tracking-[0.25em] text-foreground">
                {n}
              </span>
            ))}
          </div>
          <div className="mt-12 grid grid-cols-2 gap-6 lg:grid-cols-4">
            {[
              { v: "1.2M+", k: "social.metric1" },
              { v: "27h", k: "social.metric2" },
              { v: "98%", k: "social.metric3" },
              { v: "42", k: "social.metric4" },
            ].map((m) => (
              <div key={m.k} className="text-center">
                <p className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">{m.v}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t(m.k)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM / SOLUTION */}
      <section className="px-5 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold tracking-[0.2em] text-primary">
              {t("problem.eyebrow")}
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              {t("problem.title")}
            </h2>
            <p className="mt-4 text-muted-foreground">{t("problem.subtitle")}</p>
          </div>
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {problems.map(({ icon: Icon, k }) => (
              <div
                key={k}
                className="glass rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30"
              >
                <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-5 text-lg font-semibold">{t(`problem.${k}.title`)}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{t(`problem.${k}.body`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="scroll-mt-24 px-5 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold tracking-[0.2em] text-primary">
              {t("features.eyebrow")}
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              {t("features.title")}
            </h2>
            <p className="mt-4 text-muted-foreground">{t("features.subtitle")}</p>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            {features.map(({ icon: Icon, k }, i) => (
              <article
                key={k}
                className="group glass overflow-hidden rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="text-lg font-semibold">{t(`features.${k}.title`)}</h3>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{t(`features.${k}.body`)}</p>
                <div className="mt-6 rounded-2xl border border-border bg-background/60 p-4">
                  <div className="space-y-2">
                    {[0, 1, 2].map((r) => (
                      <div key={r} className="flex items-center gap-3">
                        <span className="size-2 rounded-full bg-primary/70" />
                        <div
                          className="h-2 rounded-full bg-muted transition-all duration-500 group-hover:bg-primary/30"
                          style={{ width: `${88 - r * 18 - i * 4}%` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="scroll-mt-24 border-y border-border bg-surface/30 px-5 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold tracking-[0.2em] text-primary">{t("how.eyebrow")}</p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">{t("how.title")}</h2>
          </div>
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {["s1", "s2", "s3"].map((s, i) => (
              <div key={s} className="relative rounded-3xl border border-border bg-background/50 p-7">
                <span className="text-5xl font-bold text-primary/25">0{i + 1}</span>
                <h3 className="mt-3 text-lg font-semibold">{t(`how.${s}.title`)}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{t(`how.${s}.body`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SHOWCASE */}
      <section className="px-5 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold tracking-[0.2em] text-primary">
              {t("showcase.eyebrow")}
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              {t("showcase.title")}
            </h2>
            <p className="mt-4 text-muted-foreground">{t("showcase.subtitle")}</p>
          </div>
          <div className="mt-12">
            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="px-5 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold tracking-[0.2em] text-primary">
              {t("testimonials.eyebrow")}
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              {t("testimonials.title")}
            </h2>
          </div>
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {testimonials.map((tm) => (
              <figure key={tm.k} className="glass rounded-3xl p-7">
                <Quote className="size-6 text-primary" />
                <blockquote className="mt-4 text-sm text-foreground/90">
                  {t(`testimonials.${tm.k}`)}
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                    {tm.name
                      .split(" ")
                      .map((p) => p[0])
                      .join("")}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{tm.name}</span>
                    <span className="block text-xs text-muted-foreground">{tm.role}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <PricingSection />

      {/* FAQ */}
      <section id="faq" className="scroll-mt-24 px-5 py-24">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <p className="text-xs font-semibold tracking-[0.2em] text-primary">{t("faq.eyebrow")}</p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">{t("faq.title")}</h2>
          </div>
          <Accordion type="single" collapsible className="mt-10 space-y-3">
            {faqs.map((n) => (
              <AccordionItem
                key={n}
                value={n}
                className="glass rounded-2xl border-b-0 px-5 data-[state=open]:border-primary/30"
              >
                <AccordionTrigger className="text-left text-sm font-semibold hover:no-underline">
                  {t(`faq.q${n}`)}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {t(`faq.a${n}`)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-5 pb-24">
        <div className="bg-hero-aura relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-border p-12 text-center shadow-glow sm:p-16">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">{t("cta.title")}</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">{t("cta.subtitle")}</p>
          <Button size="lg" variant="hero" className="mt-8" asChild>
            <Link to="/pricing">
              {t("cta.button")} <ArrowRight className="size-4" />
            </Link>
          </Button>
          <p className="mt-4 text-xs text-muted-foreground">{t("hero.note")}</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
