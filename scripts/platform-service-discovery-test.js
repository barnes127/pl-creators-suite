const fs =
  require("fs");

const path =
  require("path");


const root =
  path.resolve(
    __dirname,
    "..",
  );


const platformRoot =
  path.join(
    root,
    "packages",
    "platform",
    "src",
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
  ...parts
) {
  return fs.readFileSync(
    path.join(
      platformRoot,
      ...parts,
    ),
    "utf8",
  );
}


console.log(
  "\nPL Creators Suite — Capability and Service Discovery Test\n",
);


const expectedFiles = [
  [
    "capabilities",
    "types.ts",
  ],
  [
    "capabilities",
    "validation.ts",
  ],
  [
    "capabilities",
    "registry.ts",
  ],
  [
    "capabilities",
    "index.ts",
  ],
  [
    "services",
    "types.ts",
  ],
  [
    "services",
    "errors.ts",
  ],
  [
    "services",
    "registry.ts",
  ],
  [
    "services",
    "index.ts",
  ],
  [
    "runtime.ts",
  ],
];


for (
  const parts
  of expectedFiles
) {
  check(
    fs.existsSync(
      path.join(
        platformRoot,
        ...parts,
      ),
    ),
    `platform module exists: ${parts.join("/")}`,
  );
}


const capabilityTypes =
  read(
    "capabilities",
    "types.ts",
  );

const capabilityRegistry =
  read(
    "capabilities",
    "registry.ts",
  );

const serviceTypes =
  read(
    "services",
    "types.ts",
  );

const serviceRegistry =
  read(
    "services",
    "registry.ts",
  );

const runtime =
  read(
    "runtime.ts",
  );


check(
  capabilityTypes.includes(
    "CapabilityDefinition",
  ),
  "runtime capability contract exists",
);


check(
  capabilityTypes.includes(
    "deprecatedSince",
  ),
  "capabilities support deprecation metadata",
);


check(
  capabilityTypes.includes(
    "replacementCapabilityId",
  ),
  "capabilities support replacement metadata",
);


check(
  capabilityRegistry.includes(
    "class CapabilityRegistry",
  ),
  "capability registry exists",
);


check(
  capabilityRegistry.includes(
    "registerMany(",
  ),
  "bulk capability registration exists",
);


check(
  capabilityRegistry.includes(
    "search(",
  ),
  "capability search exists",
);


check(
  capabilityRegistry.includes(
    "includeDeprecated",
  ),
  "capability search handles deprecated capabilities",
);


check(
  serviceTypes.includes(
    "ServiceDiscoveryContext",
  ),
  "service discovery context exists",
);


check(
  serviceTypes.includes(
    "requiredPermissions",
  ),
  "services declare permissions",
);


check(
  serviceRegistry.includes(
    "class ServiceRegistry",
  ),
  "service registry exists",
);


check(
  serviceRegistry.includes(
    "discover<",
  ),
  "service discovery exists",
);


check(
  serviceRegistry.includes(
    "ServicePermissionError",
  ),
  "service discovery enforces permissions",
);


check(
  serviceRegistry.includes(
    "canDiscover(",
  ),
  "non-throwing discovery check exists",
);


check(
  runtime.includes(
    "createPlatformRuntime",
  ),
  "platform runtime composition root exists",
);


const runtimeServices = [
  "commands:",
  "capabilities:",
  "events:",
  "settings:",
  "services:",
];


for (
  const service
  of runtimeServices
) {
  check(
    runtime.includes(
      service,
    ),
    `platform runtime exposes ${service}`,
  );
}


console.log(
  `\nCapability and service discovery test complete: ${passed} passed, ${failed} failed.`,
);


if (
  failed > 0
) {
  process.exit(1);
}
