const fs =
  require("fs");

const path =
  require("path");


const root =
  path.resolve(
    __dirname,
    "..",
  );

const shellRoot =
  path.join(
    root,
    "apps",
    "renderer",
    "src",
    "platform",
    "shell",
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


function read(
  file,
) {
  return fs.readFileSync(
    path.join(
      shellRoot,
      file,
    ),
    "utf8",
  );
}


console.log(
  "\nPL Creators Suite — Shell Platform Test\n",
);


const expected = [
  "types.ts",
  "defaults.ts",
  "storage.ts",
  "state.ts",
  "components.tsx",
  "index.ts",
  "useShellState.ts",
  "shortcuts.ts",
  "useShellShortcuts.ts"
];


for (
  const file
  of expected
) {
  check(
    fs.existsSync(
      path.join(
        shellRoot,
        file,
      ),
    ),
    `shell module exists: ${file}`,
  );
}


const types =
  read(
    "types.ts",
  );

const storage =
  read(
    "storage.ts",
  );

const state =
  read(
    "state.ts",
  );

const components =
  read(
    "components.tsx",
  );

const defaults =
  read(
    "defaults.ts",
  );

const hook =
  read(
    "useShellState.ts",
  );

const shortcuts =
  read(
    "shortcuts.ts",
  );

const shortcutHook =
  read(
    "useShellShortcuts.ts",
  );


check(
  shortcuts.includes(
    "findShortcutConflicts",
  ),
  "shell shortcut conflict service exists",
);


check(
  shortcutHook.includes(
    "useShellShortcuts",
  ),
  "shell shortcut React integration exists",
);


check(
  components.includes(
    "ShellSaveIndicator",
  ),
  "shared save-state indicator exists",
);

check(
  types.includes(
    "ShellWorkspaceState",
  ),
  "workspace state contract exists",
);


check(
  types.includes(
    "ShellPanelLayout",
  ),
  "panel layout contract exists",
);


check(
  types.includes(
    "ShellSaveState",
  ),
  "shared save-state contract exists",
);


check(
  defaults.includes(
    "BUILT_IN_WORKSPACE_PROFILES",
  ),
  "built-in workspace profiles exist",
);


check(
  storage.includes(
    "pl.shell.workspace-state.v1",
  ),
  "shell persistence is versioned",
);


check(
  storage.includes(
    "normalizeShellState",
  ),
  "persisted state is normalized",
);


check(
  storage.includes(
    "resetShellState",
  ),
  "layout reset contract exists",
);


check(
  state.includes(
    "togglePanel",
  ),
  "panel toggle helper exists",
);


check(
  state.includes(
    "setShellZoom",
  ),
  "shell zoom helper exists",
);


check(
  state.includes(
    "setActiveWorkspace",
  ),
  "workspace state helper exists",
);

check(
  components.includes(
    "ApplicationShell",
  ),
  "application shell component exists",
);


check(
  components.includes(
    "ShellSidebar",
  ),
  "shared sidebar region exists",
);


check(
  components.includes(
    "ShellMain",
  ),
  "shared main region exists",
);


check(
  components.includes(
    "ShellTopBar",
  ),
  "shared top-bar region exists",
);


check(
  components.includes(
    "ShellWorkspaceRegion",
  ),
  "shared workspace region exists",
);


check(
  components.includes(
    "ShellBottomPanel",
  ),
  "shared bottom-panel region exists",
);


check(
  components.includes(
    "ShellStatusBar",
  ),
  "shared status-bar region exists",
);

check(
  hook.includes(
    "loadShellState",
  ),
  "shell hook loads persistent state",
);


check(
  hook.includes(
    "saveShellState",
  ),
  "shell hook persists state",
);


check(
  hook.includes(
    "resetShellState",
  ),
  "shell hook exposes reset behavior",
);


check(
  hook.includes(
    "setWorkspace",
  ),
  "shell hook exposes workspace switching",
);


check(
  hook.includes(
    "setProfile",
  ),
  "shell hook exposes workspace profiles",
);


check(
  hook.includes(
    "setPanel",
  ),
  "shell hook exposes panel visibility",
);


check(
  state.includes(
    "setShellThemeMode",
  ),
  "shell theme-state helper exists",
);


check(
  hook.includes(
    "setThemeMode",
  ),
  "shell hook exposes theme switching",
);


check(
  components.includes(
    "data-theme",
  ),
  "application shell exposes theme state",
);


check(
  components.includes(
    "data-zoom",
  ),
  "application shell exposes zoom state",
);


check(
  components.includes(
    "transformOrigin",
  ),
  "application shell supports whole-interface scaling",
);


console.log(
  `\nShell platform test complete: ${passed} passed, ${failed} failed.`,
);


if (
  failed > 0
) {
  process.exit(1);
}
