import React, { useState } from "react";
import {
  Sparkles,
  ArrowRight,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  FileText,
  Scan,
  CheckCircle2,
  Terminal,
  Database,
  BarChart3,
  Share2,
  Zap,
} from "lucide-react";

interface LandingHeroProps {
  onStartTesting: () => void;
  scansUsed: number;
  maxMonthlyLimit: number;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onStartTesting,
  scansUsed,
  maxMonthlyLimit = 50,
}) => {
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const remaining = Math.max(0, maxMonthlyLimit - scansUsed);
  const percentUsed = Math.min(100, Math.round((scansUsed / maxMonthlyLimit) * 100));

  const steps = [
    {
      step: 1,
      name: "Input",
      icon: FileText,
      tagline: "Multiformat Document Intake",
      details:
        "Upload scans, camera captures, mobile photos, PDFs, or spreadsheets. Verixa supports images up to 10MB with automated client-side pre-optimization.",
    },
    {
      step: 2,
      name: "Extract",
      icon: Scan,
      tagline: "Multilingual OCR & Script Detection",
      details:
        "Automatically identifies the document's native language and script (Hindi Devanagari, German, Spanish, Japanese, English, etc.) and performs multimodal field extraction.",
    },
    {
      step: 3,
      name: "Validate",
      icon: CheckCircle2,
      tagline: "Integrity Checks & Anomaly Detection",
      details:
        "Calculates field-level confidence scores, identifies unreadable cells, highlights missing critical values, and triggers SLA compliance alerts.",
    },
    {
      step: 4,
      name: "Clean",
      icon: Terminal,
      tagline: "Python 3 Normalization & 100% English",
      details:
        "The Python engine normalizes Devanagari numerals (०-९ to 0-9), executes rule-based imputation, standardizes date formats, and enforces 100% English translation.",
    },
    {
      step: 5,
      name: "Store",
      icon: Database,
      tagline: "Structured Relational Persistence",
      details:
        "Persists sanitized records, normalized field mappings, and SHA-256 tamper-evident compliance audit trails into an ACID SQL database.",
    },
    {
      step: 6,
      name: "Analyze",
      icon: BarChart3,
      tagline: "Interactive Business Intelligence",
      details:
        "Real-time operational dashboards deliver departmental throughput, pipeline health, error ratios, confidence metrics, and trend visualizers.",
    },
    {
      step: 7,
      name: "Action",
      icon: Share2,
      tagline: "Downstream Export & Integration",
      details:
        "Export clean records instantly as CSV, JSON, or SQL dumps, or connect to external BI tools like Microsoft Power BI via DirectQuery semantic models.",
    },
  ];

  return (
    <div className="w-full mb-8 animate-in fade-in duration-300">
      {/* Top Value Proposition Card */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 border border-slate-800 shadow-xl overflow-hidden">
        {/* Subtle decorative mesh background */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Intelligent Data Processing &amp; Business Intelligence</span>
            </div>

            {/* Monthly Free Usage Pill */}
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700 text-xs">
              <span className="text-slate-400">Monthly Usage:</span>
              <span className="font-bold text-white">
                {scansUsed} / {maxMonthlyLimit} pages
              </span>
              <span className="text-emerald-400 font-semibold">({remaining} free remaining)</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white max-w-3xl leading-tight">
            Turn Unstructured Information Into Actionable Data.
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
            Verixa automates multilingual information extraction, data cleaning, structured storage,
            and business intelligence — transforming raw documents and spreadsheets into analytics-ready data.
          </p>

          {/* Action CTAs */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={onStartTesting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all active:scale-95"
            >
              <span>Try Verixa Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowHowItWorks(!showHowItWorks)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <span>Explore How It Works</span>
              {showHowItWorks ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Public Demo Disclaimer Banner */}
          <div className="mt-6 p-3 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-start sm:items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <span className="font-bold text-amber-300">Portfolio &amp; Public Demo Notice: </span>
              Please do not upload confidential, personal, medical, financial, government, or otherwise sensitive documents. Use sample or non-sensitive files for testing.
            </div>
          </div>

          {/* 7-Step Visual Pipeline Tracker */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <div className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-3 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-blue-400" />
              <span>Verixa 7-Stage Automated Data Pipeline:</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {steps.map((s, idx) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.step}
                    className="flex flex-col p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 transition-colors cursor-pointer"
                    onClick={() => setShowHowItWorks(true)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-black text-slate-400">0{s.step}</span>
                      <Icon className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <span className="text-xs font-bold text-white">{s.name}</span>
                    <span className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{s.tagline}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded How It Works Drawer */}
      {showHowItWorks && (
        <div className="mt-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                How Verixa Processes Documents: Step-by-Step Architecture
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                A deterministic, enterprise-grade pipeline transforming unstructured physical and digital files into governed data assets.
              </p>
            </div>
            <button
              onClick={() => setShowHowItWorks(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-xs"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.step}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex flex-col"
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-xs">
                      {step.step}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        {step.name}
                      </h3>
                      <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {step.tagline}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-1">
                    {step.details}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
