const TASK_STATUSES = new Set([
  "queued",
  "running",
  "cancelling",
  "cancelled",
  "completed",
  "failed",
  "interrupted",
]);

function summarizeTask(record, source) {
  if (
    !record ||
    typeof record !== "object" ||
    typeof record.id !== "string" ||
    !record.id ||
    !TASK_STATUSES.has(record.status)
  ) {
    return null;
  }

  const summary = {
    id: record.id,
    status: record.status,
    source,
  };

  if (typeof record.kind === "string") summary.kind = record.kind;
  if (typeof record.title === "string") summary.title = record.title;
  if (Number.isFinite(record.progress?.percent)) {
    summary.progressPercent = record.progress.percent;
  }
  for (const field of ["createdAt", "startedAt", "finishedAt"]) {
    if (typeof record[field] === "string") summary[field] = record[field];
  }
  if (typeof record.failure?.code === "string") {
    summary.failureCode = record.failure.code;
  }
  if (Array.isArray(record.warnings)) {
    summary.warningCount = record.warnings.length;
  }

  return summary;
}

async function listUnifiedTaskStates(taskManager, diagnostics) {
  const byId = new Map();
  for (const record of taskManager.list()) {
    const summary = summarizeTask(record, "live");
    if (summary) byId.set(summary.id, summary);
  }

  try {
    const history = await diagnostics.getLatestJobs();
    for (const record of history) {
      const summary = summarizeTask(record, "history");
      if (summary && !byId.has(summary.id)) {
        byId.set(summary.id, summary);
      }
    }
    return {tasks: Array.from(byId.values()), historyAvailable: true};
  } catch (_error) {
    return {tasks: Array.from(byId.values()), historyAvailable: false};
  }
}

module.exports = {listUnifiedTaskStates};
