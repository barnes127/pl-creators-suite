import {
  useMemo,
  useState,
} from "react";

import type {
  NotificationRecord,
} from "@pl/platform";

import {
  platformRuntime,
} from "../../platform/runtime";

import {
  filterNotifications,
  groupNotificationsByCategory,
} from "../../platform/operations";

const CATEGORIES = [
  "all",
  "system",
  "project",
  "task",
  "workflow",
  "security",
  "other",
];

const SEVERITIES = [
  "all",
  "info",
  "success",
  "warning",
  "error",
];

export interface NotificationInboxProps {
  notifications:
    readonly NotificationRecord[];
  error: string;
  onDismiss: (
    notificationId: string,
  ) => void;
  onRefresh: () => void;
}

export function NotificationInbox({
  notifications,
  error,
  onDismiss,
  onRefresh,
}: NotificationInboxProps) {
  const [query, setQuery] =
    useState("");

  const [category, setCategory] =
    useState("all");

  const [severity, setSeverity] =
    useState("all");

  const [includeDismissed, setIncludeDismissed] =
    useState(false);

  const [actionMessage, setActionMessage] =
    useState("");

  const groups =
    useMemo(
      () =>
        groupNotificationsByCategory(
          filterNotifications(
            notifications,
            query,
            category,
            severity,
            includeDismissed,
          ),
        ),
      [
        notifications,
        query,
        category,
        severity,
        includeDismissed,
      ],
    );

  const entries =
    Object.entries(groups);

  async function runAction(
    commandId: string,
  ) {
    const command =
      platformRuntime.commandApi.get(
        commandId,
      );

    if (
      !command ||
      command.status !== "active" ||
      command.requiredPermissions.length > 0
    ) {
      setActionMessage(
        "This notification action is unavailable in the current context.",
      );
      return;
    }

    try {
      const result =
        await platformRuntime.commandApi.execute(
          commandId,
          undefined,
          {
            source: "ui",
            permissions:
              new Set<string>(),
          },
        );

      setActionMessage(
        result.ok
          ? "Notification action completed."
          : "Notification action could not be completed.",
      );
    } catch {
      setActionMessage(
        "Notification action could not be completed.",
      );
    }
  }

  return (
    <section
      className="notificationInbox"
      aria-label="Notifications"
    >
      <div className="operationsSectionHeading">
        <div>
          <h2>
            Notifications
          </h2>

          <p>
            Search and group session-local notices from the suite notification center.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-subtle"
          onClick={onRefresh}
        >
          Refresh
        </button>
      </div>

      <div className="notificationInboxFilters">
        <label>
          <span>
            Search notices
          </span>

          <input
            type="search"
            value={query}
            onChange={
              (event) =>
                setQuery(
                  event.target.value,
                )
            }
          />
        </label>

        <label>
          <span>
            Category
          </span>

          <select
            value={category}
            onChange={
              (event) =>
                setCategory(
                  event.target.value,
                )
            }
          >
            {CATEGORIES.map(
              (value) => (
                <option
                  key={value}
                  value={value}
                >
                  {value}
                </option>
              ),
            )}
          </select>
        </label>

        <label>
          <span>
            Severity
          </span>

          <select
            value={severity}
            onChange={
              (event) =>
                setSeverity(
                  event.target.value,
                )
            }
          >
            {SEVERITIES.map(
              (value) => (
                <option
                  key={value}
                  value={value}
                >
                  {value}
                </option>
              ),
            )}
          </select>
        </label>

        <label className="notificationInboxToggle">
          <input
            type="checkbox"
            checked={includeDismissed}
            onChange={
              (event) =>
                setIncludeDismissed(
                  event.target.checked,
                )
            }
          />

          <span>
            Include dismissed
          </span>
        </label>
      </div>

      {error && (
        <p
          className="operationsMessage operationsMessageError"
          role="alert"
        >
          {error}
        </p>
      )}

      {actionMessage && (
        <p
          className="operationsMessage"
          role="status"
        >
          {actionMessage}
        </p>
      )}

      {entries.length === 0 ? (
        <p className="operationsEmptyState">
          No notifications match these filters.
        </p>
      ) : (
        <div className="notificationGroups">
          {entries.map(
            ([group, items]) => (
              <section
                className="notificationGroup"
                key={group}
                aria-labelledby={`notification-group-${group}`}
              >
                <h3 id={`notification-group-${group}`}>
                  {group}
                </h3>

                <ul className="notificationList">
                  {items.map(
                    (item) => (
                      <li
                        className="notificationRow"
                        key={item.id}
                      >
                        <div className="notificationSummary">
                          <div>
                            <strong>
                              {item.title}
                            </strong>

                            <span className="notificationSeverity">
                              {item.severity}
                            </span>
                          </div>

                          {item.message && (
                            <p>
                              {item.message}
                            </p>
                          )}

                          <span>
                            Category: {item.category}
                            {item.dismissedAt
                              ? " · Dismissed"
                              : ""}
                          </span>
                        </div>

                        <div className="notificationActions">
                          {item.actions?.map(
                            (action) => {
                              const command =
                                action.commandId
                                  ? platformRuntime.commandApi.get(
                                      action.commandId,
                                    )
                                  : undefined;

                              const available =
                                Boolean(
                                  command &&
                                  command.status === "active" &&
                                  command.requiredPermissions.length === 0,
                                );

                              return (
                                <button
                                  type="button"
                                  className="btn btn-subtle"
                                  key={action.id}
                                  disabled={!available}
                                  title={
                                    available
                                      ? undefined
                                      : "Action unavailable in the current context"
                                  }
                                  onClick={
                                    () => {
                                      if (action.commandId) {
                                        void runAction(
                                          action.commandId,
                                        );
                                      }
                                    }
                                  }
                                >
                                  {action.label}
                                  {!available &&
                                    " (unavailable)"}
                                </button>
                              );
                            },
                          )}

                          {!item.dismissedAt && (
                            <button
                              type="button"
                              className="btn btn-subtle"
                              onClick={
                                () =>
                                  onDismiss(item.id)
                              }
                            >
                              Dismiss
                            </button>
                          )}
                        </div>
                      </li>
                    ),
                  )}
                </ul>
              </section>
            ),
          )}
        </div>
      )}
    </section>
  );
}

