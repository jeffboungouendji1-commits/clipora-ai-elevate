import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { PricingSection } from "@/components/site/PricingSection";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Tarifs — Clipora AI" },
      {
        name: "description",
        content:
          "Starter 9 €, Pro 19 € et Business 49 € par mois. Crédits IA inclus, paiement sécurisé, aucun plan gratuit.",
      },
      { property: "og:title", content: "Tarifs — Clipora AI" },
      {
        property: "og:description",
        content: "Trois plans payants pour automatiser votre production de contenu avec l'IA.",
      },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="bg-hero-aura pt-32">
        <PricingSection compact />
      </div>
      <Footer />
    </div>
  );
}
