import { SubscriptionTier } from "../types";

export type CurrencyCode = "INR" | "USD" | "EUR" | "GBP" | "AUD" | "CAD" | "JPY";

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  flag: string;
  country: string;
  isIndia?: boolean;
}

export const SUPPORTED_CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  INR: {
    code: "INR",
    symbol: "₹",
    name: "Indian Rupee",
    flag: "🇮🇳",
    country: "India",
    isIndia: true,
  },
  USD: {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    flag: "🇺🇸",
    country: "United States / Global",
  },
  EUR: {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    flag: "🇪🇺",
    country: "European Union",
  },
  GBP: {
    code: "GBP",
    symbol: "£",
    name: "British Pound",
    flag: "🇬🇧",
    country: "United Kingdom",
  },
  AUD: {
    code: "AUD",
    symbol: "A$",
    name: "Australian Dollar",
    flag: "🇦🇺",
    country: "Australia",
  },
  CAD: {
    code: "CAD",
    symbol: "C$",
    name: "Canadian Dollar",
    flag: "🇨🇦",
    country: "Canada",
  },
  JPY: {
    code: "JPY",
    symbol: "¥",
    name: "Japanese Yen",
    flag: "🇯🇵",
    country: "Japan",
  },
};

// Pricing matrix tailored per currency
interface TierPricingRecord {
  monthly: number;
  annualMonthly: number;
}

export const TIER_PRICING: Record<SubscriptionTier, Record<CurrencyCode, TierPricingRecord>> = {
  FREE: {
    INR: { monthly: 0, annualMonthly: 0 },
    USD: { monthly: 0, annualMonthly: 0 },
    EUR: { monthly: 0, annualMonthly: 0 },
    GBP: { monthly: 0, annualMonthly: 0 },
    AUD: { monthly: 0, annualMonthly: 0 },
    CAD: { monthly: 0, annualMonthly: 0 },
    JPY: { monthly: 0, annualMonthly: 0 },
  },
  STARTER: {
    INR: { monthly: 299, annualMonthly: 249 },
    USD: { monthly: 4, annualMonthly: 3 },
    EUR: { monthly: 3.5, annualMonthly: 3 },
    GBP: { monthly: 3, annualMonthly: 2.5 },
    AUD: { monthly: 6, annualMonthly: 5 },
    CAD: { monthly: 5.5, annualMonthly: 4.5 },
    JPY: { monthly: 550, annualMonthly: 450 },
  },
  PROFESSIONAL: {
    INR: { monthly: 999, annualMonthly: 799 },
    USD: { monthly: 12, annualMonthly: 10 },
    EUR: { monthly: 11, annualMonthly: 9 },
    GBP: { monthly: 9.5, annualMonthly: 8 },
    AUD: { monthly: 18, annualMonthly: 15 },
    CAD: { monthly: 16, annualMonthly: 13 },
    JPY: { monthly: 1800, annualMonthly: 1500 },
  },
  BUSINESS: {
    INR: { monthly: 2999, annualMonthly: 2499 },
    USD: { monthly: 36, annualMonthly: 30 },
    EUR: { monthly: 33, annualMonthly: 28 },
    GBP: { monthly: 29, annualMonthly: 24 },
    AUD: { monthly: 55, annualMonthly: 46 },
    CAD: { monthly: 49, annualMonthly: 41 },
    JPY: { monthly: 5400, annualMonthly: 4500 },
  },
  ENTERPRISE: {
    INR: { monthly: 0, annualMonthly: 0 },
    USD: { monthly: 0, annualMonthly: 0 },
    EUR: { monthly: 0, annualMonthly: 0 },
    GBP: { monthly: 0, annualMonthly: 0 },
    AUD: { monthly: 0, annualMonthly: 0 },
    CAD: { monthly: 0, annualMonthly: 0 },
    JPY: { monthly: 0, annualMonthly: 0 },
  },
  // Backward compatibility mappings
  PLUS: {
    INR: { monthly: 299, annualMonthly: 249 },
    USD: { monthly: 4, annualMonthly: 3 },
    EUR: { monthly: 3.5, annualMonthly: 3 },
    GBP: { monthly: 3, annualMonthly: 2.5 },
    AUD: { monthly: 6, annualMonthly: 5 },
    CAD: { monthly: 5.5, annualMonthly: 4.5 },
    JPY: { monthly: 550, annualMonthly: 450 },
  },
  PRO: {
    INR: { monthly: 999, annualMonthly: 799 },
    USD: { monthly: 12, annualMonthly: 10 },
    EUR: { monthly: 11, annualMonthly: 9 },
    GBP: { monthly: 9.5, annualMonthly: 8 },
    AUD: { monthly: 18, annualMonthly: 15 },
    CAD: { monthly: 16, annualMonthly: 13 },
    JPY: { monthly: 1800, annualMonthly: 1500 },
  },
  ULTRA: {
    INR: { monthly: 2999, annualMonthly: 2499 },
    USD: { monthly: 36, annualMonthly: 30 },
    EUR: { monthly: 33, annualMonthly: 28 },
    GBP: { monthly: 29, annualMonthly: 24 },
    AUD: { monthly: 55, annualMonthly: 46 },
    CAD: { monthly: 49, annualMonthly: 41 },
    JPY: { monthly: 5400, annualMonthly: 4500 },
  },
};

