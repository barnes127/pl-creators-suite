import {
  useEffect,
  useState,
} from "react";

import type {
  TaskRecord,
} from "@pl/platform";

import {
  rpc,
} from "../../rpc";

import {
  platformRuntime,
} from "../../platform/runtime";

import type {
  AppMetadata,
  LocalAiStatus,
  PluginInfo,
} from "../../types/app";


type RecentProject = {
  projectRoot:
    string;

  name:
    string;

  lastOpenedAt:
    string;
};


type DiagnosticsHealth = {
  jobCount:
    number;

  activeJobs:
    number;

  failedJobs:
    number;

  interruptedJobs:
    number;
};


export type FirstPartyDashboardWidgetProps = {
  widgetId:
    string;

  projectRoot:
    string;
};


function WidgetLoading({
  message,
}: {
  message:
    string;
}) {
  return (
    <div className="commandCenterWidgetState">
      {message}
    </div>
  );
}


function WidgetError({
  message,
}: {
  message:
    string;
}) {
  return (
    <div className="commandCenterWidgetState commandCenterWidgetStateError">
      {message}
    </div>
  );
}


function WidgetEmpty({
  title,
  message,
}: {
  title:
    string;

  message:
    string;
}) {
  return (
    <div className="commandCenterWidgetEmptyState">
      <strong>
        {title}
      </strong>

      <span>
        {message}
      </span>
    </div>
  );
}


function RecentsWidget() {
  const [
    items,
    setItems,
  ] =
    useState<
      RecentProject[]
    >(
      [],
    );

  const [
    loading,
    setLoading,
  ] =
    useState(
      true,
    );

  const [
    error,
    setError,
  ] =
    useState(
      "",
    );


  useEffect(
    () => {
      let cancelled =
        false;

      rpc<{
        items:
          RecentProject[];
      }>(
        "recent.list",
      )
        .then(
          (
            result,
          ) => {
            if (
              cancelled
            ) {
              return;
            }

            setItems(
              result.items ??
              [],
            );

            setError(
              "",
            );
          },
        )
        .catch(
          (
            caught,
          ) => {
            if (
              cancelled
            ) {
              return;
            }

            setError(
              caught instanceof
                Error
                ? caught.message
                : String(
                    caught,
                  ),
            );
          },
        )
        .finally(
          () => {
            if (
              !cancelled
            ) {
              setLoading(
                false,
              );
            }
          },
        );

      return () => {
        cancelled =
          true;
      };
    },
    [],
  );


  if (
    loading
  ) {
    return (
      <WidgetLoading
        message="Loading recent projects..."
      />
    );
  }

  if (
    error
  ) {
    return (
      <WidgetError
        message={`Recent projects unavailable: ${error}`}
      />
    );
  }

  if (
    items.length ===
    0
  ) {
    return (
      <WidgetEmpty
        title="No recent projects"
        message="Projects you open will appear here."
      />
    );
  }

  return (
    <div className="commandCenterWidgetItems">
      {items
        .slice(
          0,
          5,
        )
        .map(
          (
            item,
          ) => (
            <div
              className="commandCenterWidgetItem"
              key={
                item.projectRoot
              }
              title={
                item.projectRoot
              }
            >
              <strong>
                {item.name}
              </strong>

              <span>
                {item.projectRoot}
              </span>
            </div>
          ),
        )}
    </div>
  );
}


function FavoritesWidget() {
  return (
    <WidgetEmpty
      title="No favorites yet"
      message="Favorite resources will appear here when the shared favorites system is introduced."
    />
  );
}


function TemplatesWidget() {
  const templates =
    platformRuntime
      .templateApi
      .list();

  if (
    templates.length ===
    0
  ) {
    return (
      <WidgetEmpty
        title="No shared templates registered"
        message="Templates registered through the suite Template API will appear here."
      />
    );
  }

  return (
    <div className="commandCenterWidgetItems">
      {templates
        .slice(
          0,
          5,
        )
        .map(
          (
            template,
          ) => (
            <div
              className="commandCenterWidgetItem"
              key={
                template.id
              }
            >
              <strong>
                {template.name}
              </strong>

              <span>
                {template.kind}
              </span>
            </div>
          ),
        )}
    </div>
  );
}


