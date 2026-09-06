import {
  assertTaskTransition,
  canTransitionTaskStatus,
  isTerminalTaskStatus,
  normalizeTaskProgress,
  FormatAdapterRegistry,
  type FormatAdapter,
} from "../packages/platform/src";

let passed = 0;

function check(
  condition: boolean,
  label: string,
): void {
  if (
    !condition
  ) {
    throw new Error(
      `FAIL: ${label}`,
    );
  }

  passed += 1;

  console.log(
    `PASS ${passed}: ${label}`,
  );
}

check(
  canTransitionTaskStatus(
    "queued",
    "running",
  ),
  "queued transitions to running",
);

check(
  canTransitionTaskStatus(
    "running",
    "completed",
  ),
  "running transitions to completed",
);

check(
  !canTransitionTaskStatus(
    "completed",
    "running",
  ),
  "completed task cannot restart",
);

check(
  isTerminalTaskStatus(
    "cancelled",
  ) &&
    isTerminalTaskStatus(
      "interrupted",
    ),
  "cancelled and interrupted are terminal",
);

let invalidTransitionThrew =
  false;

try {
  assertTaskTransition(
    "failed",
    "running",
  );
} catch {
  invalidTransitionThrew =
    true;
}

check(
  invalidTransitionThrew,
  "invalid failed to running transition throws",
);

const derivedProgress =
  normalizeTaskProgress({
    completed: 25,
    total: 100,
  });

check(
  derivedProgress.percent ===
    25,
  "progress derives percentage from completed and total",
);

const clampedProgress =
  normalizeTaskProgress({
    completed: 150,
    total: 100,
    percent: 250,
  });

check(
  clampedProgress.completed ===
    100 &&
    clampedProgress.percent ===
      100,
  "progress clamps completed and percent",
);

const registry =
  new FormatAdapterRegistry();

const adapter:
  FormatAdapter = {
    descriptor: {
      id: "test.json",
      displayName:
        "Test JSON",

      category:
        "data",

      extensions: [
        ".json",
      ],

      mimeTypes: [
        "application/json",
      ],

      direction:
        "both",

      supportsPreview:
        true,

      supportsCancellation:
        true,

      supportsRoundTrip:
        true,
    },
  };

registry.register(
  adapter,
);

check(
  registry.get(
    "test.json",
  ) === adapter,
  "registry stores adapter",
);

check(
  registry.findByExtension(
    "JSON",
  ).length ===
    1 &&
    registry.findForPath(
      "/tmp/example.JSON",
    ).length ===
      1,
  "registry resolves normalized and case-insensitive extensions",
);

check(
  registry.findByExtension(
    ".json",
    "import",
  ).length ===
    1 &&
    registry.findByExtension(
      ".json",
      "export",
    ).length ===
      1,
  "both direction supports import and export",
);

let duplicateThrew =
  false;

try {
  registry.register(
    adapter,
  );
} catch {
  duplicateThrew =
    true;
}

check(
  duplicateThrew,
  "duplicate adapter registration rejected",
);

check(
  registry.unregister(
    "test.json",
  ) &&
    registry.get(
      "test.json",
    ) ===
      null,
  "adapter unregister works",
);

console.log(
  `${passed}/12 PASS`,
);
