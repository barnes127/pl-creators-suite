const fs =
  require(
    "fs",
  );

const path =
  require(
    "path",
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
  label,
) {
  if (
    condition
  ) {
    console.log(
      `PASS    ${label}`,
    );

    passed +=
      1;

    return;
  }

  console.error(
    `FAIL    ${label}`,
  );

  failed +=
    1;
}


const workspace =
  read(
    "apps/renderer/src/components/workspaces/CommandCenterWorkspace.tsx",
  );

const host =
  read(
    "apps/renderer/src/components/workspaces/DashboardWidgetHost.tsx",
  );

const controls =
  read(
    "apps/renderer/src/components/workspaces/DashboardWidgetControls.tsx",
  );

const panel =
  read(
    "apps/renderer/src/components/workspaces/DashboardCustomizationPanel.tsx",
  );

const storage =
  read(
    "apps/renderer/src/platform/command-center/storage.ts",
  );

const defaults =
  read(
    "apps/renderer/src/platform/command-center/defaults.ts",
  );

const extensions =
  read(
    "apps/renderer/src/platform/command-center/extensionWidgets.ts",
  );

const pluginRegistry =
  read(
    "apps/desktop/services/plugins/registry.js",
  );

const pluginDiscovery =
  read(
    "apps/desktop/services/plugins/discovery.js",
  );


check(
  controls.includes(
    "sizeBounds",
  ),
  "widget controls respect declared size bounds",
);

check(
  workspace.includes(
    "Customize",
  ),
  "dashboard exposes customization mode",
);

check(
  workspace.includes(
    "setDashboardWidgetPinned",
  ),
  "dashboard wires pinning",
);

check(
  workspace.includes(
    "setDashboardWidgetHidden",
  ),
  "dashboard wires hiding",
);

check(
  workspace.includes(
    "resizeDashboardWidget",
  ),
  "dashboard wires resizing",
);

check(
  workspace.includes(
    "setDashboardWidgetGroup",
  ),
  "dashboard wires grouping",
);

check(
  workspace.includes(
    "reorderDashboardWidget",
  ),
  "dashboard wires ordering",
);

check(
  panel.includes(
    "Show",
  ),
  "hidden widgets are recoverable",
);

check(
  workspace.includes(
    "Restore Defaults",
  ),
  "empty dashboard can restore defaults",
);

check(
  defaults.includes(
    "DASHBOARD_SCHEMA_VERSION =\n  2",
  ),
  "dashboard persistence schema advanced",
);

check(
  storage.includes(
    "parsed?.schemaVersion ===",
  ),
  "legacy dashboard state has migration path",
);

check(
  extensions.includes(
    "dashboardWidgets",
  ),
  "extension dashboard contribution contract exists",
);

check(
  extensions.includes(
    "undeclared permission",
  ),
  "extension widgets reject undeclared permissions",
);

check(
  pluginDiscovery.includes(
    "contributes: manifest.contributes",
  ),
  "plugin discovery retains contributions",
);

check(
  pluginRegistry.includes(
    "contributes:",
  ),
  "plugin registry persists contributions",
);

check(
  host.includes(
    "definition.metadata?.content",
  ),
  "extension widgets use declarative content",
);

check(
  !host.includes(
    "eval(",
  ) &&
  !host.includes(
    "new Function",
  ),
  "widget host does not execute extension code",
);

check(
  host.includes(
    "DashboardWidgetErrorBoundary",
  ),
  "widget errors remain isolated",
);


console.log(
  `\nCommand Center customization test complete: ${passed} passed, ${failed} failed.`,
);


if (
  failed >
  0
) {
  process.exitCode =
    1;
}
