import React, { useState, useEffect } from "react";
import {
  X,
  Check,
  Zap,
  Sparkles,
  ShieldCheck,
  Terminal,
  Database,
  BarChart3,
  Globe2,
  AlertCircle,
  HelpCircle,
  Layers,
  Info,
} from "lucide-react";
import { SubscriptionTier, PLAN_CONFIGS } from "../types";
import {
  CurrencyCode,
  detectUserCurrency,
  formatPlanPrice,
  SUPPORTED_CURRENCIES,
} from "../utils/currency";

export interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: SubscriptionTier;
  onSelectTier?: (tier: SubscriptionTier) => void;
  onSelectPlan?: (tier: SubscriptionTier) => void;
  suggestedTier?: SubscriptionTier;
  scansUsed: number;
  onResetUsage?: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  currentTier = "FREE",
  onSelectTier,
  onSelectPlan,
  suggestedTier,
  scansUsed,
}) => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>(() => detectUserCurrency());
  const [plannedNotice, setPlannedNotice] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem("verixa_currency", selectedCurrency);
    } catch {
      // ignore
    }
  }, [selectedCurrency]);

  if (!isOpen) return null;

  const displayTiers: SubscriptionTier[] = [
    "FREE",
    "STARTER",
    "PROFESSIONAL",
    "BUSINESS",
    "ENTERPRISE",
  ];

  const currCurrencyConfig = SUPPORTED_CURRENCIES[selectedCurrency] || SUPPORTED_CURRENCIES.USD;

  const handlePlanClick = (tier: SubscriptionTier) => {
    if (tier === "FREE") {
      if (onSelectTier) onSelectTier("FREE");
      else if (onSelectPlan) onSelectPlan("FREE");
      onClose();
      return;
    }

    // Planned commercial tier popup (Section 11 & 12)
    const planName = PLAN_CONFIGS[tier]?.name || tier;
    setPlannedNotice(planName);
  };

  return (
    <div
      id="pricing-subscription-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-6xl max-h-[94vh] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden my-auto">
        {/* Top Product Roadmap Banner */}
        <div className="bg-emerald-500/10 dark:bg-emerald-500/20 border-b border-emerald-500/20 px-6 py-2.5 flex items-center justify-between text-xs text-emerald-950 dark:text-emerald-200">
          <div className="flex items-center gap-2 font-bold">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              Verixa Public Release: 100% Free with 50 pages/month. Python cleaning, SQL storage, &amp; BI analytics are unlocked.
            </span>
          </div>
          {currCurrencyConfig.isIndia && (
            <span className="hidden sm:inline-flex items-center gap-1 font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800 text-[11px]">
              🇮🇳 India Pricing (₹ INR)
            </span>
          )}
        </div>

        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Verixa Subscription &amp; Product Roadmap
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                Future Commercial Tiers
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              You are currently using the active Free Public Release. Paid tiers are planned for upcoming high-volume enterprise deployments.
            </p>
          </div>

          <button
            id="pricing-close-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Control Subheader (Monthly/Annual toggle + Currency Selector + Active Usage) */}
        <div className="px-5 sm:px-6 py-3 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Left: Billing Cycle Switch */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center p-1 bg-slate-200/80 dark:bg-slate-800 rounded-xl border border-slate-300/60 dark:border-slate-700">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  billingCycle === "monthly"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle("annual")}
                className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                  billingCycle === "annual"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span>Annual Billing</span>
                <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-emerald-500 text-white">
                  -20%
                </span>
              </button>
            </div>

            {/* Currency Selector */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
              <Globe2 className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-semibold text-slate-500 dark:text-slate-400 text-[11px]">Currency:</span>
              <select
                id="currency-select-dropdown"
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value as CurrencyCode)}
                className="bg-transparent font-bold text-slate-900 dark:text-white text-xs focus:outline-none cursor-pointer"
              >
                {Object.values(SUPPORTED_CURRENCIES).map((c) => (
                  <option key={c.code} value={c.code} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                    {c.flag} {c.code} ({c.symbol}) - {c.country}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right: Current Active Usage */}
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-500/20 flex items-center gap-2">
              <span className="font-bold">Active Free Tier</span>
              <span>•</span>
              <span>
                Processed this month: <strong>{scansUsed}</strong> / 50 pages
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid (5 Tiers) */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {displayTiers.map((tierKey) => {
              const plan = PLAN_CONFIGS[tierKey];
              const isFree = tierKey === "FREE";
              const priceInfo = formatPlanPrice(tierKey, selectedCurrency, billingCycle);
              const isCurrent = isFree;

              return (
                <div
                  key={tierKey}
                  className={`relative rounded-3xl p-5 flex flex-col justify-between transition-all border ${
                    plan.popular
                      ? "bg-slate-50/80 dark:bg-slate-800/80 border-indigo-500 dark:border-indigo-400 shadow-lg ring-1 ring-indigo-500/50"
                      : isFree
                      ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                  }`}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span
                        className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          plan.popular
                            ? "bg-indigo-600 text-white shadow-xs"
                            : isFree
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-700 text-slate-200"
                        }`}
                      >
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <div>
                    {/* Title & Tagline */}
                    <div className="mb-3">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {plan.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 min-h-[32px] leading-tight">
                        {plan.tagline}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">
                          {priceInfo.formatted}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {priceInfo.suffix}
                        </span>
                      </div>

                      {/* Quota Highlight */}
                      <div className="mt-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          {plan.pageLimitMonthly === -1
                            ? "Unlimited Pages / Mo"
                            : `${plan.pageLimitMonthly.toLocaleString()} Pages / Mo`}
                        </span>
                      </div>
                    </div>

                    {/* Features List */}
                    <ul className="space-y-2 mb-6 text-xs text-slate-600 dark:text-slate-300">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="leading-tight">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Button */}
                  <div>
                    <button
                      onClick={() => handlePlanClick(tierKey)}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all ${
                        isFree
                          ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
                          : plan.popular
                          ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs"
                          : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      {isFree
                        ? "Currently Active (Free)"
                        : "Plan Details (Coming Soon)"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Note */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
          Have high-volume enterprise ingestion requirements or need on-premises deployment? Contact our team for customized SLA quotes.
        </div>
      </div>

      {/* Polite Planned Tier Notice Dialogue (Section 12) */}
      {plannedNotice && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              {plannedNotice} Plan — Planned Release
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              Paid plans are planned for a future commercial release. You are currently using the free public version of Verixa with <strong>50 free pages per month</strong>. All core features including Python cleaning, SQL persistence, and interactive analytics are enabled. No payment or credit card is required.
            </p>

            <button
              onClick={() => setPlannedNotice(null)}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
            >
              Understood, Continue Free
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
