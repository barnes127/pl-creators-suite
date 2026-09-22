import "./CommandCenterWorkspace.css";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  rpc,
} from "../../rpc";

import type {
  PluginInfo,
} from "../../types/app";

import {
  DashboardWidgetRegistry,
  registerFirstPartyDashboardWidgets,
  setDashboardLayoutMode,
  addDashboardWidget,
  createExtensionDashboardWidgetDefinitions,
  reorderDashboardWidget,
  resizeDashboardWidget,
  setDashboardWidgetGroup,
  setDashboardWidgetHidden,
  setDashboardWidgetPinned,
  reconcileDashboardStateWithDefinitions,
  removeDashboardWidget,
} from "../../platform/command-center";

import {
  DashboardCustomizationPanel,
} from "./DashboardCustomizationPanel";

import type {
  DashboardUnavailableWidget,
} from "./DashboardCustomizationPanel";

import {
  useDashboardState,
} from "../../platform/command-center/useDashboardState";

import {
  DashboardWidgetHost,
} from "./DashboardWidgetHost";


export type CommandCenterWorkspaceProps = {
  profileId:
    string;

  projectRoot:
    string,
};


export function CommandCenterWorkspace({
  profileId,
  projectRoot
}: CommandCenterWorkspaceProps) {
  const [customizing, setCustomizing] = useState(false);
  const [plugins, setPlugins] = useState< PluginInfo[] >([]);
  const {state, setState, reset} = useDashboardState(profileId);

  useEffect(
    () => {
      let active = true;
      rpc<{
        plugins: PluginInfo[];
      }>(
        "plugins.list",
      )
        .then(
          (
            result,
          ) => {
            if (
              active
            ) {
              setPlugins(
                result.plugins ??
                [],
              );
            }
          },
        )
        .catch(
          () => {
            if (
              active
            ) {
              setPlugins(
                [],
              );
            }
          },
        );
      return () => {
        active =
          false;
      };
    },
    [],
  );

  const registryResult =
    useMemo(
      () => {
        const nextRegistry =
           new DashboardWidgetRegistry();
        const unavailable:
          DashboardUnavailableWidget[] =
            [];
        const issues:
          string[] =
        [];
        for (
          const plugin of
          plugins
        ) {
          if (
            plugin.enabled !== false
          ) {
            continue;
          }
          const dashboardWidgets =
            plugin.contributes
              ?.dashboardWidgets;
          if (
            !Array.isArray(
              dashboardWidgets,
            )
          ) {
            continue;
          }
          for (
            const contribution of
            dashboardWidgets
          ) {
            if (
              !contribution ||
              typeof contribution !==
                "object" ||
              Array.isArray(
                contribution,
              )
            ) {
              continue;
            }
            const record =
              contribution as Record<
                string,
                unknown
              >;
            const contributionId =
              typeof record.id ===
              "string"
                ? record.id.trim()
                : "";
            const title =
              typeof record.title ===
              "string"
                ? record.title.trim()
                : contributionId;
            if (
              !contributionId
            ) {
              continue;
            }
            unavailable.push({
              id:
                `${plugin.id}.${contributionId}`,
              title:
                title ||
                contributionId,
              sourceId:
                plugin.id,
              state:
                "disabled",
              reason:
                "The extension providing this widget is disabled.",
            });
          }
        }
        registerFirstPartyDashboardWidgets(
          (
            definition,
          ) => {
            nextRegistry.register(
              definition,
            );
          },
        );
        const extensionResult =
          createExtensionDashboardWidgetDefinitions(
            plugins,
          );
        issues.push(
          ...extensionResult.issues,
        );
        for (
          const definition
          of extensionResult.definitions
        ) {
          try {
            nextRegistry.register(
              definition,
            );
          } catch (
            error
          ) {
            unavailable.push({
              id:
                definition.id,
              title:
                definition.title,
              sourceId:
                definition.source.id,
              state:
                "incompatible",
              reason:
                error instanceof
                  Error
                  ? error.message
                  : "The widget definition is incompatible with this dashboard runtime.",
            });
          }
        }
        return {
          registry:
            nextRegistry,
          issues,
          unavailable,
        };
      },
      [
        plugins,
      ],
    );

  const registry = registryResult.registry;
  useEffect(
    () => {
      setState(
        (current) =>
          reconcileDashboardStateWithDefinitions(
            current,
            registry.list(),
          ),
      );
    },
    [
      registry,
      setState,
    ],
  );
  const visibleWidgets =
    state.widgets
      .filter(
        (
          widget,
        ) =>
          !widget.hidden,
      )
      .sort(
        (
          left,
          right,
        ) =>
          Number(
            right.pinned,
          ) -
            Number(
              left.pinned,
            ) ||
          left.position.order -
            right.position.order,
      );

  const widgetGroups =
    useMemo(
      () => {
        const groups =
          new Map<
            string,
            typeof visibleWidgets
          >();

        for (
          const widget
          of visibleWidgets
        ) {
          const groupId =
            widget.groupId?.trim() ||
            "";

          const current =
            groups.get(
              groupId,
            ) ??
            [];

          groups.set(
            groupId,
            [
              ...current,
              widget,
            ],
          );
        }

        return Array.from(
          groups.entries(),
        );
      },
      [
        visibleWidgets,
      ],
    );

  const removeWidget =
    (
      instanceId:
        string,
    ) => {
      setState(
        (current) =>
          removeDashboardWidget(
            current,
            instanceId,
          ),
      );
    };

  function changeLayout(
    layoutMode:
      "grid" |
      "list",
    ) {
    setState(
      (
        current,
      ) =>
        setDashboardLayoutMode(
          current,
          layoutMode,
        ),
    );
  }

  function updatePinned(
    instanceId:
      string,
    pinned:
      boolean,
  ) {
    setState(
      (
        current,
      ) =>
        setDashboardWidgetPinned(
          current,
          instanceId,
          pinned,
        ),
    );
  }

  function updateHidden(
    instanceId:
      string,
    hidden:
      boolean,
  ) {
    setState(
      (
        current,
      ) =>
        setDashboardWidgetHidden(
          current,
          instanceId,
          hidden,
        ),
    );
  }

  function updateSize(
    instanceId:
      string,
    size:
      {
        columns:
          number;
        rows:
          number;
      },
  ) {
    setState(
      (
        current,
      ) =>
        resizeDashboardWidget(
          current,
          instanceId,
          size,
        ),
    );
  }

  function updateGroup(
    instanceId:
      string,
    groupId?:
      string,
  ) {
    setState(
      (
        current,
      ) =>
        setDashboardWidgetGroup(
          current,
          instanceId,
          groupId,
        ),
    );
  }

  function moveWidget(
    instanceId:
      string,
    direction:
      "up" |
      "down",
  ) {
    setState(
      (
        current,
      ) =>
        reorderDashboardWidget(
          current,
          instanceId,
          direction,
        ),
    );
  }


  function addWidget(
    definition:
      import(
        "../../platform/command-center"
      ).DashboardWidgetDefinition,
  ) {
    setState(
      (
        current,
      ) => {
        const nextOrder =
          current.widgets.reduce(
            (
              highest,
              widget,
            ) =>
              Math.max(
                highest,
                widget.position.order,
              ),
            -1,
          ) +
          1;

        return addDashboardWidget(
          current,
          {
            instanceId:
              `${definition.id}:${crypto.randomUUID()}`,
            widgetId:
              definition.id,
            widgetVersion:
              definition.version,
            position: {
              column:
                0,
              row:
                nextOrder,
              order:
                nextOrder,
            },
            size:
              definition.defaultSize,
            pinned:
              definition.defaultPinned ??
              false,
            hidden:
              definition.defaultHidden ??
              false,
            groupId:
              definition.defaultGroupId,
          },
        );
      },
    );
  }

  return (
    <section className="commandCenterWorkspace">
      <header className="commandCenterHeader">
        <div>
          <span className="commandCenterEyebrow">
            PL Creators Suite
          </span>

          <h1>
            Command Center
          </h1>

          <p>
            Your suite-wide workspace for projects, tasks, health, learning, and creator operations.
          </p>
        </div>

        <div className="commandCenterHeaderActions">
          <div
            className="commandCenterLayoutToggle"
            aria-label="Dashboard layout"
          >
            <button
              type="button"
              className={
                state.layoutMode ===
                "grid"
                  ? "commandCenterToggleActive"
                  : ""
              }
              aria-pressed={
                state.layoutMode ===
                "grid"
              }
              onClick={
                () =>
                  changeLayout(
                    "grid",
                  )
              }
            >
              Grid
            </button>

            <button
              type="button"
              className={
                state.layoutMode ===
                "list"
                  ? "commandCenterToggleActive"
                  : ""
              }
              aria-pressed={
                state.layoutMode ===
                "list"
              }
              onClick={
                () =>
                  changeLayout(
                    "list",
                  )
              }
            >
              List
            </button>
          </div>

          <button
            type="button"
            className={
              customizing
                ? "btn commandCenterToggleActive"
                : "btn btn-subtle"
            }
            aria-pressed={customizing}
            aria-label={
              customizing
                ? "Finish dashboard customization"
                : "Customize dashboard"
            }
            onClick={
              () =>
                setCustomizing(
                  (
                    current,
                  ) =>
                    !current,
                )
            }
          >
            {customizing
              ? "Done"
              : "Customize"}
          </button>

          <button
            type="button"
            className="btn btn-subtle"
            onClick={
              reset
            }
          >
            Reset Dashboard
          </button>
        </div>
      </header>


      <div className="commandCenterStatusRow">
        <span>
          Profile
          <strong>
            {profileId}
          </strong>
        </span>

        <span>
          Visible widgets
          <strong>
            {visibleWidgets.length}
          </strong>
        </span>

        <span>
          Layout
          <strong>
            {state.layoutMode}
          </strong>
        </span>
      </div>

      {customizing && (
        <DashboardCustomizationPanel
          widgets={state.widgets}
          definitions={registry.list()}
          issues={registryResult.issues}
          unavailable={registryResult.unavailable}
          onShow={(instanceId) => updateHidden(instanceId,false)}
          onAdd={addWidget}
          onMove={moveWidget}
          onRemove={removeWidget}
        />
      )}

      {visibleWidgets.length ===
      0 ? (
        <div className="commandCenterEmpty">
          <div className="commandCenterEmptyIcon">
            PL
          </div>

          <h2>
            Your Command Center is ready
          </h2>

          <p>
            No widgets are currently visible. Customize the dashboard to restore hidden widgets, add available extension widgets, or reset to the default layout.
          </p>

          <div className="commandCenterEmptyActions">
            <button
              type="button"
              className="btn btn-subtle"
              onClick={
                () =>
                  setCustomizing(
                    true,
                  )
              }
            >
              Customize Dashboard
            </button>

            <button
              type="button"
              className="btn btn-subtle"
              onClick={reset}
            >
              Restore Defaults
            </button>
          </div>

          <div className="commandCenterEmptyPreview">
            <span />
            <span />
            <span />
          </div>
        </div>
      ) : (
        <div className="commandCenterGroups">
          {widgetGroups.map(
            (
              [
                groupId,
                widgets,
              ],
            ) => (
              <section
                className="commandCenterWidgetGroup"
                key={groupId || "ungrouped"}
              >
                {groupId && (
                  <h2 className="commandCenterWidgetGroupTitle">
                    {groupId}
                  </h2>
                )}
                <div
                  className={
                    state.layoutMode ===
                    "grid"
                      ? "commandCenterGrid"
                      : "commandCenterList"
                  }
                >
                  {widgets.map(
                    (instance) => (
                      <DashboardWidgetHost
                        key={instance.instanceId}
                        instance={instance}
                        definition={registry.get(instance.widgetId)}
                        projectRoot={projectRoot}
                        customizing={customizing}
                        onPinnedChange={
                          (pinned) =>
                            updatePinned(
                              instance.instanceId,
                              pinned,
                            )
                        }
                        onHiddenChange={
                          (hidden) =>
                            updateHidden(
                              instance.instanceId,
                              hidden,
                            )
                        }
                        onSizeChange={
                          (size) =>
                            updateSize(
                              instance.instanceId,
                              size,
                            )
                        }
                        onGroupChange={
                          (groupId) =>
                            updateGroup(
                              instance.instanceId,
                              groupId,
                            )
                        }
                      />
                    ),
                  )}
                </div>
              </section>
            ),
          )}
        </div>
      )}
    </section>
  );
}
