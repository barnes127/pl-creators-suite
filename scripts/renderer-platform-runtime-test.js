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


const runtimePath =
  path.join(
    root,
    "apps",
    "renderer",
    "src",
    "platform",
    "runtime.ts",
  );

const appPath =
  path.join(
    root,
    "apps",
    "renderer",
    "src",
    "App.tsx",
  );

const packagePath =
  path.join(
    root,
    "apps",
    "renderer",
    "package.json",
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


const runtime =
  fs.readFileSync(
    runtimePath,
    "utf8",
  );

const app =
  fs.readFileSync(
    appPath,
    "utf8",
  );

const rendererPackage =
  JSON.parse(
    fs.readFileSync(
      packagePath,
      "utf8",
    ),
  );


console.log(
  "\nPL Creators Suite — Renderer Platform Runtime Test\n",
);


check(
  runtime.includes(
    'from "@pl/platform"',
  ),
  "renderer owns a production platform-package dependency",
);


check(
  runtime.includes(
    "createPlatformRuntime",
  ),
  "renderer creates the shared platform runtime",
);


check(
  runtime.includes(
    "code.workspace.activate",
  ),
  "Code registers a production platform command",
);


check(
  runtime.includes(
    "docs.workspace.activate",
  ),
  "Docs registers a production platform command",
);


check(
  app.includes(
    "bindBuiltInSliceConsumers",
  ),
  "App binds real built-in slice consumers",
);


check(
  app.includes(
    "platformRuntime.eventApi.emit",
  ),
  "App publishes real workspace activation events",
);


check(
  rendererPackage
    .dependencies?.[
      "@pl/platform"
    ] ===
    "workspace:*",
  "renderer declares @pl/platform as a workspace dependency",
);


console.log(
  `\nRenderer platform runtime test complete: ${passed} passed, ${failed} failed.`,
);


if (
  failed > 0
) {
  process.exit(
    1,
  );
}
