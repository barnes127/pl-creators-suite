import {
  canCancelTask,
} from "../../platform/operations";

import type {
  OperationalTaskRow,
} from "../../platform/operations";

export interface TaskListProps {
  tasks:
    readonly OperationalTaskRow[];
  loading: boolean;
  error: string;
  cancellingTaskIds:
    ReadonlySet<string>;
  onRefresh: () => void;
  onCancel: (
    taskId: string,
  ) => void;
}

export function TaskList({
  tasks,
  loading,
  error,
  cancellingTaskIds,
  onRefresh,
  onCancel,
}: TaskListProps) {
  if (
    loading &&
    tasks.length === 0
  ) {
    return (
      <p role="status">
        Loading tasks…
      </p>
    );
  }

  return (
    <section
      className="operationalTasks"
      aria-label="Operational tasks"
    >
      <div className="operationsSectionHeading">
        <div>
          <h2>
            Jobs &amp; Tasks
          </h2>

          <p>
            Live work and privacy-safe diagnostic history. Priority is unavailable in this projection.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-subtle"
          onClick={onRefresh}
          disabled={loading}
        >
          {loading
            ? "Refreshing…"
            : "Refresh"}
        </button>
      </div>

      {error && (
        <p
          className="operationsMessage operationsMessageError"
          role="alert"
        >
          {error}
        </p>
      )}

      {tasks.length === 0 ? (
        <p className="operationsEmptyState">
          No task activity is available.
        </p>
      ) : (
        <ul className="operationalTaskList">
          {tasks.map(
            (task) => {
              const cancelling =
                cancellingTaskIds.has(
                  task.id,
                );

              return (
                <li
                  key={task.id}
                  className="operationalTaskRow"
                >
                  <div className="operationalTaskSummary">
                    <strong>
                      {task.title ||
                        "Background task"}
                    </strong>

                    <span>
                      {task.kind || "other"}
                      {" · "}
                      {task.status}
                    </span>

                    <span>
                      {task.source === "history"
                        ? "History only · Not active"
                        : "Live task"}
                      {typeof task.warningCount ===
                        "number" &&
                        ` · ${task.warningCount} warning${
                          task.warningCount === 1
                            ? ""
                            : "s"
                        }`}
                    </span>

                    {task.failureCode && (
                      <span>
                        Failure code: {task.failureCode}
                      </span>
                    )}
                  </div>

                  <div className="operationalTaskControls">
                    {typeof task.progressPercent ===
                      "number" && (
                      <label className="operationalTaskProgress">
                        <span>
                          Progress {Math.round(task.progressPercent)}%
                        </span>

                        <progress
                          value={task.progressPercent}
                          max={100}
                        />
                      </label>
                    )}

                    {canCancelTask(task) && (
                      <button
                        type="button"
                        className="btn btn-subtle"
                        disabled={cancelling}
                        aria-label={`Cancel ${
                          task.title ||
                          "background task"
                        }`}
                        onClick={
                          () =>
                            onCancel(task.id)
                        }
                      >
                        {cancelling
                          ? "Cancelling…"
                          : "Cancel"}
                      </button>
                    )}
                  </div>
                </li>
              );
            },
          )}
        </ul>
      )}
    </section>
  );
}