function TasksWidget() {
  const [
    tasks,
    setTasks,
  ] =
    useState<
      readonly TaskRecord[]
    >(
      [],
    );

  const [
    loading,
    setLoading,
  ] =
    useState(
      true,
    );

  const [
    error,
    setError,
  ] =
    useState(
      "",
    );


  useEffect(
    () => {
      let cancelled =
        false;

      rpc<{
        tasks:
          TaskRecord[];
      }>(
        "tasks.list",
      )
        .then(
          (
            result,
          ) => {
            if (
              cancelled
            ) {
              return;
            }

            setTasks(
              result.tasks ??
              [],
            );

            setError(
              "",
            );
          },
        )
        .catch(
          (
            caught,
          ) => {
            if (
              cancelled
            ) {
              return;
            }

            setError(
              caught instanceof
                Error
                ? caught.message
                : String(
                    caught,
                  ),
            );
          },
        )
        .finally(
          () => {
            if (
              !cancelled
            ) {
              setLoading(
                false,
              );
            }
          },
        );

      return () => {
        cancelled =
          true;
      };
    },
    [],
  );


  if (
    loading
  ) {
    return (
      <WidgetLoading
        message="Loading task activity..."
      />
    );
  }

  if (
    error
  ) {
    return (
      <WidgetError
        message={`Task activity unavailable: ${error}`}
      />
    );
  }

  if (
    tasks.length ===
    0
  ) {
    return (
      <WidgetEmpty
        title="No task activity"
        message="Suite background and operational tasks will appear here."
      />
    );
  }

  return (
    <div className="commandCenterWidgetItems">
      {tasks
        .slice(
          0,
          5,
        )
        .map(
          (
            task,
          ) => (
            <div
              className="commandCenterWidgetItem"
              key={
                task.id
              }
            >
              <div className="commandCenterWidgetItemRow">
                <strong>
                  {task.title}
                </strong>

                <span className="commandCenterWidgetStatus">
                  {task.status}
                </span>
              </div>

              <span>
                {task.kind}
                {" · "}
                {task.progress.message ||
                  task.progress.phase}
              </span>
            </div>
          ),
        )}
    </div>
  );
}


function MilestonesWidget() {
  return (
    <WidgetEmpty
      title="No milestone provider connected"
      message="Project milestone data will appear here when its owning service is available."
    />
  );
}


function NotificationsWidget() {
  const notifications =
    platformRuntime
      .notifications
      .list();

  if (
    notifications.length ===
    0
  ) {
    return (
      <WidgetEmpty
        title="No notifications"
        message="Suite notifications will appear here as operations publish them."
      />
    );
  }

  return (
    <div className="commandCenterWidgetItems">
      {notifications
        .slice(
          0,
          5,
        )
        .map(
          (
            notification,
          ) => (
            <div
              className="commandCenterWidgetItem"
              key={
                notification.id
              }
            >
              <div className="commandCenterWidgetItemRow">
                <strong>
                  {notification.title}
                </strong>

                <span className="commandCenterWidgetStatus">
                  {notification.severity}
                </span>
              </div>

              {notification.message && (
                <span>
                  {notification.message}
                </span>
              )}
            </div>
          ),
        )}
    </div>
  );
}


function ReleasesWidget() {
  const [
    metadata,
    setMetadata,
  ] =
    useState<
      AppMetadata |
      null
    >(
      null,
    );

  const [
    error,
    setError,
  ] =
    useState(
      "",
    );


  useEffect(
    () => {
      let cancelled =
        false;

      rpc<{
        metadata:
          AppMetadata;
      }>(
        "app.metadata",
      )
        .then(
          (
            result,
          ) => {
            if (
              cancelled
            ) {
              return;
            }

            setMetadata(
              result.metadata,
            );

            setError(
              "",
            );
          },
        )
        .catch(
          (
            caught,
          ) => {
            if (
              cancelled
            ) {
              return;
            }

            setError(
              caught instanceof
                Error
                ? caught.message
                : String(
                    caught,
                  ),
            );
          },
        );

      return () => {
        cancelled =
          true;
      };
    },
    [],
  );


  if (
    error
  ) {
    return (
      <WidgetError
        message={`Release information unavailable: ${error}`}
      />
    );
  }

  if (
    !metadata
  ) {
    return (
      <WidgetLoading
        message="Loading release information..."
      />
    );
  }

  return (
    <div className="commandCenterWidgetMetrics">
      <div>
        <span>
          Product
        </span>

        <strong>
          {metadata.productName}
        </strong>
      </div>

      <div>
        <span>
          Version
        </span>

        <strong>
          {metadata.version}
        </strong>
      </div>

      <div>
        <span>
          Runtime
        </span>

        <strong>
          {metadata.isPackaged
            ? "Packaged"
            : "Development"}
        </strong>
      </div>
    </div>
  );
}


