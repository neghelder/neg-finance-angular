export type ReportAssetType = 'FII' | 'FIAGRO' | 'STOCK';
export type MarketStatus = 'CHEAP' | 'NOT_CHEAP' | 'UNAVAILABLE';
export type PortfolioStatus = 'MY_CHEAP' | 'MY_EXPENSIVE' | 'NOT_HELD';
export type FinalLabel = 'COMPRAR' | 'NEUTRO' | 'EVITAR' | 'INDETERMINADO';
export type QualitativeStatus = 'CURRENT' | 'STALE' | 'MISSING' | 'INVALID' | 'FAILED' | string;
export type FreshnessStatus = 'FRESH' | 'STALE' | 'MISSING' | 'CONFLICT' | string;

/** Read-only API projection returned by /analisys/reports and its history route. */
export interface ScheduledReportSnapshot {
  id: string;
  run_id: string;
  asset_type: ReportAssetType;
  ticker: string;
  created_at: string;
  final_label: FinalLabel;
  market: ReportMarket;
  portfolio_status: PortfolioStatus;
  qualitative: ReportQualitative;
  source: ReportSource | null;
  freshness: ReportFreshness;
  conflicts: ReportConflicts;
  partial_failure: ReportPartialFailure;
  details: ReportDetails;
}

export interface ReportMarket {
  status: MarketStatus;
  grade: number | null;
  rank: number | null;
  criterion_results: JsonValue;
  cohort_size: number;
  criteria_hash: string;
  snapshot_at: string;
}

export interface ReportQualitative {
  status: QualitativeStatus;
  analysis_id: string | null;
  analysed_at: string | null;
  quality: number | null;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH' | string | null;
  critical_risk: boolean | null;
  evidence: ReportEvidence[];
  details: JsonValue | null;
}

export interface ReportEvidence {
  page: number | null;
  [key: string]: JsonValue | undefined;
}

export interface ReportSource {
  document_id: string | null;
  url: string | null;
  published_at: string | null;
  fetched_at: string | null;
  pdf_sha256: string | null;
  revision: string | null;
  metadata: JsonValue | null;
}

export interface ReportFreshness {
  status: FreshnessStatus;
  qualitative_status: QualitativeStatus;
  source_revision_matches_analysis: boolean | null;
  analysis_created_at: string | null;
  source_published_at: string | null;
}

export interface ReportConflicts {
  has_conflict: boolean;
  qualitative_variants_for_revision: number;
  source_revision_count: number;
}

export interface ReportPartialFailure {
  is_partial: boolean;
  job_status: string | null;
  attempts: number;
}

export interface ReportDetails {
  asset_type: ReportAssetType;
  qualitative: JsonValue | null;
  cvm: JsonValue | null;
}

export interface AutomationRun {
  run_id: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  requested?: ReportAutomationRunRequest;
  jobs?: Record<string, number>;
}

export interface ReportAutomationStatus {
  runs: AutomationRun[];
  manual_runs?: ReportAutomationRun[];
  jobs: Record<string, number>;
  config?: Record<string, JsonValue>;
  runtime?: ReportAutomationRuntime;
}

/** Asset catalogue returned by the manual-report automation endpoint. */
export interface ReportAutomationAssets {
  asset_type: ReportAssetType;
  tickers: string[];
  max_jobs_per_run: number;
}

export interface ReportAutomationRunRequest {
  asset_type: ReportAssetType;
  tickers: string[];
  force_reprocess: boolean;
}

export interface ReportAutomationRun extends AutomationRun {
  requested: ReportAutomationRunRequest;
  items?: ReportAutomationRunItem[];
  jobs: Record<string, number>;
  diagnostics: ReportAutomationDiagnostic[];
  errors: ReportAutomationRunError[];
  reports?: ScheduledReportSnapshot[];
}

export interface ReportAutomationRunItem {
  ticker: string;
  status: string;
  job_id: string | null;
  diagnostics: ReportAutomationDiagnostic[];
  started_at: string | null;
  completed_at: string | null;
}

export interface ReportAutomationDiagnostic {
  asset_type: ReportAssetType;
  ticker?: string | null;
  reason?: string | null;
}

export interface ReportAutomationRunError {
  ticker: string;
  attempts: number;
  status: string;
  code: 'PROCESSING_FAILED' | string;
}

export interface ReportAutomationRuntime {
  codex_available: boolean;
  auth_available: boolean;
}

export type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];

export interface JsonObject {
  [key: string]: JsonValue;
}
