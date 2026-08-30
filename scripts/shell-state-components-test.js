const fs =
  require("fs");

const path =
  require("path");


const root =
  path.resolve(
    __dirname,
    "..",
  );

const statesPath =
  path.join(
    root,
    "apps",
    "renderer",
    "src",
    "platform",
    "shell",
    "states.tsx",
  );

const appPath =
  path.join(
    root,
    "apps",
    "renderer",
    "src",
    "App.tsx",
  );

const cssPath =
  path.join(
    root,
    "apps",
    "renderer",
    "src",
    "app.css",
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


const states =
  fs.readFileSync(
    statesPath,
    "utf8",
  );

const app =
  fs.readFileSync(
    appPath,
    "utf8",
  );

const css =
  fs.readFileSync(
    cssPath,
    "utf8",
  );


console.log(
  "\nPL Creators Suite — Shared Shell State Components Test\n",
);


const componentNames = [
  "ShellState",
  "LoadingState",
  "EmptyState",
  "ErrorState",
  "DisabledState",
  "WarningState",
  "PermissionState",
  "DestructiveState",
];


for (
  const component
  of componentNames
) {
  check(
    states.includes(
      component,
    ),
    `shared state component exists: ${component}`,
  );
}


const stateKinds = [
  "loading",
  "empty",
  "error",
  "disabled",
  "warning",
  "permission",
  "destructive",
];


for (
  const kind
  of stateKinds
) {
  check(
    states.includes(
      `"${kind}"`,
    ),
    `shared state kind exists: ${kind}`,
  );
}


check(
  states.includes(
    "aria-live",
  ),
  "state surfaces expose live-region behavior",
);


check(
  states.includes(
    'role="alert"' ,
  ) ||
  states.includes(
    '"alert"',
  ),
  "urgent states support alert semantics",
);


check(
  app.includes(
    "LoadingState",
  ),
  "App consumes shared loading state",
);


check(
  app.includes(
    "EmptyState",
  ),
  "App consumes shared empty state",
);


check(
  app.includes(
    "WarningState",
  ),
  "App consumes shared warning state",
);


check(
  css.includes(
    ".shellState-error",
  ),
  "error state styling exists",
);


check(
  css.includes(
    ".shellState-permission",
  ),
  "permission state styling exists",
);


check(
  css.includes(
    ".shellState-destructive",
  ),
  "destructive state styling exists",
);


console.log(
  `\nShared state components test complete: ${passed} passed, ${failed} failed.`,
);


if (
  failed > 0
) {
  process.exit(1);
}
