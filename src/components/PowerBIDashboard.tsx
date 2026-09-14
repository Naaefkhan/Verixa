import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  RefreshCw,
  Download,
  Filter,
  FileSpreadsheet,
  Share2,
  Maximize2,
  ChevronRight,
  HelpCircle,
  TrendingUp,
  BarChart3,
  Layers,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  Sparkles
} from "lucide-react";
import { DashboardMetrics, DocumentRecord } from "../types";

interface PowerBIDashboardProps {
  selectedDepartment: string;
  setSelectedDepartment: (dept: string) => void;
  metrics: DashboardMetrics | null;
  onRefresh: () => void;
  onBack?: () => void;
}

type RegionFilter = "ALL" | "Central" | "East" | "West";
type PartnerFilter = "ALL" | "No" | "Yes";
type SizeFilter = "ALL" | "Small" | "Medium" | "Large";
type ActiveViewTab = "PIPELINE" | "OCR_TELEMETRY";

export const PowerBIDashboard: React.FC<PowerBIDashboardProps> = ({
  selectedDepartment,
  setSelectedDepartment,
  metrics,
  onRefresh,
  onBack,
}) => {
  const [activeViewTab, setActiveViewTab] = useState<ActiveViewTab>("PIPELINE");
  const [regionFilter, setRegionFilter] = useState<RegionFilter>("ALL");
  const [partnerFilter, setPartnerFilter] = useState<PartnerFilter>("ALL");
  const [sizeFilter, setSizeFilter] = useState<SizeFilter>("ALL");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [recentDocs, setRecentDocs] = useState<DocumentRecord[]>([]);
  const [hoveredTile, setHoveredTile] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  // Listen to Escape key to go back
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onBack) {
        onBack();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onBack]);

  // Load recent documents for telemetry tab
  useEffect(() => {
    const fetchRecentDocs = async () => {
      try {
        const deptParam = selectedDepartment === "ALL" ? "ALL" : selectedDepartment;
        const res = await fetch(`/api/documents?department=${deptParam}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setRecentDocs(data.slice(0, 8));
          }
        }
      } catch (e) {
        console.error("Failed to fetch documents for Power BI:", e);
      }
    };
    fetchRecentDocs();
  }, [selectedDepartment]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Base data aligned with the exact screenshot in image.png
  // Opportunity Count = 487, Revenue = $2bn, Factored Revenue = $461M
  const getFilteredMetrics = () => {
    let multiplier = 1.0;
    if (regionFilter === "Central") multiplier *= 0.48;
    else if (regionFilter === "East") multiplier *= 0.32;
    else if (regionFilter === "West") multiplier *= 0.20;

    if (partnerFilter === "Yes") multiplier *= 0.55;
    else if (partnerFilter === "No") multiplier *= 0.45;

    if (sizeFilter === "Large") multiplier *= 0.45;
    else if (sizeFilter === "Medium") multiplier *= 0.35;
    else if (sizeFilter === "Small") multiplier *= 0.20;

    const baseCount = 487;
    const count = Math.round(baseCount * multiplier);
    const revenueBillions = (2.0 * multiplier).toFixed(1);
    const factoredRevMillions = Math.round(461 * multiplier);

    return {
      opportunityCount: count,
      revenueText: multiplier === 1.0 ? "$2bn" : `$${revenueBillions}bn`,
      factoredRevenueText: `$${factoredRevMillions}M`,
    };
  };

  const currentKPIs = getFilteredMetrics();

  // Download visual Power BI report HTML
  const handleDownloadVisualReport = () => {
    const reportHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Power BI Executive Dashboard Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f3f4f6; color: #1e293b; margin: 0; padding: 24px; }
    .header { background: #ffffff; padding: 18px 24px; border: 1px solid #e2e8f0; border-bottom: 3px solid #F2C811; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
    .title { font-size: 20px; font-weight: 700; color: #0f172a; }
    .grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 14px; }
    .tile { background: #ffffff; border: 1px solid #e2e8f0; padding: 16px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
    .tile-title { font-size: 11px; font-weight: 600; text-transform: uppercase; color: #64748b; margin-bottom: 8px; }
    .kpi-val { font-size: 44px; font-weight: 300; color: #0f172a; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="title">Microsoft Power BI - Executive Pipeline & Revenue Report</div>
      <div style="font-size: 12px; color: #64748b; margin-top: 4px;">DirectQuery Gateway • Enterprise Semantic Model • Filtered View</div>
    </div>
    <div style="font-size: 13px; font-weight: 600; color: #0f172a;">Generated: ${new Date().toLocaleString()}</div>
  </div>
  <div class="grid">
    <div class="tile" style="grid-column: span 3;">
      <div class="tile-title">Opportunity Count</div>
      <div class="kpi-val">${currentKPIs.opportunityCount}</div>
    </div>
    <div class="tile" style="grid-column: span 6;">
      <div class="tile-title">Pipeline Region Breakdown</div>
      <div style="font-size: 14px; margin-top: 10px;">Central: 48% • East: 32% • West: 20%</div>
    </div>
    <div class="tile" style="grid-column: span 3;">
      <div class="tile-title">Total Revenue</div>
      <div class="kpi-val">${currentKPIs.revenueText}</div>
    </div>
    <div class="tile" style="grid-column: span 12; margin-top: 10px;">
      <div class="tile-title">Factored Revenue</div>
      <div class="kpi-val" style="font-size: 36px; color: #00a39e;">${currentKPIs.factoredRevenueText}</div>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([reportHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `PowerBI_Executive_Dashboard_${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["Region", "PartnerDriven", "OpportunitySize", "SalesStage", "Count", "Revenue"];
    const rows = [
      ["Central", "Yes", "Large", "Lead", "65", "$650M"],
      ["Central", "No", "Medium", "Qualify", "45", "$320M"],
      ["East", "Yes", "Large", "Solution", "58", "$410M"],
      ["East", "No", "Small", "Proposal", "34", "$80M"],
      ["West", "Yes", "Medium", "Finalize", "22", "$140M"],
      ["West", "No", "Large", "Lead", "38", "$400M"],
    ];
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.download = `powerbi_pipeline_dataset_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 font-sans text-slate-800 dark:text-slate-100">
      
      {/* ========================================================================= */}
      {/* 1. TOP BREADCRUMB & PROMINENT BACK BUTTON (NEVER GET STUCK)              */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 shadow-xs">
        
        {/* Back Button & Path */}
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              id="powerbi-back-btn"
              title="Return to Document Scanner (Esc)"
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Scanner</span>
              <kbd className="hidden md:inline-block ml-1 px-1.5 py-0.5 text-[10px] bg-blue-700/80 rounded text-blue-100 font-mono">
                ESC
              </kbd>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer" onClick={onBack}>
              Workspace
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              Power BI Reports
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-blue-600 dark:text-blue-400 font-medium">
              Opportunity &amp; Revenue Analysis
            </span>
          </div>
        </div>

        {/* View Switcher & Action Tools */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Tab Switcher: Exact Power BI Layout vs Document OCR Telemetry */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            <button
              onClick={() => setActiveViewTab("PIPELINE")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                activeViewTab === "PIPELINE"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-[#00a39e]" />
              <span>Pipeline Analysis (Image View)</span>
            </button>
            <button
              onClick={() => setActiveViewTab("OCR_TELEMETRY")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                activeViewTab === "OCR_TELEMETRY"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>OCR &amp; SQL Telemetry</span>
            </button>
          </div>

          {/* Export Visual Report */}
          <button
            onClick={handleDownloadVisualReport}
            id="download-powerbi-report-btn"
            title="Download Standalone Power BI Visual Report (.HTML)"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Download Report</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            title="Export Underlying Dataset to CSV"
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
          </button>

          {/* Refresh Data */}
          <button
            onClick={handleRefresh}
            title="Refresh Power BI DirectQuery Dataset"
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-blue-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. POWER BI BRANDED TOOLBAR & SLICERS RIBBON                             */}
      {/* ========================================================================= */}
      <div className="bg-[#f0f2f5] dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Power BI Brand Identifier */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#F2C811] flex items-center justify-center text-slate-950 font-black text-xs shadow-xs">
              PB
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  Power BI Service • Enterprise DirectQuery Model
                </span>
                <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-900 dark:text-amber-300 border border-amber-400/30">
                  Live Connection
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Data Source: Azure Synapse / SQLite ACID Gateway (Latency: 142ms)
              </p>
            </div>
          </div>

          {/* Power BI Interactive Slicers */}
          {activeViewTab === "PIPELINE" && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              
              {/* Slicer: Region */}
              <div className="flex items-center bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 px-2 py-1 gap-1.5 shadow-xs">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Region:
                </span>
                {(["ALL", "Central", "East", "West"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRegionFilter(r)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                      regionFilter === r
                        ? "bg-[#00a39e] text-white font-bold"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {/* Slicer: Partner Driven */}
              <div className="flex items-center bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 px-2 py-1 gap-1.5 shadow-xs">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Partner Driven:
                </span>
                {(["ALL", "No", "Yes"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPartnerFilter(p)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                      partnerFilter === p
                        ? "bg-[#2d3748] text-white font-bold"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Reset Slicers */}
              {(regionFilter !== "ALL" || partnerFilter !== "ALL" || sizeFilter !== "ALL") && (
                <button
                  onClick={() => {
                    setRegionFilter("ALL");
                    setPartnerFilter("ALL");
                    setSizeFilter("ALL");
                  }}
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline px-1 font-semibold"
                >
                  Clear Slicers
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. VIEW TAB 1: EXACT REPLICA OF THE UPLOADED POWER BI DASHBOARD (IMAGE)   */}
      {/* ========================================================================= */}
      {activeViewTab === "PIPELINE" && (
        <div className="bg-[#edeef0] dark:bg-slate-950 p-2 sm:p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner">
          <div className="space-y-2.5">
            
            {/* ------------------------------------------------------------- */}
            {/* ROW 1: Opportunity Count, Partner Clustered, Stage Clustered, Donut, Revenue */}
            {/* ------------------------------------------------------------- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5">
              
              {/* Tile 1: KPI Opportunity Count (Col span 2.5) */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 shadow-2xs flex flex-col justify-between">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                  Opportunity Count
                </div>
                <div className="py-5 text-center">
                  <div className="text-4xl sm:text-5xl font-light text-slate-800 dark:text-slate-100 tracking-tight">
                    {currentKPIs.opportunityCount}
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 text-center">
                  Live Target Metric
                </div>
              </div>

              {/* Tile 2: Opportunity Count by Partner Driven & Opportunity Size (Col span 3) */}
              <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 shadow-2xs">
                <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-tight">
                  Opportunity Count
                </div>
                <div className="text-[9px] text-slate-400 uppercase tracking-tight mb-2">
                  BY PARTNER DRIVEN, OPPORTUNITY SIZE
                </div>

                {/* Legend */}
                <div className="flex items-center gap-3 text-[10px] text-slate-500 mb-2">
                  <span className="text-[9px] font-semibold text-slate-400">Oppo...</span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#00a39e]"></span> Small
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#2d3748]"></span> Medium
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#ff5c5c]"></span> Large
                  </span>
                </div>

                {/* SVG Chart: Clustered Columns */}
                <div className="h-28 w-full">
                  <svg viewBox="0 0 200 90" className="w-full h-full">
                    {/* Grid lines */}
                    <line x1="25" y1="20" x2="190" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="25" y1="50" x2="190" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="25" y1="80" x2="190" y2="80" stroke="#cbd5e1" strokeWidth="1" />

                    {/* Y Axis Labels */}
                    <text x="20" y="24" fontSize="8" fill="#94a3b8" textAnchor="end">200</text>
                    <text x="20" y="54" fontSize="8" fill="#94a3b8" textAnchor="end">100</text>
                    <text x="20" y="82" fontSize="8" fill="#94a3b8" textAnchor="end">0</text>

                    {/* Bars for 'No' (x: ~60) */}
                    <rect x="50" y="45" width="12" height="35" fill="#00a39e" rx="1" />
                    <rect x="64" y="42" width="12" height="38" fill="#2d3748" rx="1" />
                    <rect x="78" y="70" width="12" height="10" fill="#ff5c5c" rx="1" />
                    <text x="70" y="89" fontSize="8" fill="#64748b" textAnchor="middle">No</text>

                    {/* Bars for 'Yes' (x: ~135) */}
                    <rect x="120" y="52" width="12" height="28" fill="#00a39e" rx="1" />
                    <rect x="134" y="48" width="12" height="32" fill="#2d3748" rx="1" />
                    <rect x="148" y="32" width="12" height="48" fill="#ff5c5c" rx="1" />
                    <text x="140" y="89" fontSize="8" fill="#64748b" textAnchor="middle">Yes</text>
                  </svg>
                </div>
              </div>

              {/* Tile 3: Opportunity Count by Partner Driven & Sales Stage (Col span 2.5) */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 shadow-2xs">
                <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-tight">
                  Opportunity Count
                </div>
                <div className="text-[9px] text-slate-400 uppercase tracking-tight mb-2">
                  BY PARTNER DRIVEN, SALES STAGE
                </div>

                {/* Legend */}
                <div className="flex items-center gap-2 text-[9px] text-slate-500 mb-2">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00a39e]"></span> Lead
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2d3748]"></span> Qualify
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff5c5c]"></span> Solution
                  </span>
                </div>

                {/* SVG Chart */}
                <div className="h-28 w-full">
                  <svg viewBox="0 0 160 90" className="w-full h-full">
                    <line x1="20" y1="20" x2="155" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="20" y1="50" x2="155" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="20" y1="80" x2="155" y2="80" stroke="#cbd5e1" strokeWidth="1" />

                    <text x="16" y="24" fontSize="7" fill="#94a3b8" textAnchor="end">200</text>
                    <text x="16" y="54" fontSize="7" fill="#94a3b8" textAnchor="end">100</text>
                    <text x="16" y="82" fontSize="7" fill="#94a3b8" textAnchor="end">0</text>

                    {/* No */}
                    <rect x="42" y="48" width="9" height="32" fill="#00a39e" rx="1" />
                    <rect x="53" y="70" width="9" height="10" fill="#2d3748" rx="1" />
                    <rect x="64" y="75" width="9" height="5" fill="#ff5c5c" rx="1" />
                    <text x="59" y="89" fontSize="8" fill="#64748b" textAnchor="middle">No</text>

                    {/* Yes */}
                    <rect x="98" y="38" width="9" height="42" fill="#00a39e" rx="1" />
                    <rect x="109" y="68" width="9" height="12" fill="#2d3748" rx="1" />
                    <rect x="120" y="73" width="9" height="7" fill="#ff5c5c" rx="1" />
                    <text x="115" y="89" fontSize="8" fill="#64748b" textAnchor="middle">Yes</text>
                  </svg>
                </div>
              </div>

              {/* Tile 4: Opportunity Count by Region (Pie / Donut) (Col span 2.5) */}
              <div className="lg:col-span-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 shadow-2xs">
                <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-tight">
                  Opportunity Count
                </div>
                <div className="text-[9px] text-slate-400 uppercase tracking-tight mb-2">
                  BY REGION
                </div>

                {/* Donut Chart SVG */}
                <div className="h-28 w-full flex items-center justify-center relative">
                  <svg viewBox="0 0 100 100" className="w-24 h-24">
                    {/* Central: ~48% slice (#00a39e) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="32"
                      fill="transparent"
                      stroke="#00a39e"
                      strokeWidth="20"
                      strokeDasharray="96.5 104"
                      strokeDashoffset="25"
                    />
                    {/* East: ~32% slice (#2d3748) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="32"
                      fill="transparent"
                      stroke="#2d3748"
                      strokeWidth="20"
                      strokeDasharray="64.3 136"
                      strokeDashoffset="-71.5"
                    />
                    {/* West: ~20% slice (#ff5c5c) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="32"
                      fill="transparent"
                      stroke="#ff5c5c"
                      strokeWidth="20"
                      strokeDasharray="40.2 160"
                      strokeDashoffset="-135.8"
                    />
                  </svg>
                  
                  {/* Labels matching screenshot */}
                  <div className="absolute right-1 top-2 text-[8px] text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00a39e]"></span> Central
                  </div>
                  <div className="absolute left-1 bottom-1 text-[8px] text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2d3748]"></span> East
                  </div>
                  <div className="absolute left-1 top-2 text-[8px] text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff5c5c]"></span> West
                  </div>
                </div>
              </div>

              {/* Tile 5: KPI Revenue $2bn (Col span 2) */}
              <div className="lg:col-span-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 shadow-2xs flex flex-col justify-between">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                  Revenue
                </div>
                <div className="py-5 text-center">
                  <div className="text-4xl sm:text-5xl font-light text-slate-800 dark:text-slate-100 tracking-tight">
                    {currentKPIs.revenueText}
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 text-center">
                  Total Projected Pipeline
                </div>
              </div>

            </div>

            {/* ------------------------------------------------------------- */}
            {/* ROW 2: 100% Stacked by Month, Region Size Horizontal, Funnel, Avg Revenue */}
            {/* ------------------------------------------------------------- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5">
              
              {/* Tile 6: Opportunity Count BY MONTH, SALES STAGE (100% Stacked Column) (Col span 4.5) */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 shadow-2xs">
                <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-tight">
                  Opportunity Count
                </div>
                <div className="text-[9px] text-slate-400 uppercase tracking-tight mb-2">
                  BY MONTH, SALES STAGE
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-2 text-[8px] text-slate-500 mb-2">
                  <span className="text-slate-400 font-medium">Sales Stage:</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#00a39e]"></span> Lead</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#2d3748]"></span> Qualify</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#ff5c5c]"></span> Solution</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#ffb703]"></span> Proposal</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#2b90b8]"></span> Finalize</span>
                </div>

                {/* 100% Stacked Column Chart SVG */}
                <div className="h-44 w-full">
                  <svg viewBox="0 0 320 140" className="w-full h-full">
                    {/* Grid lines 0%, 20%, 40%, 60%, 80%, 100% */}
                    {[15, 37, 59, 81, 103, 125].map((y, idx) => (
                      <g key={y}>
                        <line x1="30" y1={y} x2="315" y2={y} stroke={idx === 5 ? "#cbd5e1" : "#f1f5f9"} strokeWidth="1" />
                        <text x="25" y={y + 3} fontSize="7" fill="#94a3b8" textAnchor="end">
                          {100 - idx * 20}%
                        </text>
                      </g>
                    ))}

                    {/* Months: Jan to Dec */}
                    {[
                      { m: "Jan", lead: 10, qual: 10, sol: 45, prop: 35 },
                      { m: "Feb", lead: 18, qual: 15, sol: 40, prop: 27 },
                      { m: "Mar", lead: 25, qual: 20, sol: 42, prop: 13 },
                      { m: "Apr", lead: 35, qual: 35, sol: 20, prop: 10 },
                      { m: "May", lead: 48, qual: 30, sol: 16, prop: 6 },
                      { m: "Jun", lead: 55, qual: 25, sol: 14, prop: 6 },
                      { m: "Jul", lead: 65, qual: 25, sol: 7, prop: 3 },
                      { m: "Aug", lead: 68, qual: 24, sol: 5, prop: 3 },
                      { m: "Sep", lead: 72, qual: 20, sol: 6, prop: 2 },
                      { m: "Oct", lead: 80, qual: 15, sol: 5, prop: 0 },
                      { m: "Nov", lead: 100, qual: 0, sol: 0, prop: 0 },
                      { m: "Dec", lead: 100, qual: 0, sol: 0, prop: 0 },
                    ].map((item, i) => {
                      const x = 38 + i * 23;
                      const width = 14;
                      const totalHeight = 110; // from y=15 (100%) to y=125 (0%)
                      
                      const hLead = (item.lead / 100) * totalHeight;
                      const hQual = (item.qual / 100) * totalHeight;
                      const hSol = (item.sol / 100) * totalHeight;
                      const hProp = (item.prop / 100) * totalHeight;

                      const yLead = 125 - hLead;
                      const yQual = yLead - hQual;
                      const ySol = yQual - hSol;
                      const yProp = ySol - hProp;

                      return (
                        <g key={item.m}>
                          {hLead > 0 && <rect x={x} y={yLead} width={width} height={hLead} fill="#00a39e" />}
                          {hQual > 0 && <rect x={x} y={yQual} width={width} height={hQual} fill="#2d3748" />}
                          {hSol > 0 && <rect x={x} y={ySol} width={width} height={hSol} fill="#ff5c5c" />}
                          {hProp > 0 && <rect x={x} y={yProp} width={width} height={hProp} fill="#ffb703" />}
                          <text x={x + width / 2} y="136" fontSize="7" fill="#64748b" textAnchor="middle">
                            {item.m}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Tile 7: Opportunity Count BY REGION, OPPORTUNITY SIZE (Horizontal Clustered Bar) (Col span 4.5) */}
              <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 shadow-2xs">
                <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-tight">
                  Opportunity Count
                </div>
                <div className="text-[9px] text-slate-400 uppercase tracking-tight mb-2">
                  BY REGION, OPPORTUNITY SIZE
                </div>

                {/* Legend */}
                <div className="flex items-center gap-3 text-[9px] text-slate-500 mb-2">
                  <span className="text-slate-400">Opportunity Size:</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#00a39e]"></span> Small</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#2d3748]"></span> Medium</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#ff5c5c]"></span> Large</span>
                </div>

                {/* Horizontal Bar Chart SVG */}
                <div className="h-44 w-full">
                  <svg viewBox="0 0 250 140" className="w-full h-full">
                    {/* Vertical grid lines: 0, 20, 40, 60, 80 */}
                    {[45, 95, 145, 195, 245].map((x, idx) => (
                      <g key={x}>
                        <line x1={x} y1="10" x2={x} y2="120" stroke="#f1f5f9" strokeWidth="1" />
                        <text x={x} y="132" fontSize="7" fill="#94a3b8" textAnchor="middle">
                          {idx * 20}
                        </text>
                      </g>
                    ))}

                    {/* East */}
                    <text x="40" y="32" fontSize="8" fill="#64748b" textAnchor="end">East</text>
                    <rect x="45" y="20" width="180" height="7" fill="#00a39e" rx="1" />
                    <rect x="45" y="29" width="168" height="7" fill="#2d3748" rx="1" />
                    <rect x="45" y="38" width="164" height="7" fill="#ff5c5c" rx="1" />

                    {/* Central */}
                    <text x="40" y="70" fontSize="8" fill="#64748b" textAnchor="end">Central</text>
                    <rect x="45" y="58" width="150" height="7" fill="#00a39e" rx="1" />
                    <rect x="45" y="67" width="138" height="7" fill="#2d3748" rx="1" />
                    <rect x="45" y="76" width="155" height="7" fill="#ff5c5c" rx="1" />

                    {/* West */}
                    <text x="40" y="108" fontSize="8" fill="#64748b" textAnchor="end">West</text>
                    <rect x="45" y="96" width="70" height="7" fill="#00a39e" rx="1" />
                    <rect x="45" y="105" width="92" height="7" fill="#2d3748" rx="1" />
                    <rect x="45" y="114" width="78" height="7" fill="#ff5c5c" rx="1" />
                  </svg>
                </div>
              </div>

              {/* Tile 8 & 9 (Col span 3): Funnel Chart & Average Revenue */}
              <div className="lg:col-span-3 space-y-2.5">
                
                {/* Tile 8: Opportunity Count BY SALES STAGE (Funnel Chart) */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 shadow-2xs">
                  <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-tight">
                    Opportunity Count
                  </div>
                  <div className="text-[9px] text-slate-400 uppercase tracking-tight mb-1.5">
                    BY SALES STAGE
                  </div>

                  {/* Funnel Bars */}
                  <div className="space-y-1 py-1">
                    {[
                      { stage: "Lead", pct: "100%", width: "w-full" },
                      { stage: "Qualify", pct: "74%", width: "w-[74%]" },
                      { stage: "Solution", pct: "37%", width: "w-[37%]" },
                      { stage: "Proposal", pct: "16%", width: "w-[16%]" },
                      { stage: "Finalize", pct: "5.2%", width: "w-[10%]" },
                    ].map((f) => (
                      <div key={f.stage} className="flex items-center justify-between text-[8px]">
                        <span className="w-12 text-slate-500">{f.stage}</span>
                        <div className="flex-1 mx-2 flex justify-center">
                          <div className={`h-2.5 bg-[#00a39e] ${f.width} rounded-[1px] transition-all`}></div>
                        </div>
                        <span className="w-7 text-right font-semibold text-slate-700 dark:text-slate-300">{f.pct}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tile 9: Average Revenue BY PARTNER DRIVEN, OPPORTUNITY SIZE */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 shadow-2xs">
                  <div className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-tight">
                    Average Revenue
                  </div>
                  <div className="text-[8px] text-slate-400 uppercase tracking-tight mb-1">
                    BY PARTNER DRIVEN, OPPORTUNITY SIZE
                  </div>

                  {/* Small Bar Visual */}
                  <div className="h-16 w-full">
                    <svg viewBox="0 0 160 50" className="w-full h-full">
                      <line x1="25" y1="42" x2="155" y2="42" stroke="#cbd5e1" strokeWidth="1" />
                      <text x="22" y="15" fontSize="6" fill="#94a3b8" textAnchor="end">$10M</text>
                      <text x="22" y="30" fontSize="6" fill="#94a3b8" textAnchor="end">$5M</text>
                      <text x="22" y="44" fontSize="6" fill="#94a3b8" textAnchor="end">$0M</text>

                      {/* No */}
                      <rect x="52" y="38" width="6" height="4" fill="#00a39e" />
                      <rect x="60" y="28" width="6" height="14" fill="#2d3748" />
                      <rect x="68" y="20" width="6" height="22" fill="#ff5c5c" />
                      <text x="63" y="49" fontSize="6" fill="#64748b" textAnchor="middle">No</text>

                      {/* Yes */}
                      <rect x="110" y="35" width="6" height="7" fill="#00a39e" />
                      <rect x="118" y="24" width="6" height="18" fill="#2d3748" />
                      <rect x="126" y="14" width="6" height="28" fill="#ff5c5c" />
                      <text x="121" y="49" fontSize="6" fill="#64748b" textAnchor="middle">Yes</text>
                    </svg>
                  </div>
                </div>

              </div>

            </div>

            {/* ------------------------------------------------------------- */}
            {/* ROW 3: Revenue by Stage, Avg Rev Horizontal, Factored Rev KPI, Factored Rev Size */}
            {/* ------------------------------------------------------------- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5">
              
              {/* Tile 10: Revenue BY SALES STAGE, PARTNER DRIVEN (Col span 5) */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 shadow-2xs">
                <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-tight">
                  Revenue
                </div>
                <div className="text-[9px] text-slate-400 uppercase tracking-tight mb-2">
                  BY SALES STAGE, PARTNER DRIVEN
                </div>

                {/* Legend */}
                <div className="flex items-center gap-3 text-[9px] text-slate-500 mb-2">
                  <span className="text-slate-400 font-medium">Partner Driven:</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#00a39e]"></span> No</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#2d3748]"></span> Yes</span>
                </div>

                {/* SVG Clustered Column */}
                <div className="h-40 w-full">
                  <svg viewBox="0 0 280 120" className="w-full h-full">
                    {/* Y Axis Grid lines */}
                    {[15, 33, 51, 69, 87, 105].map((y, idx) => (
                      <g key={y}>
                        <line x1="30" y1={y} x2="275" y2={y} stroke={idx === 5 ? "#cbd5e1" : "#f1f5f9"} strokeWidth="1" />
                        <text x="26" y={y + 3} fontSize="7" fill="#94a3b8" textAnchor="end">
                          ${(1.0 - idx * 0.2).toFixed(1)}bn
                        </text>
                      </g>
                    ))}

                    {/* Stages: Lead, Qualify, Solution, Proposal, Finalize */}
                    {[
                      { s: "Lead", noH: 26, yesH: 85 },
                      { s: "Qualify", noH: 14, yesH: 21 },
                      { s: "Solution", noH: 11, yesH: 16 },
                      { s: "Proposal", noH: 6, yesH: 8 },
                      { s: "Finalize", noH: 3, yesH: 5 },
                    ].map((item, idx) => {
                      const x = 50 + idx * 46;
                      return (
                        <g key={item.s}>
                          {/* No Bar (Teal) */}
                          <rect x={x} y={105 - item.noH} width="14" height={item.noH} fill="#00a39e" rx="1" />
                          {/* Yes Bar (Navy) */}
                          <rect x={x + 16} y={105 - item.yesH} width="14" height={item.yesH} fill="#2d3748" rx="1" />
                          <text x={x + 15} y="116" fontSize="7" fill="#64748b" textAnchor="middle">
                            {item.s}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Tile 11: Average Revenue BY PARTNER DRIVEN, OPPORTUNITY SIZE (Horizontal Bar) (Col span 4) */}
              <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 shadow-2xs">
                <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-tight">
                  Average Revenue
                </div>
                <div className="text-[9px] text-slate-400 uppercase tracking-tight mb-2">
                  BY PARTNER DRIVEN, OPPORTUNITY SIZE
                </div>

                {/* Legend */}
                <div className="flex items-center gap-3 text-[9px] text-slate-500 mb-2">
                  <span className="text-slate-400">Opportunity Size:</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#00a39e]"></span> Small</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#2d3748]"></span> Medium</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#ff5c5c]"></span> Large</span>
                </div>

                {/* Horizontal Bars */}
                <div className="h-40 w-full">
                  <svg viewBox="0 0 240 120" className="w-full h-full">
                    {/* Grid lines $0M, $2M, $4M, $6M, $8M, $10M */}
                    {[35, 75, 115, 155, 195, 235].map((x, idx) => (
                      <g key={x}>
                        <line x1={x} y1="10" x2={x} y2="98" stroke="#f1f5f9" strokeWidth="1" />
                        <text x={x} y="112" fontSize="7" fill="#94a3b8" textAnchor="middle">
                          ${idx * 2}M
                        </text>
                      </g>
                    ))}

                    {/* Yes */}
                    <text x="30" y="38" fontSize="8" fill="#64748b" textAnchor="end">Yes</text>
                    <rect x="35" y="24" width="28" height="9" fill="#00a39e" rx="1" />
                    <rect x="35" y="35" width="95" height="9" fill="#2d3748" rx="1" />
                    <rect x="35" y="46" width="180" height="9" fill="#ff5c5c" rx="1" />

                    {/* No */}
                    <text x="30" y="80" fontSize="8" fill="#64748b" textAnchor="end">No</text>
                    <rect x="35" y="66" width="22" height="9" fill="#00a39e" rx="1" />
                    <rect x="35" y="77" width="90" height="9" fill="#2d3748" rx="1" />
                    <rect x="35" y="88" width="145" height="9" fill="#ff5c5c" rx="1" />
                  </svg>
                </div>
              </div>

              {/* Tile 12 & 13 (Col span 3): Factored Revenue KPI & Factored Revenue by Size */}
              <div className="lg:col-span-3 space-y-2.5">
                
                {/* Tile 12: Factored Revenue KPI */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 shadow-2xs">
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                    Factored Revenue
                  </div>
                  <div className="py-2 text-center">
                    <div className="text-3xl sm:text-4xl font-light text-slate-800 dark:text-slate-100 tracking-tight">
                      {currentKPIs.factoredRevenueText}
                    </div>
                  </div>
                </div>

                {/* Tile 13: Factored Revenue BY OPPORTUNITY SIZE */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 shadow-2xs">
                  <div className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-tight">
                    Factored Revenue
                  </div>
                  <div className="text-[8px] text-slate-400 uppercase tracking-tight mb-1">
                    BY OPPORTUNITY SIZE
                  </div>

                  {/* Column Chart in Teal */}
                  <div className="h-20 w-full">
                    <svg viewBox="0 0 160 65" className="w-full h-full">
                      <line x1="28" y1="52" x2="155" y2="52" stroke="#cbd5e1" strokeWidth="1" />
                      <text x="25" y="16" fontSize="6" fill="#94a3b8" textAnchor="end">$0.2bn</text>
                      <text x="25" y="52" fontSize="6" fill="#94a3b8" textAnchor="end">$0.0bn</text>

                      {/* Large */}
                      <rect x="44" y="14" width="22" height="38" fill="#00a39e" rx="1" />
                      <text x="55" y="60" fontSize="7" fill="#64748b" textAnchor="middle">Large</text>

                      {/* Medium */}
                      <rect x="80" y="28" width="22" height="24" fill="#00a39e" rx="1" />
                      <text x="91" y="60" fontSize="7" fill="#64748b" textAnchor="middle">Medium</text>

                      {/* Small */}
                      <rect x="116" y="40" width="22" height="12" fill="#00a39e" rx="1" />
                      <text x="127" y="60" fontSize="7" fill="#64748b" textAnchor="middle">Small</text>
                    </svg>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. VIEW TAB 2: MULTILINGUAL OCR TELEMETRY & SQL DATABASE PIPELINE        */}
      {/* ========================================================================= */}
      {activeViewTab === "OCR_TELEMETRY" && (
        <div className="space-y-4">
          
          {/* Executive KPI Header */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-[11px] font-semibold text-slate-500 uppercase">Total Scans</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {metrics?.total_scans || 0}
              </div>
              <div className="text-[10px] text-emerald-600 font-medium mt-1">Acquired physical docs</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-[11px] font-semibold text-slate-500 uppercase">Committed to SQL</div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {metrics?.committed || 0}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">ACID Verified</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-[11px] font-semibold text-slate-500 uppercase">Needs Review</div>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                {metrics?.needs_review || 0}
              </div>
              <div className="text-[10px] text-amber-600 font-medium mt-1">Flagged for humans</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-[11px] font-semibold text-slate-500 uppercase">Avg OCR Confidence</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                {metrics?.avg_confidence || 94.8}%
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Hindi / Marathi / Eng</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-[11px] font-semibold text-slate-500 uppercase">Total Fields</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {metrics?.total_fields || 0}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Extracted tokens</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-[11px] font-semibold text-slate-500 uppercase">Missing Rate</div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                {metrics?.missing_rate || 0}%
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Python auto-imputed</div>
            </div>
          </div>

          {/* Department & Language Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Department Breakdown */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-3">
                Volume by Department
              </h3>
              <div className="space-y-2.5">
                {(metrics?.department_distribution || []).map((dept) => {
                  const maxCount = Math.max(...(metrics?.department_distribution || []).map((d) => d.doc_count), 1);
                  const pct = Math.round((dept.doc_count / maxCount) * 100);
                  return (
                    <div key={dept.id} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                        <span>{dept.name}</span>
                        <span className="font-bold text-slate-900 dark:text-white">{dept.doc_count} docs</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Language Breakdown */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-3">
                Multilingual OCR Acquisition
              </h3>
              <div className="space-y-2.5">
                {(metrics?.language_distribution || []).map((lang) => {
                  const total = (metrics?.language_distribution || []).reduce((acc, l) => acc + l.count, 0) || 1;
                  const pct = Math.round((lang.count / total) * 100);
                  return (
                    <div key={lang.original_language} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                        <span>{lang.original_language}</span>
                        <span className="font-bold text-slate-900 dark:text-white">{lang.count} ({pct}%)</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Recent Synced Documents Table */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-3">
              Power BI Incremental Refresh Stream (Recent Ingestions)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3">Doc #</th>
                    <th className="py-2.5 px-3">Title</th>
                    <th className="py-2.5 px-3">Language</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Confidence</th>
                    <th className="py-2.5 px-3">Ingested At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {recentDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {doc.doc_number}
                      </td>
                      <td className="py-2 px-3 text-slate-900 dark:text-white font-medium max-w-xs truncate">
                        {doc.title}
                      </td>
                      <td className="py-2 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                          {doc.original_language}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          doc.status === "COMMITTED"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                        }`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-600 dark:text-slate-400">
                        {doc.ocr_confidence}%
                      </td>
                      <td className="py-2 px-3 text-slate-500 font-mono">
                        {new Date(doc.created_at).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Persistent Bottom Back Button for long-scroll convenience */}
      {onBack && (
        <div className="flex justify-center pt-2 pb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm shadow-md hover:bg-slate-800 dark:hover:bg-slate-100 transition-all active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Done with Analytics — Back to Document Scanner</span>
          </button>
        </div>
      )}

    </div>
  );
};