/**
 * Automatically detect user's currency and country based on timezone, language and location
 */
export function detectUserCurrency(): CurrencyCode {
  try {
    // 1. Check if user already manually selected one
    const saved = localStorage.getItem("verixa_currency");
    if (saved && saved in SUPPORTED_CURRENCIES) {
      return saved as CurrencyCode;
    }

    // 2. Check timezone
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    const tzLower = timeZone.toLowerCase();

    if (
      tzLower.includes("calcutta") ||
      tzLower.includes("kolkata") ||
      tzLower.includes("india") ||
      tzLower.includes("ist") ||
      tzLower.includes("asia/delhi")
    ) {
      return "INR";
    }

    if (tzLower.includes("london") || tzLower.includes("britain") || tzLower.includes("belfast")) {
      return "GBP";
    }

    if (
      tzLower.includes("berlin") ||
      tzLower.includes("paris") ||
      tzLower.includes("rome") ||
      tzLower.includes("madrid") ||
      tzLower.includes("amsterdam") ||
      tzLower.includes("brussels") ||
      tzLower.includes("vienna") ||
      tzLower.includes("dublin") ||
      tzLower.includes("europe/")
    ) {
      return "EUR";
    }

    if (tzLower.includes("australia") || tzLower.includes("sydney") || tzLower.includes("melbourne") || tzLower.includes("brisbane") || tzLower.includes("perth")) {
      return "AUD";
    }

    if (tzLower.includes("toronto") || tzLower.includes("vancouver") || tzLower.includes("canada") || tzLower.includes("montreal") || tzLower.includes("edmonton")) {
      return "CAD";
    }

    if (tzLower.includes("tokyo") || tzLower.includes("japan")) {
      return "JPY";
    }

    // 3. Check browser language (e.g. en-IN, hi, mr, etc.)
    const languages = [
      navigator.language,
      ...(navigator.languages || []),
    ].map((l) => (l || "").toLowerCase());

    const isIndianLang = languages.some(
      (lang) =>
        lang.includes("-in") ||
        lang.startsWith("hi") ||
        lang.startsWith("mr") ||
        lang.startsWith("ta") ||
        lang.startsWith("te") ||
        lang.startsWith("bn") ||
        lang.startsWith("gu") ||
        lang.startsWith("kn") ||
        lang.startsWith("pa")
    );

    if (isIndianLang) {
      return "INR";
    }

    if (languages.some((l) => l.includes("-gb"))) {
      return "GBP";
    }

    if (languages.some((l) => l.includes("-au"))) {
      return "AUD";
    }

    if (languages.some((l) => l.includes("-ca"))) {
      return "CAD";
    }

    // Default to USD for global fallback
    return "USD";
  } catch (err) {
    return "USD";
  }
}

/**
 * Format plan price according to chosen currency and billing cycle
 */
export function formatPlanPrice(
  tier: SubscriptionTier,
  currency: CurrencyCode,
  cycle: "monthly" | "annual"
): { formatted: string; amount: number; suffix: string } {
  const config = SUPPORTED_CURRENCIES[currency] || SUPPORTED_CURRENCIES.USD;
  const pricing = TIER_PRICING[tier][currency] || TIER_PRICING[tier].USD;
  const amount = cycle === "annual" ? pricing.annualMonthly : pricing.monthly;

  if (tier === "ENTERPRISE") {
    return {
      formatted: "Custom",
      amount: 0,
      suffix: "tailored volume & SLA",
    };
  }

  if (amount === 0) {
    return {
      formatted: `${config.symbol}0`,
      amount: 0,
      suffix: "free public release",
    };
  }

  // Format with thousands separator
  const formattedNumber = amount.toLocaleString(
    currency === "INR" ? "en-IN" : "en-US"
  );

  return {
    formatted: `${config.symbol}${formattedNumber}`,
    amount,
    suffix: cycle === "annual" ? "/mo (billed annually)" : "/month",
  };
}
