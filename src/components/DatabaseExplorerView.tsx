import React, { useState } from "react";
import {
  Database,
  Play,
  Download,
  Table,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  Copy,
  Terminal,
  RotateCcw,
  ArrowLeft
} from "lucide-react";
import { UserRole } from "../types";

interface DatabaseExplorerViewProps {
  userRole: UserRole;
  onBack?: () => void;
}

export const DatabaseExplorerView: React.FC<DatabaseExplorerViewProps> = ({ userRole, onBack }) => {
  const [sqlQuery, setSqlQuery] = useState<string>(
    "SELECT doc_number, title, department_id, status, original_language, created_at FROM documents ORDER BY created_at DESC LIMIT 10;"
  );
  const [queryResult, setQueryResult] = useState<any | null>(null);
  const [executing, setExecuting] = useState(false);
  const [activeTable, setActiveTable] = useState<string>("documents");
  const [copied, setCopied] = useState(false);

  const sampleQueries = [
    {
      title: "Latest Scanned Documents",
      sql: "SELECT doc_number, title, department_id, status, original_language, created_at FROM documents ORDER BY created_at DESC LIMIT 10;",
    },
    {
      title: "Missing Fields Distribution by Department",
      sql: "SELECT d.name as department, COUNT(f.id) as total_fields, SUM(f.is_empty) as missing_fields FROM departments d JOIN documents doc ON d.id = doc.department_id JOIN document_fields f ON doc.id = f.document_id GROUP BY d.name;",
    },
    {
      title: "Active Pipeline Validation Alerts",
      sql: "SELECT id, document_id, rule_name, severity, message, is_resolved, created_at FROM pipeline_alerts WHERE is_resolved = 0;",
    },
    {
      title: "High Value Assets (> $10,000 / €10.000)",
      sql: "SELECT d.doc_number, d.title, f.field_key, f.cleaned_value, f.data_type FROM documents d JOIN document_fields f ON d.id = f.document_id WHERE f.data_type = 'currency' AND CAST(f.cleaned_value as FLOAT) >= 10000;",
    },
  ];

  const runQuery = async (customSql?: string) => {
    const toRun = customSql || sqlQuery;
    setExecuting(true);
    setQueryResult(null);

    try {
      const res = await fetch("/api/database/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql: toRun }),
      });
      const data = await res.json();
      setQueryResult(data);
    } catch (err: any) {
      setQueryResult({ success: false, error: err.message });
    } finally {
      setExecuting(false);
    }
  };

  const handleDownloadSqlDump = () => {
    window.open("/api/database/export", "_blank");
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlQuery);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          <span className="text-xs text-slate-500 font-medium">Enterprise SQL Database Gateway</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Enterprise SQL Relational Database
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
              ACID Compliant • SQLite / SQL Gateway
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Direct access to normalized data schemas: departments, documents, fields, alerts, and audit logs.
          </p>
        </div>

        {/* Backup Options */}
        <div className="flex items-center gap-2">
          <button
            id="download-sql-backup-button"
            onClick={handleDownloadSqlDump}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download SQL Dump (.sql)
          </button>
        </div>
      </div>

      {/* SQL Console Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Interactive SQL Console
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySql}
              className="text-xs px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1"
            >
              <Copy className="w-3 h-3" />
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              id="execute-sql-button"
              disabled={executing}
              onClick={() => runQuery()}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs disabled:opacity-50 transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {executing ? "Executing..." : "Execute SQL"}
            </button>
          </div>
        </div>

        {/* Query Input */}
        <div className="relative font-mono text-xs">
          <textarea
            rows={3}
            value={sqlQuery}
            onChange={(e) => setSqlQuery(e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-950 text-emerald-400 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            placeholder="SELECT * FROM documents..."
          />
        </div>

        {/* Quick Sample Queries */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400">Quick Templates:</span>
          {sampleQueries.map((sq, i) => (
            <button
              key={i}
              onClick={() => {
                setSqlQuery(sq.sql);
                runQuery(sq.sql);
              }}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            >
              {sq.title}
            </button>
          ))}
        </div>
      </div>

      {/* Query Results Data Table */}
      {queryResult && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Table className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Query Execution Result
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {queryResult.success
                ? `${queryResult.count || queryResult.affected_rows || 0} rows returned`
                : "Execution Error"}
            </span>
          </div>

          {queryResult.success ? (
            queryResult.rows && queryResult.rows.length > 0 ? (
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800/90 backdrop-blur-xs">
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-mono font-bold">
                      {Object.keys(queryResult.rows[0]).map((col) => (
                        <th key={col} className="py-2.5 px-4">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-[11px]">
                    {queryResult.rows.map((row: any, rIdx: number) => (
                      <tr key={rIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        {Object.values(row).map((val: any, cIdx: number) => (
                          <td key={cIdx} className="py-2 px-4 text-slate-800 dark:text-slate-200 whitespace-nowrap">
                            {val !== null && val !== undefined ? String(val) : <span className="text-slate-400 italic">NULL</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">
                {queryResult.message || "Query returned 0 rows."}
              </div>
            )
          ) : (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 text-xs font-mono">
              <AlertCircle className="w-4 h-4 inline mr-2 text-rose-600" />
              {queryResult.error}
            </div>
          )}
        </div>
      )}

      {/* Database Schema & Tables Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Table 1: documents */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
              documents
            </span>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono">
              Primary Table
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Core documents table storing document IDs, multilingual metadata, and pipeline statuses.
          </p>
          <div className="text-[10px] font-mono text-slate-400 space-y-0.5">
            <div>• id (TEXT PK)</div>
            <div>• doc_number (TEXT UNIQUE)</div>
            <div>• department_id (TEXT FK)</div>
            <div>• status (COMMITTED | NEEDS_REVIEW)</div>
          </div>
        </div>

        {/* Table 2: document_fields */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
              document_fields
            </span>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono">
              Normalized Fields
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Extracted, sanitized, and translated key-value pairs with confidence scores.
          </p>
          <div className="text-[10px] font-mono text-slate-400 space-y-0.5">
            <div>• id (TEXT PK)</div>
            <div>• document_id (TEXT FK)</div>
            <div>• field_key, cleaned_value</div>
            <div>• is_empty, review_status</div>
          </div>
        </div>

        {/* Table 3: pipeline_alerts */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
              pipeline_alerts
            </span>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono">
              Validation Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Operational anomalies, arithmetic mismatches, and data type errors for human intervention.
          </p>
          <div className="text-[10px] font-mono text-slate-400 space-y-0.5">
            <div>• id (TEXT PK)</div>
            <div>• document_id (TEXT FK)</div>
            <div>• rule_name, severity</div>
            <div>• is_resolved, resolution_notes</div>
          </div>
        </div>

      </div>
    </div>
  );
};
