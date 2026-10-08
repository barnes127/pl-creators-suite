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


const platformIndex =
  read(
    "packages/platform/src/index.ts",
  );

const healthTypes =
  read(
    "packages/platform/src/health/types.ts",
  );

const healthHook =
  read(
    "apps/renderer/src/platform/health/useHealthSnapshot.ts",
  );

const healthRail =
  read(
    "apps/renderer/src/components/health/HealthContextRail.tsx",
  );

const shellComponents =
  read(
    "apps/renderer/src/platform/shell/components.tsx",
  );

const renderer =
  read(
    "apps/renderer/src/components/workspaces/FirstPartyDashboardWidget.tsx",
  );

const app =
  read(
    "apps/renderer/src/App.tsx",
  );


check(
  platformIndex.includes(
    'export * from "./health"',
  ),
  "platform root exports shared health contracts",
);


check(
  healthTypes.includes(
    "export interface HealthSnapshot",
  ) &&
  healthTypes.includes(
    "export interface HealthSource",
  ) &&
  healthTypes.includes(
    "export interface HealthFinding",
  ),
  "shared health snapshot contracts exist",
);


check(
  healthHook.includes(
    '"health.snapshot"',
  ),
  "renderer health hook uses unified health snapshot RPC",
);


check(
  healthHook.includes(
    "projectRoot",
  ),
  "health snapshot request carries project context",
);


check(
  healthRail.includes(
    "Health Center",
  ),
  "health context rail exposes Health Center",
);


check(
  healthRail.includes(
    "snapshot.findings",
  ),
  "health context rail renders findings",
);


check(
  healthRail.includes(
    "snapshot.sources",
  ),
  "health context rail renders health sources",
);


check(
  healthRail.includes(
    "onRefresh",
  ) &&
  healthRail.includes(
    "onClose",
  ),
  "health context rail provides refresh and close controls",
);


check(
  shellComponents.includes(
    "ShellContextRail",
  ),
  "shell defines a reusable context rail",
);


check(
  shellComponents.includes(
    'aria-label="Context rail"',
  ),
  "context rail exposes an accessibility label",
);


check(
  app.includes(
    "<ShellContextRail",
  ),
  "App renders the right context rail",
);


check(
  app.includes(
    'visibility.inspector',
  ) ||
  app.includes(
    'visibility["inspector"]',
  ),
  "right context rail uses persisted inspector visibility",
);


check(
  app.includes(
    ".inspectorWidth",
  ),
  "right context rail uses persisted inspector width",
);


check(
  app.includes(
    "<HealthContextRail",
  ),
  "App mounts the Health Center inside the shell",
);


check(
  app.includes(
    'setPanel("inspector", false)',
  ) ||
  (
    app.includes(
      "setPanel(",
    ) &&
    app.includes(
      '"inspector"',
    )
  ),
  "Health Center can close through shell panel state",
);


check(
  app.includes(
    "healthSeverity={",
  ),
  "App passes health severity to the status bar",
);


check(
  app.includes(
    "healthFindingCount={",
  ),
  "App passes health finding count to the status bar",
);


check(
  shellComponents.includes(
    "healthSeverity",
  ) &&
  shellComponents.includes(
    "healthFindingCount",
  ),
  "status bar accepts health summary props",
);


check(
  shellComponents.includes(
    "shellHealthIndicator",
  ),
  "status bar renders persistent health state",
);


check(
  renderer.includes(
    "useHealthSnapshot",
  ),
  "Command Center project health uses shared health hook",
);


check(
  !renderer.includes(
    '"diagnostics.health"',
  ),
  "project health no longer calls diagnostics health directly",
);


check(
  !renderer.includes(
    '"ai.local.status"',
  ),
  "project health no longer calls local AI status directly",
);


check(
  !renderer.includes(
    '"plugins.list"',
  ),
  "project health no longer calls plugin list directly",
);


check(
  renderer.includes(
    ".overallSeverity",
  ) &&
  renderer.includes(
    ".sourceCount",
  ) &&
  renderer.includes(
    ".findingCount",
  ),
  "Command Center summarizes unified health snapshot",
);


console.log(
  `\nCommand Center health UI test complete: ${passed} passed, ${failed} failed.`,
);


if (failed > 0) {
  process.exit(1);
}
