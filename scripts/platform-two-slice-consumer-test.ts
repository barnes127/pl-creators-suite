import {
  createPlatformRuntime,
} from "../packages/platform/src";

type SliceId =
  | "code"
  | "docs";

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

async function main() {
const runtime =
  createPlatformRuntime();

const slices:
  readonly SliceId[] = [
    "code",
    "docs",
  ];

let passed =
  0;

function pass(
  message: string,
) {
  passed +=
    1;

  console.log(
    `PASS ${passed}: ${message}`,
  );
}

for (
  const slice
  of slices
) {
  runtime.commandApi.register({
    id:
      `${slice}.consumer.command`,

    title:
      `${slice} consumer command`,

    version:
      "1.0.0",

    keywords: [
      slice,
      "consumer-proof",
    ],

    async execute() {
      return {
        ok:
          true,

        value:
          slice,
      };
    },
  });

  runtime.searchApi.register({
    id:
      `${slice}.consumer.search`,

    kinds: [
      "file",
    ],

    async search(
      query,
    ) {
      if (
        !query.text
          .toLowerCase()
          .includes(
            slice,
          )
      ) {
        return [];
      }

      return [
        {
          id:
            `${slice}-result`,

          kind:
            "file",

          title:
            `${slice} result`,

          sourceId:
            `${slice}.consumer.search`,

          score:
            1,
        },
      ];
    },
  });

  runtime.uiApi.register({
    id:
      `${slice}.consumer.panel`,

    kind:
      "panel",

    title:
      `${slice} consumer panel`,

    sourceId:
      slice,

    requiredCapabilities: [
      "ui.contribute",
    ],
  });

  runtime.themeApi.register({
    id:
      `${slice}.consumer.theme`,

    name:
      `${slice} consumer theme`,

    sourceId:
      slice,

    mode:
      "dark",

    tokens: {
      accent:
        slice ===
        "code"
          ? "code-accent"
          : "docs-accent",
    },

    requiredCapabilities: [
      "theme.contribute",
    ],
  });

  runtime.templateApi.register({
    id:
      `${slice}.consumer.template`,

    name:
      `${slice} consumer template`,

    kind:
      slice ===
      "code"
        ? "code"
        : "document",

    sourceId:
      slice,

    payload: {
      slice,
    },

    requiredCapabilities: [
      "template.contribute",
    ],
  });

  runtime.settingsApi.set(
    {
      kind:
        "slice",

      id:
        slice,
    },
    "consumer-proof.enabled",
    true,
  );

  runtime.notifications.push({
    title:
      `${slice} consumer ready`,

    sourceId:
      slice,

    category:
      "system",
  });
}

assertEqual(
  runtime.commandApi
    .search(
      "consumer-proof",
    )
    .length,
  2,
  "Code and Docs both register shared commands",
);

pass(
  "Code and Docs consume Command API",
);

const codeSearch =
  await runtime.searchApi.search(
    {
      text:
        "code",
    },
    {
      projectRoot:
        "/test/project",
    },
  );

const docsSearch =
  await runtime.searchApi.search(
    {
      text:
        "docs",
    },
    {
      projectRoot:
        "/test/project",
    },
  );

assertEqual(
  codeSearch.length,
  1,
  "Code search provider participates",
);

assertEqual(
  docsSearch.length,
  1,
  "Docs search provider participates",
);

pass(
  "Code and Docs consume Search API",
);

const accessContext = {
  requesterId:
    "two-slice-proof",

  permissions:
    new Set<string>(),

  capabilities:
    new Set([
      "ui.contribute",
      "theme.contribute",
      "template.contribute",
    ]),
};

assertEqual(
  runtime.uiApi
    .listDiscoverable(
      accessContext,
      "panel",
    )
    .length,
  2,
  "Code and Docs UI contributions discoverable",
);

pass(
  "Code and Docs consume UI API",
);

assertEqual(
  runtime.themeApi
    .listDiscoverable(
      accessContext,
    )
    .length,
  2,
  "Code and Docs themes discoverable",
);

pass(
  "Code and Docs consume Theme API",
);

assertEqual(
  runtime.templateApi
    .listDiscoverable(
      accessContext,
    )
    .length,
  2,
  "Code and Docs templates discoverable",
);

pass(
  "Code and Docs consume Template API",
);

for (
  const slice
  of slices
) {
  assertEqual(
    runtime.settingsApi
      .resolveValue(
        "consumer-proof.enabled",
        [
          {
            kind:
              "slice",

            id:
              slice,
          },
        ],
      ),
    true,
    `${slice} settings resolve`,
  );
}

pass(
  "Code and Docs consume Settings API",
);

assertEqual(
  runtime.notifications
    .list()
    .length,
  2,
  "Code and Docs notifications retained",
);

pass(
  "Code and Docs consume Notification API",
);

const activated:
  SliceId[] =
    [];

runtime.eventApi.subscribe(
  "slice.activated",
  (
    event,
  ) => {
    if (
      event.payload.slice ===
        "code" ||
      event.payload.slice ===
        "docs"
    ) {
      activated.push(
        event.payload.slice,
      );
    }
  },
);

for (
  const slice
  of slices
) {
  await runtime.eventApi.emit(
    "slice.activated",
    {
      slice,
    },
    {
      source:
        "renderer",
    },
  );
}

assertEqual(
  activated.length,
  2,
  "Code and Docs events observed",
);

pass(
  "Code and Docs consume Event API",
);

console.log(
  `\nPlatform two-slice consumer test complete: ${passed}/8 PASS`,
);
}

main().catch(
  (
    error,
  ) => {
    console.error(
      error,
    );

    throw error;
  },
);
