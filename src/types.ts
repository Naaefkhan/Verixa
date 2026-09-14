export type UserRole = "ADMIN" | "REVIEWER" | "AUDITOR" | "VIEWER";

export type DocumentStatus = "COMMITTED" | "NEEDS_REVIEW" | "PIPELINE_ERROR" | "REJECTED";

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  lead_reviewer?: string;
  sla_hours?: number;
  doc_count?: number;
}

export interface SuggestedAction {
  type: "IMPUTE_DEFAULT" | "CALCULATE" | "FILL_CURRENT_DATE" | "INFER_DEPARTMENT" | "MANUAL_INPUT";
  value: string | null;
  rationale: string;
}

export interface DocumentField {
  id?: string;
  document_id?: string;
  key: string;
  original_key?: string;
  original_value: string;
  cleaned_value: string;
  data_type: "string" | "currency" | "date" | "number" | "id" | "text" | "boolean";
  confidence: number;
  is_empty: boolean;
  review_status: "VALID" | "NEEDS_REVIEW" | "OVERRIDDEN" | "ERROR" | "REJECTED";
  suggested_action?: SuggestedAction | null;
}

export interface PipelineAlert {
  id?: string;
  document_id?: string;
  field_key?: string;
  severity: "WARNING" | "ERROR" | "CRITICAL";
  rule_name: string;
  message: string;
  is_resolved?: boolean | number;
  resolution_notes?: string | null;
  created_at: string;
  resolved_at?: string | null;
  doc_number?: string;
  doc_title?: string;
}

