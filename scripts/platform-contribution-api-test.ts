import {
  ContributionCapabilityError,
  ThemeApi,
  ThemeRegistry,
  TemplateApi,
  TemplateRegistry,
  UiApi,
  UiContributionRegistry,
} from "../packages/platform/src";

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

function assertThrows(
  fn: () => unknown,
  expected:
    new (...args: any[]) => Error,
  message: string,
) {
  try {
    fn();
  } catch (
    error
  ) {
    if (
      error instanceof
      expected
    ) {
      return;
    }

    throw error;
  }

  throw new Error(
    `${message}: expected function to throw`,
  );
}

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

const restrictedContext = {
  requesterId:
    "test.restricted",

  permissions:
    new Set<string>(),

  capabilities:
    new Set<string>(),
};

const uiContext = {
  requesterId:
    "test.ui",

  permissions:
    new Set<string>(),

  capabilities:
    new Set([
      "ui.contribute",
      "theme.contribute",
      "template.contribute",
    ]),
};

const uiRegistry =
  new UiContributionRegistry();

const uiApi =
  new UiApi(
    uiRegistry,
  );

uiApi.register({
  id:
    "test.panel",

  kind:
    "panel",

  title:
    "Test Panel",

  sourceId:
    "test",

  requiredCapabilities: [
    "ui.contribute",
  ],
});

assertEqual(
  uiApi
    .list(
      "panel",
    )
    .length,
  1,
  "UI contribution registration",
);

pass(
  "UI contribution registration works",
);

assertThrows(
  () =>
    uiApi.discover(
      "test.panel",
      restrictedContext,
    ),
  ContributionCapabilityError,
  "restricted UI contribution discovery",
);

assertEqual(
  uiApi.discover(
    "test.panel",
    uiContext,
  )?.id,
  "test.panel",
  "authorized UI contribution discovery",
);

pass(
  "UI contribution capability enforcement works",
);

const themeRegistry =
  new ThemeRegistry();

const themeApi =
  new ThemeApi(
    themeRegistry,
  );

themeApi.register({
  id:
    "test.theme",

  name:
    "Test Theme",

  sourceId:
    "test",

  mode:
    "dark",

  tokens: {
    background:
      "#000000",

    foreground:
      "#ffffff",
  },

  requiredCapabilities: [
    "theme.contribute",
  ],
});

assertEqual(
  themeApi
    .listDiscoverable(
      restrictedContext,
    )
    .length,
  0,
  "restricted theme discovery",
);

assertEqual(
  themeApi
    .listDiscoverable(
      uiContext,
    )
    .length,
  1,
  "authorized theme discovery",
);

pass(
  "Theme capability enforcement works",
);

const templateRegistry =
  new TemplateRegistry();

const templateApi =
  new TemplateApi(
    templateRegistry,
  );

templateApi.register({
  id:
    "test.template",

  name:
    "Test Template",

  kind:
    "project",

  sourceId:
    "test",

  payload: {
    version:
      1,
  },

  requiredCapabilities: [
    "template.contribute",
  ],
});

assertEqual(
  templateApi
    .listDiscoverable(
      restrictedContext,
    )
    .length,
  0,
  "restricted template discovery",
);

assertEqual(
  templateApi
    .listDiscoverable(
      uiContext,
    )
    .length,
  1,
  "authorized template discovery",
);

pass(
  "Template capability enforcement works",
);

assertEqual(
  uiApi
    .listDiscoverable(
      uiContext,
      "panel",
    )
    .length,
  1,
  "UI discoverable filtering",
);

pass(
  "UI discoverable filtering works",
);

assertEqual(
  themeApi
    .get(
      "test.theme",
    )
    ?.tokens
    .background,
  "#000000",
  "theme token data retained",
);

pass(
  "Theme token data remains declarative",
);

assertEqual(
  templateApi
    .get(
      "test.template",
    )
    ?.kind,
  "project",
  "template metadata retained",
);

pass(
  "Template metadata remains declarative",
);

console.log(
  `\nPlatform contribution API test complete: ${passed}/6 PASS`,
);
