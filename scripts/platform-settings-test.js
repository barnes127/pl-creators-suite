const fs =
  require("fs");

const path =
  require("path");


const root =
  path.resolve(
    __dirname,
    "..",
  );


const settingsRoot =
  path.join(
    root,
    "packages",
    "platform",
    "src",
    "settings",
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


function read(
  file,
) {
  return fs.readFileSync(
    path.join(
      settingsRoot,
      file,
    ),
    "utf8",
  );
}


console.log(
  "\nPL Creators Suite — Platform Settings Test\n",
);


const expectedFiles = [
  "types.ts",
  "scopes.ts",
  "store.ts",
  "access.ts",
  "index.ts",
];


for (
  const file
  of expectedFiles
) {
  check(
    fs.existsSync(
      path.join(
        settingsRoot,
        file,
      ),
    ),
    `settings module exists: ${file}`,
  );
}


const types =
  read(
    "types.ts",
  );

const scopes =
  read(
    "scopes.ts",
  );

const store =
  read(
    "store.ts",
  );

const access =
  read(
    "access.ts",
  );


const requiredScopes = [
  "application",
  "profile",
  "project",
  "slice",
  "language",
  "extension",
  "provider",
];


for (
  const scope
  of requiredScopes
) {
  check(
    types.includes(
      `"${scope}"`,
    ),
    `settings scope exists: ${scope}`,
  );
}


check(
  scopes.includes(
    "SETTINGS_SCOPE_PRECEDENCE",
  ),
  "settings precedence contract exists",
);


check(
  scopes.includes(
    "settingsScopeKey",
  ),
  "settings scope serialization exists",
);


check(
  store.includes(
    "class SettingsStore",
  ),
  "settings store exists",
);


check(
  store.includes(
    "set(",
  ),
  "scoped setting write exists",
);


check(
  store.includes(
    "get(",
  ),
  "scoped setting read exists",
);


check(
  store.includes(
    "setMany(",
  ),
  "bulk scoped setting write exists",
);


check(
  store.includes(
    "resolve(",
  ),
  "layered setting resolution exists",
);


check(
  store.includes(
    "resolveValue(",
  ),
  "resolved setting value helper exists",
);


check(
  store.includes(
    "clearScope(",
  ),
  "scope cleanup exists",
);


check(
  access.includes(
    "getStringSetting",
  ),
  "typed string setting access exists",
);


check(
  access.includes(
    "getNumberSetting",
  ),
  "typed number setting access exists",
);


check(
  access.includes(
    "getBooleanSetting",
  ),
  "typed boolean setting access exists",
);


check(
  access.includes(
    "getSetting<",
  ),
  "generic setting access exists",
);


console.log(
  `\nPlatform settings test complete: ${passed} passed, ${failed} failed.`,
);


if (
  failed > 0
) {
  process.exit(1);
}
