const fs =
  require("fs");

const path =
  require("path");


const root =
  path.resolve(
    __dirname,
    "..",
  );


const eventRoot =
  path.join(
    root,
    "packages",
    "platform",
    "src",
    "events",
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
      eventRoot,
      file,
    ),
    "utf8",
  );
}


console.log(
  "\nPL Creators Suite — Platform Event Bus Test\n",
);


const expectedFiles = [
  "types.ts",
  "platformEvents.ts",
  "eventBus.ts",
  "platformEventBus.ts",
  "index.ts",
];


for (
  const file
  of expectedFiles
) {
  check(
    fs.existsSync(
      path.join(
        eventRoot,
        file,
      ),
    ),
    `event module exists: ${file}`,
  );
}


const types =
  read(
    "types.ts",
  );

const events =
  read(
    "platformEvents.ts",
  );

const bus =
  read(
    "eventBus.ts",
  );

const platformBus =
  read(
    "platformEventBus.ts",
  );


check(
  types.includes(
    "PlatformEventEnvelope",
  ),
  "typed event envelope exists",
);


check(
  types.includes(
    "PlatformEventMetadata",
  ),
  "event metadata contract exists",
);


check(
  types.includes(
    "correlationId",
  ),
  "events support correlation IDs",
);


check(
  bus.includes(
    "class EventBus",
  ),
  "generic event bus exists",
);


check(
  bus.includes(
    "subscribe<",
  ),
  "typed subscription exists",
);


check(
  bus.includes(
    "unsubscribe<",
  ),
  "typed unsubscription exists",
);


check(
  bus.includes(
    "once<",
  ),
  "one-shot subscription exists",
);


check(
  bus.includes(
    "async emit<",
  ),
  "typed async event emission exists",
);


check(
  bus.includes(
    "listenerCount",
  ),
  "listener diagnostics exist",
);


check(
  bus.includes(
    "clear(",
  ),
  "listener cleanup exists",
);


const requiredDomains = [
  "project.",
  "asset.",
  "slice.",
  "engine.",
  "task.",
  "terminal.",
  "extension.",
  "ai.",
  "cloud.",
  "collaboration.",
];


for (
  const domain
  of requiredDomains
) {
  check(
    events.includes(
      `"${domain}`,
    ),
    `typed event domain exists: ${domain}`,
  );
}


check(
  events.includes(
    "PlatformEventMap",
  ),
  "shared platform event map exists",
);


check(
  platformBus.includes(
    "createPlatformEventBus",
  ),
  "platform event bus factory exists",
);


check(
  platformBus.includes(
    "PlatformEventMap",
  ),
  "platform bus uses shared typed event map",
);


console.log(
  `\nPlatform event bus test complete: ${passed} passed, ${failed} failed.`,
);


if (
  failed > 0
) {
  process.exit(1);
}
