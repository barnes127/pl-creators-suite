import {
  DASHBOARD_SCHEMA_VERSION,
  DASHBOARD_WIDGET_CONTRACT_VERSION,
  FIRST_PARTY_WIDGET_IDS,
  DashboardWidgetRegistry,
  DashboardWidgetValidationError,
  createDefaultDashboardState,
} from "../apps/renderer/src/platform/command-center";


let passed =
  0;


function pass(
  message:
    string,
) {
  passed +=
    1;

  console.log(
    `PASS ${passed}: ${message}`,
  );
}


function assert(
  condition:
    unknown,
  message:
    string,
) {
  if (
    !condition
  ) {
    throw new Error(
      message,
    );
  }

  pass(
    message,
  );
}


function assertThrows(
  callback:
    () => void,
  message:
    string,
) {
  let threw =
    false;

  try {
    callback();
  } catch {
    threw =
      true;
  }

  assert(
    threw,
    message,
  );
}


function createWidget(
  id:
    string,
) {
  return {
    id,

    contractVersion:
      DASHBOARD_WIDGET_CONTRACT_VERSION,

    version:
      "1.0.0",

    title:
      `Widget ${id}`,

    source: {
      kind:
        "first-party" as const,

      id:
        "pl-creators-suite",
    },

    defaultSize: {
      columns:
        2,

      rows:
        2,
    },

    sizeBounds: {
      min: {
        columns:
          1,

        rows:
          1,
      },

      max: {
        columns:
          4,

        rows:
          4,
      },
    },

    requiredPermissions:
      [],

    requiredCapabilities:
      [],
  };
}


function main() {
  const defaultState =
    createDefaultDashboardState(
      "default",
    );


  assert(
    defaultState.schemaVersion ===
      DASHBOARD_SCHEMA_VERSION,
    "default dashboard state uses current schema version",
  );


  assert(
    defaultState.profileId ===
      "default",
    "dashboard state belongs to a profile",
  );


  assert(
    defaultState.layoutMode ===
      "grid",
    "default dashboard layout is grid",
  );


  assert(
    defaultState.widgets.length ===
      0,
    "default dashboard state begins without instantiated widgets",
  );


  assert(
    FIRST_PARTY_WIDGET_IDS.length ===
      9,
    "all nine roadmap first-party widget IDs are reserved",
  );


  const registry =
    new DashboardWidgetRegistry();


  const unregister =
    registry.register(
      createWidget(
        "recents",
      ),
    );


  assert(
    registry.has(
      "recents",
    ),
    "widget registration succeeds",
  );


  assert(
    registry.get(
      "recents",
    )?.source.kind ===
      "first-party",
    "widget source ownership is retained",
  );


  assertThrows(
    () =>
      registry.register(
        createWidget(
          "recents",
        ),
      ),
    "duplicate widget IDs are rejected",
  );


  registry.register({
    ...createWidget(
      "extension.example",
    ),

    source: {
      kind:
        "extension",

      id:
        "example.extension",
    },

    requiredPermissions: [
      "project.read",
    ],

    requiredCapabilities: [
      "ui.contribute",
    ],
  });


  assert(
    registry.listBySource(
      "extension",
    ).length ===
      1,
    "extension widget metadata is represented without executable injection",
  );


  assertThrows(
    () =>
      registry.register({
        ...createWidget(
          "bad.contract",
        ),

        contractVersion:
          999,
      }),
    "unsupported widget contract versions are rejected",
  );


  assertThrows(
    () =>
      registry.register({
        ...createWidget(
          "bad.version",
        ),

        version:
          "latest",
      }),
    "malformed widget versions are rejected",
  );


  assertThrows(
    () =>
      registry.register({
        ...createWidget(
          "bad.bounds",
        ),

        defaultSize: {
          columns:
            5,

          rows:
            2,
        },
      }),
    "default widget size outside declared bounds is rejected",
  );


  let validationError =
    false;

  try {
    registry.register({
      ...createWidget(
        " ",
      ),
    });
  } catch (
    error
  ) {
    validationError =
      error instanceof
      DashboardWidgetValidationError;
  }


  assert(
    validationError,
    "blank widget IDs fail with typed validation error",
  );


  unregister();


  assert(
    !registry.has(
      "recents",
    ),
    "widget unregister removes definition",
  );


  console.log(
    `\nCommand Center contract test complete: ${passed}/${passed} PASS`,
  );
}


main();
