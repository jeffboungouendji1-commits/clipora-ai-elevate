import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type Lang = "fr" | "en";

const STORAGE_KEY = "clipora.lang";

type Dict = Record<string, string>;

const fr: Dict = {
  "brand.tagline": "Automatisation de contenu par l'IA",

  "nav.features": "Fonctionnalités",
  "nav.how": "Comment ça marche",
  "nav.pricing": "Tarifs",
  "nav.faq": "FAQ",
  "nav.login": "Connexion",
  "nav.start": "Commencer",
  "nav.dashboard": "Tableau de bord",
  "nav.billing": "Facturation",
  "nav.admin": "Admin",
  "nav.logout": "Déconnexion",

  "hero.badge": "⚡ PROPULSÉ PAR L'IA",
  "hero.title.a": "Transformez votre",
  "hero.title.b": "contenu",
  "hero.title.c": "avec l'",
  "hero.title.d": "IA",
  "hero.subtitle":
    "Clipora AI automatise vos workflows de contenu : génération, découpage, réécriture et publication. Créez plus de contenu, plus vite, sans agrandir votre équipe.",
  "hero.cta.primary": "Commencer maintenant",
  "hero.cta.secondary": "Voir comment ça marche",
  "hero.note": "Abonnement payant • Paiement sécurisé",

  "social.title": "Des équipes de contenu exigeantes utilisent Clipora AI",
  "social.metric1": "contenus générés",
  "social.metric2": "heures économisées / mois",
  "social.metric3": "de satisfaction",
  "social.metric4": "pays desservis",

  "problem.eyebrow": "LE PROBLÈME",
  "problem.title": "Produire du contenu prend trop de temps",
  "problem.subtitle":
    "Entre l'idéation, l'écriture, le montage et la publication, vos meilleures idées meurent dans la file d'attente.",
  "problem.card1.title": "Gagnez du temps",
  "problem.card1.body":
    "Ce qui prenait une journée prend maintenant quelques minutes. L'IA prépare, vous validez.",
  "problem.card2.title": "Automatisez le workflow",
  "problem.card2.body":
    "Enchaînez génération, variantes, formats et exports dans un seul pipeline reproductible.",
  "problem.card3.title": "Créez plus vite",
  "problem.card3.body":
    "Multipliez vos formats par dix sans multiplier votre équipe ni votre budget.",

  "features.eyebrow": "FONCTIONNALITÉS",
  "features.title": "Un vrai studio de production IA",
  "features.subtitle": "Tout ce qu'il faut pour transformer une idée en contenu publiable.",
  "features.f1.title": "Studio de génération",
  "features.f1.body":
    "Générez scripts, posts, descriptions et variantes à partir d'un brief unique, avec votre ton de marque.",
  "features.f2.title": "Workflows automatisés",
  "features.f2.body":
    "Chaînez plusieurs étapes IA en un pipeline : analyse, rédaction, adaptation par plateforme, contrôle qualité.",
  "features.f3.title": "Analytics de production",
  "features.f3.body":
    "Suivez volume produit, crédits consommés et performance de chaque workflow en temps réel.",
  "features.f4.title": "Crédits transparents",
  "features.f4.body":
    "Chaque action IA consomme un nombre de crédits clair. Solde, usage et date de réinitialisation toujours visibles.",

  "how.eyebrow": "COMMENT ÇA MARCHE",
  "how.title": "Trois étapes, zéro friction",
  "how.s1.title": "Choisissez votre plan",
  "how.s1.body": "Starter, Pro ou Business. Paiement sécurisé, activation après vérification.",
  "how.s2.title": "Décrivez votre besoin",
  "how.s2.body": "Un brief, une source ou un thème suffit pour lancer un workflow.",
  "how.s3.title": "Publiez",
  "how.s3.body": "Récupérez vos contenus prêts à l'emploi et exportez-les où vous voulez.",

  "showcase.eyebrow": "PRODUIT",
  "showcase.title": "Un tableau de bord conçu pour la vitesse",
  "showcase.subtitle":
    "Workflows, contenus générés, crédits et performance réunis dans une interface unique.",

  "testimonials.eyebrow": "TÉMOIGNAGES",
  "testimonials.title": "Ils produisent plus, avec moins",
  "testimonials.t1":
    "Nous sommes passés de 8 à 60 contenus par mois sans recruter. Le workflow IA fait le gros du travail.",
  "testimonials.t2":
    "L'interface est la plus claire que j'aie utilisée. Le système de crédits est parfaitement lisible.",
  "testimonials.t3":
    "Clipora AI a remplacé trois outils dans notre stack. Le gain de temps est immédiat.",

  "pricing.eyebrow": "TARIFS",
  "pricing.title": "Un plan payant, sans surprise",
  "pricing.subtitle":
    "Pas de plan gratuit. Uniquement des abonnements pensés pour les créateurs professionnels.",
  "pricing.monthly": "Mensuel",
  "pricing.yearly": "Annuel",
  "pricing.save": "2 mois offerts",
  "pricing.perMonth": "/mois",
  "pricing.perYear": "/an",
  "pricing.popular": "LE PLUS POPULAIRE",
  "pricing.credits": "crédits IA / mois",
  "pricing.cta": "Choisir ce plan",
  "pricing.ctaCurrent": "Plan actuel",
  "pricing.billedYearly": "facturé annuellement",
  "pricing.feature.workflows": "Workflows IA illimités",
  "pricing.feature.formats": "Tous les formats de contenu",
  "pricing.feature.export": "Exports illimités",
  "pricing.feature.support": "Support prioritaire",
  "pricing.feature.team": "Accès équipe",
  "pricing.feature.api": "Accès API",
  "pricing.loading": "Chargement des plans…",

  "faq.eyebrow": "FAQ",
  "faq.title": "Questions fréquentes",
  "faq.q1": "Existe-t-il un plan gratuit ?",
  "faq.a1":
    "Non. Clipora AI est un service exclusivement payant. Chaque compte doit disposer d'un abonnement actif et vérifié pour accéder au produit.",
  "faq.q2": "Comment fonctionnent les crédits ?",
  "faq.a2":
    "Chaque plan attribue une enveloppe mensuelle de crédits (100, 500 ou 2 000). Chaque action IA en déduit une partie. L'enveloppe est réinitialisée à chaque renouvellement.",
  "faq.q3": "Quels moyens de paiement acceptez-vous ?",
  "faq.a3":
    "Les paiements sont traités par Flutterwave. Les moyens disponibles dépendent de la devise et de la configuration de votre compte Flutterwave.",
  "faq.q4": "Puis-je annuler à tout moment ?",
  "faq.a4":
    "Oui. L'annulation conserve votre accès payant jusqu'à la fin de la période en cours, puis l'abonnement expire automatiquement.",
  "faq.q5": "Puis-je changer de plan ?",
  "faq.a5":
    "Oui, depuis la page Facturation. Le nouveau plan est activé après vérification du paiement.",
  "faq.q6": "Mes données de paiement sont-elles sécurisées ?",
  "faq.a6":
    "Oui. Aucune donnée bancaire ne transite par Clipora AI. Chaque transaction est vérifiée côté serveur et via webhook signé avant toute activation.",

  "cta.title": "Prêt à produire dix fois plus ?",
  "cta.subtitle": "Rejoignez Clipora AI et lancez votre premier workflow aujourd'hui.",
  "cta.button": "Commencer maintenant",

  "footer.product": "Produit",
  "footer.company": "Entreprise",
  "footer.legal": "Légal",
  "footer.about": "À propos",
  "footer.contact": "Contact",
  "footer.terms": "Conditions",
  "footer.privacy": "Confidentialité",
  "footer.refund": "Remboursement",
  "footer.rights": "Tous droits réservés.",
  "footer.blurb":
    "Clipora AI automatise la production de contenu pour les créateurs et les équipes marketing.",

  "auth.login.title": "Content de vous revoir",
  "auth.login.subtitle": "Connectez-vous pour accéder à votre studio.",
  "auth.signup.title": "Créez votre compte",
  "auth.signup.subtitle": "Un compte est nécessaire avant le paiement.",
  "auth.email": "Adresse e-mail",
  "auth.password": "Mot de passe",
  "auth.name": "Nom complet",
  "auth.login.button": "Se connecter",
  "auth.signup.button": "Créer mon compte",
  "auth.google": "Continuer avec Google",
  "auth.or": "ou",
  "auth.noAccount": "Pas encore de compte ?",
  "auth.hasAccount": "Vous avez déjà un compte ?",
  "auth.checkEmail": "Vérifiez votre boîte mail pour confirmer votre compte.",

  "checkout.title": "Finaliser votre abonnement",
  "checkout.subtitle": "Vous serez redirigé vers le paiement sécurisé Flutterwave.",
  "checkout.plan": "Plan",
  "checkout.interval": "Périodicité",
  "checkout.total": "Total à payer",
  "checkout.pay": "Payer avec Flutterwave",
  "checkout.securedBy": "Paiement sécurisé traité par Flutterwave",
  "checkout.noPlan": "Aucun plan sélectionné.",
  "checkout.choosePlan": "Voir les tarifs",
  "checkout.notConfigured":
    "Le paiement n'est pas encore configuré. Ajoutez les clés Flutterwave dans les secrets du projet.",

  "payment.success.title": "Paiement confirmé",
  "payment.success.body": "Votre abonnement est actif et vos crédits ont été attribués.",
  "payment.verifying": "Vérification du paiement en cours…",
  "payment.failed.title": "Paiement échoué",
  "payment.failed.body":
    "La transaction n'a pas abouti. Aucun accès premium n'a été activé et aucun montant n'a été débité.",
  "payment.pending.title": "Paiement en attente",
  "payment.pending.body":
    "Votre paiement est en cours de traitement. L'accès sera activé automatiquement dès confirmation.",
  "payment.retry": "Réessayer",
  "payment.toDashboard": "Aller au tableau de bord",
  "payment.toPricing": "Retour aux tarifs",

  "studio.title": "Studio IA",
  "studio.subtitle": "Générez des scripts et des vidéos courtes avec le moteur Clipora.",
  "studio.kind.script": "Script",
  "studio.kind.video": "Vidéo",
  "studio.placeholder": "Décrivez la scène ou le sujet à produire (minimum 8 caractères)…",
  "studio.duration": "Durée",
  "studio.resolution": "Résolution",
  "studio.format": "Format",
  "studio.generate": "Générer",
  "studio.credits": "crédits",
  "studio.inProgress": "Génération en cours, cela peut prendre 1 à 3 minutes…",
  "studio.started": "Génération lancée.",
  "studio.done": "Génération terminée.",
  "studio.history": "Historique",
  "studio.err.credits": "Crédits insuffisants pour cette action.",
  "studio.err.engine": "Le moteur IA a renvoyé une erreur. Les crédits ont été remboursés.",
  "studio.notConfigured": "Le moteur IA n'est pas configuré sur ce projet.",
  "studio.status.queued": "En attente",
  "studio.status.running": "En cours",
  "studio.status.completed": "Terminé",
  "studio.status.failed": "Échec",
  "studio.status.refunded": "Remboursé",
  "nav.studio": "Studio",

  "dashboard.title": "Tableau de bord",
  "dashboard.welcome": "Bonjour",
  "dashboard.credits": "Crédits restants",
  "dashboard.used": "Utilisés cette période",
  "dashboard.allowance": "Enveloppe mensuelle",
  "dashboard.reset": "Réinitialisation",
  "dashboard.plan": "Plan actuel",
  "dashboard.noSub.title": "Aucun abonnement actif",
  "dashboard.noSub.body":
    "Clipora AI est un service payant. Choisissez un plan pour débloquer le studio IA.",
  "dashboard.noSub.cta": "Voir les tarifs",
  "dashboard.run.title": "Lancer un workflow IA",
  "dashboard.run.placeholder": "Décrivez le contenu à produire…",
  "dashboard.run.button": "Générer (1 crédit)",
  "dashboard.run.success": "Workflow exécuté. 1 crédit déduit.",
  "dashboard.run.noCredits": "Crédits insuffisants pour cette action.",
  "dashboard.activity": "Activité récente",
  "dashboard.noActivity": "Aucune activité pour le moment.",

  "billing.title": "Facturation",
  "billing.currentPlan": "Plan actuel",
  "billing.status": "Statut",
  "billing.nextBilling": "Prochaine facturation",
  "billing.credits": "Crédits",
  "billing.changePlan": "Changer de plan",
  "billing.cancel": "Annuler l'abonnement",
  "billing.cancelConfirm.title": "Annuler votre abonnement ?",
  "billing.cancelConfirm.body":
    "Vous conserverez l'accès payant jusqu'à la fin de la période en cours. Ensuite, l'abonnement expirera automatiquement.",
  "billing.cancelConfirm.confirm": "Confirmer l'annulation",
  "billing.cancelConfirm.back": "Retour",
  "billing.canceled": "Annulation programmée à la fin de la période.",
  "billing.history": "Historique des paiements",
  "billing.date": "Date",
  "billing.amount": "Montant",
  "billing.noPayments": "Aucun paiement enregistré.",
  "billing.cancelScheduled": "Annulation programmée",

  "admin.title": "Administration",
  "admin.users": "Utilisateurs",
  "admin.activeSubs": "Abonnements actifs",
  "admin.revenue": "Revenu encaissé",
  "admin.failed": "Paiements échoués",
  "admin.cancellations": "Annulations",
  "admin.plans": "Plans",
  "admin.payments": "Historique des paiements",
  "admin.plan.code": "Code",
  "admin.plan.monthly": "Prix mensuel",
  "admin.plan.yearly": "Prix annuel",
  "admin.plan.credits": "Crédits",
  "admin.plan.flwMonthly": "Flutterwave Plan ID (mensuel)",
  "admin.plan.flwYearly": "Flutterwave Plan ID (annuel)",
  "admin.save": "Enregistrer",
  "admin.saved": "Plan mis à jour.",
  "admin.denied": "Accès réservé aux administrateurs.",

  "status.active": "Actif",
  "status.canceled": "Annulé",
  "status.past_due": "Impayé",
  "status.expired": "Expiré",
  "status.incomplete": "Incomplet",
  "status.pending": "En attente",
  "status.successful": "Réussi",
  "status.failed": "Échoué",

  "common.loading": "Chargement…",
  "common.error": "Une erreur est survenue.",
  "common.back": "Retour",
  "common.none": "—",
  "common.month": "mois",
  "common.year": "an",
};

