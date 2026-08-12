/**
 * Centralised, client-safe billing configuration for Clipora AI.
 *
 * Prices, credits and Flutterwave Plan IDs live in the `subscription_plans`
 * table and are ALWAYS re-read server-side before a charge. Nothing here is
 * trusted for pricing — this file only holds presentation + currency policy.
 */

export type BillingInterval = "monthly" | "yearly";

export type CurrencyCode = "EUR" | "XAF" | "USD";

export type CurrencyDefinition = {
  code: CurrencyCode;
  symbol: string;
  locale: string;
  /**
   * Whether this currency is actually enabled for recurring Flutterwave
   * payments in the current configuration. Only enabled currencies are ever
   * offered at checkout — we never fake a conversion.
   */
  supportedForRecurring: boolean;
  minorUnits: number;
};

export const CURRENCIES: Record<CurrencyCode, CurrencyDefinition> = {
  EUR: { code: "EUR", symbol: "€", locale: "fr-FR", supportedForRecurring: true, minorUnits: 2 },
  XAF: { code: "XAF", symbol: "FCFA", locale: "fr-CM", supportedForRecurring: false, minorUnits: 0 },
  USD: { code: "USD", symbol: "$", locale: "en-US", supportedForRecurring: false, minorUnits: 2 },
};

export const DEFAULT_CURRENCY: CurrencyCode = "EUR";

export function supportedCurrencies(): CurrencyDefinition[] {
  return Object.values(CURRENCIES).filter((c) => c.supportedForRecurring);
}

export function formatMoney(amount: number, currency: string, lang: "fr" | "en" = "fr"): string {
  const def = CURRENCIES[currency as CurrencyCode];
  const locale = def ? (lang === "en" ? "en-US" : def.locale) : lang === "en" ? "en-US" : "fr-FR";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: def?.minorUnits === 0 ? 0 : 2,
      minimumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

export const PLAN_FEATURES: Record<string, string[]> = {
  starter: ["pricing.feature.workflows", "pricing.feature.formats", "pricing.feature.export"],
  pro: [
    "pricing.feature.workflows",
    "pricing.feature.formats",
    "pricing.feature.export",
    "pricing.feature.support",
  ],
  business: [
    "pricing.feature.workflows",
    "pricing.feature.formats",
    "pricing.feature.export",
    "pricing.feature.support",
    "pricing.feature.team",
    "pricing.feature.api",
  ],
};

/** Credits consumed per AI action type. Configurable in one place. */
export const CREDIT_COSTS = {
  generate: 1,
  workflow: 3,
} as const;
