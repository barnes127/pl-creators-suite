const fs =
  require(
    "node:fs",
  );

const path =
  require(
    "node:path",
  );


const root =
  path.resolve(
    __dirname,
    "..",
  );


function read(
  relativePath,
) {
  return fs.readFileSync(
    path.join(
      root,
      relativePath,
    ),
    "utf8",
  );
}


let passed =
  0;

let failed =
  0;


function check(
  condition,
  message,
) {
  if (
    condition
  ) {
    passed +=
      1;

    console.log(
      `PASS    ${message}`,
    );

    return;
  }

  failed +=
    1;

  console.error(
    `FAIL    ${message}`,
  );
}


const definitions =
  read(
    "apps/renderer/src/platform/command-center/firstPartyWidgets.ts",
  );

const storage =
  read(
    "apps/renderer/src/platform/command-center/storage.ts",
  );

const workspace =
  read(
    "apps/renderer/src/components/workspaces/CommandCenterWorkspace.tsx",
  );

const host =
  read(
    "apps/renderer/src/components/workspaces/DashboardWidgetHost.tsx",
  );

const renderer =
  read(
    "apps/renderer/src/components/workspaces/FirstPartyDashboardWidget.tsx",
  );

const app =
  read(
    "apps/renderer/src/App.tsx",
  );


const widgetIds =
  [
    "recents",
    "favorites",
    "templates",
    "tasks",
    "milestones",
    "notifications",
    "releases",
    "learning",
    "project-health",
  ];


for (
  const widgetId
  of widgetIds
) {
  check(
    definitions.includes(
      `"${widgetId}"`,
    ),
    `first-party definition exists: ${widgetId}`,
  );
}


check(
  definitions.includes(
    "DASHBOARD_WIDGET_CONTRACT_VERSION",
  ),
  "first-party widgets use versioned dashboard contract",
);


check(
  definitions.includes(
    "createFirstPartyDashboardInstances",
  ),
  "default first-party instances are created",
);


check(
  definitions.includes(
    "populateFirstPartyDashboardState",
  ),
  "empty dashboards can receive first-party defaults",
);


check(
  storage.includes(
    "populateFirstPartyDashboardState",
  ),
  "dashboard loading migrates empty Batch-3 state",
);


check(
  workspace.includes(
    "registerFirstPartyDashboardWidgets",
  ),
  "Command Center registers first-party definitions",
);


check(
  host.includes(
    'definition.source.kind ===',
  ) &&
  host.includes(
    '"first-party"',
  ),
  "widget host separates first-party rendering from extension widgets",
);


check(
  host.includes(
    "FirstPartyDashboardWidget",
  ),
  "widget host mounts first-party renderer",
);


check(
  renderer.includes(
    '"recent.list"',
  ),
  "recents widget uses real recent project RPC",
);


check(
  renderer.includes(
    '"tasks.list"',
  ),
  "tasks widget uses real task RPC",
);


check(
  renderer.includes(
    "platformRuntime" +
    "\n" +
    "      .templateApi",
  ) ||
  renderer.includes(
    "templateApi",
  ),
  "templates widget uses shared Template API",
);


check(
  renderer.includes(
    ".notifications",
  ),
  "notifications widget uses shared Notification API",
);


check(
  renderer.includes(
    '"app.metadata"',
  ),
  "releases widget uses real app metadata",
);


check(
  renderer.includes(
    '"diagnostics.health"',
  ),
  "project health uses diagnostics service",
);


check(
  renderer.includes(
    '"ai.local.status"',
  ),
  "project health includes local AI state",
);


check(
  renderer.includes(
    '"plugins.list"',
  ),
  "project health includes plugin state without mutating discovery",
);


check(
  app.includes(
    "projectRoot={",
  ) &&
  app.includes(
    "CommandCenterWorkspace",
  ),
  "App passes current project context to Command Center",
);


check(
  renderer.includes(
    "No favorites yet",
  ),
  "favorites uses an intentional empty state",
);


check(
  renderer.includes(
    "No milestone provider connected",
  ),
  "milestones use an intentional empty state",
);


check(
  renderer.includes(
    "No learning provider connected",
  ),
  "learning uses an intentional empty state",
);


console.log(
  `\nCommand Center first-party widget test complete: ${passed} passed, ${failed} failed.`,
);


if (
  failed >
  0
) {
  process.exit(
    1,
  );
}
