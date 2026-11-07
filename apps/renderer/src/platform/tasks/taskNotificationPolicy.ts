export type ObservedTaskStatus =
  | "queued"
  | "running"
  | "cancelling"
  | "cancelled"
  | "completed"
  | "failed"
  | "interrupted";

export interface ObservedTask {
  id: string;
  title?: string;
  kind?: string;
  status: ObservedTaskStatus;
  progress?: {
    percent?: number | null;
  };
  createdAt?: string;
  startedAt?: string;
  finishedAt?: string;
}

export type TaskNotificationIntent = {
  taskId: string;
  title: string;
  message: string;
  severity: "success" | "warning" | "error";
  category: "task";
  sourceId: string;
};

export const MAX_TRACKED_TASK_IDS =
  100;

const active =
  new Set<ObservedTaskStatus>([
    "queued",
    "running",
    "cancelling",
  ]);

const terminal =
  new Set<ObservedTaskStatus>([
    "completed",
    "failed",
    "cancelled",
    "interrupted",
  ]);

export function isActiveTaskStatus(
  status: ObservedTaskStatus,
) {
  return active.has(status);
}

export function isTerminalTaskStatus(
  status: ObservedTaskStatus,
) {
  return terminal.has(status);
}

export function toSafeObservedTask(
  input: unknown,
): ObservedTask | null {
  if (
    !input ||
    typeof input !== "object" ||
    Array.isArray(input)
  ) {
    return null;
  }

  const task =
    input as Record<string, unknown>;

  if (
    typeof task.id !== "string" ||
    !task.id ||
    task.source !== "live" ||
    typeof task.status !== "string" ||
    (!active.has(
      task.status as ObservedTaskStatus,
    ) &&
      !terminal.has(
        task.status as ObservedTaskStatus,
      ))
  ) {
    return null;
  }

  const percent =
    task.progressPercent;

  return {
    id:
      task.id.slice(
        0,
        160,
      ),

    status:
      task.status as ObservedTaskStatus,

    ...(typeof task.kind === "string"
      ? {
          kind:
            task.kind.slice(
              0,
              80,
            ),
        }
      : {}),

    ...(typeof percent === "number" &&
    Number.isFinite(percent)
      ? {
          progress: {
            percent:
              Math.max(
                0,
                Math.min(
                  100,
                  percent,
                ),
              ),
          },
        }
      : {}),
  };
}

export function toSafeObservedTasks(
  input: unknown,
) {
  if (!Array.isArray(input)) {
    return [];
  }

  const byId =
    new Map<string, ObservedTask>();

  for (const candidate of input) {
    const task =
      toSafeObservedTask(candidate);

    if (task) {
      byId.set(
        task.id,
        task,
      );
    }
  }

  const activeTasks: ObservedTask[] =
    [];

  const terminalTasks: ObservedTask[] =
    [];

  for (const task of byId.values()) {
    if (isActiveTaskStatus(task.status)) {
      activeTasks.push(task);
    } else {
      terminalTasks.push(task);
    }
  }

  const terminalCapacity =
    Math.max(
      0,
      MAX_TRACKED_TASK_IDS -
        activeTasks.length,
    );

  return [
    ...activeTasks,
    ...(terminalCapacity > 0
      ? terminalTasks.slice(
          -terminalCapacity,
        )
      : []),
  ];
}

export function taskNotificationIntent(
  task: ObservedTask,
): TaskNotificationIntent | null {
  if (
    !task.id ||
    !isTerminalTaskStatus(
      task.status,
    )
  ) {
    return null;
  }

  // Task-supplied titles and diagnostic strings are intentionally excluded.
  const label =
    "Background task";

  const outcomes = {
    completed: {
      title:
        "Task completed",
      message:
        `${label} finished successfully.`,
      severity:
        "success" as const,
    },

    failed: {
      title:
        "Task failed",
      message:
        `${label} did not complete.`,
      severity:
        "error" as const,
    },

    cancelled: {
      title:
        "Task cancelled",
      message:
        `${label} was cancelled.`,
      severity:
        "warning" as const,
    },

    interrupted: {
      title:
        "Task interrupted",
      message:
        `${label} stopped before completion.`,
      severity:
        "warning" as const,
    },
  };

  const detail =
    outcomes[
      task.status as keyof typeof outcomes
    ];

  return detail
    ? {
        taskId:
          task.id,

        ...detail,

        category:
          "task",

        sourceId:
          `task:${task.id}`,
      }
    : null;
}
