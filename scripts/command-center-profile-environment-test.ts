import {
  DEFAULT_WORKSPACE_STATE,
} from "../apps/renderer/src/platform/shell/defaults";

import {
  createBuiltInCreatorProfiles,
  ensureBuiltInCreatorProfiles,
  getActiveCreatorProfile,
} from "../apps/renderer/src/platform/profiles/builtIns";

import {
  createDefaultCreatorProfileStore,
} from "../apps/renderer/src/platform/profiles/defaults";

import {
  applyCreatorProfileToShellState,
  captureCreatorProfileEnvironment,
} from "../apps/renderer/src/platform/profiles/environment";

import {
  applyCreatorShortcutOverrides,
} from "../apps/renderer/src/platform/profiles/shortcuts";

import {
  exportCreatorProfile,
  importCreatorProfile,
} from "../apps/renderer/src/platform/profiles/transfer";


let passed =
  0;


function assert(
  condition:
    unknown,
  message =
    "Assertion failed",
): asserts condition {
  if (
    !condition
  ) {
    throw new Error(
      message,
    );
  }
}


function assertEqual(
  actual:
    unknown,
  expected:
    unknown,
) {
  if (
    actual !==
    expected
  ) {
    throw new Error(
      `Expected ${String(
        expected,
      )}, received ${String(
        actual,
      )}`,
    );
  }
}


function test(
  name:
    string,
  run:
    () => void,
) {
  run();

  passed +=
    1;

  console.log(
    `PASS ${passed}: ${name}`,
  );
}


console.log(
  "\nPL Creators Suite — v1.3.2 Batch 2 Profile Environment Test\n",
);


test(
  "eight creator profile templates exist",
  () => {
    const profiles =
      createBuiltInCreatorProfiles();

    assertEqual(
      profiles.length,
      8,
    );
  },
);


test(
  "creator profile names match roadmap roles",
  () => {
    const names =
      createBuiltInCreatorProfiles()
        .map(
          (
            profile,
          ) =>
            profile.name,
        );

    for (
      const name of [
        "Writing",
        "Data",
        "Development",
        "Modeling",
        "Animation",
        "Game",
        "Research",
        "Custom",
      ]
    ) {
      assert(
        names.includes(
          name,
        ),
        `Missing profile: ${name}`,
      );
    }
  },
);


test(
  "legacy store is expanded without losing legacy profile",
  () => {
    const store =
      createDefaultCreatorProfileStore();

    const ensured =
      ensureBuiltInCreatorProfiles(
        store,
      );

    assert(
      ensured.profiles.some(
        (
          profile,
        ) =>
          profile.id ===
          "default",
      ),
    );

    assert(
      ensured.profiles.some(
        (
          profile,
        ) =>
          profile.name ===
          "Development",
      ),
    );
  },
);


test(
  "development profile opens code workspace",
  () => {
    const profile =
      createBuiltInCreatorProfiles()
        .find(
          (
            candidate,
          ) =>
            candidate.name ===
            "Development",
        );

    assert(
      profile,
    );

    assertEqual(
      profile.workspace,
      "code",
    );
  },
);


test(
  "modeling profile opens modeler workspace",
  () => {
    const profile =
      createBuiltInCreatorProfiles()
        .find(
          (
            candidate,
          ) =>
            candidate.name ===
            "Modeling",
        );

    assert(
      profile,
    );

    assertEqual(
      profile.workspace,
      "modeler",
    );
  },
);


test(
  "profile environment applies to shell",
  () => {
    const profile =
      createBuiltInCreatorProfiles()
        .find(
          (
            candidate,
          ) =>
            candidate.name ===
            "Modeling",
        );

    assert(
      profile,
    );


    const shell =
      applyCreatorProfileToShellState(
        structuredClone(
          DEFAULT_WORKSPACE_STATE,
        ),
        profile,
      );


    assertEqual(
      shell.profileId,
      profile.id,
    );

    assertEqual(
      shell.activeWorkspace,
      "modeler",
    );

    assertEqual(
      shell.layout.inspectorWidth,
      360,
    );
  },
);


test(
  "shell environment captures back into profile",
  () => {
    const profile =
      createBuiltInCreatorProfiles()[
        0
      ];

    const shell =
      structuredClone(
        DEFAULT_WORKSPACE_STATE,
      );

    shell.activeWorkspace =
      "docs";

    shell.zoom =
      1.25;

    shell.layout.primarySidebarWidth =
      333;

    shell.layout.visibility.copilot =
      false;


    const captured =
      captureCreatorProfileEnvironment(
        profile,
        shell,
      );


    assertEqual(
      captured.workspace,
      "docs",
    );

    assertEqual(
      captured.zoom,
      1.25,
    );

    assertEqual(
      captured.layout.primarySidebarWidth,
      333,
    );

    assertEqual(
      captured.toolVisibility.copilot,
      false,
    );
  },
);


test(
  "shortcut override changes binding",
  () => {
    const result =
      applyCreatorShortcutOverrides(
        [
          {
            id:
              "workspace.code",

            label:
              "Code",

            shortcut:
              "ctrl+1",

            execute() {},
          },
        ],
        {
          "workspace.code":
            "ctrl+shift+1",
        },
      );


    assertEqual(
      result[
        0
      ].shortcut,
      "ctrl+shift+1",
    );
  },
);


test(
  "null shortcut override disables binding",
  () => {
    const result =
      applyCreatorShortcutOverrides(
        [
          {
            id:
              "workspace.code",

            label:
              "Code",

            shortcut:
              "ctrl+1",

            execute() {},
          },
        ],
        {
          "workspace.code":
            null,
        },
      );


    assertEqual(
      result.length,
      0,
    );
  },
);


test(
  "extension stacks default to inheritance",
  () => {
    for (
      const profile
      of createBuiltInCreatorProfiles()
    ) {
      assertEqual(
        profile.extensionStackMode,
        "inherit",
      );
    }
  },
);


test(
  "profile export and import round-trip",
  () => {
    const source =
      createBuiltInCreatorProfiles()[
        0
      ];

    const serialized =
      exportCreatorProfile(
        source,
      );

    const imported =
      importCreatorProfile(
        serialized,
        "imported-writing",
      );


    assertEqual(
      imported.id,
      "imported-writing",
    );

    assertEqual(
      imported.name,
      source.name,
    );

    assertEqual(
      imported.kind,
      "custom",
    );
  },
);


test(
  "active profile can be resolved from ensured store",
  () => {
    const initial =
      createDefaultCreatorProfileStore();

    const ensured =
      ensureBuiltInCreatorProfiles(
        initial,
      );

    const active =
      getActiveCreatorProfile(
        ensured,
      );

    assert(
      active,
    );

    assertEqual(
      active.id,
      ensured.activeProfileId,
    );
  },
);


console.log(
  `\nProfile environment test complete: ${passed} passed, 0 failed.\n`,
);
