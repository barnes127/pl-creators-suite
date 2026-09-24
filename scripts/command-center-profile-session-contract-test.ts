import {
  DEFAULT_WORKSPACE_STATE,
} from "../apps/renderer/src/platform/shell/defaults";

import {
  createCreatorProfileFromShellState,
  createDefaultCreatorProfileStore,
} from "../apps/renderer/src/platform/profiles/defaults";

import {
  CREATOR_PROFILE_SCHEMA_VERSION,
} from "../apps/renderer/src/platform/profiles/types";

import {
  loadCreatorProfileStoreResult,
  migrateShellStateToCreatorProfiles,
  saveCreatorProfileStore,
} from "../apps/renderer/src/platform/profiles/storage";

import {
  normalizeCreatorProfile,
} from "../apps/renderer/src/platform/profiles/validation";

import {
  createCreatorSessionRecord,
  createEmptyCreatorSessionStore,
} from "../apps/renderer/src/platform/session/defaults";

import {
  CREATOR_SESSION_SCHEMA_VERSION,
} from "../apps/renderer/src/platform/session/types";

import {
  loadCreatorSessionStoreResult,
  saveCreatorSessionStore,
} from "../apps/renderer/src/platform/session/storage";

import {
  normalizeCreatorSessionRecord,
} from "../apps/renderer/src/platform/session/validation";

function assert(
  condition: unknown,
  message = "Assertion failed",
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
  actual: unknown,
  expected: unknown,
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

function assertDeepEqual(
  actual: unknown,
  expected: unknown,
) {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);
  if (
    actualJson !==
    expectedJson
  ) {
    throw new Error(
      `Expected ${expectedJson}, received ${actualJson}`,
    );
  }
}

class MemoryStorage {
  private readonly values =
    new Map<
      string,
      string
    >();


  getItem(
    key:
      string,
  ) {
    return this.values.get(
      key,
    ) ?? null;
  }


  setItem(
    key:
      string,
    value:
      string,
  ) {
    this.values.set(
      key,
      value,
    );
  }


  removeItem(
    key:
      string,
  ) {
    this.values.delete(
      key,
    );
  }
}


let passed =
  0;


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
  "\nPL Creators Suite — v1.3.2 Batch 1 Profile / Session Test\n",
);


test(
  "default profile store is schema-versioned",
  () => {
    const state =
      createDefaultCreatorProfileStore();

    assertEqual(
      state.schemaVersion,
      CREATOR_PROFILE_SCHEMA_VERSION,
    );

    assertEqual(
      state.profiles.length,
      1,
    );
  },
);


test(
  "legacy shell state converts into creator profile",
  () => {
    const shellState =
      structuredClone(
        DEFAULT_WORKSPACE_STATE,
      );

    shellState.activeWorkspace =
      "docs";

    shellState.profileId =
      "docs";

    shellState.zoom =
      1.25;

    shellState.layout.primarySidebarWidth =
      333;


    const profile =
      createCreatorProfileFromShellState(
        shellState,
      );


    assertEqual(
      profile.id,
      "docs",
    );

    assertEqual(
      profile.workspace,
      "docs",
    );

    assertEqual(
      profile.zoom,
      1.25,
    );

    assertEqual(
      profile.layout.primarySidebarWidth,
      333,
    );
  },
);


test(
  "legacy shell migration persists once",
  () => {
    const storage =
      new MemoryStorage();

    const shellState =
      structuredClone(
        DEFAULT_WORKSPACE_STATE,
      );

    shellState.profileId =
      "game";

    shellState.activeWorkspace =
      "game";


    const first =
      migrateShellStateToCreatorProfiles(
        shellState,
        storage,
      );


    assertEqual(
      first.activeProfileId,
      "game",
    );

    assertEqual(
      first.migratedFromShellV1,
      true,
    );


    const changedShell =
      structuredClone(
        shellState,
      );

    changedShell.activeWorkspace =
      "docs";


    const second =
      migrateShellStateToCreatorProfiles(
        changedShell,
        storage,
      );


    assertEqual(
      second.profiles[
        0
      ].workspace,
      "game",
    );
  },
);


test(
  "profile storage round-trips",
  () => {
    const storage =
      new MemoryStorage();

    const state =
      createDefaultCreatorProfileStore();

    saveCreatorProfileStore(
      state,
      storage,
    );


    const loaded =
      loadCreatorProfileStoreResult(
        storage,
      );


    assertEqual(
      loaded.status,
      "ok",
    );

    assertDeepEqual(
      loaded.state,
      state,
    );
  },
);


test(
  "corrupt profile storage recovers safely",
  () => {
    const storage =
      new MemoryStorage();

    storage.setItem(
      "pl.creator-profiles.v1",
      "{bad-json",
    );


    const loaded =
      loadCreatorProfileStoreResult(
        storage,
      );


    assertEqual(
      loaded.status,
      "recovered",
    );

    assertEqual(
      loaded.state.profiles.length,
      1,
    );
  },
);


