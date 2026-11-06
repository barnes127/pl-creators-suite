const TASK_STATUSES = new Set([
  "queued",
  "running",
  "cancelling",
  "cancelled",
  "completed",
  "failed",
  "interrupted",
]);

const CANCELLABLE_STATUSES = new Set([
  "queued",
  "running",
]);

const MAX_OVERVIEW_ROWS = 250;
const MAX_TASK_ID_LENGTH = 200;

function boundedString(value, maximumLength) {
  return typeof value === "string" && value
    ? value.slice(0, maximumLength)
    : undefined;
}

function summarizeTask(record, source) {
  if (
    !record ||
    typeof record !== "object" ||
    typeof record.id !== "string" ||
    !record.id ||
    record.id.length > MAX_TASK_ID_LENGTH ||
    !TASK_STATUSES.has(record.status)
  ) {
    return null;
  }

  const summary = {
    id: record.id,
    status: record.status,
    source,
  };

  const kind = boundedString(record.kind, 80);
  const title = boundedString(record.title, 240);
  if (kind) summary.kind = kind;
  if (title) summary.title = title;
  if (Number.isFinite(record.progress?.percent)) {
    summary.progressPercent = record.progress.percent;
  }
  for (const field of ["createdAt", "startedAt", "finishedAt"]) {
    const value = boundedString(record[field], 80);
    if (value) summary[field] = value;
  }
  const failureCode = boundedString(record.failure?.code, 120);
  if (failureCode) {
    summary.failureCode = failureCode;
  }
  if (Array.isArray(record.warnings)) {
    summary.warningCount = record.warnings.length;
  }

  return summary;
}

function supportsLiveCancellation(taskManager, record) {
  if (
    !CANCELLABLE_STATUSES.has(record.status) ||
    !(taskManager.tasks instanceof Map)
  ) {
    return false;
  }

  const ownedTask = taskManager.tasks.get(record.id);

  return (
    ownedTask === record ||
    ownedTask?.id === record.id
  ) && ownedTask?.supportsCancellation === true;
}

function boundedRows(byId) {
  return Array.from(byId.values())
    .slice(0, MAX_OVERVIEW_ROWS);
}

async function listUnifiedTaskStates(taskManager, diagnostics) {
  const byId = new Map();
  for (const record of taskManager.list()) {
    const summary = summarizeTask(record, "live");
    if (summary) {
      if (supportsLiveCancellation(taskManager, record)) {
        summary.supportsCancellation = true;
      }
      byId.set(summary.id, summary);
    }
  }

  try {
    const history = await diagnostics.getLatestJobs();
    for (const record of history) {
      const summary = summarizeTask(record, "history");
      if (summary && !byId.has(summary.id)) {
        byId.set(summary.id, summary);
      }
    }
    return {tasks: boundedRows(byId), historyAvailable: true};
  } catch (_error) {
    return {tasks: boundedRows(byId), historyAvailable: false};
  }
}

module.exports = {listUnifiedTaskStates};
