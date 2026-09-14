import React, { useState, useRef, useEffect } from "react";
import {
  Scan,
  BarChart3,
  Terminal,
  Database,
  ShieldCheck,
  Camera,
  Upload,
  Sparkles,
  X,
  Lock,
} from "lucide-react";
import { SubscriptionTier, PLAN_CONFIGS } from "../types";

interface BottomNavigationProps {
  currentTab: "scan" | "dashboard" | "review" | "database" | "audit";
  setCurrentTab: (tab: "scan" | "dashboard" | "review" | "database" | "audit") => void;
  pendingReviewCount: number;
  activeAlertsCount: number;
  onTriggerScanMode?: (mode: "camera" | "upload" | "presets") => void;
  currentTier: SubscriptionTier;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentTab,
  setCurrentTab,
  pendingReviewCount,
  activeAlertsCount,
  onTriggerScanMode,
  currentTier,
}) => {
  const [showScanOptions, setShowScanOptions] = useState(false);
  const optionsRef = useRef<HTMLDivElement>(null);

  // Close options menu if clicked outside
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (optionsRef.current && !optionsRef.current.contains(e.target as Node)) {
        setShowScanOptions(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const handleSelectOption = (mode: "camera" | "upload" | "presets") => {
    setCurrentTab("scan");
    setShowScanOptions(false);
    if (onTriggerScanMode) {
      onTriggerScanMode(mode);
    }
  };

  return (
    <nav
      id="enterprise-bottom-navigation-bar"
      aria-label="Bottom Navigation"
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-2xl safe-area-pb"
    >
      {/* Scan Quick Action Popover (Scan Document vs Upload File) */}
      {showScanOptions && (
        <div
          ref={optionsRef}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[90vw] max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              <Scan className="w-4 h-4 text-blue-600" />
              Document Ingestion Mode
            </span>
            <button
              onClick={() => setShowScanOptions(false)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1.5">
            {/* Option 1: Live Camera Scan */}
            <button
              id="quick-action-scan-camera"
              onClick={() => handleSelectOption("camera")}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors group"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Scan Document (Camera)
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Take physical paper photo with camera
                </div>
              </div>
            </button>

            {/* Option 2: Upload File */}
            <button
              id="quick-action-upload-file"
              onClick={() => handleSelectOption("upload")}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors group"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Upload a File
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Select image (JPG, PNG) or document file
                </div>
              </div>
            </button>

            {/* Option 3: Multilingual Indian & Global Presets */}
            <button
              id="quick-action-sample-presets"
              onClick={() => handleSelectOption("presets")}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors group"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Multilingual Presets (Demo)
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Hindi GST Invoice, Marathi Asset, German cert
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Main Bottom Bar Content */}
      <div className="max-w-2xl mx-auto px-4 py-1.5 flex items-center justify-between relative">
        
        {/* Item 1: Analytics / Business Intelligence */}
        <button
          id="bottom-tab-powerbi"
          onClick={() => setCurrentTab("dashboard")}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 transition-all ${
            currentTab === "dashboard"
              ? "text-blue-600 dark:text-blue-400 font-bold scale-105"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <div className="relative">
            <BarChart3 className="w-5 h-5 mb-0.5" />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] sm:text-[11px] tracking-tight font-medium">Analytics</span>
          </div>
        </button>

        {/* Item 2: Python Cleaning & Validation Pipeline */}
        <button
          id="bottom-tab-python"
          onClick={() => setCurrentTab("review")}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 relative transition-all ${
            currentTab === "review"
              ? "text-blue-600 dark:text-blue-400 font-bold scale-105"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <div className="relative">
            <Terminal className="w-5 h-5 mb-0.5" />
            {pendingReviewCount > 0 && (
              <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-500 text-white min-w-4 text-center">
                {pendingReviewCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] sm:text-[11px] tracking-tight font-medium">Python Clean</span>
          </div>
        </button>

        {/* Item 3: CENTER ELEVATED ACTION - Process Document (Options: Camera, File Upload, Presets) */}
        <div className="flex-1 flex flex-col items-center justify-center -mt-6">
          <button
            id="bottom-tab-scan-center"
            onClick={() => setShowScanOptions((prev) => !prev)}
            title="Process Document, Upload File, or Test Presets"
            className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl transition-all transform active:scale-95 ${
              currentTab === "scan"
                ? "bg-gradient-to-tr from-blue-600 to-indigo-600 ring-4 ring-blue-400/40 shadow-blue-500/50 scale-110"
                : "bg-gradient-to-tr from-blue-600 to-indigo-600 hover:scale-105 shadow-blue-600/30"
            }`}
          >
            <Scan className="w-6 h-6" />
          </button>
          <span
            className={`text-[10px] sm:text-[11px] font-bold mt-1 tracking-tight ${
              currentTab === "scan"
                ? "text-blue-600 dark:text-blue-400"
                : "text-slate-700 dark:text-slate-300"
            }`}
          >
            Process Data
          </span>
        </div>

        {/* Item 4: SQL Database Explorer */}
        <button
          id="bottom-tab-sql-database"
          onClick={() => setCurrentTab("database")}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 transition-all ${
            currentTab === "database"
              ? "text-blue-600 dark:text-blue-400 font-bold scale-105"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <div className="relative">
            <Database className="w-5 h-5 mb-0.5" />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] sm:text-[11px] tracking-tight font-medium">SQL DB</span>
          </div>
        </button>

        {/* Item 5: Cryptographic Audit Trail */}
        <button
          id="bottom-tab-compliance"
          onClick={() => setCurrentTab("audit")}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 transition-all ${
            currentTab === "audit"
              ? "text-blue-600 dark:text-blue-400 font-bold scale-105"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <div className="relative">
            <ShieldCheck className="w-5 h-5 mb-0.5" />
            {activeAlertsCount > 0 && (
              <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-rose-500 text-white min-w-4 text-center">
                {activeAlertsCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] sm:text-[11px] tracking-tight font-medium">Audit Trail</span>
          </div>
        </button>

      </div>
    </nav>
  );
};
