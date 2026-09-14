import React, { useState, useEffect } from "react";
import {
  X,
  ShieldCheck,
  Activity,
  Zap,
  Layers,
  Database,
  RefreshCw,
  Server,
  FileCheck2,
  DollarSign,
  Clock,
  Sparkles,
  Download,
} from "lucide-react";

interface OwnerUsageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OwnerUsageModal: React.FC<OwnerUsageModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    totalPagesProcessed: number;
    apiCallsCount: number;
    duplicateSubmissionsSaved: number;
    activeDocumentsInDb: number;
    totalFieldsCleaned: number;
    avgConfidence: number;
    missingRate: number;
    defaultMonthlyQuota: number;
    cachedEntriesCount: number;
    systemHealth: string;
    startTime: string;
    lastProcessedAt: string;
  } | null>(null);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/usage-summary");
      if (res.ok) {
        const json = await res.json();
        setData(json.systemTelemetry);
      }
    } catch (err) {
      console.error("Failed to fetch admin usage summary:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSummary();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      id="owner-usage-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-slate-900 dark:text-white">
                  System Usage &amp; Cost Telemetry
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Owner View
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time API volume, cache cost-savings, and database health metrics.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchSummary}
              disabled={loading}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Refresh telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Key Metrics Bento */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                <span className="text-xs font-semibold">Total Pages</span>
                <FileCheck2 className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {data?.totalPagesProcessed || 0}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Processed to date</div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-1">
                <span className="text-xs font-semibold">Cost Prevented</span>
                <Zap className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {data?.duplicateSubmissionsSaved || 0}
              </div>
              <div className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-1">
                Fingerprint cache hits
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                <span className="text-xs font-semibold">Gemini Calls</span>
                <Sparkles className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {data?.apiCallsCount || 0}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Direct OCR invocations</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                <span className="text-xs font-semibold">DB Documents</span>
                <Database className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {data?.activeDocumentsInDb || 0}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Active SQL records</div>
            </div>
          </div>

          {/* Infrastructure Health & Details */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Pipeline Subsystems &amp; Governance
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400">Monthly Free Page Limit:</span>
                <span className="font-bold text-slate-900 dark:text-white">50 pages / month</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400">Duplicate Protection Cache:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  Active (SHA-256 Fingerprinting)
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400">Python 3.x Cleaning Engine:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  Online (All Users Enabled)
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400">ACID Relational SQLite Engine:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Operational</span>
              </div>
            </div>
          </div>

          {/* Export Action */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Need a full database backup snapshot?
            </span>
            <a
              href="/api/database/export"
              download="verixa_backup.sql"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-opacity"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download SQL Backup Dump</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
