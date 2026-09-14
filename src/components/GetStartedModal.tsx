import React from "react";
import {
  Sparkles,
  X,
  FileText,
  Camera,
  Upload,
  Cpu,
  Database,
  BarChart3,
  CheckCircle2,
  ArrowRight
} from "lucide-react";

interface GetStartedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartScanning: () => void;
}

export const GetStartedModal: React.FC<GetStartedModalProps> = ({
  isOpen,
  onClose,
  onStartScanning,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
        
        {/* Header with Close */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-900">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Multilingual OCR &amp; Python Pipeline
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* The Exact User-Requested Headline & Description */}
        <div className="space-y-3">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Intelligent Document Scanning &amp; Data Entry
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Snap a photo or upload physical paperwork in any language. Our pipeline extracts all fields,
            translates into English, executes automated Python data cleaning, flags missing values with
            intelligent suggestions, and inserts cleanly into our enterprise SQL database.
          </p>
        </div>

        {/* 4-Step Interactive Visual Flow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              1. Snap or Upload Paperwork
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Support for Hindi (हिन्दी), Marathi (मराठी), German, French, and English documents.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              2. Multilingual OCR Extraction
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Devanagari numeral translation (०-९ to 0-9), GSTIN, PAN, and automatic translation to English.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              3. Python Automated Data Clean
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Standardizes currency (₹ INR, € EUR, $ USD), formats dates to ISO-8601, and flags missing values.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              4. SQL Storage &amp; Power BI
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Inserts records into SQLite tables and streams real-time telemetry to Power BI Insights.
            </p>
          </div>

        </div>

        {/* Action Button */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Ready to test with live documents or samples?
          </span>
          <button
            onClick={() => {
              onClose();
              onStartScanning();
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all"
          >
            <span>Get Started &amp; Scan Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
