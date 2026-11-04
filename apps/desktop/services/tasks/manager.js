class TaskHandlerNotFoundError extends Error {
  constructor(handlerId) {
    super(`No task handler registered: ${handlerId}`);
    this.name = "TaskHandlerNotFoundError";
    this.code = "TASK_HANDLER_NOT_FOUND";
    this.handlerId = handlerId;
  }
}

const TASK_PRIORITY_ORDER = Object.freeze({
  critical: 0,
  high: 1,
  normal: 2,
  low: 3,
});

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

function normalizeTaskPriority(priority) {
  const value = priority ?? "normal";

  if (!Object.hasOwn(TASK_PRIORITY_ORDER, value)) {
    throw new Error(
      `Invalid task priority: ${value}`,
    );
  }

  return value;
}

function createDeferred() {
  let resolve;
  let reject;

  const promise = new Promise((yes, no) => {
    resolve = yes;
    reject = no;
  });

  return {
    promise,
    resolve,
    reject,
  };
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

    const limit =
      options.maxConcurrentTasks ?? 2;

    if (
      !Number.isSafeInteger(limit) ||
      limit < 1
    ) {
      throw new RangeError(
        "maxConcurrentTasks must be a positive safe integer",
      );
    }

    this.maxConcurrentTasks = limit;
    this.activeCount = 0;
    this.pending = [];
    this.drainScheduled = false;
  }

  notifyTaskChanged(task) {
    try {
      this.onTaskChanged(
        createTaskSnapshot(task),
      );
    } catch (error) {
      console.error(
        "Task change observer failed",
        error,
      );
    }
  }

  notifyTaskCallback(
    callback,
    value,
    task,
  ) {
    if (typeof callback !== "function") {
      return;
    }

    try {
      callback(
        value,
        createTaskSnapshot(task),
      );
    } catch (error) {
      console.error(
        "Task reporting observer failed",
        error,
      );
    }
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

  scheduleDrain() {
    if (this.drainScheduled) {
      return;
    }

    this.drainScheduled = true;

    queueMicrotask(() => {
      this.drainScheduled = false;
      this.drainQueue();
    });
  }

  selectNextPending() {
    if (this.pending.length === 0) {
      return null;
    }

    let bestIndex = 0;

    for (
      let index = 1;
      index < this.pending.length;
      index += 1
    ) {
      const candidate =
        this.pending[index];

      const selected =
        this.pending[bestIndex];

      if (
        TASK_PRIORITY_ORDER[
          candidate.priority
        ] <
        TASK_PRIORITY_ORDER[
          selected.priority
        ]
      ) {
        bestIndex = index;
      }
    }

    const [selected] =
      this.pending.splice(
        bestIndex,
        1,
      );

    return selected;
  }

  drainQueue() {
    while (
      this.activeCount <
        this.maxConcurrentTasks &&
      this.pending.length > 0
    ) {
      const task =
        this.selectNextPending();

      if (
        !task ||
        task.status !== "queued"
      ) {
        continue;
      }

      this.activeCount += 1;
      void this.executeQueuedTask(task);
    }
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

    if (!this.handlers.has(handlerId)) {
      throw new TaskHandlerNotFoundError(handlerId);
    }

    const controller = new AbortController();

    const task = {
      id: taskId,
      handlerId,
      kind: definition.kind ?? "other",
      title: definition.title ?? handlerId,
      description: definition.description,
      priority: normalizeTaskPriority(
        definition.priority,
      ),
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
      callbacks: options,
      deferred: createDeferred(),
      promise: null,
    };

    task.promise = task.deferred.promise;

    // Keep the original promise rejecting for submit()/wait(),
    // while ensuring fire-and-forget callers do not create a
    // process-level unhandled rejection.
    void task.promise.catch(() => {});

    this.tasks.set(taskId, task);
    this.notifyTaskChanged(task);
    this.pending.push(task);
    this.scheduleDrain();

    return {
      taskId,
      task: createTaskSnapshot(task),
      promise: task.promise,
    };
  }

  async executeQueuedTask(task) {
    try {
      if (task.controller.signal.aborted) {
        task.status = "cancelled";
        task.finishedAt ??= nowIso();
        this.notifyTaskChanged(task);
        task.deferred.resolve(undefined);
        return;
      }

      task.status = "running";
      task.startedAt = nowIso();
      this.notifyTaskChanged(task);

      const canReport = () =>
        task.status === "running" ||
        task.status === "cancelling";

      const context = {
        signal: task.controller.signal,

        reportProgress: (progress) => {
          if (!canReport()) {
            return;
          }

          task.progress = normalizeProgress({
            ...task.progress,
            ...progress,
          });

          this.notifyTaskChanged(task);
          this.notifyTaskCallback(
            task.callbacks?.onProgress,
            { ...task.progress },
            task,
          );
        },

        reportWarning: (warning) => {
          if (!canReport()) {
            return;
          }

          task.warnings.push({
            ...warning,
          });

          this.notifyTaskChanged(task);
          this.notifyTaskCallback(
            task.callbacks?.onWarning,
            { ...warning },
            task,
          );
        },

        reportResourceUsage: (usage) => {
          if (!canReport()) {
            return;
          }

          task.resourceUsage = {
            ...task.resourceUsage,
            ...usage,
          };

          this.notifyTaskChanged(task);
          this.notifyTaskCallback(
            task.callbacks?.onResourceUsage,
            { ...task.resourceUsage },
            task,
          );
        },
      };

      const handler =
        this.handlers.get(task.handlerId);

      if (!handler) {
        throw new TaskHandlerNotFoundError(
          task.handlerId,
        );
      }

      const result = await handler(
        task.input,
        context,
      );

      if (task.controller.signal.aborted) {
        task.status = "cancelled";
        task.finishedAt = nowIso();
        this.notifyTaskChanged(task);
        task.deferred.resolve(undefined);
        return;
      }

      task.result = result;
      task.status = "completed";
      task.finishedAt = nowIso();
      this.notifyTaskChanged(task);
      task.deferred.resolve(result);
    } catch (error) {
      if (
        isCancellationError(
          error,
          task.controller.signal,
        )
      ) {
        task.status = "cancelled";
        task.deferred.resolve(undefined);
      } else {
        task.status = "failed";
        task.failure = {
          code:
            error?.code ||
            "TASK_FAILED",
          message:
            error?.message ||
            "Task execution failed",
          details: error?.details,
          retryable:
            error?.retryable === true,
        };
        task.deferred.reject(error);
      }

      task.finishedAt = nowIso();
      this.notifyTaskChanged(task);
    } finally {
      task.callbacks = undefined;
      this.activeCount -= 1;
      this.scheduleDrain();
    }
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
      this.pending = this.pending.filter(
        (entry) => entry.id !== task.id,
      );
      task.controller.abort();
      task.status = "cancelled";
      task.finishedAt = nowIso();
      task.callbacks = undefined;
      this.notifyTaskChanged(task);
      task.deferred.resolve(undefined);
      this.scheduleDrain();
      return createTaskSnapshot(task);
    }

    if (task.status === "cancelling") {
      return createTaskSnapshot(task);
    }

    task.status = "cancelling";
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
