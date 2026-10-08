export type HealthSeverity =
  | "healthy"
  | "info"
  | "warning"
  | "error"
  | "critical"
  | "unavailable"
  | "unknown";
export type HealthStatus =
  | "healthy"
  | "degraded"
  | "failed"
  | "unavailable"
  | "unknown"
  | "disabled";
export type HealthCategory =
  | "system"
  | "diagnostics"
  | "project"
  | "recovery"
  | "engine"
  | "extension"
  | "index"
  | "backup"
  | "ai"
  | "sync"
  | "task"
  | "cache";
export interface HealthSuggestedAction {
  id: string;
  label: string;
  kind: string;
  [key: string]: unknown;
}
export interface HealthResourceRef {
  type?: string;
  id?: string;
  [key: string]: unknown;
}
export interface HealthFinding {
  id: string;
  sourceId: string;
  severity: HealthSeverity;
  status: HealthStatus;
  title: string;
  summary: string;
  owner: string;
  observedAt: string;
  details: Readonly<Record<string, unknown>>;
  suggestedActions: readonly HealthSuggestedAction[];
  logRefs: readonly unknown[];
  resourceRefs: readonly HealthResourceRef[];
}
export interface HealthSource {
  id: string;
  displayName: string;
  category: HealthCategory;
  owner: string;
  status: HealthStatus;
  severity: HealthSeverity;
  summary: string;
  observedAt: string;
  details: Readonly<Record<string, unknown>>;
}
export type HealthSeverityCounts = Partial<Record<HealthSeverity, number>>;
export interface HealthSnapshotSummary {
  collectorCount: number;
  sourceCount: number;
  findingCount: number;
  sourceCounts: HealthSeverityCounts;
  findingCounts: HealthSeverityCounts;
}
export interface HealthSnapshot {
  generatedAt: string;
  overallSeverity: HealthSeverity;
  summary: HealthSnapshotSummary;
  sources: readonly HealthSource[];
  findings: readonly HealthFinding[];
}
