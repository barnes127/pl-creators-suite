declare const process: {exitCode?: number};
import {
  getDashboardWidgetCompatibility,
  reconcileDashboardStateWithDefinitions,
} from "../apps/renderer/src/platform/command-center/compatibility";

import type {
  DashboardProfileState,
  DashboardWidgetDefinition,
  DashboardWidgetInstance,
} from "../apps/renderer/src/platform/command-center/types";


let passed =
  0;

let failed =
  0;


function check(
  name:
    string,
  condition:
    boolean,
) {
  if (
    condition
  ) {
    passed +=
      1;

    console.log(
      `PASS ${passed}: ${name}`,
    );

    return;
  }

  failed +=
    1;

  console.error(
    `FAIL: ${name}`,
  );
}


const definition = {
  id:
    "sample.widget",
  contractVersion:
    1,
  version:
    "1.2.0",
  title:
    "Sample Widget",
  source: {
    kind:
      "extension",
    id:
      "sample.extension",
  },
  defaultSize: {
    columns:
      2,
    rows:
      2,
  },
} as DashboardWidgetDefinition;


function widget(
  version:
    string,
): DashboardWidgetInstance {
  return {
    instanceId:
      "sample-instance",
    widgetId:
      "sample.widget",
    widgetVersion:
      version,
    position: {
      column:
        0,
      row:
        0,
      order:
        0,
    },
    size: {
      columns:
        2,
      rows:
        2,
    },
    pinned:
      false,
    hidden:
      false,
  };
}


function state(
  instance:
    DashboardWidgetInstance,
): DashboardProfileState {
  return {
    schemaVersion:
      2,
    profileId:
      "profile-a",
    layoutMode:
      "grid",
    widgets: [
      instance,
    ],
  };
}


check(
  "exact widget version is compatible",
  getDashboardWidgetCompatibility(
    widget(
      "1.2.0",
    ),
    definition,
  ).state ===
    "compatible",
);


check(
  "same-major widget version is compatible",
  getDashboardWidgetCompatibility(
    widget(
      "1.0.0",
    ),
    definition,
  ).state ===
    "compatible",
);


check(
  "same-major saved version migrates to current definition version",
  reconcileDashboardStateWithDefinitions(
    state(
      widget(
        "1.0.0",
      ),
    ),
    [
      definition,
    ],
  ).widgets[0]
    ?.widgetVersion ===
    "1.2.0",
);


check(
  "major-version mismatch is incompatible",
  getDashboardWidgetCompatibility(
    widget(
      "2.0.0",
    ),
    definition,
  ).state ===
    "incompatible-version",
);


check(
  "major-version mismatch is not silently rewritten",
  reconcileDashboardStateWithDefinitions(
    state(
      widget(
        "2.0.0",
      ),
    ),
    [
      definition,
    ],
  ).widgets[0]
    ?.widgetVersion ===
    "2.0.0",
);


check(
  "missing definition is represented explicitly",
  getDashboardWidgetCompatibility(
    widget(
      "1.2.0",
    ),
    undefined,
  ).state ===
    "missing",
);


check(
  "missing widgets survive reconciliation for bounded recovery",
  reconcileDashboardStateWithDefinitions(
    state(
      widget(
        "1.2.0",
      ),
    ),
    [],
  ).widgets.length ===
    1,
);


console.log(
  `\nCommand Center compatibility test complete: ${passed} passed, ${failed} failed.`,
);


if (
  failed >
  0
) {
  process.exitCode =
    1;
}
