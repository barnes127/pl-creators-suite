import "./OperationsPanel.css";

import {
  useMemo,
  useState,
} from "react";

import {
  rpc,
} from "../../rpc";

import {
  sortOperationalTasks,
  useNotifications,
  useOperationalTasks,
} from "../../platform/operations";

import {
  NotificationInbox,
} from "./NotificationInbox";

import {
  TaskList,
} from "./TaskList";

type OperationsTab =
  | "tasks"
  | "notifications";

const TASK_STATUSES =
  new Set([
    "queued",
    "running",
    "cancelling",
    "cancelled",
    "completed",
    "failed",
    "interrupted",
  ]);

export function OperationsPanel() {
  const [activeTab, setActiveTab] =
    useState<OperationsTab>(
      "tasks",
    );

  const [cancellingTaskIds, setCancellingTaskIds] =
    useState<ReadonlySet<string>>(
      new Set(),
    );

  const [cancelMessage, setCancelMessage] =
    useState("");

  const [cancelError, setCancelError] =
    useState("");

  const tasks =
    useOperationalTasks();

  const notifications =
    useNotifications();

  const sortedTasks =
    useMemo(
      () =>
        sortOperationalTasks(
          tasks.value.tasks,
        ),
      [tasks.value.tasks],
    );

  async function cancelTask(
    taskId: string,
  ) {
    setCancelError("");
    setCancelMessage("");
    setCancellingTaskIds(
      (current) =>
        new Set([
          ...current,
          taskId,
        ]),
    );

    try {
      const response =
        await rpc<{
          task?: unknown;
        }>(
          "tasks.cancel",
          {taskId},
        );

      const result =
        response.task;

      if (
        !result ||
        typeof result !== "object" ||
        Array.isArray(result)
      ) {
        setCancelError(
          "The task is no longer available for cancellation.",
        );
        return;
      }

      const row =
        result as Record<string, unknown>;

      if (
        typeof row.status !== "string" ||
        !TASK_STATUSES.has(row.status)
      ) {
        setCancelError(
          "The cancellation response was invalid.",
        );
        return;
      }

      if (
        row.status === "cancelling" ||
        row.status === "cancelled"
      ) {
        setCancelMessage(
          row.status === "cancelled"
            ? "Task cancelled."
            : "Cancellation requested. The task will stop cooperatively.",
        );
      } else if (
        row.status === "completed" ||
        row.status === "failed" ||
        row.status === "interrupted"
      ) {
        setCancelMessage(
          `The task is already ${row.status}.`,
        );
      } else {
        setCancelError(
          "This live task does not support cancellation.",
        );
      }
    } catch {
      setCancelError(
        "The cancellation request failed. The task remains visible.",
      );
    } finally {
      setCancellingTaskIds(
        (current) => {
          const next =
            new Set(current);

          next.delete(taskId);
          return next;
        },
      );

      await tasks.refresh();
    }
  }

  return (
    <section
      className="operationsPanel"
      aria-label="Command Center operations"
    >
      <div className="operationsPanelToolbar">
        <div>
          <span className="commandCenterEyebrow">
            Operations
          </span>

          <h2>
            Jobs, Tasks &amp; Notifications
          </h2>
        </div>

        <div
          className="operationsTabs"
          role="tablist"
          aria-label="Operations views"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "tasks"}
            className={
              activeTab === "tasks"
                ? "operationsTabActive"
                : ""
            }
            onClick={
              () =>
                setActiveTab("tasks")
            }
          >
            Jobs &amp; Tasks
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "notifications"}
            className={
              activeTab === "notifications"
                ? "operationsTabActive"
                : ""
            }
            onClick={
              () =>
                setActiveTab(
                  "notifications",
                )
            }
          >
            Notifications
          </button>
        </div>
      </div>

      {activeTab === "tasks" ? (
        <div
          role="tabpanel"
          aria-label="Jobs and tasks"
        >
          {!tasks.value.historyAvailable && (
            <p
              className="operationsMessage operationsMessageWarning"
              role="status"
            >
              Task history is unavailable. Live task activity is still shown.
            </p>
          )}

          {cancelMessage && (
            <p
              className="operationsMessage"
              role="status"
            >
              {cancelMessage}
            </p>
          )}

          {cancelError && (
            <p
              className="operationsMessage operationsMessageError"
              role="alert"
            >
              {cancelError}
            </p>
          )}

          <TaskList
            tasks={sortedTasks}
            loading={tasks.loading}
            error={tasks.error}
            cancellingTaskIds={cancellingTaskIds}
            onRefresh={
              () => {
                void tasks.refresh();
              }
            }
            onCancel={
              (taskId) => {
                void cancelTask(taskId);
              }
            }
          />
        </div>
      ) : (
        <div
          role="tabpanel"
          aria-label="Notifications"
        >
          <NotificationInbox
            notifications={notifications.notifications}
            error={notifications.error}
            onRefresh={notifications.refresh}
            onDismiss={
              (notificationId) => {
                notifications.dismiss(
                  notificationId,
                );
              }
            }
          />
        </div>
      )}
    </section>
  );
}