test(
  "future profile schema is bounded as incompatible",
  () => {
    const storage =
      new MemoryStorage();

    storage.setItem(
      "pl.creator-profiles.v1",
      JSON.stringify({
        schemaVersion:
          CREATOR_PROFILE_SCHEMA_VERSION +
          1,

        profiles:
          [],
      }),
    );


    const loaded =
      loadCreatorProfileStoreResult(
        storage,
      );


    assertEqual(
      loaded.status,
      "incompatible",
    );

    assertEqual(
      loaded.sourceSchemaVersion,
      CREATOR_PROFILE_SCHEMA_VERSION +
      1,
    );
  },
);


test(
  "profile validation clamps unsafe layout values",
  () => {
    const profile =
      normalizeCreatorProfile({
        id:
          "test",

        name:
          "Test",

        kind:
          "custom",

        workspace:
          "code",

        zoom:
          99,

        layout: {
          primarySidebarWidth:
            -100,

          inspectorWidth:
            9999,

          bottomPanelHeight:
            -50,

          visibility: {
            copilot:
              false,
          },
        },
      });


    assert(
      profile,
    );

    assertEqual(
      profile.zoom,
      2,
    );

    assertEqual(
      profile.layout.primarySidebarWidth,
      160,
    );

    assertEqual(
      profile.layout.inspectorWidth,
      720,
    );

    assertEqual(
      profile.layout.bottomPanelHeight,
      100,
    );

    assertEqual(
      profile.layout.visibility.copilot,
      false,
    );
  },
);


test(
  "session store begins empty",
  () => {
    const state =
      createEmptyCreatorSessionStore();

    assertEqual(
      state.schemaVersion,
      CREATOR_SESSION_SCHEMA_VERSION,
    );

    assertEqual(
      state.activeSessionId,
      null,
    );

    assertEqual(
      state.sessions.length,
      0,
    );
  },
);


test(
  "session records enforce metadata-only resume",
  () => {
    const session =
      createCreatorSessionRecord({
        id:
          "session-1",

        profileId:
          "default",

        activeWorkspace:
          "code",
      });


    assertEqual(
      session.resumePolicy,
      "metadata-only",
    );
  },
);


test(
  "session validation cannot accept executable replay data",
  () => {
    const normalized =
      normalizeCreatorSessionRecord({
        id:
          "session-1",

        profileId:
          "default",

        activeWorkspace:
          "code",

        resumePolicy:
          "execute",

        command:
          "rm -rf /",

        workflow:
          {
            run:
              true,
          },

        taskRefs: [
          {
            id:
              "task-1",

            status:
              "running",

            execute:
              "dangerous-command",
          },
        ],
      });


    assert(
      normalized,
    );

    assertEqual(
      normalized.resumePolicy,
      "metadata-only",
    );

    assertEqual(
      "command" in
        normalized,
      false,
    );

    assertEqual(
      "workflow" in
        normalized,
      false,
    );

    assertDeepEqual(
      normalized.taskRefs,
      [
        {
          id:
            "task-1",

          status:
            "running",
        },
      ],
    );
  },
);


test(
  "session storage round-trips safe metadata",
  () => {
    const storage =
      new MemoryStorage();

    const session =
      createCreatorSessionRecord({
        id:
          "session-1",

        profileId:
          "default",

        activeWorkspace:
          "modeler",

        projectRoot:
          "/tmp/example",
      });


    const state = {
      ...createEmptyCreatorSessionStore(),

      activeSessionId:
        session.id,

      sessions: [
        session,
      ],
    };


    saveCreatorSessionStore(
      state,
      storage,
    );


    const loaded =
      loadCreatorSessionStoreResult(
        storage,
      );


    assertEqual(
      loaded.status,
      "ok",
    );

    assertEqual(
      loaded.state.activeSessionId,
      "session-1",
    );

    assertEqual(
      loaded.state.sessions[
        0
      ].projectRoot,
      "/tmp/example",
    );
  },
);


test(
  "corrupt session storage recovers safely",
  () => {
    const storage =
      new MemoryStorage();

    storage.setItem(
      "pl.creator-sessions.v1",
      "not-json",
    );


    const loaded =
      loadCreatorSessionStoreResult(
        storage,
      );


    assertEqual(
      loaded.status,
      "recovered",
    );

    assertEqual(
      loaded.state.sessions.length,
      0,
    );
  },
);


test(
  "future session schema is bounded as incompatible",
  () => {
    const storage =
      new MemoryStorage();

    storage.setItem(
      "pl.creator-sessions.v1",
      JSON.stringify({
        schemaVersion:
          CREATOR_SESSION_SCHEMA_VERSION +
          1,

        sessions:
          [],
      }),
    );


    const loaded =
      loadCreatorSessionStoreResult(
        storage,
      );


    assertEqual(
      loaded.status,
      "incompatible",
    );
  },
);


console.log(
  `\nProfile / session test complete: ${passed} passed, 0 failed.\n`,
);
