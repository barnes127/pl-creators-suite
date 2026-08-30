const fs =
  require("fs");

const path =
  require("path");


const root =
  path.resolve(
    __dirname,
    "..",
  );


const shortcutsPath =
  path.join(
    root,
    "apps",
    "renderer",
    "src",
    "platform",
    "shell",
    "shortcuts.ts",
  );

const hookPath =
  path.join(
    root,
    "apps",
    "renderer",
    "src",
    "platform",
    "shell",
    "useShellShortcuts.ts",
  );

const appPath =
  path.join(
    root,
    "apps",
    "renderer",
    "src",
    "App.tsx",
  );

const componentsPath =
  path.join(
    root,
    "apps",
    "renderer",
    "src",
    "platform",
    "shell",
    "components.tsx",
  );


let passed = 0;
let failed = 0;


function check(
  condition,
  message,
) {
  if (
    condition
  ) {
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


const shortcuts =
  fs.readFileSync(
    shortcutsPath,
    "utf8",
  );

const hook =
  fs.readFileSync(
    hookPath,
    "utf8",
  );

const app =
  fs.readFileSync(
    appPath,
    "utf8",
  );

const components =
  fs.readFileSync(
    componentsPath,
    "utf8",
  );


console.log(
  "\nPL Creators Suite — Shell Shortcut Test\n",
);


check(
  shortcuts.includes(
    "normalizeShortcut",
  ),
  "shortcut normalization exists",
);


check(
  shortcuts.includes(
    "keyboardEventToShortcut",
  ),
  "keyboard events map to shortcuts",
);


check(
  shortcuts.includes(
    "findShortcutConflicts",
  ),
  "shortcut conflict detection exists",
);


check(
  shortcuts.includes(
    "assertNoShortcutConflicts",
  ),
  "shortcut conflict enforcement exists",
);


check(
  shortcuts.includes(
    "isEditableShortcutTarget",
  ),
  "editable controls are protected",
);


check(
  hook.includes(
    'addEventListener(',
  ) &&
  hook.includes(
    '"keydown"',
  ),
  "shortcut hook registers keyboard listener",
);


check(
  hook.includes(
    "preventDefault",
  ),
  "matched shortcuts prevent duplicate browser behavior",
);


for (
  let index = 1;
  index <= 6;
  index += 1
) {
  check(
    app.includes(
      `ctrl+${index}`,
    ),
    `workspace shortcut exists: Ctrl+${index}`,
  );
}


check(
  app.includes(
    "ctrl+0",
  ),
  "zoom reset shortcut exists",
);


check(
  app.includes(
    "ctrl+shift+h",
  ),
  "high-contrast shortcut exists",
);


check(
  app.includes(
    "ctrl+shift+l",
  ),
  "layout reset shortcut exists",
);


check(
  components.includes(
    "ShellSaveIndicator",
  ),
  "shared save indicator exists",
);


check(
  components.includes(
    "Unsaved changes",
  ),
  "save indicator exposes dirty state",
);


check(
  app.includes(
    "suiteHasUnsavedChanges",
  ),
  "App aggregates real slice dirty states",
);


console.log(
  `\nShell shortcut test complete: ${passed} passed, ${failed} failed.`,
);


if (
  failed > 0
) {
  process.exit(1);
}
