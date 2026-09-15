import {
  useMemo,
} from "react";

import {
  DashboardWidgetRegistry,
  setDashboardLayoutMode,
} from "../../platform/command-center";

import {
  useDashboardState,
} from "../../platform/command-center/useDashboardState";

import {
  DashboardWidgetHost,
} from "./DashboardWidgetHost";

import "./CommandCenterWorkspace.css";


export type CommandCenterWorkspaceProps = {
  profileId:
    string;
};


export function CommandCenterWorkspace({
  profileId,
}: CommandCenterWorkspaceProps) {
  const {
    state,
    setState,
    reset,
  } =
    useDashboardState(
      profileId,
    );


  const registry =
    useMemo(
      () =>
        new DashboardWidgetRegistry(),
      [],
    );


  const visibleWidgets =
    state.widgets.filter(
      (
        widget,
      ) =>
        !widget.hidden,
    );


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
            The dashboard foundation is active. First-party project, task, notification, learning, release, and health widgets will populate this surface next.
          </p>

          <div className="commandCenterEmptyPreview">
            <span />
            <span />
            <span />
          </div>
        </div>
      ) : (
        <div
          className={
            state.layoutMode ===
            "grid"
              ? "commandCenterGrid"
              : "commandCenterList"
          }
        >
          {visibleWidgets.map(
            (
              instance,
            ) => (
              <DashboardWidgetHost
                key={
                  instance.instanceId
                }
                instance={
                  instance
                }
                definition={
                  registry.get(
                    instance.widgetId,
                  )
                }
              />
            ),
          )}
        </div>
      )}
    </section>
  );
}
