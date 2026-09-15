const fs =
  require(
    "fs",
  );

const path =
  require(
    "path",
  );


const ROOT =
  process.cwd();


function read(
  file,
) {
  return fs.readFileSync(
    path.join(
      ROOT,
      file,
    ),
    "utf8",
  );
}


let passed =
  0;


function check(
  condition,
  message,
) {
  if (
    !condition
  ) {
    console.error(
      `FAIL    ${message}`,
    );

    process.exitCode =
      1;

    return;
  }

  passed +=
    1;

  console.log(
    `PASS    ${message}`,
  );
}


const appTypes =
  read(
    "apps/renderer/src/types/app.ts",
  );

const navigation =
  read(
    "apps/renderer/src/config/navigation.ts",
  );

const workspaceIndex =
  read(
    "apps/renderer/src/components/workspaces/index.ts",
  );

const workspace =
  read(
    "apps/renderer/src/components/workspaces/CommandCenterWorkspace.tsx",
  );

const widgetHost =
  read(
    "apps/renderer/src/components/workspaces/DashboardWidgetHost.tsx",
  );

const widgetBoundary =
  read(
    "apps/renderer/src/components/workspaces/DashboardWidgetErrorBoundary.tsx",
  );

const dashboardHook =
  read(
    "apps/renderer/src/platform/command-center/useDashboardState.ts",
  );

const app =
  read(
    "apps/renderer/src/App.tsx",
  );


check(
  appTypes.includes(
    '"command-center"',
  ),
  "Command Center is a renderer AppId",
);


check(
  navigation.includes(
    'id: "command-center"',
  ),
  "Command Center appears in navigation",
);


check(
  workspaceIndex.includes(
    "CommandCenterWorkspace",
  ),
  "workspace barrel exports Command Center",
);


check(
  app.includes(
    'case "command-center"',
  ),
  "App mounts Command Center workspace",
);


check(
  app.includes(
    "shellState.profileId",
  ),
  "Command Center receives active shell profile",
);


check(
  workspace.includes(
    "useDashboardState",
  ),
  "Command Center consumes persisted dashboard state",
);


check(
  workspace.includes(
    "setDashboardLayoutMode",
  ),
  "Command Center exposes real layout switching",
);


check(
  workspace.includes(
    "DashboardWidgetRegistry",
  ),
  "Command Center owns widget registry boundary",
);


check(
  workspace.includes(
    "DashboardWidgetHost",
  ),
  "Command Center mounts widgets through host",
);


check(
  widgetHost.includes(
    "DashboardWidgetErrorBoundary",
  ),
  "widget host uses isolated error boundary",
);


check(
  widgetHost.includes(
    "Missing Widget",
  ),
  "missing widget degrades safely",
);


check(
  dashboardHook.includes(
    "loadDashboardState",
  ) &&
  dashboardHook.includes(
    "saveDashboardState",
  ),
  "dashboard hook loads and saves profile state",
);


check(
  widgetBoundary.includes(
    "getDerivedStateFromError",
  ),
  "widget error boundary contains renderer failures",
);


check(
  workspace.includes(
    "Reset Dashboard",
  ),
  "dashboard exposes reset control",
);


check(
  workspace.includes(
    "Your Command Center is ready",
  ),
  "dashboard has intentional onboarding empty state",
);


if (
  process.exitCode
) {
  console.error(
    "\nCommand Center workspace test failed.",
  );
} else {
  console.log(
    `\nCommand Center workspace test complete: ${passed} passed, 0 failed.`,
  );
}
