const fs =
  require("fs");

const path =
  require("path");


const root =
  path.resolve(
    __dirname,
    "..",
  );


const commandRoot =
  path.join(
    root,
    "packages",
    "platform",
    "src",
    "commands",
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
      commandRoot,
      file,
    ),
    "utf8",
  );
}


console.log(
  "\nPL Creators Suite — Platform Command Registry Test\n",
);


const expectedFiles = [
  "types.ts",
  "errors.ts",
  "validation.ts",
  "registry.ts",
  "index.ts",
];


for (
  const file
  of expectedFiles
) {
  check(
    fs.existsSync(
      path.join(
        commandRoot,
        file,
      ),
    ),
    `command module exists: ${file}`,
  );
}


const types =
  read(
    "types.ts",
  );

const registry =
  read(
    "registry.ts",
  );

const validation =
  read(
    "validation.ts",
  );

const platformIndex =
  fs.readFileSync(
    path.join(
      root,
      "packages",
      "platform",
      "src",
      "index.ts",
    ),
    "utf8",
  );

check(
  platformIndex.includes(
    'export * from "./settings"',
  ),
  "platform package exports settings",
);

check(
  platformIndex.includes(
    'export * from "./commands"',
  ),
  "platform package exports commands",
);


check(
  platformIndex.includes(
    'export * from "./events"',
  ),
  "platform package exports events",
);

check(
  types.includes(
    "CommandDefinition",
  ),
  "typed command definition exists",
);


check(
  types.includes(
    "CommandContext",
  ),
  "command execution context exists",
);


check(
  types.includes(
    "requiredPermissions",
  ),
  "commands support permission declarations",
);


check(
  types.includes(
    "deprecatedSince",
  ),
  "commands support deprecation metadata",
);


check(
  registry.includes(
    "class CommandRegistry",
  ),
  "command registry exists",
);


check(
  registry.includes(
    "register(",
  ),
  "command registration exists",
);


check(
  registry.includes(
    "unregister(",
  ),
  "command unregistration exists",
);


check(
  registry.includes(
    "search(",
  ),
  "command search exists",
);


check(
  registry.includes(
    "execute<",
  ),
  "command execution exists",
);


check(
  registry.includes(
    "CommandPermissionError",
  ),
  "command execution enforces permissions",
);


check(
  validation.includes(
    "deprecated",
  ),
  "deprecation validation exists",
);


check(
  validation.includes(
    "replacementCommandId",
  ),
  "replacement-command validation exists",
);


console.log(
  `\nPlatform command registry test complete: ${passed} passed, ${failed} failed.`,
);


if (
  failed > 0
) {
  process.exit(1);
}
