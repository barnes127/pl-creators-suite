const fs =
  require("fs");

const path =
  require("path");


const root =
  path.resolve(
    __dirname,
    "..",
  );

const appPath =
  path.join(
    root,
    "apps",
    "renderer",
    "src",
    "App.tsx",
  );


let passed = 0;
let failed = 0;


function check(
  condition,
  message,
) {
  if (condition) {
    passed += 1;

    console.log(
      `PASS    ${message}`,
    );

    return;
  }

  failed += 1;

  console.error(
    `FAIL    ${message}`,
  );
}


const app =
  fs.readFileSync(
    appPath,
    "utf8",
  );


console.log(
  "\nPL Creators Suite — Shell Integration Test\n",
);


check(
  app.includes(
    "ApplicationShell",
  ),
  "App uses shared application shell",
);


check(
  app.includes(
    "ShellSidebar",
  ),
  "App uses shared sidebar region",
);


check(
  app.includes(
    "ShellMain",
  ),
  "App uses shared main region",
);


check(
  app.includes(
    "ShellTopBar",
  ),
  "App uses shared top bar",
);


check(
  app.includes(
    "ShellWorkspaceRegion",
  ),
  "App uses shared workspace region",
);


check(
  app.includes(
    "ShellBottomPanel",
  ),
  "App uses shared bottom-panel region",
);


check(
  app.includes(
    "ShellStatusBar",
  ),
  "App uses shared status bar",
);


check(
  !app.includes(
    '<div className="shell">',
  ),
  "App no longer owns raw shell root markup",
);


check(
  !app.includes(
    '<main className="main">',
  ),
  "App no longer owns raw main shell markup",
);


check(
  !app.includes(
    '<header className="topbar">',
  ),
  "App no longer owns raw top-bar markup",
);


check(
  !app.includes(
    '<footer className="statusbar">',
  ),
  "App no longer owns raw status-bar markup",
);


check(
  app.includes(
    "useShellState",
  ),
  "App consumes persistent shell state",
);


check(
  app.includes(
    "BUILT_IN_WORKSPACE_PROFILES",
  ),
  "App exposes built-in workspace profiles",
);


check(
  app.includes(
    "Reset Layout",
  ),
  "App exposes layout reset control",
);


check(
  !app.includes(
    "pl.layout.copilotDrawerOpen",
  ),
  "legacy Copilot drawer persistence removed",
);


check(
  !app.includes(
    "pl.layout.physicsDrawerOpen",
  ),
  "legacy physics drawer persistence removed",
);


check(
  app.includes(
    'setPanel(',
  ),
  "App routes drawer visibility through shell state",
);

console.log(
  `\nShell integration test complete: ${passed} passed, ${failed} failed.`,
);

check(
  app.includes(
    "setZoom",
  ),
  "App exposes shell zoom control",
);


check(
  app.includes(
    "setThemeMode",
  ),
  "App exposes shell theme control",
);


check(
  app.includes(
    "Interface zoom",
  ),
  "App provides accessible zoom selector",
);


check(
  app.includes(
    "High Contrast",
  ),
  "App provides high-contrast control",
);


check(
  app.includes(
    "aria-pressed",
  ),
  "contrast toggle exposes pressed state",
);

if (
  failed > 0
) {
  process.exit(1);
}
