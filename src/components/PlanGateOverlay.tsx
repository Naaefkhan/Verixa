import React from "react";
import {
  Lock,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  Terminal,
  Database,
  BarChart3,
  CheckCircle2,
  ArrowLeft,
  AlertTriangle,
  Globe2,
} from "lucide-react";
import { SubscriptionTier, PLAN_CONFIGS } from "../types";
import { detectUserCurrency, formatPlanPrice, SUPPORTED_CURRENCIES } from "../utils/currency";

export interface PlanGateOverlayProps {
  requiredTier: SubscriptionTier;
  currentTier: SubscriptionTier;
  featureName?: string;
  featureTitle?: string;
  featureDescription?: string;
  bulletPoints?: string[];
  onOpenPricing?: (suggestedTier?: SubscriptionTier) => void;
  onUpgrade?: () => void;
  onBack?: () => void;
  onQuickUpgrade?: (tier: SubscriptionTier) => void;
}

export const PlanGateOverlay: React.FC<PlanGateOverlayProps> = ({
  requiredTier = "ULTRA",
  currentTier = "FREE",
  featureName,
  featureTitle,
  featureDescription,
  bulletPoints,
  onOpenPricing,
  onUpgrade,
  onBack,
  onQuickUpgrade,
}) => {
  const normalizedReqTier: SubscriptionTier =
    requiredTier === "FREE" || requiredTier === "PLUS" || requiredTier === "PRO" || requiredTier === "ULTRA"
      ? requiredTier
      : "ULTRA";
  const normalizedCurrTier: SubscriptionTier =
    currentTier === "FREE" || currentTier === "PLUS" || currentTier === "PRO" || currentTier === "ULTRA"
      ? currentTier
      : "FREE";

  const effectiveName = featureName || featureTitle || "PowerBI Analytics Dashboard";
  const reqPlan = PLAN_CONFIGS[normalizedReqTier] || PLAN_CONFIGS.ULTRA;
  const currPlan = PLAN_CONFIGS[normalizedCurrTier] || PLAN_CONFIGS.FREE;

  // Currency detection
  const currencyCode = detectUserCurrency();
  const currencyConfig = SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES.USD;
  const price = formatPlanPrice(normalizedReqTier, currencyCode, "monthly");

  const effectiveDescription =
    featureDescription ||
    `Access to ${effectiveName} is reserved for paid subscription tiers. Upgrade your workspace to unlock multi-dimensional interactive charts, departmental pipeline metrics, and enterprise telemetry.`;

  const defaultBullets: Partial<Record<SubscriptionTier, string[]>> = {
    FREE: ["50 pages monthly quota", "OCR extraction preview", "Standard pipeline"],
    PLUS: [
      "High volume document processing",
      "Python 3.x automated data cleaning engine",
      "100% English transliteration & auto-normalization",
      "Devanagari numerals (०-९) conversion",
      "Smart missing value auto-imputation",
    ],
    PRO: [
      "Full automated cleaning & auto-imputation",
      "Full ACID SQLite relational database explorer",
      "Direct SQL query console & table inspection",
      "Instant CSV, JSON, and SQL table exports",
    ],
    ULTRA: [
      "PowerBI-style real-time interactive business analytics",
      "Departmental ingestion speed & SLA telemetry",
      "SOC2 Type II & GDPR Art. 30 SHA-256 compliance ledger",
      "All Python cleaning & SQL database capabilities included",
    ],
    STARTER: [
      "500 pages/month processing quota",
      "Batch document upload & processing",
      "CSV & Excel direct export",
      "Standard email support",
    ],
    PROFESSIONAL: [
      "2,500 pages/month processing quota",
      "Advanced Python cleaning engine",
      "Multi-user collaboration (up to 5 seats)",
      "Priority processing queue",
    ],
    BUSINESS: [
      "10,000 pages/month processing quota",
      "Direct Power BI & Tableau connector",
      "Custom cleaning rules & schema mapping",
      "Dedicated account manager",
    ],
    ENTERPRISE: [
      "Unlimited pages/month processing quota",
      "On-premises / Private Cloud deployment",
      "Custom ML model fine-tuning",
      "24/7 Phone support & 99.9% uptime SLA",
    ],
  };

  const effectiveBullets =
    bulletPoints && bulletPoints.length > 0
      ? bulletPoints
      : defaultBullets[requiredTier] || defaultBullets.ULTRA;

  const handleUpgradeClick = () => {
    if (onOpenPricing) {
      onOpenPricing(requiredTier);
    } else if (onUpgrade) {
      onUpgrade();
    }
  };

  const getFeatureIcon = () => {
    const lowerName = (effectiveName || "").toLowerCase();
    if (lowerName.includes("power") || lowerName.includes("chart") || lowerName.includes("dashboard")) {
      return <BarChart3 className="w-10 h-10 text-purple-600 dark:text-purple-400" />;
    }
    if (lowerName.includes("python") || lowerName.includes("review")) {
      return <Terminal className="w-10 h-10 text-blue-600 dark:text-blue-400" />;
    }
    if (lowerName.includes("sql") || lowerName.includes("data")) {
      return <Database className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />;
    }
    if (lowerName.includes("audit") || lowerName.includes("compliance")) {
      return <ShieldCheck className="w-10 h-10 text-purple-600 dark:text-purple-400" />;
    }
    return <Lock className="w-10 h-10 text-amber-500" />;
  };

  return (
    <div
      id={`plan-gate-${(effectiveName || "feature").toLowerCase().replace(/\s+/g, "-")}`}
      className="w-full max-w-4xl mx-auto py-8 px-4 sm:px-6 animate-in fade-in duration-300"
    >
      <div className="relative rounded-3xl bg-gradient-to-b from-white via-slate-50/50 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-10 overflow-hidden">
        {/* Glow ambient background rings */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-purple-500/10 dark:bg-purple-600/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 rounded-full bg-blue-500/10 dark:bg-blue-600/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
          {/* USER DIRECTIVE NOTICE: "Get the paid version to access these" */}
          <div
            id="paid-version-notice-banner"
            className="w-full mb-6 p-3.5 rounded-2xl bg-amber-500/15 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-200 flex items-center justify-center gap-2 shadow-xs"
          >
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wide">
              Get the paid version to access these features
            </span>
          </div>

          {/* Central Feature Icon with Lock Badge */}
          <div className="relative mb-4">
            <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-lg">
              {getFeatureIcon()}
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-md border-2 border-white dark:border-slate-900">
              <Lock className="w-4 h-4" />
            </div>
          </div>

          {/* Plan requirement tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Requires {reqPlan.name} Plan</span>
            <span>•</span>
            <span className="font-normal opacity-80">You are currently on {currPlan.name}</span>
          </div>

          {/* Headline */}
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
            Unlock {effectiveName}
          </h2>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
            {effectiveDescription}
          </p>

          {/* Country / Currency Indicator */}
          <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-6 bg-slate-100 dark:bg-slate-800/60 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
            <Globe2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Pricing shown in {currencyConfig.name} ({currencyConfig.symbol}) for {currencyConfig.country} {currencyConfig.flag}</span>
          </div>

          {/* Key Value Prop Bullets */}
          <div className="w-full bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/70 p-5 mb-7 text-left shadow-xs">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-3 flex items-center justify-between">
              <span>Included in the {reqPlan.name} Paid Tier:</span>
              <span className="text-purple-600 dark:text-purple-400 font-bold">
                {price.formatted} {price.suffix}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {effectiveBullets.map((bullet, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>{bullet}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
            <button
              id={`btn-upgrade-paid-${(requiredTier || "ultra").toLowerCase()}`}
              onClick={handleUpgradeClick}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-black text-sm shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Get the Paid Version ({price.formatted}/mo)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {onBack && (
              <button
                id="btn-back-to-scanner"
                onClick={onBack}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Data Entry</span>
              </button>
            )}

            {onQuickUpgrade && (
              <button
                id={`btn-quick-switch-${(requiredTier || "ultra").toLowerCase()}`}
                onClick={() => onQuickUpgrade(requiredTier)}
                className="w-full sm:w-auto px-4 py-3 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-semibold text-xs transition-all border border-purple-200 dark:border-purple-800 flex items-center justify-center gap-1.5"
                title="Instant switch for preview and evaluation"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Instant Switch to {reqPlan.name}</span>
              </button>
            )}
          </div>

          <div className="mt-4 text-[11px] text-slate-400 dark:text-slate-500">
            Secure checkout. Convert between currencies and change or cancel plans anytime.
          </div>
        </div>
      </div>
    </div>
  );
};
