const { desktopTaskManager } = require("../../tasks");


function toLegacyIndexStatus(status) {
  if (status === "completed") {
    return "complete";
  }
  return status;
}

function toLegacyIndexProgress(progress = {}) {
  return {
    phase: progress.phase,
    completed: progress.completed ?? 0,
    total: progress.total ?? 0,
    relativePath:
      progress.currentItem ?? null,
  };
}

class ProjectIndexJobManager {
  constructor(taskManager = desktopTaskManager) {
    this.taskManager = taskManager;
    this.jobIds = new Set();
  }

  start(params = {}) {
    const submitted =
      this.taskManager.submit(
        {
          handlerId: "project.index",
          kind: "indexing",
          title: "Index project",
          description: "Scan and incrementally index project content.",
          input: {
            projectRoot: params.projectRoot,
            ignore: params.ignore,
          },
          supportsCancellation: true,
          metadata: { projectRoot: params.projectRoot },
        },
        {
          onProgress(progress) {
            params.onProgress?.(toLegacyIndexProgress(progress));
          },
        },
      );
    this.jobIds.add(submitted.taskId);
    return {jobId: submitted.taskId, promise: submitted.promise};
  }


  cancel(jobId) {
    if (!this.jobIds.has(jobId)) {
      return false;
    }
    const before = this.taskManager.get(jobId);

    if (!before ||
      (before.status !== "queued" &&
        before.status !== "running" &&
        before.status !== "cancelling")
    ) {
      return false;
    }
    this.taskManager.cancel(jobId);
    return true;
  }



  get(jobId) {
    if (!this.jobIds.has(jobId)) {
      return undefined;
    }

    const task = this.taskManager.get(jobId);

    if (!task) {
      return undefined;
    }

    return {
      id: task.id,
      projectRoot: task.metadata?.projectRoot ?? task.input?.projectRoot,
      status: toLegacyIndexStatus(task.status),
      progress: toLegacyIndexProgress(task.progress),
      startedAt: task.startedAt ?? null,
      finishedAt: task.finishedAt ?? null,
      result: task.result ?? null,
      error: task.failure ? {
            name: task.failure.code || "TaskError",
            message: task.failure.message,
          }
        : null,
    };
  }


  list() {
    return Array.from(
        this.jobIds,
      (jobId) => this.get(jobId),
    ).filter(Boolean);
  }
}


module.exports = {
  ProjectIndexJobManager,
};
