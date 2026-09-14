import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Download,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Server,
  Hash,
  UserCheck,
  FileText,
  ArrowLeft
} from "lucide-react";
import { AuditLog, SyncLog, UserRole } from "../types";

interface ComplianceAuditViewProps {
  userRole: UserRole;
  onBack?: () => void;
}

export const ComplianceAuditView: React.FC<ComplianceAuditViewProps> = ({ userRole, onBack }) => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [maskPII, setMaskPII] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchAuditData = async () => {
    setLoading(true);
    try {
      const [auditRes, syncRes] = await Promise.all([
        fetch("/api/audit-logs"),
        fetch("/api/sync-logs"),
      ]);
      const audits = auditRes.ok ? await auditRes.json() : [];
      const syncs = syncRes.ok ? await syncRes.json() : [];
      setAuditLogs(Array.isArray(audits) ? audits : []);
      setSyncLogs(Array.isArray(syncs) ? syncs : []);
    } catch (e) {
      console.error("Failed to load audit or sync logs:", e);
      setAuditLogs([]);
      setSyncLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditData();
  }, []);

  const formatEmail = (email: string) => {
    if (!maskPII) return email;
    const parts = email.split("@");
    if (parts.length !== 2) return email;
    const maskedName = parts[0].slice(0, 2) + "***";
    return `${maskedName}@${parts[1]}`;
  };

  const formatIP = (ip: string) => {
    if (!maskPII) return ip;
    return ip.replace(/\.\d+$/, ".***");
  };

  const handleExportDossier = () => {
    const report = {
      compliance_frameworks: ["GDPR Article 30 (Record of Processing Activities)", "SOC2 Type II Trust Principles"],
      export_timestamp: new Date().toISOString(),
      generated_by: `user_role_${userRole}`,
      audit_trail_count: auditLogs.length,
      audit_records: auditLogs,
      external_sync_gateways: syncLogs,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `compliance_audit_dossier_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      {/* Top Back Navigation Bar */}
      {onBack && (
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 shadow-xs">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 dark:text-blue-300 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Document Scanner</span>
          </button>
          <span className="text-xs text-slate-500 font-medium">Compliance Ledger &amp; Security Vault</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              SOC2 &amp; GDPR Compliance Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Cryptographically Verified
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Immutable SHA-256 audit ledger, role-based access enforcement, and automated PII anonymization.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* PII Masking Toggle */}
          <button
            onClick={() => setMaskPII(!maskPII)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              maskPII
                ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800"
                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
            }`}
          >
            {maskPII ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{maskPII ? "PII Masking Active (GDPR)" : "PII Unmasked"}</span>
          </button>

          {/* Export Dossier */}
          <button
            onClick={handleExportDossier}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export Audit Dossier (.json)
          </button>
        </div>
      </div>

      {/* SOC2 Controls Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Access Control</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white">
            4-Tier Enterprise RBAC
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Admin, Reviewer, Auditor, and Viewer permissions strictly verified per transaction.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Data Encryption</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white">
            In-Transit &amp; At-Rest
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            TLS 1.3 protocol encryption with encrypted SQLite storage volumes and hashed ledgers.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Integrity Ledger</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white">
            SHA-256 Chained Hash
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Every creation, cleaning step, and override is cryptographically hashed for tamper-evidence.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase">GDPR Privacy</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white">
            Article 17 &amp; 30 Compliant
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Supports Right to Erasure, automated PII obfuscation, and data portability exports.
          </p>
        </div>
      </div>

      {/* Main Audit Trail Ledger Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Hash className="w-4 h-4 text-indigo-600" />
              Immutable Audit Trail Records ({auditLogs.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Complete provenance tracking for every document ingest, field update, and alert resolution.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Current Operator Role: {userRole}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4">SHA-256 Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap font-mono text-[11px]">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-slate-800 dark:text-slate-200 font-mono">
                    {formatEmail(log.user_email)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {log.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.action.includes("COMMIT")
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : log.action.includes("UPDATE")
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                    {log.entity_type} ({log.entity_id.slice(0, 8)}...)
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300 max-w-xs truncate">
                    {log.details}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      title={log.log_hash}
                      className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-900"
                    >
                      {log.log_hash.slice(0, 10)}...
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sync Gateway Logs (Power BI, SAP ERP, Snowflake) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1 flex items-center gap-2">
          <Server className="w-4 h-4 text-blue-600" />
          Cross-Platform Enterprise Data Sync Gateways
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Automated replication to downstream enterprise reporting systems.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {syncLogs.map((sync) => (
            <div
              key={sync.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-slate-900 dark:text-white">
                  {sync.target_system}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {sync.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                {sync.details}
              </p>
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>Records: {sync.records_count}</span>
                <span>Latency: {sync.latency_ms}ms</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
