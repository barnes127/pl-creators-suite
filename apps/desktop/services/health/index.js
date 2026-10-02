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
const {createPluginHealthCollector} = require("./plugins");
const {createLocalAiHealthCollector} = require("./ai");
const {createRecoveryHealthCollector, createIndexHealthCollector} = require("./project");
const {createSyncHealthCollector, createEngineHealthCollector} = require("./platform");

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
  createPluginHealthCollector,
  createLocalAiHealthCollector,
  createRecoveryHealthCollector,
  createIndexHealthCollector,
  createSyncHealthCollector,
  createEngineHealthCollector,
};
