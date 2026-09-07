const DIAGNOSTIC_LEVELS = Object.freeze([
  "debug",
  "info",
  "warn",
  "error",
  "fatal",
]);

const PROBLEM_SEVERITIES = Object.freeze([
  "info",
  "warning",
  "error",
]);

const JOB_TERMINAL_STATUSES = Object.freeze([
  "cancelled",
  "completed",
  "failed",
  "interrupted",
]);

function isDiagnosticLevel(value) {
  return DIAGNOSTIC_LEVELS.includes(value);
}

function isProblemSeverity(value) {
  return PROBLEM_SEVERITIES.includes(value);
}

function isTerminalJobStatus(value) {
  return JOB_TERMINAL_STATUSES.includes(value);
}

module.exports = {
  DIAGNOSTIC_LEVELS,
  PROBLEM_SEVERITIES,
  JOB_TERMINAL_STATUSES,
  isDiagnosticLevel,
  isProblemSeverity,
  isTerminalJobStatus,
};
