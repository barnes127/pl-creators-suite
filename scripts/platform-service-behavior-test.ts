import {
  ServiceRegistry,
} from "../packages/platform/src/services";

let passed = 0;

function assertEqual(
  actual: unknown,
  expected: unknown,
  message: string,
) {
  if (
    actual !==
    expected
  ) {
    throw new Error(
      `${message}: expected ${String(expected)}, received ${String(actual)}`,
    );
  }
}

function check(
  name: string,
  fn: () => void,
) {
  fn();

  passed += 1;

  console.log(
    `PASS ${passed}: ${name}`,
  );
}

const registry =
  new ServiceRegistry();

registry.register(
  {
    id: "project.read",
    version: "1.0.0",
    category: "project",
    stability: "stable",
    requiredPermissions: [
      "filesystem.read",
    ],
  },
  {
    read() {
      return "project";
    },
  },
);

registry.register(
  {
    id: "notification.show",
    version: "1.0.0",
    category: "notification",
    stability: "internal",
  },
  {
    show() {
      return "notification";
    },
  },
);

registry.register(
  {
    id: "future.query",
    version: "0.1.0",
    category: "query",
    stability: "experimental",
  },
  {},
);

registry.register(
  {
    id:
      "capability.protected",

    version:
      "1.0.0",

    category:
      "ui",

    stability:
      "internal",

    requiredCapabilities: [
      "ui.contribute",
    ],
  },
  {},
);

const privilegedContext = {
  requesterId:
    "test.privileged",

  permissions:
    new Set([
      "filesystem.read",
    ]),
};

const restrictedContext = {
  requesterId:
    "test.restricted",

  permissions:
    new Set<string>(),
};

const capabilityContext = {
  requesterId:
    "test.capability",

  permissions:
    new Set<string>(),

  capabilities:
    new Set([
      "ui.contribute",
    ]),
};

check(
  "service metadata is retained",
  () => {
    const descriptor =
      registry.describe(
        "project.read",
      );

    assertEqual(
      descriptor?.category,
      "project",
      "project service category",
    );

    assertEqual(
      descriptor?.stability,
      "stable",
      "stable service category",
    );
  },
);

check(
  "category filtering returns matching services",
  () => {
    const services =
      registry.listByCategory(
        "notification",
      );

    assertEqual(
      services.length,
      1,
      "notification service count",
    );

    assertEqual(
      services[0]?.id,
      "notification.show",
      "service notification content is discoverable",
    );
  },
);

check(
  "discoverable listing respects permissions",
  () => {
    const restricted =
      registry.listDiscoverable(
        restrictedContext,
      );

    assertEqual(
      restricted.some(
        (
          service,
        ) =>
          service.id ===
          "project.read",
      ),
      false,
      "project services not discoverable",
    );

    const privileged =
      registry.listDiscoverable(
        privilegedContext,
      );

    assertEqual(
      privileged.some(
        (
          service,
        ) =>
          service.id ===
          "project.read",
      ),
      true,
      "project services are discoverable",
    );
  },
);

check(
  "future query category is reserved without runtime implementation",
  () => {
    const services =
      registry.listByCategory(
        "query",
      );

    assertEqual(
      services.length,
      1,
      "query service count",
    );

    assertEqual(
      services[0]?.stability,
      "experimental",
      "experimental services stability"
    );
  },
);

check(
  "service discovery enforces required capabilities",
  () => {
    assertEqual(
      registry.canDiscover(
        "capability.protected",
        restrictedContext,
      ),
      false,
      "restricted context cannot discover capability-protected service",
    );

    assertEqual(
      registry.canDiscover(
        "capability.protected",
        capabilityContext,
      ),
      true,
      "capability context can discover capability-protected service",
    );
  },
);

console.log(
  `\nPlatform service behavior test complete: ${passed}/5 PASS`,
);
