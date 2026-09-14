import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  X,
  FileText,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Layers,
  Globe,
  Eye
} from "lucide-react";
import { DocumentRecord } from "../types";

interface DocumentSearchBarProps {
  onSelectDocument?: (doc: DocumentRecord) => void;
  selectedDepartment?: string;
}

export const DocumentSearchBar: React.FC<DocumentSearchBarProps> = ({
  onSelectDocument,
  selectedDepartment,
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DocumentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut (/) to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === "/" || (e.key === "k" && (e.metaKey || e.ctrlKey))) &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch search results with debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const deptParam = selectedDepartment && selectedDepartment !== "ALL" ? selectedDepartment : "ALL";
        const res = await fetch(`/api/documents?search=${encodeURIComponent(query.trim())}&department=${deptParam}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setResults(data);
          }
        }
      } catch (err) {
        console.error("Search fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, selectedDepartment]);

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  const getLangBadge = (lang: string) => {
    if (lang?.toLowerCase().includes("hindi") || lang?.includes("हिन्दी")) return { flag: "🇮🇳", name: "Hindi" };
    if (lang?.toLowerCase().includes("marathi") || lang?.includes("मराठी")) return { flag: "🇮🇳", name: "Marathi" };
    if (lang?.toLowerCase().includes("german")) return { flag: "🇩🇪", name: "German" };
    if (lang?.toLowerCase().includes("french")) return { flag: "🇫🇷", name: "French" };
    if (lang?.toLowerCase().includes("spanish")) return { flag: "🇪🇸", name: "Spanish" };
    return { flag: "🌐", name: lang || "English" };
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-lg">
      {/* Unique, highly intuitive search input */}
      <div className="relative flex items-center">
        <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
          <Search className="w-4 h-4 text-blue-500" />
        </div>

        <input
          ref={inputRef}
          type="text"
          id="global-document-search-input"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder="Search documents by ID (FIN-2026), Title, Hindi, Marathi, or Dept..."
          className="w-full pl-10 pr-20 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100/90 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-xs"
        />

        <div className="absolute right-2.5 flex items-center gap-1.5">
          {isLoading && (
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-1" />
          )}

          {query ? (
            <button
              onClick={handleClear}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[10px] font-mono text-slate-400">
              /
            </kbd>
          )}
        </div>
      </div>

      {/* Instant Dropdown Search Results */}
      {isOpen && query.trim().length > 0 && (
        <div
          id="document-search-results-dropdown"
          className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 max-h-[80vh] flex flex-col"
        >
          {/* Header Bar */}
          <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {results.length} Document{results.length === 1 ? "" : "s"} Found
            </span>
            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
              Live SQL Database Search
            </span>
          </div>

          {/* Results List */}
          <div className="overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {results.length === 0 && !isLoading && (
              <div className="p-8 text-center text-slate-400">
                <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  No matching documents
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Try searching by document number like <code className="font-mono text-blue-500">FIN-2026</code>,
                  title, or language <code className="font-mono text-blue-500">Hindi</code>.
                </p>
              </div>
            )}

            {results.map((doc) => {
              const langInfo = getLangBadge(doc.original_language);
              return (
                <div
                  key={doc.id}
                  onClick={() => {
                    setSelectedDoc(doc);
                    if (onSelectDocument) onSelectDocument(doc);
                  }}
                  className="p-3.5 hover:bg-blue-50/70 dark:hover:bg-slate-800/70 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {/* Doc Number */}
                        <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900">
                          {doc.doc_number}
                        </span>

                        {/* Status Badge */}
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            doc.status === "COMMITTED"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-300 dark:border-amber-800"
                          }`}
                        >
                          {doc.status === "COMMITTED" ? (
                            <CheckCircle2 className="w-2.5 h-2.5" />
                          ) : (
                            <Clock className="w-2.5 h-2.5" />
                          )}
                          {doc.status === "COMMITTED" ? "Committed to SQL" : "Needs Review"}
                        </span>

                        {/* Language Tag */}
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          <span>{langInfo.flag}</span>
                          <span>{langInfo.name}</span>
                        </span>

                        {/* Department */}
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                          {doc.department_name || doc.department_id}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                        {doc.title}
                      </h4>

                      {/* Key Extracted Fields Preview */}
                      {doc.fields && doc.fields.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {doc.fields.slice(0, 3).map((f: any, i: number) => (
                            <span
                              key={i}
                              className="text-[10px] bg-slate-100 dark:bg-slate-800/90 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-mono truncate max-w-[200px]"
                            >
                              <strong className="text-slate-700 dark:text-slate-300 font-sans">{f.cleaned_key}:</strong> {f.cleaned_value || "—"}
                            </span>
                          ))}
                          {doc.fields.length > 3 && (
                            <span className="text-[10px] text-slate-400">+{doc.fields.length - 3} more</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="text-right shrink-0 flex flex-col items-end justify-between self-stretch">
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                        {Math.round((doc.confidence_score || 0.95) * 100)}% OCR
                      </span>
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold group-hover:underline flex items-center gap-0.5 mt-2">
                        View
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Document Detail Preview Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl p-6 space-y-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400">
                      {selectedDoc.doc_number}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        selectedDoc.status === "COMMITTED"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400"
                      }`}
                    >
                      {selectedDoc.status}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedDoc.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedDoc(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Metadata Bar */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Department</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedDoc.department_name || selectedDoc.department_id}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Language</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedDoc.original_language} → English
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">OCR Confidence</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {Math.round((selectedDoc.confidence_score || 0.95) * 100)}% Match
                </span>
              </div>
            </div>

            {/* Extracted & Cleaned Fields Table */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Sanitized SQL Fields ({selectedDoc.fields?.length || 0})
              </h4>
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {selectedDoc.fields && selectedDoc.fields.length > 0 ? (
                  selectedDoc.fields.map((field: any, idx: number) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <div className="w-1/3 font-semibold text-slate-700 dark:text-slate-300 truncate">
                        {field.cleaned_key}
                      </div>
                      <div className="w-2/3 font-mono text-slate-900 dark:text-slate-100 break-words pl-2">
                        {field.cleaned_value || (
                          <span className="text-amber-500 italic font-sans text-[11px]">
                            Empty (Flagged for Review)
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-400">No fields recorded</div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
              >
                Close Inspector
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