function LearningWidget() {
  return (
    <WidgetEmpty
      title="No learning provider connected"
      message="Learning progress will appear here when the suite learning service is introduced."
    />
  );
}


function ProjectHealthWidget({
  projectRoot,
}: {
  projectRoot:
    string;
}) {
  const [
    health,
    setHealth,
  ] =
    useState<
      DiagnosticsHealth |
      null
    >(
      null,
    );

  const [
    localAi,
    setLocalAi,
  ] =
    useState<
      LocalAiStatus |
      null
    >(
      null,
    );

  const [
    plugins,
    setPlugins,
  ] =
    useState<
      PluginInfo[]
    >(
      [],
    );

  const [
    error,
    setError,
  ] =
    useState(
      "",
    );


  useEffect(
    () => {
      let cancelled =
        false;

      Promise.all(
        [
          rpc<{
            health:
              DiagnosticsHealth;
          }>(
            "diagnostics.health",
          ),

          rpc<{
            status:
              LocalAiStatus;
          }>(
            "ai.local.status",
          ),

          rpc<{
            plugins:
              PluginInfo[];
          }>(
            "plugins.list",
          ),
        ],
      )
        .then(
          (
            [
              healthResult,
              aiResult,
              pluginResult,
            ],
          ) => {
            if (
              cancelled
            ) {
              return;
            }

            setHealth(
              healthResult.health,
            );

            setLocalAi(
              aiResult.status,
            );

            setPlugins(
              pluginResult.plugins ??
              [],
            );

            setError(
              "",
            );
          },
        )
        .catch(
          (
            caught,
          ) => {
            if (
              cancelled
            ) {
              return;
            }

            setError(
              caught instanceof
                Error
                ? caught.message
                : String(
                    caught,
                  ),
            );
          },
        );

      return () => {
        cancelled =
          true;
      };
    },
    [],
  );


  if (
    error
  ) {
    return (
      <WidgetError
        message={`Health information unavailable: ${error}`}
      />
    );
  }

  if (
    !health ||
    !localAi
  ) {
    return (
      <WidgetLoading
        message="Checking suite health..."
      />
    );
  }

  const enabledPlugins =
    plugins.filter(
      (
        plugin,
      ) =>
        plugin.enabled,
    ).length;

  return (
    <div className="commandCenterWidgetMetrics">
      <div>
        <span>
          Project
        </span>

        <strong>
          {projectRoot
            ? "Open"
            : "None"}
        </strong>
      </div>

      <div>
        <span>
          Active tasks
        </span>

        <strong>
          {health.activeJobs}
        </strong>
      </div>

      <div>
        <span>
          Failed tasks
        </span>

        <strong>
          {health.failedJobs}
        </strong>
      </div>

      <div>
        <span>
          Interrupted
        </span>

        <strong>
          {health.interruptedJobs}
        </strong>
      </div>

      <div>
        <span>
          Local AI
        </span>

        <strong>
          {localAi.available
            ? "Available"
            : "Unavailable"}
        </strong>
      </div>

      <div>
        <span>
          Plugins
        </span>

        <strong>
          {enabledPlugins}
          /
          {plugins.length}
        </strong>
      </div>
    </div>
  );
}


export function FirstPartyDashboardWidget({
  widgetId,
  projectRoot,
}: FirstPartyDashboardWidgetProps) {
  switch (
    widgetId
  ) {
    case "recents":
      return (
        <RecentsWidget />
      );

    case "favorites":
      return (
        <FavoritesWidget />
      );

    case "templates":
      return (
        <TemplatesWidget />
      );

    case "tasks":
      return (
        <TasksWidget />
      );

    case "milestones":
      return (
        <MilestonesWidget />
      );

    case "notifications":
      return (
        <NotificationsWidget />
      );

    case "releases":
      return (
        <ReleasesWidget />
      );

    case "learning":
      return (
        <LearningWidget />
      );

    case "project-health":
      return (
        <ProjectHealthWidget
          projectRoot={
            projectRoot
          }
        />
      );

    default:
      return (
        <WidgetError
          message={`Unknown first-party widget: ${widgetId}`}
        />
      );
  }
}
