import type {
  NotificationRecord,
} from "@pl/platform";

import type {
  OperationalTaskResult,
  OperationalTaskRow,
  OperationalTaskSource,
  OperationalTaskStatus,
} from "./types";

const ACTIVE =
  new Set<OperationalTaskStatus>([
    "queued",
    "running",
    "cancelling",
  ]);

const CANCELLABLE =
  new Set<OperationalTaskStatus>([
    "queued",
    "running",
  ]);

const STATUSES =
  new Set<OperationalTaskStatus>([
    ...ACTIVE,
    "cancelled",
    "completed",
    "failed",
    "interrupted",
  ]);

const SOURCES =
  new Set<OperationalTaskSource>([
    "live",
    "history",
  ]);

function optionalString(
  row: Record<string, unknown>,
  field: string,
  maximumLength: number,
) {
  const value = row[field];

  return typeof value === "string" && value
    ? value.slice(0, maximumLength)
    : undefined;
}

export function toOperationalTaskResult(
  input: unknown,
): OperationalTaskResult {
  if (
    !input ||
    typeof input !== "object" ||
    Array.isArray(input)
  ) {
    throw new Error(
      "Task activity response is invalid.",
    );
  }

  const result =
    input as Record<string, unknown>;

  if (
    !Array.isArray(result.tasks) ||
    typeof result.historyAvailable !==
      "boolean"
  ) {
    throw new Error(
      "Task activity response is invalid.",
    );
  }

  const tasks:
    OperationalTaskRow[] = [];

  for (const candidate of result.tasks) {
    if (
      !candidate ||
      typeof candidate !== "object" ||
      Array.isArray(candidate)
    ) {
      continue;
    }

    const row =
      candidate as Record<string, unknown>;

    if (
      typeof row.id !== "string" ||
      !row.id ||
      row.id.length > 200 ||
      typeof row.status !== "string" ||
      !STATUSES.has(
        row.status as OperationalTaskStatus,
      ) ||
      typeof row.source !== "string" ||
      !SOURCES.has(
        row.source as OperationalTaskSource,
      )
    ) {
      continue;
    }

    const task:
      OperationalTaskRow = {
        id: row.id,
        status:
          row.status as OperationalTaskStatus,
        source:
          row.source as OperationalTaskSource,
      };

    for (const [field, maximumLength] of [
      ["kind", 80],
      ["title", 240],
      ["createdAt", 80],
      ["startedAt", 80],
      ["finishedAt", 80],
      ["failureCode", 120],
    ] as const) {
      const value =
        optionalString(
          row,
          field,
          maximumLength,
        );

      if (value !== undefined) {
        (task as unknown as Record<
          string,
          unknown
        >)[field] = value;
      }
    }

    if (
      typeof row.progressPercent ===
        "number" &&
      Number.isFinite(row.progressPercent)
    ) {
      task.progressPercent =
        Math.max(
          0,
          Math.min(
            100,
            row.progressPercent,
          ),
        );
    }

    if (
      Number.isSafeInteger(
        row.warningCount,
      ) &&
      (row.warningCount as number) >= 0
    ) {
      task.warningCount =
        row.warningCount as number;
    }

    if (
      task.source === "live" &&
      CANCELLABLE.has(task.status) &&
      row.supportsCancellation === true
    ) {
      task.supportsCancellation = true;
    }

    tasks.push(task);
  }

  return {
    tasks,
    historyAvailable:
      result.historyAvailable,
  };
}

export function isActiveTask(
  task: OperationalTaskRow,
) {
  return ACTIVE.has(task.status);
}

export function canCancelTask(
  task: OperationalTaskRow,
) {
  return (
    task.source === "live" &&
    task.supportsCancellation === true &&
    CANCELLABLE.has(task.status)
  );
}

export function sortOperationalTasks(
  tasks: readonly OperationalTaskRow[],
): OperationalTaskRow[] {
  return [...tasks].sort(
    (left, right) => {
      const leftOrder =
        isActiveTask(left)
          ? 0
          : 1;

      const rightOrder =
        isActiveTask(right)
          ? 0
          : 1;

      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }

      return (
        (
          right.startedAt ??
          right.createdAt ??
          ""
        ).localeCompare(
          left.startedAt ??
          left.createdAt ??
          "",
        ) ||
        left.id.localeCompare(right.id)
      );
    },
  );
}

export function filterOperationalTasks(
  tasks: readonly OperationalTaskRow[],
  query: string,
): OperationalTaskRow[] {
  const needle =
    query.trim().toLocaleLowerCase();

  if (!needle) {
    return [...tasks];
  }

  return tasks.filter(
    (task) =>
      [
        task.title,
        task.kind,
        task.status,
        task.id,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase()
        .includes(needle),
  );
}

export function filterNotifications(
  rows: readonly NotificationRecord[],
  query: string,
  category = "all",
  severity = "all",
  includeDismissed = false,
): NotificationRecord[] {
  const needle =
    query.trim().toLocaleLowerCase();

  return rows.filter(
    (row) =>
      (includeDismissed || !row.dismissedAt) &&
      (
        category === "all" ||
        row.category === category
      ) &&
      (
        severity === "all" ||
        row.severity === severity
      ) &&
      (
        !needle ||
        [
          row.title,
          row.message,
          row.severity,
          row.category,
        ]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase()
          .includes(needle)
      ),
  );
}

export function groupNotificationsByCategory(
  rows: readonly NotificationRecord[],
) {
  return rows.reduce<
    Record<string, NotificationRecord[]>
  >(
    (groups, row) => {
      (groups[row.category] ??= [])
        .push(row);

      return groups;
    },
    {},
  );
}

