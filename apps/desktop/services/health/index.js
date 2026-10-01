const {HealthService, normalizeSource, normalizeFinding} = require("./service");
const {createDiagnosticsHealthCollector} = require("./diagnostics");
const {
  createSystemHealthCollector,
  getCpuSummary,
  getMemorySummary,
  getDiskSummary,
  getQueueSummary,
  getWorkerSummary,
  getGpuSummary,
  getCacheSummary,
} = require("./system");
const {
  HEALTH_SEVERITIES,
  HEALTH_STATUSES,
  HEALTH_CATEGORIES,
  HEALTH_SEVERITY_RANK,
  isHealthSeverity,
  isHealthStatus,
  isHealthCategory,
  getHighestHealthSeverity,
} = require("./types");

module.exports = {
  HealthService,
  normalizeSource,
  normalizeFinding,
  createDiagnosticsHealthCollector,
  createSystemHealthCollector,
  getCpuSummary,
  getMemorySummary,
  getDiskSummary,
  getQueueSummary,
  getWorkerSummary,
  getGpuSummary,
  getCacheSummary,
  HEALTH_SEVERITIES,
  HEALTH_STATUSES,
  HEALTH_CATEGORIES,
  HEALTH_SEVERITY_RANK,
  isHealthSeverity,
  isHealthStatus,
  isHealthCategory,
  getHighestHealthSeverity,
};
