# Clipora AI: Content Amplified

CREATE A BRAND-NEW PROJECT from scratch. DO NOT modify, remix, or reuse any existing project. Project/product name: Clipora AI.

Build a premium international AI SaaS inspired by the visual quality and structure of ViralClip.me and Remakeit.io, but with a completely original identity. The product must be PAY-ONLY: absolutely no free plan.

CORE OFFER:
- Starter: €9/month or €90/year — 100 AI credits/month
- Pro: €19/month or €190/year — 500 AI credits/month — visually highlighted as MOST POPULAR
- Business: €49/month or €490/year — 2,000 AI credits/month

MOST IMPORTANT REQUIREMENT: REAL FLUTTERWAVE PAYMENT INTEGRATION. Do not create a fake checkout or simulated payment. Build the architecture for production use with Flutterwave Payment Plans and webhooks. Use Supabase/PostgreSQL for users, subscriptions, payments, plans, credits, and webhook events. Never expose FLW_SECRET_KEY in frontend code. Use server-side functions/endpoints and environment variables: FLW_PUBLIC_KEY, FLW_SECRET_KEY, FLW_WEBHOOK_SECRET_HASH, FLW_ENVIRONMENT. Support Flutterwave Sandbox first and make it easy to switch to Production.

PAYMENT FLOW:
Visitor → Pricing → choose paid plan → authentication/account creation → Flutterwave checkout → server-side transaction verification → verified webhook → subscription activated → credits assigned → SaaS dashboard access. Never activate premium access based only on redirect/success page. Handle successful payments, failed payments, renewals, cancellation, past_due/expired states, idempotent webhook processing, and billing period dates.

Create database tables: subscription_plans, subscriptions, payments, payment_events, user_credits. Store Flutterwave Plan IDs centrally, not hardcoded across components. Server must validate the actual plan/price from the database rather than trusting browser values.

Create pages/routes: /, /pricing, /login, /signup, /checkout, /payment/success, /payment/failed, /payment/pending, /billing, /dashboard, /admin. Admin must be protected and show users, active subscriptions, plans, revenue/payment history, failed payments, cancellations, and editable plan prices/credits/Flutterwave Plan IDs.

BILLING:
Users can see current plan, status, next billing date, credits, payment history, change plan, and cancel subscription. Cancellation should preserve paid access until current_period_end, then automatically expire. Monthly/yearly toggle must work. Pricing values must be easy to modify from centralized configuration/database.

LANGUAGE:
Add a visible language selector in the navbar: 🇫🇷 FR / 🇬🇧 EN. Translate the entire UI including landing page, dashboard, pricing, checkout, billing, FAQ, errors, success messages and buttons. Detect browser language initially and persist the user's choice. Keep the brand name Clipora AI unchanged.

CURRENCY:
Prepare the architecture for EUR, XAF and USD, but only offer a currency/payment option when actually supported by the configured Flutterwave recurring-payment setup. Never fake currency conversion at checkout.

CREDITS:
Starter 100/month, Pro 500/month, Business 2,000/month. Track balance, monthly usage and reset date. Every AI action checks and deducts credits. Renewal resets the allowance. Values must be configurable.

LANDING PAGE DESIGN:
Create a visually exceptional SaaS landing page. Dark premium aesthetic, near-black background, electric lime/green accent, white typography, subtle glow, fine borders, rounded cards, subtle glassmorphism, huge modern typography, smooth micro-interactions, responsive mobile/tablet/desktop. Do not copy ViralClip or Remakeit; use them only as visual references.

NAVBAR:
Clipora AI logo on left. Links: Fonctionnalités, Comment ça marche, Tarifs, FAQ. Right side: FR/EN selector, Connexion, bright lime “Commencer”. Floating/glass navbar.

HERO:
Small badge: “⚡ PROPULSÉ PAR L’IA”
Headline: “Transformez votre contenu avec l’IA.” with the key words in electric lime.
Subheadline explaining that Clipora AI automates content workflows and helps create more content faster.
CTAs: “Commencer maintenant” and “Voir comment ça marche”. Under CTA: “Abonnement payant • Paiement sécurisé”.
Add a large premium product/dashboard preview under the hero with realistic AI workflow, generated content, analytics and credits.

SECTIONS:
1. Social proof with tasteful fictional monochrome logos and metrics.
2. Problem/solution: save time, automate workflow, create faster.
3. Features as large product-preview cards, not generic icon cards.
4. How it works in 3 steps.
5. Large product showcase/dashboard.
6. Testimonials.
7. Pricing with Starter/Pro/Business only, Pro highlighted.
8. FAQ.
9. Strong final CTA.
10. Premium footer.

PRICING UX:
No Free plan anywhere. Make Pro the recommended plan. Buttons must actually start the Flutterwave payment flow. Pricing must clearly show monthly/yearly options and savings.

SECURITY:
Never expose Flutterwave secret credentials in React, JavaScript, HTML, localStorage or URLs. Never trust client-side price/plan values. Verify transactions server-side. Validate webhook authenticity. Make webhook handling idempotent. Do not give premium access without verified payment.

TECH:
Use React + TypeScript + Tailwind CSS + shadcn/ui and Supabase/PostgreSQL. Build reusable components, clean architecture, responsive UI, functional navigation, accordion FAQ, billing state management and real backend payment architecture.

IMPORTANT: If Flutterwave credentials are not yet configured, still implement the complete real integration architecture, environment variable placeholders, backend endpoints, webhook handling, database schema and clear configuration instructions. Do NOT replace Flutterwave with mock payments.

The visual target is the premium quality of ViralClip.me + Remakeit.io, but the branding, copy, layout details and UI must be original to Clipora AI.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/bb22d0ce-24fa-4a52-809f-32a672a0232d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
