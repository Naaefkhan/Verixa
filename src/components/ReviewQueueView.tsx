import React, { useState, useEffect } from "react";
import {
  ClipboardCheck,
  AlertTriangle,
  CheckCircle2,
  Edit3,
  Zap,
  Clock,
  Search,
  Filter,
  ArrowRight,
  ShieldAlert,
  Save,
  Check,
  ArrowLeft
} from "lucide-react";
import { DocumentRecord, DocumentField, PipelineAlert, UserRole } from "../types";

interface ReviewQueueViewProps {
  userRole: UserRole;
  selectedDepartment: string;
  onRefreshMetrics: () => void;
  onBack?: () => void;
}

export const ReviewQueueView: React.FC<ReviewQueueViewProps> = ({
  userRole,
  selectedDepartment,
  onRefreshMetrics,
  onBack,
}) => {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDoc, setActiveDoc] = useState<DocumentRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "MISSING_DATA" | "ALERTS">("ALL");
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [fieldValueDraft, setFieldValueDraft] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [resolvingAlertId, setResolvingAlertId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const deptParam = selectedDepartment === "ALL" ? "ALL" : selectedDepartment;
      const res = await fetch(`/api/documents?department=${deptParam}&status=ALL`);
      if (!res.ok) {
        setDocuments([]);
        return;
      }
      const data: DocumentRecord[] = await res.json();
      if (!Array.isArray(data)) {
        setDocuments([]);
        return;
      }
      
      // Filter for items that need human review or have pipeline alerts
      const queueDocs = data.filter(
        (d) => d.status === "NEEDS_REVIEW" || d.status === "PIPELINE_ERROR" || (d.missing_count && d.missing_count > 0)
      );

      setDocuments(queueDocs);
      if (queueDocs.length > 0 && !activeDoc) {
        setActiveDoc(queueDocs[0]);
      } else if (activeDoc) {
        const refreshed = queueDocs.find((d) => d.id === activeDoc.id);
        if (refreshed) setActiveDoc(refreshed);
      }
    } catch (err) {
      console.error("Error fetching review queue:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [selectedDepartment]);

  // Handle Field Edit / Override
  const handleSaveField = async (fieldId: string) => {
    try {
      const res = await fetch(`/api/fields/${fieldId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cleaned_value: fieldValueDraft,
          userEmail: "reviewer.desk@corp.internal",
          role: userRole,
        }),
      });
      const result = await res.json();
      if (result.success) {
        setActionMessage("Field successfully updated and recorded in audit log.");
        setEditingFieldId(null);
        await fetchQueue();
        onRefreshMetrics();
      }
    } catch (err) {
      alert("Failed to update field value");
    }
  };

  // Handle Alert Resolution
  const handleResolveAlert = async (alertId: string) => {
    try {
      const res = await fetch(`/api/alerts/${alertId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resolution_notes: resolutionNotes || "Manually reviewed and verified by human operator.",
          userEmail: "reviewer.desk@corp.internal",
          role: userRole,
        }),
      });
      const result = await res.json();
      if (result.success) {
        setActionMessage("Pipeline alert resolved and audit logged.");
        setResolvingAlertId(null);
        setResolutionNotes("");
        await fetchQueue();
        onRefreshMetrics();
      }
    } catch (err) {
      alert("Failed to resolve alert");
    }
  };

  // Accept suggested action for a field
  const handleAcceptSuggestion = async (field: DocumentField) => {
    if (!field.id || !field.suggested_action?.value) return;
    try {
      const res = await fetch(`/api/fields/${field.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cleaned_value: field.suggested_action.value,
          userEmail: "reviewer.desk@corp.internal",
          role: userRole,
        }),
      });
      const result = await res.json();
      if (result.success) {
        setActionMessage(`Accepted recommendation: ${field.suggested_action.value}`);
        await fetchQueue();
        onRefreshMetrics();
      }
    } catch (err) {
      alert("Error applying suggestion");
    }
  };

  // Filter documents
  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.doc_number.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === "MISSING_DATA") {
      return (doc.missing_count || 0) > 0;
    }
    if (filterType === "ALERTS") {
      return (doc.alerts || []).some((a) => !a.is_resolved);
    }
    return true;
  });

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
          <span className="text-xs text-slate-500 font-medium">Review &amp; Python Validation Queue</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Document Review & Anomaly Queue
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
              {documents.length} Items Pending
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Intelligent triage for empty fields, low confidence OCR readings, and pipeline validation alerts.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search document # or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs rounded-xl pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="text-xs font-medium rounded-xl px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Issues</option>
            <option value="MISSING_DATA">Missing Data Only</option>
            <option value="ALERTS">Pipeline Alerts Only</option>
          </select>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Review Workspace Layout: Master-Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Document List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              Loading review queue...
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Queue Clear! No Pending Reviews
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                All scanned documents have been cleaned, validated, and successfully committed to SQL.
              </p>
            </div>
          ) : (
            filteredDocs.map((doc) => {
              const isSelected = activeDoc?.id === doc.id;
              const hasAlerts = (doc.alerts || []).some((a) => !a.is_resolved);
              return (
                <div
                  key={doc.id}
                  id={`queue-item-${doc.id}`}
                  onClick={() => setActiveDoc(doc)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-blue-50/70 dark:bg-blue-950/40 border-blue-500 dark:border-blue-500 shadow-sm"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      {doc.doc_number}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {doc.missing_count > 0 && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          {doc.missing_count} Empty
                        </span>
                      )}
                      {hasAlerts && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 flex items-center gap-0.5">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          Alert
                        </span>
                      )}
                    </div>
                  </div>

                  <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                    {doc.title}
                  </h4>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                    <span>{doc.department_name || doc.department_id}</span>
                    <span>Lang: {doc.original_language}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Active Document Inspection & Resolution Pane (7 cols) */}
        <div className="lg:col-span-7">
          {activeDoc ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
              
              {/* Document Summary Header */}
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
                      {activeDoc.doc_number}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {activeDoc.department_name || activeDoc.department_id}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Scanned: {new Date(activeDoc.created_at).toLocaleString()}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {activeDoc.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Original Source Language: <span className="font-semibold text-slate-700 dark:text-slate-300">{activeDoc.original_language}</span> • Translated into English
                </p>
              </div>

              {/* Active Pipeline Alerts Section */}
              {activeDoc.alerts && activeDoc.alerts.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    Active Pipeline Validation Alerts
                  </h4>
                  {activeDoc.alerts.map((alt) => (
                    <div
                      key={alt.id}
                      className={`p-4 rounded-xl border ${
                        alt.is_resolved
                          ? "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 opacity-60"
                          : "bg-rose-50/70 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-200 text-rose-900 dark:bg-rose-900 dark:text-rose-200">
                              {alt.severity}
                            </span>
                            <span className="text-xs font-bold text-rose-900 dark:text-rose-200">
                              {alt.rule_name}
                            </span>
                          </div>
                          <p className="text-xs text-rose-800 dark:text-rose-300">
                            {alt.message}
                          </p>
                        </div>

                        {!alt.is_resolved && (
                          <button
                            onClick={() => setResolvingAlertId(alt.id || null)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-xs"
                          >
                            Resolve Alert
                          </button>
                        )}
                      </div>

                      {/* Inline Resolution Modal */}
                      {resolvingAlertId === alt.id && (
                        <div className="mt-3 pt-3 border-t border-rose-200 dark:border-rose-900 space-y-2">
                          <label className="text-[11px] font-semibold text-rose-900 dark:text-rose-200">
                            Compliance Resolution Notes (SOC2/Audit trail):
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Verified with supplier, signed credit memo attached..."
                            value={resolutionNotes}
                            onChange={(e) => setResolutionNotes(e.target.value)}
                            className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 text-slate-900 dark:text-white"
                          />
                          <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                              onClick={() => setResolvingAlertId(null)}
                              className="text-xs px-3 py-1 rounded text-slate-600 dark:text-slate-400"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => alt.id && handleResolveAlert(alt.id)}
                              className="text-xs font-bold px-4 py-1.5 rounded-lg bg-rose-600 text-white shadow-xs"
                            >
                              Confirm Resolution
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Document Fields & Smart Suggestions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Fields & Missing Value Recommendations
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    {activeDoc.fields?.filter((f) => f.is_empty).length || 0} fields missing
                  </span>
                </div>

                <div className="space-y-3">
                  {activeDoc.fields?.map((field) => {
                    const isEditing = editingFieldId === field.id;
                    const isMissing = field.is_empty;

                    return (
                      <div
                        key={field.id}
                        className={`p-4 rounded-xl border transition-all ${
                          isMissing
                            ? "bg-amber-50/50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800"
                            : "bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-xs font-bold text-slate-900 dark:text-white">
                                {field.key}
                              </span>
                              <span className="font-mono text-[10px] text-slate-400">
                                ({field.data_type})
                              </span>
                              {isMissing && (
                                <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200">
                                  MISSING
                                </span>
                              )}
                            </div>
                            <div className="text-xs font-medium text-slate-600 dark:text-slate-300">
                              Current Value:{" "}
                              {field.cleaned_value ? (
                                <span className="font-mono text-slate-900 dark:text-white font-semibold">
                                  {field.cleaned_value}
                                </span>
                              ) : (
                                <span className="italic text-amber-700 dark:text-amber-400 font-semibold">
                                  [Blank on document]
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {field.suggested_action?.value && isMissing && (
                              <button
                                onClick={() => handleAcceptSuggestion(field)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-colors"
                              >
                                <Zap className="w-3.5 h-3.5" />
                                Accept Recommendation: {field.suggested_action.value}
                              </button>
                            )}

                            {!isEditing && (
                              <button
                                onClick={() => {
                                  setEditingFieldId(field.id || null);
                                  setFieldValueDraft(field.cleaned_value || "");
                                }}
                                className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-semibold transition-colors"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                Edit
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Rationale explanation */}
                        {field.suggested_action?.rationale && isMissing && (
                          <div className="mt-2 text-[11px] text-amber-800 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-950/60 p-2 rounded-lg">
                            💡 <span className="font-semibold">AI Recommendation Logic:</span> {field.suggested_action.rationale}
                          </div>
                        )}

                        {/* Inline Edit Form */}
                        {isEditing && (
                          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2">
                            <input
                              type="text"
                              value={fieldValueDraft}
                              onChange={(e) => setFieldValueDraft(e.target.value)}
                              placeholder="Enter value..."
                              className="flex-1 text-xs px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-blue-500 text-slate-900 dark:text-white focus:outline-none"
                            />
                            <button
                              onClick={() => field.id && handleSaveField(field.id)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs"
                            >
                              <Save className="w-3.5 h-3.5" />
                              Save
                            </button>
                            <button
                              onClick={() => setEditingFieldId(null)}
                              className="px-2.5 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-700"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-400">
              Select a document from the left list to review its fields.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
