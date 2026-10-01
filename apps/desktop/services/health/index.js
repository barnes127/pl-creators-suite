const {
  HealthService,
  normalizeSource,
  normalizeFinding,
} = require("./service");
const {createDiagnosticsHealthCollector} = require("./diagnostics");
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
  HEALTH_SEVERITIES,
  HEALTH_STATUSES,
  HEALTH_CATEGORIES,
  HEALTH_SEVERITY_RANK,
  isHealthSeverity,
  isHealthStatus,
  isHealthCategory,
  getHighestHealthSeverity,
};