export interface DocumentRecord {
  id: string;
  doc_number: string;
  title: string;
  department_id: string;
  department_name?: string;
  department_code?: string;
  original_language: string;
  translated_to: string;
  document_type: string;
  status: DocumentStatus;
  confidence_score: number;
  missing_count: number;
  raw_text?: string;
  image_preview?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  fields?: DocumentField[];
  alerts?: PipelineAlert[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user_email: string;
  role: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: string;
  ip_address: string;
  log_hash: string;
}

export interface SyncLog {
  id: string;
  timestamp: string;
  target_system: string;
  status: "SUCCESS" | "FAILED" | "RETRYING";
  records_count: number;
  latency_ms: number;
  details: string;
}

export type SubscriptionTier = 
  | "FREE" 
  | "STARTER" 
  | "PROFESSIONAL" 
  | "BUSINESS" 
  | "ENTERPRISE" 
  | "PLUS" 
  | "PRO" 
  | "ULTRA";

export const DEFAULT_MONTHLY_PAGE_LIMIT = 50;

export interface PlanPricing {
  monthly: number;
  annualMonthly: number;
}

export interface PlanDetails {
  id: SubscriptionTier;
  name: string;
  tagline: string;
  priceMonthly: string; // fallback string
  priceAnnual: string; // fallback string
  pageLimitMonthly: number; // 50 for free, 1000 for starter, 5000 for pro, 20000 for business, -1 for enterprise
  scanLimit: number; // alias for pageLimitMonthly
  isCurrentActive?: boolean;
  isPlanned?: boolean;
  hasPythonCleaning: boolean;
  hasSqlDatabase: boolean;
  hasPowerBiDashboard: boolean;
  hasComplianceAudit: boolean;
  hasPriorityOcr: boolean;
  hasBatchExport: boolean;
  color: string;
  badge?: string;
  popular?: boolean;
  features: string[];
}

export const PLAN_CONFIGS: Record<SubscriptionTier, PlanDetails> = {
  FREE: {
    id: "FREE",
    name: "Free Public Tier",
    tagline: "Currently active: 100% free with full end-to-end pipeline access",
    priceMonthly: "₹0",
    priceAnnual: "₹0",
    pageLimitMonthly: 50,
    scanLimit: 50,
    isCurrentActive: true,
    isPlanned: false,
    hasPythonCleaning: true,
    hasSqlDatabase: true,
    hasPowerBiDashboard: true,
    hasComplianceAudit: true,
    hasPriorityOcr: true,
    hasBatchExport: true,
    color: "emerald",
    badge: "Active Free Plan",
    features: [
      "50 pages processed per month",
      "Full multilingual OCR & script detection",
      "Automated Python 3.x cleaning pipeline",
      "100% English translation & Devanagari conversion",
      "Structured ACID SQL database persistence",
      "Interactive analytics & business intelligence",
      "CSV, JSON & Excel data exports",
    ],
  },
  STARTER: {
    id: "STARTER",
    name: "Starter",
    tagline: "For growing teams and consistent departmental intake",
    priceMonthly: "₹299",
    priceAnnual: "₹249/mo",
    pageLimitMonthly: 1000,
    scanLimit: 1000,
    isCurrentActive: false,
    isPlanned: true,
    hasPythonCleaning: true,
    hasSqlDatabase: true,
    hasPowerBiDashboard: true,
    hasComplianceAudit: true,
    hasPriorityOcr: true,
    hasBatchExport: true,
    color: "blue",
    badge: "Planned Tier",
    features: [
      "1,000 pages processed per month",
      "Automated Python cleaning & imputation",
      "100% English standardization",
      "Interactive analytics dashboard",
      "Structured SQL data storage & export",
      "Email & community support",
    ],
  },
  PROFESSIONAL: {
    id: "PROFESSIONAL",
    name: "Professional",
    tagline: "For organizations processing high-volume business documents",
    priceMonthly: "₹999",
    priceAnnual: "₹799/mo",
    pageLimitMonthly: 5000,
    scanLimit: 5000,
    isCurrentActive: false,
    isPlanned: true,
    popular: true,
    badge: "Most Popular (Planned)",
    hasPythonCleaning: true,
    hasSqlDatabase: true,
    hasPowerBiDashboard: true,
    hasComplianceAudit: true,
    hasPriorityOcr: true,
    hasBatchExport: true,
    color: "indigo",
    features: [
      "5,000 pages processed per month",
      "Everything in Starter included",
      "Priority OCR & high-concurrency pipeline",
      "Direct SQL explorer & custom queries",
      "Advanced business intelligence & trends",
      "Priority SLA & queue precedence",
    ],
  },
  BUSINESS: {
    id: "BUSINESS",
    name: "Business",
    tagline: "High-scale enterprise workflow with advanced governance",
    priceMonthly: "₹2,999",
    priceAnnual: "₹2,499/mo",
    pageLimitMonthly: 20000,
    scanLimit: 20000,
    isCurrentActive: false,
    isPlanned: true,
    badge: "Enterprise Scale (Planned)",
    hasPythonCleaning: true,
    hasSqlDatabase: true,
    hasPowerBiDashboard: true,
    hasComplianceAudit: true,
    hasPriorityOcr: true,
    hasBatchExport: true,
    color: "purple",
    features: [
      "20,000 pages processed per month",
      "Multi-department data routing & custom rules",
      "Compliance audit ledger with SHA-256 logs",
      "SOC2 Type II & GDPR Art. 30 reporting",
      "Dedicated account manager & SLA",
    ],
  },
  ENTERPRISE: {
    id: "ENTERPRISE",
    name: "Enterprise",
    tagline: "Custom volume, on-premise or VPC deployment, tailored models",
    priceMonthly: "Custom",
    priceAnnual: "Custom",
    pageLimitMonthly: -1,
    scanLimit: -1,
    isCurrentActive: false,
    isPlanned: true,
    badge: "Contact Sales (Planned)",
    hasPythonCleaning: true,
    hasSqlDatabase: true,
    hasPowerBiDashboard: true,
    hasComplianceAudit: true,
    hasPriorityOcr: true,
    hasBatchExport: true,
    color: "slate",
    features: [
      "Custom monthly page volume",
      "Dedicated cloud / VPC / on-premise gateway",
      "Custom OCR fine-tuning for proprietary sheets",
      "Single Sign-On (SSO) & SAML integration",
      "24/7 dedicated enterprise engineer",
    ],
  },
  // Backward compatibility aliases
  PLUS: {
    id: "PLUS",
    name: "Starter (Plus)",
    tagline: "Planned tier: 1,000 pages per month",
    priceMonthly: "₹299",
    priceAnnual: "₹249/mo",
    pageLimitMonthly: 1000,
    scanLimit: 1000,
    isPlanned: true,
    hasPythonCleaning: true,
    hasSqlDatabase: true,
    hasPowerBiDashboard: true,
    hasComplianceAudit: true,
    hasPriorityOcr: true,
    hasBatchExport: true,
    color: "blue",
    features: ["1,000 pages/mo", "Python cleaning", "Analytics dashboard"],
  },
  PRO: {
    id: "PRO",
    name: "Professional",
    tagline: "Planned tier: 5,000 pages per month",
    priceMonthly: "₹999",
    priceAnnual: "₹799/mo",
    pageLimitMonthly: 5000,
    scanLimit: 5000,
    isPlanned: true,
    popular: true,
    badge: "Most Popular",
    hasPythonCleaning: true,
    hasSqlDatabase: true,
    hasPowerBiDashboard: true,
    hasComplianceAudit: true,
    hasPriorityOcr: true,
    hasBatchExport: true,
    color: "indigo",
    features: ["5,000 pages/mo", "Priority OCR", "SQL queries", "Analytics"],
  },
  ULTRA: {
    id: "ULTRA",
    name: "Business",
    tagline: "Planned tier: 20,000 pages per month",
    priceMonthly: "₹2,999",
    priceAnnual: "₹2,499/mo",
    pageLimitMonthly: 20000,
    scanLimit: 20000,
    isPlanned: true,
    badge: "Enterprise Scale",
    hasPythonCleaning: true,
    hasSqlDatabase: true,
    hasPowerBiDashboard: true,
    hasComplianceAudit: true,
    hasPriorityOcr: true,
    hasBatchExport: true,
    color: "purple",
    features: ["20,000 pages/mo", "Full compliance", "Custom rules"],
  },
};

export interface DashboardMetrics {
  total_scans: number;
  committed: number;
  needs_review: number;
  pipeline_errors: number;
  avg_confidence: number;
  total_fields: number;
  empty_fields: number;
  missing_rate: number;
  department_distribution: Array<{ id: string; name: string; code: string; doc_count: number }>;
  language_distribution: Array<{ original_language: string; count: number }>;
  active_alerts: PipelineAlert[];
  recent_syncs: SyncLog[];
  audit_count: number;
  compliance_score: number;
}
