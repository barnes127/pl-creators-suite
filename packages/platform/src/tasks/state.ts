import type {TaskProgress, TaskStatus} from "./types";

const TERMINAL_TASK_STATUSES =
  new Set<TaskStatus>([
    "cancelled",
    "completed",
    "failed",
    "interrupted",
  ]);

const ALLOWED_TASK_TRANSITIONS:
  Readonly<Record<
    TaskStatus,
    readonly TaskStatus[]
  >> = {
    queued: [
      "running",
      "cancelled",
      "interrupted",
    ],

    running: [
      "cancelling",
      "completed",
      "failed",
      "interrupted",
    ],

    cancelling: [
      "cancelled",
      "failed",
      "interrupted",
    ],

    cancelled: [],
    completed: [],
    failed: [],
    interrupted: [],
  };

export function isTerminalTaskStatus(status: TaskStatus): boolean {
  return TERMINAL_TASK_STATUSES.has(status);
}

export function canTransitionTaskStatus(
  from: TaskStatus,
  to: TaskStatus,
): boolean {
  return ALLOWED_TASK_TRANSITIONS[
    from
  ].includes(
    to,
  );
}

export function assertTaskTransition(
  from: TaskStatus,
  to: TaskStatus,
): void {
  if (
    !canTransitionTaskStatus(
      from,
      to,
    )
  ) {
    throw new Error(
      `Invalid task status transition: ${from} -> ${to}`,
    );
  }
}

function clamp(
  value: number,
  minimum: number,
  maximum: number,
): number {
  return Math.min(
    maximum,
    Math.max(
      minimum,
      value,
    ),
  );
}

export function normalizeTaskProgress(
  progress: Partial<TaskProgress> = {},
): TaskProgress {
  let completed =
    progress.completed ??
    null;

  let total =
    progress.total ??
    null;

  if (
    completed !== null
  ) {
    completed =
      Math.max(
        0,
        completed,
      );
  }

  if (
    total !== null
  ) {
    total =
      Math.max(
        0,
        total,
      );
  }

  if (
    completed !== null &&
    total !== null
  ) {
    completed =
      Math.min(
        completed,
        total,
      );
  }

  let percent =
    progress.percent ??
    null;

  if (
    percent === null &&
    completed !== null &&
    total !== null &&
    total > 0
  ) {
    percent =
      (
        completed /
        total
      ) *
      100;
  }

  if (percent !== null) {
    percent =
      clamp(percent, 0, 100,);
  }

  return {
    phase:progress.phase ?? "pending",
    completed,
    total,
    percent,
    message: progress.message ?? "",
    currentItem: progress.currentItem ?? null,
  };
}
