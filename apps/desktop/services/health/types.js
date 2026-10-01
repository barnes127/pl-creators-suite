const HEALTH_SEVERITIES =
  Object.freeze([
    "healthy",
    "info",
    "warning",
    "error",
    "critical",
    "unavailable",
    "unknown",
  ]);

const HEALTH_STATUSES =
  Object.freeze([
    "healthy",
    "degraded",
    "failed",
    "unavailable",
    "unknown",
    "disabled",
  ]);

const HEALTH_CATEGORIES =
  Object.freeze([
    "system",
    "diagnostics",
    "project",
    "recovery",
    "engine",
    "extension",
    "index",
    "backup",
    "ai",
    "sync",
    "task",
    "cache",
  ]);

const HEALTH_SEVERITY_RANK =
  Object.freeze({
    healthy: 0,
    info: 1,
    unknown: 2,
    unavailable: 3,
    warning: 4,
    error: 5,
    critical: 6,
  });

function isHealthSeverity(value) {
  return HEALTH_SEVERITIES
    .includes(value);
}

function isHealthStatus(value) {
  return HEALTH_STATUSES
    .includes(value);
}

function isHealthCategory(
  value,
) {
  return HEALTH_CATEGORIES
    .includes(value);
}

function getHighestHealthSeverity(
  values = [],
) {
  let highest =
    "healthy";

  for (const value of values) {
    if (
      !isHealthSeverity(value)
    ) {
      continue;
    }

    if (
      HEALTH_SEVERITY_RANK[value] >
      HEALTH_SEVERITY_RANK[highest]
    ) {
      highest = value;
    }
  }

  return highest;
}

module.exports = {
  HEALTH_SEVERITIES,
  HEALTH_STATUSES,
  HEALTH_CATEGORIES,
  HEALTH_SEVERITY_RANK,
  isHealthSeverity,
  isHealthStatus,
  isHealthCategory,
  getHighestHealthSeverity,
};
