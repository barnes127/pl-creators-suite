class TaskHandlerNotFoundError extends Error {
  constructor(handlerId) {
    super(`No task handler registered: ${handlerId}`);
    this.name = "TaskHandlerNotFoundError";
    this.code = "TASK_HANDLER_NOT_FOUND";
    this.handlerId = handlerId;
  }
}

function nowIso() {
  return new Date().toISOString();
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function normalizeProgress(progress = {}) {
  let completed = progress.completed ?? null;
  let total = progress.total ?? null;

  if (completed !== null) {
    completed = Math.max(0, completed);
  }

  if (total !== null) {
    total = Math.max(0, total);
  }

  if (completed !== null && total !== null) {
    completed = Math.min(completed, total);
  }

  let percent = progress.percent ?? null;

  if (
    percent === null &&
    completed !== null &&
    total !== null &&
    total > 0
  ) {
    percent = (completed / total) * 100;
  }

  if (percent !== null) {
    percent = clamp(percent, 0, 100);
  }

  return {
    phase: progress.phase ?? "pending",
    completed,
    total,
    percent,
    message: progress.message ?? "",
    currentItem: progress.currentItem ?? null,
  };
}

function createTaskSnapshot(task) {
  return {
    id: task.id,
    handlerId: task.handlerId,
    kind: task.kind,
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status,
    input: task.input,
    result: task.result,
    progress: { ...task.progress },
    warnings: [...task.warnings],
    failure: task.failure
      ? { ...task.failure }
      : undefined,
    resourceUsage: task.resourceUsage
      ? { ...task.resourceUsage }
      : undefined,
    createdAt: task.createdAt,
    startedAt: task.startedAt,
    finishedAt: task.finishedAt,
    metadata: task.metadata,
  };
}

function isCancellationError(error, signal) {
  return (
    signal.aborted ||
    error?.name === "AbortError" ||
    error?.name === "IndexCancellationError"
  );
}

class TaskManager {
  constructor(options = {}) {
    this.handlers = new Map();
    this.tasks = new Map();
    this.sequence = 0;
    this.onTaskChanged =
      typeof options.onTaskChanged === "function"
        ? options.onTaskChanged
        : () => {};
  }

  notifyTaskChanged(task) {
    this.onTaskChanged(
      createTaskSnapshot(task),
    );
  }

  registerHandler(handlerId, handler) {
    const id = String(handlerId || "").trim();

    if (!id) {
      throw new Error("Task handler id is required");
    }

    if (typeof handler !== "function") {
      throw new Error(`Task handler must be a function: ${id}`);
    }

    if (this.handlers.has(id)) {
      throw new Error(`Task handler already registered: ${id}`);
    }

    this.handlers.set(id, handler);
  }

  unregisterHandler(handlerId) {
    return this.handlers.delete(handlerId);
  }

  hasHandler(handlerId) {
    return this.handlers.has(handlerId);
  }

  submit(definition = {}, options = {}) {
    this.sequence += 1;

    const taskId =
      definition.id ||
      `task-${Date.now()}-${this.sequence}`;

    if (this.tasks.has(taskId)) {
      throw new Error(`Task id already exists: ${taskId}`);
    }

    const handlerId = String(
      definition.handlerId ||
      definition.kind ||
      "",
    ).trim();

    const handler = this.handlers.get(handlerId);

    if (!handler) {
      throw new TaskHandlerNotFoundError(handlerId);
    }

    const controller = new AbortController();

    const task = {
      id: taskId,
      handlerId,
      kind: definition.kind ?? "other",
      title: definition.title ?? handlerId,
      description: definition.description,
      priority: definition.priority ?? "normal",
      status: "queued",
      input: definition.input,
      result: undefined,
      progress: normalizeProgress(),
      warnings: [],
      failure: undefined,
      resourceUsage: undefined,
      createdAt: nowIso(),
      startedAt: undefined,
      finishedAt: undefined,
      metadata: definition.metadata,
      supportsCancellation:
        definition.supportsCancellation !== false,
      controller,
      promise: null,
    };

    this.tasks.set(taskId, task);

    this.notifyTaskChanged(task);

    task.promise = Promise.resolve()
      .then(async () => {
        if (controller.signal.aborted) {
          task.status = "cancelled";
          task.finishedAt = nowIso();
          return undefined;
        }

        task.status = "running";
        task.startedAt = nowIso();
        this.notifyTaskChanged(task);

        const context = {
          signal: controller.signal,

          reportProgress: (progress) => {
            task.progress = normalizeProgress({
              ...task.progress,
              ...progress,
            });

            this.notifyTaskChanged(task);

            options.onProgress?.(
              { ...task.progress },
              createTaskSnapshot(task),
            );
          },

          reportWarning: (warning) => {
            task.warnings.push({
              ...warning,
            });

            this.notifyTaskChanged(task);

            options.onWarning?.(
              { ...warning },
              createTaskSnapshot(task),
            );
          },

          reportResourceUsage: (usage) => {
            task.resourceUsage = {
              ...task.resourceUsage,
              ...usage,
            };

            this.notifyTaskChanged(task);

            options.onResourceUsage?.(
              { ...task.resourceUsage },
              createTaskSnapshot(task),
            );
          },
        };

        try {
          const result = await handler(
            task.input,
            context,
          );

          if (controller.signal.aborted) {
            task.status = "cancelled";
            task.finishedAt = nowIso();
            return undefined;
          }

          task.result = result;
          task.status = "completed";
          task.finishedAt = nowIso();
          this.notifyTaskChanged(task);

          return result;
        } catch (error) {
          if (
            isCancellationError(
              error,
              controller.signal,
            )
          ) {
            task.status = "cancelled";
          } else {
            task.status = "failed";

            task.failure = {
              code: error?.code || "TASK_FAILED",
              message:
                error?.message ||
                "Task execution failed",
              details: error?.details,
              retryable:
                error?.retryable === true,
            };
          }

          task.finishedAt = nowIso();

          this.notifyTaskChanged(task);

          if (task.status === "cancelled") {
            return undefined;
          }

          throw error;
        }
      });

    return {
      taskId,
      task: createTaskSnapshot(task),
      promise: task.promise,
    };
  }

  async start(definition) {
    const submitted = this.submit(definition);
    return submitted.task;
  }

  cancel(taskId) {
    const task = this.tasks.get(taskId);

    if (!task) {
      return null;
    }

    if (
      task.status === "completed" ||
      task.status === "failed" ||
      task.status === "cancelled" ||
      task.status === "interrupted"
    ) {
      return createTaskSnapshot(task);
    }

    if (!task.supportsCancellation) {
      return createTaskSnapshot(task);
    }

    if (task.status === "queued") {
      task.status = "cancelled";
      task.finishedAt = nowIso();
    } else {
      task.status = "cancelling";
    }

    task.controller.abort();

    this.notifyTaskChanged(task);

    return createTaskSnapshot(task);
  }

  get(taskId) {
    const task = this.tasks.get(taskId);

    return task
      ? createTaskSnapshot(task)
      : null;
  }

  list() {
    return Array.from(
      this.tasks.values(),
      createTaskSnapshot,
    );
  }

  wait(taskId) {
    const task = this.tasks.get(taskId);

    if (!task) {
      return Promise.reject(
        new Error(`Unknown task: ${taskId}`),
      );
    }

    return task.promise;
  }
}

module.exports = {
  TaskHandlerNotFoundError,
  TaskManager,
  normalizeProgress,
};