const en: Dict = {
  "brand.tagline": "AI content automation",

  "nav.features": "Features",
  "nav.how": "How it works",
  "nav.pricing": "Pricing",
  "nav.faq": "FAQ",
  "nav.login": "Log in",
  "nav.start": "Get started",
  "nav.dashboard": "Dashboard",
  "nav.billing": "Billing",
  "nav.admin": "Admin",
  "nav.logout": "Log out",

  "hero.badge": "⚡ POWERED BY AI",
  "hero.title.a": "Transform your",
  "hero.title.b": "content",
  "hero.title.c": "with ",
  "hero.title.d": "AI",
  "hero.subtitle":
    "Clipora AI automates your content workflows: generation, repurposing, rewriting and publishing. Create more content, faster, without growing your team.",
  "hero.cta.primary": "Get started now",
  "hero.cta.secondary": "See how it works",
  "hero.note": "Paid subscription • Secure payment",

  "social.title": "Demanding content teams run on Clipora AI",
  "social.metric1": "pieces generated",
  "social.metric2": "hours saved / month",
  "social.metric3": "satisfaction",
  "social.metric4": "countries served",

  "problem.eyebrow": "THE PROBLEM",
  "problem.title": "Producing content takes far too long",
  "problem.subtitle":
    "Between ideation, writing, editing and publishing, your best ideas die in the queue.",
  "problem.card1.title": "Save time",
  "problem.card1.body":
    "What used to take a full day now takes minutes. AI prepares, you approve.",
  "problem.card2.title": "Automate the workflow",
  "problem.card2.body":
    "Chain generation, variants, formats and exports into one repeatable pipeline.",
  "problem.card3.title": "Create faster",
  "problem.card3.body":
    "Multiply your output tenfold without multiplying your team or your budget.",

  "features.eyebrow": "FEATURES",
  "features.title": "A real AI production studio",
  "features.subtitle": "Everything you need to turn an idea into publishable content.",
  "features.f1.title": "Generation studio",
  "features.f1.body":
    "Generate scripts, posts, descriptions and variants from a single brief, in your brand voice.",
  "features.f2.title": "Automated workflows",
  "features.f2.body":
    "Chain multiple AI steps into one pipeline: analysis, writing, per-platform adaptation, QA.",
  "features.f3.title": "Production analytics",
  "features.f3.body":
    "Track output volume, credit consumption and workflow performance in real time.",
  "features.f4.title": "Transparent credits",
  "features.f4.body":
    "Every AI action costs a clear number of credits. Balance, usage and reset date always visible.",

  "how.eyebrow": "HOW IT WORKS",
  "how.title": "Three steps, zero friction",
  "how.s1.title": "Pick your plan",
  "how.s1.body": "Starter, Pro or Business. Secure payment, access after verification.",
  "how.s2.title": "Describe what you need",
  "how.s2.body": "A brief, a source or a theme is enough to start a workflow.",
  "how.s3.title": "Publish",
  "how.s3.body": "Collect ready-to-use content and export it anywhere.",

  "showcase.eyebrow": "PRODUCT",
  "showcase.title": "A dashboard built for speed",
  "showcase.subtitle":
    "Workflows, generated content, credits and performance in a single interface.",

  "testimonials.eyebrow": "TESTIMONIALS",
  "testimonials.title": "They ship more, with less",
  "testimonials.t1":
    "We went from 8 to 60 pieces a month without hiring. The AI workflow does the heavy lifting.",
  "testimonials.t2":
    "The cleanest interface I have used. The credit system is perfectly readable.",
  "testimonials.t3":
    "Clipora AI replaced three tools in our stack. The time savings were immediate.",

  "pricing.eyebrow": "PRICING",
  "pricing.title": "One paid plan, no surprises",
  "pricing.subtitle":
    "No free plan. Only subscriptions designed for professional creators.",
  "pricing.monthly": "Monthly",
  "pricing.yearly": "Yearly",
  "pricing.save": "2 months free",
  "pricing.perMonth": "/month",
  "pricing.perYear": "/year",
  "pricing.popular": "MOST POPULAR",
  "pricing.credits": "AI credits / month",
  "pricing.cta": "Choose this plan",
  "pricing.ctaCurrent": "Current plan",
  "pricing.billedYearly": "billed yearly",
  "pricing.feature.workflows": "Unlimited AI workflows",
  "pricing.feature.formats": "All content formats",
  "pricing.feature.export": "Unlimited exports",
  "pricing.feature.support": "Priority support",
  "pricing.feature.team": "Team access",
  "pricing.feature.api": "API access",
  "pricing.loading": "Loading plans…",

  "faq.eyebrow": "FAQ",
  "faq.title": "Frequently asked questions",
  "faq.q1": "Is there a free plan?",
  "faq.a1":
    "No. Clipora AI is a paid-only service. Every account needs an active, verified subscription to access the product.",
  "faq.q2": "How do credits work?",
  "faq.a2":
    "Each plan grants a monthly credit allowance (100, 500 or 2,000). Every AI action deducts from it. The allowance resets on each renewal.",
  "faq.q3": "Which payment methods do you accept?",
  "faq.a3":
    "Payments are processed by Flutterwave. Available methods depend on the currency and your Flutterwave account configuration.",
  "faq.q4": "Can I cancel anytime?",
  "faq.a4":
    "Yes. Cancelling keeps your paid access until the end of the current period, then the subscription expires automatically.",
  "faq.q5": "Can I change plan?",
  "faq.a5": "Yes, from the Billing page. The new plan activates after payment verification.",
  "faq.q6": "Is my payment data secure?",
  "faq.a6":
    "Yes. No card data ever touches Clipora AI. Every transaction is verified server-side and through a signed webhook before any activation.",

  "cta.title": "Ready to produce ten times more?",
  "cta.subtitle": "Join Clipora AI and launch your first workflow today.",
  "cta.button": "Get started now",

  "footer.product": "Product",
  "footer.company": "Company",
  "footer.legal": "Legal",
  "footer.about": "About",
  "footer.contact": "Contact",
  "footer.terms": "Terms",
  "footer.privacy": "Privacy",
  "footer.refund": "Refunds",
  "footer.rights": "All rights reserved.",
  "footer.blurb":
    "Clipora AI automates content production for creators and marketing teams.",

  "auth.login.title": "Welcome back",
  "auth.login.subtitle": "Log in to access your studio.",
  "auth.signup.title": "Create your account",
  "auth.signup.subtitle": "An account is required before payment.",
  "auth.email": "Email address",
  "auth.password": "Password",
  "auth.name": "Full name",
  "auth.login.button": "Log in",
  "auth.signup.button": "Create my account",
  "auth.google": "Continue with Google",
  "auth.or": "or",
  "auth.noAccount": "No account yet?",
  "auth.hasAccount": "Already have an account?",
  "auth.checkEmail": "Check your inbox to confirm your account.",

  "checkout.title": "Complete your subscription",
  "checkout.subtitle": "You will be redirected to Flutterwave secure checkout.",
  "checkout.plan": "Plan",
  "checkout.interval": "Billing period",
  "checkout.total": "Total due",
  "checkout.pay": "Pay with Flutterwave",
  "checkout.securedBy": "Secure payment processed by Flutterwave",
  "checkout.noPlan": "No plan selected.",
  "checkout.choosePlan": "See pricing",
  "checkout.notConfigured":
    "Payments are not configured yet. Add the Flutterwave keys in project secrets.",

  "payment.success.title": "Payment confirmed",
  "payment.success.body": "Your subscription is active and your credits have been granted.",
  "payment.verifying": "Verifying your payment…",
  "payment.failed.title": "Payment failed",
  "payment.failed.body":
    "The transaction did not complete. No premium access was activated and no amount was charged.",
  "payment.pending.title": "Payment pending",
  "payment.pending.body":
    "Your payment is being processed. Access will be activated automatically once confirmed.",
  "payment.retry": "Try again",
  "payment.toDashboard": "Go to dashboard",
  "payment.toPricing": "Back to pricing",

  "studio.title": "AI Studio",
  "studio.subtitle": "Generate scripts and short videos with the Clipora engine.",
  "studio.kind.script": "Script",
  "studio.kind.video": "Video",
  "studio.placeholder": "Describe the scene or topic to produce (at least 8 characters)…",
  "studio.duration": "Duration",
  "studio.resolution": "Resolution",
  "studio.format": "Format",
  "studio.generate": "Generate",
  "studio.credits": "credits",
  "studio.inProgress": "Generating, this can take 1 to 3 minutes…",
  "studio.started": "Generation started.",
  "studio.done": "Generation completed.",
  "studio.history": "History",
  "studio.err.credits": "Not enough credits for this action.",
  "studio.err.engine": "The AI engine returned an error. Credits were refunded.",
  "studio.notConfigured": "The AI engine is not configured on this project.",
  "studio.status.queued": "Queued",
  "studio.status.running": "Running",
  "studio.status.completed": "Completed",
  "studio.status.failed": "Failed",
  "studio.status.refunded": "Refunded",
  "nav.studio": "Studio",

  "dashboard.title": "Dashboard",
  "dashboard.welcome": "Hello",
  "dashboard.credits": "Credits left",
  "dashboard.used": "Used this period",
  "dashboard.allowance": "Monthly allowance",
  "dashboard.reset": "Resets on",
  "dashboard.plan": "Current plan",
  "dashboard.noSub.title": "No active subscription",
  "dashboard.noSub.body":
    "Clipora AI is a paid service. Choose a plan to unlock the AI studio.",
  "dashboard.noSub.cta": "See pricing",
  "dashboard.run.title": "Run an AI workflow",
  "dashboard.run.placeholder": "Describe the content you need…",
  "dashboard.run.button": "Generate (1 credit)",
  "dashboard.run.success": "Workflow executed. 1 credit deducted.",
  "dashboard.run.noCredits": "Not enough credits for this action.",
  "dashboard.activity": "Recent activity",
  "dashboard.noActivity": "No activity yet.",

  "billing.title": "Billing",
  "billing.currentPlan": "Current plan",
  "billing.status": "Status",
  "billing.nextBilling": "Next billing date",
  "billing.credits": "Credits",
  "billing.changePlan": "Change plan",
  "billing.cancel": "Cancel subscription",
  "billing.cancelConfirm.title": "Cancel your subscription?",
  "billing.cancelConfirm.body":
    "You keep paid access until the end of the current period. After that, the subscription expires automatically.",
  "billing.cancelConfirm.confirm": "Confirm cancellation",
  "billing.cancelConfirm.back": "Back",
  "billing.canceled": "Cancellation scheduled at period end.",
  "billing.history": "Payment history",
  "billing.date": "Date",
  "billing.amount": "Amount",
  "billing.noPayments": "No payments recorded.",
  "billing.cancelScheduled": "Cancellation scheduled",

  "admin.title": "Administration",
  "admin.users": "Users",
  "admin.activeSubs": "Active subscriptions",
  "admin.revenue": "Collected revenue",
  "admin.failed": "Failed payments",
  "admin.cancellations": "Cancellations",
  "admin.plans": "Plans",
  "admin.payments": "Payment history",
  "admin.plan.code": "Code",
  "admin.plan.monthly": "Monthly price",
  "admin.plan.yearly": "Yearly price",
  "admin.plan.credits": "Credits",
  "admin.plan.flwMonthly": "Flutterwave Plan ID (monthly)",
  "admin.plan.flwYearly": "Flutterwave Plan ID (yearly)",
  "admin.save": "Save",
  "admin.saved": "Plan updated.",
  "admin.denied": "Administrators only.",

  "status.active": "Active",
  "status.canceled": "Canceled",
  "status.past_due": "Past due",
  "status.expired": "Expired",
  "status.incomplete": "Incomplete",
  "status.pending": "Pending",
  "status.successful": "Successful",
  "status.failed": "Failed",

  "common.loading": "Loading…",
  "common.error": "Something went wrong.",
  "common.back": "Back",
  "common.none": "—",
  "common.month": "month",
  "common.year": "year",
};

const dictionaries: Record<Lang, Dict> = { fr, en };

type I18nValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

function detectLang(): Lang {
  if (typeof window === "undefined") return "fr";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "fr" || stored === "en") return stored;
  const nav = window.navigator.language?.toLowerCase() ?? "fr";
  return nav.startsWith("en") ? "en" : "fr";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fr");

  useEffect(() => {
    setLangState(detectLang());
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, l);
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      let out = dictionaries[lang][key] ?? dictionaries.en[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) out = out.replaceAll(`{${k}}`, String(v));
      }
      return out;
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
