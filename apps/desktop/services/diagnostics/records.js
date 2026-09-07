const {
  isDiagnosticLevel,
  isProblemSeverity,
} = require("./types");

function nowIso() {
  return new Date().toISOString();
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function createLogRecord(input = {}) {
  const level =
    input.level || "info";

  if (!isDiagnosticLevel(level)) {
    throw new Error(
      `Invalid diagnostic level: ${level}`,
    );
  }

  return {
    id:
      input.id ||
      createId("log"),

    timestamp:
      input.timestamp ||
      nowIso(),

    level,

    subsystem:
      input.subsystem ||
      "unknown",

    event:
      input.event ||
      "log",

    message:
      input.message ??
      null,

    correlationId:
      input.correlationId ??
      null,

    taskId:
      input.taskId ??
      null,

    requestId:
      input.requestId ??
      null,

    details:
      input.details ??
      null,
  };
}

function createProblemRecord(input = {}) {
  const severity =
    input.severity ||
    "error";

  if (!isProblemSeverity(severity)) {
    throw new Error(
      `Invalid problem severity: ${severity}`,
    );
  }

  return {
    id:
      input.id ||
      createId("problem"),

    timestamp:
      input.timestamp ||
      nowIso(),

    severity,

    code:
      input.code ||
      "UNKNOWN_PROBLEM",

    message:
      input.message ||
      "Unknown problem",

    subsystem:
      input.subsystem ||
      "unknown",

    source:
      input.source ??
      null,

    taskId:
      input.taskId ??
      null,

    correlationId:
      input.correlationId ??
      null,

    resolved:
      input.resolved === true,

    details:
      input.details ??
      null,
  };
}

function createCrashRecord(input = {}) {
  return {
    id:
      input.id ||
      createId("crash"),

    timestamp:
      input.timestamp ||
      nowIso(),

    subsystem:
      input.subsystem ||
      "desktop",

    name:
      input.name ||
      "Error",

    message:
      input.message ||
      "Unknown crash",

    stack:
      input.stack ??
      null,

    fatal:
      input.fatal === true,

    correlationId:
      input.correlationId ??
      null,

    taskId:
      input.taskId ??
      null,

    details:
      input.details ??
      null,
  };
}

function createResourceRecord(input = {}) {
  return {
    id:
      input.id ||
      createId("resource"),

    timestamp:
      input.timestamp ||
      nowIso(),

    subsystem:
      input.subsystem ||
      "desktop",

    taskId:
      input.taskId ??
      null,

    cpuPercent:
      input.cpuPercent ??
      null,

    memoryBytes:
      input.memoryBytes ??
      null,

    diskReadBytes:
      input.diskReadBytes ??
      null,

    diskWriteBytes:
      input.diskWriteBytes ??
      null,

    gpuPercent:
      input.gpuPercent ??
      null,

    elapsedMs:
      input.elapsedMs ??
      null,

    details:
      input.details ??
      null,
  };
}

function createJobRecord(task = {}) {
  return {
    id: task.id,
    handlerId:
      task.handlerId ??
      null,

    kind:
      task.kind ??
      "other",

    title:
      task.title ??
      "Task",

    status:
      task.status ??
      "queued",

    progress:
      task.progress
        ? { ...task.progress }
        : null,

    warnings:
      Array.isArray(task.warnings)
        ? [...task.warnings]
        : [],

    failure:
      task.failure
        ? { ...task.failure }
        : null,

    resourceUsage:
      task.resourceUsage
        ? { ...task.resourceUsage }
        : null,

    createdAt:
      task.createdAt ??
      null,

    startedAt:
      task.startedAt ??
      null,

    finishedAt:
      task.finishedAt ??
      null,

    metadata:
      task.metadata ??
      null,
  };
}

module.exports = {
  createLogRecord,
  createProblemRecord,
  createCrashRecord,
  createResourceRecord,
  createJobRecord,
};
