import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Globe,
  ArrowRight,
  RefreshCw,
  Edit3,
  Layers,
  FileText,
  HelpCircle,
  Check,
  RotateCcw,
  Zap,
  ShieldCheck,
  Lock,
  Database,
  Terminal,
} from "lucide-react";
import { DocumentField, PipelineAlert, UserRole, SubscriptionTier, PLAN_CONFIGS } from "../types";
import { LandingHero } from "./LandingHero";

interface ScannerViewProps {
  onScanSuccess: (doc: any) => void;
  onQueueOffline: (doc: any) => void;
  isOffline: boolean;
  selectedDepartment: string;
  userRole: UserRole;
  initialMode?: "camera" | "upload" | "presets";
  onOpenGetStarted?: () => void;
  currentTier: SubscriptionTier;
  scansUsed: number;
  onIncrementScanCount: () => void;
  onOpenPricing: (suggestedTier?: SubscriptionTier) => void;
}

export const ScannerView: React.FC<ScannerViewProps> = ({
  onScanSuccess,
  onQueueOffline,
  isOffline,
  selectedDepartment,
  userRole,
  initialMode,
  onOpenGetStarted,
  currentTier,
  scansUsed,
  onIncrementScanCount,
  onOpenPricing,
}) => {
  const [scanMode, setScanMode] = useState<"camera" | "upload" | "presets">(initialMode || "presets");

  useEffect(() => {
    if (initialMode) {
      setScanMode(initialMode);
      if (initialMode === "camera") {
        startCamera();
      } else {
        stopCamera();
      }
    }
  }, [initialMode]);
  const [isScanning, setIsScanning] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Extracted and cleaned document state
  const [scannedResult, setScannedResult] = useState<{
    document_type: string;
    title: string;
    original_language: string;
    translated_to: string;
    raw_text_summary: string;
    pipeline_status: string;
    fields: DocumentField[];
    pipeline_alerts: PipelineAlert[];
    cleaning_log: string[];
    missing_count: number;
    total_fields: number;
  } | null>(null);

  const [editableFields, setEditableFields] = useState<DocumentField[]>([]);
  const [committing, setCommitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Preset sample documents for instant testing of auto-detection & 100% English conversion
  const presets = [
    {
      id: "hindi_covid_registry",
      lang: "Hindi (हिन्दी) Auto-Detected",
      flag: "🇮🇳",
      department: "dept-asset",
      deptName: "Public Health & Registry",
      title: "COVID-19 Inward Traveler & Migrant Registry (कोविड 19 प्रवासी प्रविष्टि)",
      type: "Public Health Quarantine Registry",
      desc: "Trained on uploaded Hindi document. Auto-detects Devanagari script; converts all Hindi names (Nayan, Aditya, Vinay, Prithvi, Chandra), districts (Bhopal, Nagpur, Hyderabad, Surat, Indore) and states into 100% English.",
      badge: "Trained on hindi.jpg",
    },
    {
      id: "excel_company_registry",
      lang: "English (Spreadsheet) Auto-Detected",
      flag: "📊",
      department: "dept-asset",
      deptName: "Executive & Venture Analytics",
      title: "Executive Tech Venture Directory (Patribarcanalst1ist.xlsx)",
      type: "Corporate Registry Spreadsheet",
      desc: "Trained on uploaded Excel spreadsheet. Auto-extracts multi-column corporate entities (Naritiv, FameBit, TOTEMS, Popular Pays, NMRKT, Snapwire, Revfluence, NeoReach) into standardized English fields.",
      badge: "Trained on english.jfif",
    },
    {
      id: "hindi_invoice",
      lang: "Hindi (हिन्दी) Auto-Detected",
      flag: "🇮🇳",
      department: "dept-finance",
      deptName: "Finance & Tax (India)",
      title: "Bharat Electronics & Services Pvt. Ltd. - GST Tax Invoice",
      type: "GST Tax Invoice (वस्तु एवं सेवा कर चालान)",
      desc: "Indian GST tax invoice with Devanagari numerals (२,४५,०००.००), 18% IGST, GSTIN identifier, and missing due date. 100% converted to English.",
    },
    {
      id: "marathi_asset",
      lang: "Marathi (मराठी) Auto-Detected",
      flag: "🇮🇳",
      department: "dept-asset",
      deptName: "Asset Management (Maharashtra)",
      title: "Government Asset Handover - Heavy Hydraulic Excavator",
      type: "Government Asset Handover (मालमत्ता हस्तांतरण)",
      desc: "Maharashtra PWD heavy machinery certificate in Marathi with valuation in INR (₹ ८५,००,०००) and unassigned supervising officer. 100% converted to English.",
    },
    {
      id: "german_asset",
      lang: "German (Deutsch) Auto-Detected",
      flag: "🇩🇪",
      department: "dept-asset",
      deptName: "Asset Management",
      title: "Siemens Gasturbine SGT-400 Wartungsprotokoll",
      type: "Heavy Equipment Handover & Maintenance",
      desc: "Equipment handover protocol with EU currency (485.000,00 €), DIN date (14.09.2026), and 2 missing status inspection fields. 100% converted to English.",
    },
    {
      id: "french_logistics",
      lang: "French (Français) Auto-Detected",
      flag: "🇫🇷",
      department: "dept-logistics",
      deptName: "Logistics & Supply Chain",
      title: "CMA CGM Maritime Container Bill of Lading",
      type: "Maritime Bill of Lading (40ft High Cube)",
      desc: "International maritime container manifest with French terminology, gross cargo weight (18.450,50 kg), and missing customs code. 100% converted to English.",
    },
    {
      id: "japanese_invoice",
      lang: "Japanese (日本語) Auto-Detected",
      flag: "🇯🇵",
      department: "dept-finance",
      deptName: "Finance & Invoicing",
      title: "Tokyo Semiconductor Co., Ltd. Delivery Invoice",
      type: "Vendor Commercial Tax Invoice",
      desc: "Electronic parts invoice in Japanese yen (¥2,850,000) with missing Consumption Tax (VAT) and due date. 100% converted to English.",
    },
    {
      id: "spanish_health",
      lang: "Spanish (Español) Auto-Detected",
      flag: "🇪🇸",
      department: "dept-healthcare",
      deptName: "Healthcare & Medical",
      title: "Somatom Computed Tomography Calibration Certificate",
      type: "Bio-Medical Device Calibration",
      desc: "Hospital medical scanner certificate with Spanish medical terminology, radiation variance, and missing renewal date. 100% converted to English.",
    },
  ];

  // Camera Management
  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      alert("Unable to access camera. You can still use File Upload or Multilingual Presets.");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      setCapturedImage(dataUrl);
      stopCamera();
      triggerScan({ imageBase64: dataUrl });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Security & Infrastructure Guard: 10MB maximum file size check (Section 8)
    if (file.size > 10 * 1024 * 1024) {
      alert("File exceeds the maximum limit of 10MB. Please choose a sample or compressed document.");
      return;
    }

    // Client-side image pre-optimization to save network bandwidth and Gemini tokens
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1600;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const optimizedBase64 = canvas.toDataURL("image/jpeg", 0.85);
            setCapturedImage(optimizedBase64);
            triggerScan({ imageBase64: optimizedBase64, mimeType: "image/jpeg" });
          } else {
            const rawBase64 = reader.result as string;
            setCapturedImage(rawBase64);
            triggerScan({ imageBase64: rawBase64, mimeType: file.type });
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setCapturedImage(base64);
        triggerScan({ imageBase64: base64, mimeType: file.type });
      };
      reader.readAsDataURL(file);
    }
  };

  // Main Scan Trigger (Multilingual OCR + Python pipeline)
  const triggerScan = async (params: { imageBase64?: string; mimeType?: string; presetId?: string }) => {
    const scanLimit = PLAN_CONFIGS[currentTier]?.pageLimitMonthly ?? 50;
    if (scanLimit !== -1 && scansUsed >= scanLimit) {
      alert(
        `You've reached your monthly free processing limit (${scanLimit}/${scanLimit} pages). Your limit will reset on the 1st of next month.`
      );
      onOpenPricing(currentTier);
      return;
    }

    setIsScanning(true);
    setScannedResult(null);
    setSuccessMessage(null);
    setActiveStep(1);

    try {
      // Step 1: Multilingual Ingestion & Translation
      await new Promise((r) => setTimeout(r, 600));
      setActiveStep(2);

      // Step 2: Calling API
      const dept = selectedDepartment === "ALL" ? "dept-asset" : selectedDepartment;
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...params,
          departmentId: dept,
          userTier: currentTier,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        if (errJson.requires_upgrade) {
          onOpenPricing(errJson.required_tier || "PLUS");
          throw new Error(errJson.error || "Subscription upgrade required");
        }
        throw new Error(`Scan failed: ${res.statusText}`);
      }

      setActiveStep(3);
      await new Promise((r) => setTimeout(r, 500));

      const data = await res.json();
      setActiveStep(4);
      await new Promise((r) => setTimeout(r, 400));

      setScannedResult(data);
      setEditableFields(data.fields || []);
      onIncrementScanCount();
    } catch (err: any) {
      console.error("Scan error:", err);
      alert(`Error during document processing: ${err.message}`);
    } finally {
      setIsScanning(false);
      setActiveStep(0);
    }
  };

  // Handle Field Edits
  const handleFieldChange = (index: number, newCleanedValue: string) => {
    setEditableFields((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        cleaned_value: newCleanedValue,
        is_empty: newCleanedValue.trim() === "",
        review_status: "OVERRIDDEN",
      };
      return next;
    });
  };

  // Apply Smart Suggestions to missing fields
  const applyAllSuggestions = () => {
    setEditableFields((prev) =>
      prev.map((f) => {
        if (f.is_empty && f.suggested_action && f.suggested_action.value) {
          return {
            ...f,
            cleaned_value: f.suggested_action.value,
            is_empty: false,
            review_status: "OVERRIDDEN",
          };
        }
        return f;
      })
    );
  };

  // Commit document to SQL or Mark for Review
  const handleCommitOrReview = async (action: "COMMIT" | "MARK_REVIEW") => {
    if (!scannedResult) return;

    setCommitting(true);

    const missingNow = editableFields.filter((f) => f.is_empty).length;
    const finalStatus =
      action === "MARK_REVIEW" || missingNow > 0
        ? "NEEDS_REVIEW"
        : scannedResult.pipeline_alerts.some((a) => a.severity === "ERROR")
        ? "PIPELINE_ERROR"
        : "COMMITTED";

    const docPayload = {
      title: scannedResult.title,
      document_type: scannedResult.document_type,
      department_id: selectedDepartment === "ALL" ? "dept-asset" : selectedDepartment,
      original_language: scannedResult.original_language,
      translated_to: "English",
      status: finalStatus,
      confidence_score: 0.96,
      missing_count: missingNow,
      raw_text: scannedResult.raw_text_summary,
      image_preview: capturedImage,
      fields: editableFields,
      pipeline_alerts: scannedResult.pipeline_alerts,
      scan_mode: capturedImage ? "Camera / Photo Upload" : "Preset Multilingual OCR",
    };

    // If Offline, store in local queue
    if (isOffline) {
      onQueueOffline(docPayload);
      setSuccessMessage("Device is offline. Document successfully stored in Offline Queue for automated sync!");
      setCommitting(false);
      return;
    }

    try {
      const res = await fetch("/api/documents/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document: docPayload,
          userEmail: "operator.scanner@corp.internal",
          role: userRole,
        }),
      });

      const result = await res.json();
      if (result.success) {
        setSuccessMessage(
          action === "COMMIT"
            ? `Successfully sanitized and committed ${result.doc_number} to SQL Database!`
            : `Document ${result.doc_number} marked for human review in Review Queue.`
        );
        onScanSuccess(result);
      } else {
        alert(`Failed to save document: ${result.error || "Unknown error"}`);
      }
    } catch (err: any) {
      alert(`Commit error: ${err.message}`);
    } finally {
      setCommitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar with Get Started guide trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Intelligent Data Processing &amp; Ingestion
              </h2>
              <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-medium text-slate-600 dark:text-slate-400">
                🇮🇳 Hindi • 🇮🇳 Marathi • 🇩🇪 German • 🇫🇷 French • 🇺🇸 English
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Transform unstructured multilingual records into clean, structured, analytics-ready business data.
            </p>
          </div>
        </div>

        {onOpenGetStarted && (
          <button
            onClick={onOpenGetStarted}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Pipeline Architecture Guide</span>
          </button>
        )}
      </div>

      {/* Subscription Tier & Quota Status Bar */}
      <div
        id="scanner-tier-quota-banner"
        className="p-4 rounded-2xl border bg-blue-50/60 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Free Public Platform Tier
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.2 rounded-full border border-emerald-300 dark:border-emerald-800">
                Full Pipeline Unlocked
              </span>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              <span>
                <strong>Monthly Processing Limit</strong>: {scansUsed} of 50 pages processed this month (
                <strong className="text-blue-600 dark:text-blue-400">{Math.max(0, 50 - scansUsed)} remaining</strong>). Python cleaning, SQL storage, and BI analytics are active.
              </span>
            </div>
          </div>
        </div>

        {/* Usage Progress & Roadmap CTA */}
        <div className="flex items-center gap-4 self-end md:self-auto">
          <div className="w-36">
            <div className="flex justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              <span>Monthly Quota</span>
              <span>{scansUsed} / 50</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all ${
                  scansUsed >= 50
                    ? "bg-rose-500"
                    : scansUsed >= 40
                    ? "bg-amber-500"
                    : "bg-blue-600"
                }`}
                style={{
                  width: `${Math.min(100, (scansUsed / 50) * 100)}%`,
                }}
              />
            </div>
          </div>

          <button
            id="scanner-tier-upgrade-btn"
            onClick={() => onOpenPricing()}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:opacity-90 transition-all flex items-center gap-1.5 shadow-xs whitespace-nowrap cursor-pointer"
          >
            <span>Product Roadmap</span>
          </button>
        </div>
      </div>

      {/* Mode Selection Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <button
            id="mode-presets"
            onClick={() => {
              setScanMode("presets");
              stopCamera();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              scanMode === "presets"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            <Globe className="w-4 h-4" />
            Trained Models &amp; Auto-Detect (100% English Output)
          </button>

          <button
            id="mode-camera"
            onClick={() => {
              setScanMode("camera");
              startCamera();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              scanMode === "camera"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            <Camera className="w-4 h-4" />
            Take Photo / Camera
          </button>

          <button
            id="mode-upload"
            onClick={() => {
              setScanMode("upload");
              stopCamera();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              scanMode === "upload"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload File
          </button>
        </div>

        {scannedResult && (
          <button
            onClick={() => {
              setScannedResult(null);
              setCapturedImage(null);
              setSuccessMessage(null);
            }}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear / Scan New
          </button>
        )}
      </div>

      {/* Input Panes */}
      {!scannedResult && !isScanning && (
        <>
          {/* Presets Mode */}
          {scanMode === "presets" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {presets.map((preset) => (
                <div
                  key={preset.id}
                  id={`preset-${preset.id}`}
                  onClick={() => triggerScan({ presetId: preset.id })}
                  className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl p-5 shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{preset.flag}</span>
                      <div className="flex items-center gap-1.5">
                        {preset.badge && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                            {preset.badge}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {preset.deptName}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                        {preset.lang}
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                        100% English Output
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {preset.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                      {preset.desc}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
                    <span>Click to Simulate Scan & Clean</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Camera Mode */}
          {scanMode === "camera" && (
            <div className="bg-slate-900 rounded-2xl p-6 text-white text-center flex flex-col items-center">
              <div className="relative w-full max-w-xl aspect-4/3 rounded-xl overflow-hidden bg-black border-2 border-slate-700 shadow-inner flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                {/* Viewfinder overlay */}
                <div className="absolute inset-8 border-2 border-dashed border-blue-400/70 rounded-lg pointer-events-none flex flex-col justify-between p-3">
                  <div className="flex justify-between">
                    <div className="w-4 h-4 border-t-2 border-l-2 border-blue-400"></div>
                    <div className="w-4 h-4 border-t-2 border-r-2 border-blue-400"></div>
                  </div>
                  <div className="text-center text-xs font-medium text-blue-200/90 bg-slate-900/70 py-1 px-3 rounded-full mx-auto backdrop-blur-xs">
                    Align document within frame
                  </div>
                  <div className="flex justify-between">
                    <div className="w-4 h-4 border-b-2 border-l-2 border-blue-400"></div>
                    <div className="w-4 h-4 border-b-2 border-r-2 border-blue-400"></div>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-4">
                <button
                  id="capture-photo-button"
                  onClick={captureSnapshot}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/40 transform active:scale-95 transition-all"
                >
                  <Camera className="w-5 h-5" />
                  Capture & Process Document
                </button>
                <button
                  onClick={stopCamera}
                  className="px-4 py-3 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Turn Off Camera
                </button>
              </div>
            </div>
          )}

          {/* Upload Mode */}
          {scanMode === "upload" && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl p-12 text-center bg-white dark:bg-slate-900 cursor-pointer transition-all group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={handleFileUpload}
              />
              <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                Upload Paper Document Scan or Photo
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
                Drag and drop your file here, or click to browse. Supports Hindi documents, spreadsheets, invoices, receipts, and photos.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                  <Globe className="w-3 h-3" />
                  Auto-Detects Any Source Language
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3 h-3" />
                  100% Final Data in English Only
                </span>
              </div>
            </div>
          )}
        </>
      )}

      {/* Progress Stepper Animation when scanning */}
      {isScanning && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center shadow-lg">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-5 animate-spin">
            <RefreshCw className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Automated Document Pipeline in Progress...
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
            Extracting text across languages, cleaning values with Python, and validating against enterprise business rules.
          </p>

          <div className="max-w-xl mx-auto grid grid-cols-1 sm:grid-cols-4 gap-3 text-left">
            <div className={`p-3 rounded-xl border text-xs ${activeStep >= 1 ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 font-semibold" : "border-slate-200 dark:border-slate-800 text-slate-400"}`}>
              <div className="text-[10px] opacity-75">STEP 1</div>
              <div>Multilingual OCR</div>
            </div>
            <div className={`p-3 rounded-xl border text-xs ${activeStep >= 2 ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 font-semibold" : "border-slate-200 dark:border-slate-800 text-slate-400"}`}>
              <div className="text-[10px] opacity-75">STEP 2</div>
              <div>English Translation</div>
            </div>
            <div className={`p-3 rounded-xl border text-xs ${activeStep >= 3 ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 font-semibold" : "border-slate-200 dark:border-slate-800 text-slate-400"}`}>
              <div className="text-[10px] opacity-75">STEP 3</div>
              <div>Python Sanitizer</div>
            </div>
            <div className={`p-3 rounded-xl border text-xs ${activeStep >= 4 ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 font-semibold" : "border-slate-200 dark:border-slate-800 text-slate-400"}`}>
              <div className="text-[10px] opacity-75">STEP 4</div>
              <div>Missing Data Logic</div>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-xl p-4 text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span className="text-sm font-semibold">{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-xs font-semibold underline hover:no-underline text-emerald-700 dark:text-emerald-400"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Extracted Fields & Decision View */}
      {scannedResult && !isScanning && (
        <div className="space-y-6">
          {/* Header Summary Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300">
                    {scannedResult.document_type}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    Detected: {scannedResult.original_language} → {scannedResult.translated_to}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    100% English Output Guaranteed
                  </span>
                  {scannedResult.missing_count > 0 ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {scannedResult.missing_count} Missing Field(s)
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      All Fields Complete
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {scannedResult.title}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                  {scannedResult.raw_text_summary}
                </p>
              </div>

              {/* Quick Suggestion Button */}
              {editableFields.some((f) => f.is_empty && f.suggested_action) && (
                <button
                  id="apply-suggestions-button"
                  disabled={userRole === "VIEWER"}
                  onClick={applyAllSuggestions}
                  title={userRole === "VIEWER" ? "Viewer role: Read-only access" : "Apply all suggested defaults"}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Zap className="w-4 h-4" />
                  Apply All AI Smart Recommendations
                </button>
              )}
            </div>

            {/* Free Tier - Python Cleaning Engine Locked Banner */}
            {scannedResult.python_cleaning_locked && (
              <div
                id="scanner-python-cleaning-locked-banner"
                className="mt-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                      <span>Python Cleaning &amp; Imputation Engine Locked</span>
                      <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 font-black">
                        Free Tier
                      </span>
                    </div>
                    <div className="text-xs text-amber-800/90 dark:text-amber-300/90 mt-0.5">
                      The Free tier includes data entry only. Rule-based Python cleaning, automated imputation of missing fields, and advanced anomaly detection require the <strong>Plus</strong> tier or higher.
                    </div>
                  </div>
                </div>
                <button
                  id="unlock-python-cleaning-btn"
                  onClick={() => onOpenPricing("PLUS")}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs whitespace-nowrap self-start sm:self-auto"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Upgrade to Plus</span>
                </button>
              </div>
            )}

            {/* Viewer Role Banner */}
            {userRole === "VIEWER" && (
              <div className="mt-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-between text-xs text-blue-800 dark:text-blue-300">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>
                    <strong>Viewer Role Active</strong>: Read-only mode enabled. You can inspect OCR extractions, but cannot modify fields or commit changes to the SQL database.
                  </span>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wider bg-blue-200 dark:bg-blue-900 px-2 py-0.5 rounded font-bold">
                  Read-Only
                </span>
              </div>
            )}

            {/* Pipeline Alert if triggered */}
            {scannedResult.pipeline_alerts.length > 0 && (
              <div className="mt-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 space-y-2">
                <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 text-xs font-bold">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  Pipeline Validation Alerts ({scannedResult.pipeline_alerts.length})
                </div>
                {scannedResult.pipeline_alerts.map((alt, i) => (
                  <div key={i} className="text-xs text-rose-700 dark:text-rose-400 pl-6">
                    • <span className="font-semibold">{alt.rule_name}</span>: {alt.message}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Fields Review Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Extracted Document Fields ({editableFields.length})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  You can edit any cleaned value directly before committing to the SQL database.
                </p>
              </div>
              <span className="text-xs text-slate-400">
                Confidence Threshold: &gt; 70%
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                    <th className="py-3 px-4">Field Name (English)</th>
                    <th className="py-3 px-4">Original on Paper</th>
                    <th className="py-3 px-4">Cleaned &amp; Translated Value (100% English)</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Confidence</th>
                    <th className="py-3 px-4">Status & Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {editableFields.map((field, idx) => {
                    const isBlank = field.is_empty;
                    return (
                      <tr
                        key={idx}
                        className={`transition-colors ${
                          isBlank
                            ? "bg-amber-50/40 dark:bg-amber-950/20"
                            : "hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                        }`}
                      >
                        {/* Field Key */}
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                          {field.key}
                        </td>

                        {/* Original on Paper */}
                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono">
                          {field.original_value || (
                            <span className="italic text-slate-400">[Empty / Blank]</span>
                          )}
                        </td>

                        {/* Cleaned Value (Editable) */}
                        <td className="py-3 px-4">
                          <div className="relative flex items-center">
                            <input
                              type="text"
                              value={field.cleaned_value}
                              readOnly={userRole === "VIEWER"}
                              placeholder="Type value or leave for review..."
                              onChange={(e) => handleFieldChange(idx, e.target.value)}
                              className={`w-full text-xs font-medium rounded-lg px-2.5 py-1.5 border transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                userRole === "VIEWER"
                                  ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-not-allowed border-slate-200 dark:border-slate-700"
                                  : isBlank
                                  ? "border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 placeholder-amber-400"
                                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                              }`}
                            />
                            {userRole !== "VIEWER" && (
                              <Edit3 className="w-3 h-3 text-slate-400 absolute right-2 pointer-events-none" />
                            )}
                          </div>
                        </td>

                        {/* Data Type */}
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono uppercase text-[10px]">
                          {field.data_type}
                        </td>

                        {/* Confidence */}
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                              field.confidence >= 0.95
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                                : field.confidence >= 0.8
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                            }`}
                          >
                            {Math.round(field.confidence * 100)}%
                          </span>
                        </td>

                        {/* Status & Suggested Action */}
                        <td className="py-3 px-4">
                          {isBlank ? (
                            <div className="space-y-1">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                NEEDS REVIEW
                              </span>
                              {field.suggested_action && (
                                <div className="flex items-center gap-1.5 mt-1">
                                  <button
                                    disabled={userRole === "VIEWER"}
                                    onClick={() =>
                                      field.suggested_action?.value &&
                                      handleFieldChange(idx, field.suggested_action.value)
                                    }
                                    title={userRole === "VIEWER" ? "Viewer role: Read-only access" : field.suggested_action.rationale}
                                    className="text-[10px] font-semibold bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded hover:bg-amber-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    💡 Suggest: {field.suggested_action.value || "Review"}
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                              <Check className="w-3 h-3" /> Validated
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Python Cleaning Execution Log */}
          {scannedResult.cleaning_log && scannedResult.cleaning_log.length > 0 && (
            <div className="bg-slate-900 text-slate-300 rounded-xl p-4 font-mono text-xs space-y-1">
              <div className="text-slate-400 font-bold mb-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Python Data Processing Log Output:
              </div>
              {scannedResult.cleaning_log.map((log, i) => (
                <div key={i} className="text-slate-300">
                  &gt; {log}
                </div>
              ))}
            </div>
          )}

          {/* Action Execution Bar: Go Ahead vs Mark for Review */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
              {editableFields.some((f) => f.is_empty) ? (
                <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 inline" />
                  Notice: Document contains missing values. You can mark it for later human review or go ahead with insertion.
                </span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 inline" />
                  All extracted fields sanitized and ready for direct SQL database insertion.
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Mark for Review Button */}
              <button
                id="mark-for-review-button"
                disabled={committing || userRole === "VIEWER"}
                onClick={() => handleCommitOrReview("MARK_REVIEW")}
                title={userRole === "VIEWER" ? "Viewer role: Read-only access" : "Save and flag for review queue"}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Clock className="w-4 h-4" />
                {userRole === "VIEWER" ? "Review Mode (Viewer)" : "Mark for Review for Later"}
              </button>

              {/* Go Ahead / Commit Button */}
              <button
                id="go-ahead-commit-button"
                disabled={committing || userRole === "VIEWER"}
                onClick={() => handleCommitOrReview("COMMIT")}
                title={userRole === "VIEWER" ? "Viewer role: Cannot write to database" : "Insert cleaned record into SQL database"}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="w-4 h-4" />
                {userRole === "VIEWER"
                  ? "Read-Only (Viewer Role)"
                  : committing
                  ? "Inserting to SQL..."
                  : "Go Ahead & Insert to SQL"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
