import type {
  PlatformRuntime,
} from "@pl/platform";

import {
  isActiveTaskStatus,
  isTerminalTaskStatus,
  MAX_TRACKED_TASK_IDS,
  taskNotificationIntent,
} from "./taskNotificationPolicy";

import type {
  ObservedTask,
} from "./taskNotificationPolicy";

type Reader =
  () => Promise<ObservedTask[]>;

type Platform =
  Pick<
    PlatformRuntime,
    "notifications" | "eventApi"
  >;

type TaskEventType =
  | "task.started"
  | "task.progress"
  | "task.completed";

export function createTaskNotificationBridge(
  options: {
    readTasks: Reader;
    platform: Platform;
    intervalMs?: number;
  },
) {
  const seen =
    new Map<string, ObservedTask>();

  const activeSeen =
    new Set<string>();

  let timer:
    ReturnType<typeof setInterval> |
      undefined;

  let inFlightGeneration:
    number |
      undefined;

  let running =
    false;

  let initialized =
    false;

  let generation =
    0;

  function isCurrent(
    requestGeneration: number,
  ) {
    return running &&
      requestGeneration === generation;
  }

  async function safeEmit(
    type: TaskEventType,
    task: ObservedTask,
  ) {
    try {
      const metadata = {
        source:
          "renderer" as const,
      };

      if (type === "task.started") {
        await options.platform.eventApi.emit(
          "task.started",
          {
            taskId:
              task.id,

            taskType:
              task.kind ?? "other",
          },
          metadata,
        );
      } else if (type === "task.progress") {
        const percent =
          task.progress?.percent;

        if (
          typeof percent === "number" &&
          Number.isFinite(percent)
        ) {
          await options.platform.eventApi.emit(
            "task.progress",
            {
              taskId:
                task.id,

              percent,
            },
            metadata,
          );
        }
      } else {
        await options.platform.eventApi.emit(
          "task.completed",
          {
            taskId:
              task.id,

            success:
              task.status === "completed",
          },
          metadata,
        );
      }
    } catch {
      // Listener failures must not suppress notifications or observation.
    }
  }

  function pruneTrackedTasks() {
    if (
      seen.size <=
        MAX_TRACKED_TASK_IDS
    ) {
      return;
    }

    for (const id of seen.keys()) {
      if (
        seen.size <=
          MAX_TRACKED_TASK_IDS
      ) {
        return;
      }

      if (!activeSeen.has(id)) {
        seen.delete(id);
      }
    }
  }

  async function refresh() {
    const requestGeneration =
      generation;

    if (
      !running ||
      inFlightGeneration ===
        requestGeneration
    ) {
      return;
    }

    inFlightGeneration =
      requestGeneration;

    try {
      const tasks =
        await options.readTasks();

      if (!isCurrent(requestGeneration)) {
        return;
      }

      const present =
        new Set<string>();

      for (const task of tasks) {
        if (
          !isCurrent(requestGeneration) ||
          !task.id
        ) {
          if (!isCurrent(requestGeneration)) {
            return;
          }

          continue;
        }

        present.add(task.id);

        const previous =
          seen.get(task.id);

        if (
          previous?.status === task.status &&
          previous.progress?.percent ===
            task.progress?.percent
        ) {
          continue;
        }

        seen.set(
          task.id,
          task,
        );

        if (isActiveTaskStatus(task.status)) {
          activeSeen.add(task.id);
        }

        // The first read establishes a baseline and never replays history.
        if (
          !initialized ||
          !previous
        ) {
          continue;
        }

        if (
          task.status === "running" &&
          previous.status !== "running"
        ) {
          await safeEmit(
            "task.started",
            task,
          );

          if (!isCurrent(requestGeneration)) {
            return;
          }
        }

        if (
          task.status === "running" &&
          task.progress?.percent !==
            previous.progress?.percent
        ) {
          await safeEmit(
            "task.progress",
            task,
          );

          if (!isCurrent(requestGeneration)) {
            return;
          }
        }

        if (
          activeSeen.has(task.id) &&
          isTerminalTaskStatus(task.status)
        ) {
          const intent =
            taskNotificationIntent(task);

          if (intent) {
            try {
              options.platform.notifications.push(
                intent,
              );
            } catch {
              // Notification storage failure is isolated from task events.
            }
          }

          if (
            task.status === "completed" ||
            task.status === "failed"
          ) {
            await safeEmit(
              "task.completed",
              task,
            );

            if (!isCurrent(requestGeneration)) {
              return;
            }
          }

          activeSeen.delete(task.id);
        }
      }

      for (const id of seen.keys()) {
        if (!present.has(id)) {
          seen.delete(id);
          activeSeen.delete(id);
        }
      }

      pruneTrackedTasks();
      initialized =
        true;
    } catch {
      // Observation failures never modify the desktop task manager.
    } finally {
      if (
        inFlightGeneration ===
          requestGeneration
      ) {
        inFlightGeneration =
          undefined;
      }
    }
  }

  return {
    start() {
      if (running) {
        return;
      }

      running =
        true;

      generation +=
        1;

      initialized =
        false;

      seen.clear();
      activeSeen.clear();

      void refresh();

      timer =
        setInterval(
          () => void refresh(),
          options.intervalMs ?? 5000,
        );
    },

    stop() {
      running =
        false;

      generation +=
        1;

      if (timer) {
        clearInterval(timer);
      }

      timer =
        undefined;

      initialized =
        false;

      seen.clear();
      activeSeen.clear();
    },

    refresh,
  };
}
