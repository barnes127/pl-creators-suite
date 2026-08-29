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
  "index.ts",
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

const defaults =
  read(
    "defaults.ts",
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


console.log(
  `\nShell platform test complete: ${passed} passed, ${failed} failed.`,
);


if (
  failed > 0
) {
  process.exit(1);
}
