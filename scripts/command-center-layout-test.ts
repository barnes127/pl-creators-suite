import {
  DASHBOARD_SCHEMA_VERSION,
  addDashboardWidget,
  createDefaultDashboardState,
  createDefaultWidgetInstance,
  moveDashboardWidget,
  normalizeDashboardState,
  removeDashboardWidget,
  resizeDashboardWidget,
  setDashboardLayoutMode,
  setDashboardWidgetGroup,
  setDashboardWidgetHidden,
  setDashboardWidgetPinned,
} from "../apps/renderer/src/platform/command-center";


let passed =
  0;


function assert(
  condition:
    unknown,
  message:
    string,
) {
  if (
    !condition
  ) {
    throw new Error(
      message,
    );
  }

  passed +=
    1;

  console.log(
    `PASS ${passed}: ${message}`,
  );
}


function main() {
  let state =
    createDefaultDashboardState(
      "code",
    );


  state =
    addDashboardWidget(
      state,
      createDefaultWidgetInstance(
        "recents",
        "1.0.0",
        0,
      ),
    );


  assert(
    state.widgets.length ===
      1,
    "widget instance can be added",
  );


  state =
    moveDashboardWidget(
      state,
      "recents:default",
      2,
      3,
      4,
    );


  assert(
    state.widgets[0]
      ?.position.column ===
      2 &&
    state.widgets[0]
      ?.position.row ===
      3 &&
    state.widgets[0]
      ?.position.order ===
      4,
    "widget position can be updated",
  );


  state =
    resizeDashboardWidget(
      state,
      "recents:default",
      {
        columns:
          3,

        rows:
          4,
      },
    );


  assert(
    state.widgets[0]
      ?.size.columns ===
      3 &&
    state.widgets[0]
      ?.size.rows ===
      4,
    "widget size can be updated",
  );


  state =
    setDashboardWidgetPinned(
      state,
      "recents:default",
      true,
    );


  assert(
    state.widgets[0]
      ?.pinned ===
      true,
    "widget can be pinned",
  );


  state =
    setDashboardWidgetHidden(
      state,
      "recents:default",
      true,
    );


  assert(
    state.widgets[0]
      ?.hidden ===
      true,
    "widget can be hidden",
  );


  state =
    setDashboardWidgetGroup(
      state,
      "recents:default",
      "projects",
    );


  assert(
    state.widgets[0]
      ?.groupId ===
      "projects",
    "widget can be grouped",
  );


  state =
    setDashboardLayoutMode(
      state,
      "list",
    );


  assert(
    state.layoutMode ===
      "list",
    "dashboard layout mode can change",
  );


  const normalized =
    normalizeDashboardState(
      "docs",
      {
        schemaVersion:
          DASHBOARD_SCHEMA_VERSION,

        profileId:
          "wrong-profile",

        layoutMode:
          "list",

        widgets: [
          createDefaultWidgetInstance(
            "tasks",
            "1.0.0",
            0,
          ),
        ],
      },
    );


  assert(
    normalized.profileId ===
      "docs",
    "loaded dashboard state remains owned by requested profile",
  );


  assert(
    normalized.widgets.length ===
      1,
    "valid persisted widget survives normalization",
  );


  const corrupt =
    normalizeDashboardState(
      "default",
      {
        schemaVersion:
          DASHBOARD_SCHEMA_VERSION,

        widgets: [
          {
            instanceId:
              "",

            widgetId:
              "broken",
          },

          createDefaultWidgetInstance(
            "notifications",
            "1.0.0",
            1,
          ),
        ],
      },
    );


  assert(
    corrupt.widgets.length ===
      1 &&
    corrupt.widgets[0]
      ?.widgetId ===
      "notifications",
    "corrupt widget entries are discarded without losing valid widgets",
  );


  const wrongVersion =
    normalizeDashboardState(
      "default",
      {
        schemaVersion:
          999,

        layoutMode:
          "list",

        widgets: [
          createDefaultWidgetInstance(
            "tasks",
            "1.0.0",
            0,
          ),
        ],
      },
    );


  assert(
    wrongVersion.schemaVersion ===
      DASHBOARD_SCHEMA_VERSION &&
    wrongVersion.layoutMode ===
      "grid" &&
    wrongVersion.widgets.length ===
      0,
    "unsupported persisted schema safely resets to defaults",
  );


  state =
    removeDashboardWidget(
      state,
      "recents:default",
    );


  assert(
    state.widgets.length ===
      0,
    "widget instance can be removed",
  );


  console.log(
    `\nCommand Center layout test complete: ${passed}/${passed} PASS`,
  );
}


main();
