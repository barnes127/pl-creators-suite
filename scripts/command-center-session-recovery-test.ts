import {
  createCreatorSessionRecord,
  createEmptyCreatorSessionStore,
} from "../apps/renderer/src/platform/session/defaults";

import {
  captureCreatorSession,
  getActiveCreatorSession,
  markCreatorSessionClean,
} from "../apps/renderer/src/platform/session/lifecycle";

import {
  createCreatorSessionRestorePoint,
  createEmptyCreatorSessionRecoveryStore,
  getLatestAutomaticRestorePoint,
  MAX_CREATOR_SESSION_RESTORE_POINTS,
  resolveCreatorSessionRestorePlan,
  restoreCreatorSessionFromPoint,
} from "../apps/renderer/src/platform/session/recovery";

import {
  loadCreatorSessionRecoveryStore,
  saveCreatorSessionRecoveryStore,
} from "../apps/renderer/src/platform/session/recoveryStorage";

import {
  DEFAULT_WORKSPACE_STATE,
} from "../apps/renderer/src/platform/shell/defaults";

import type {
  SessionStorageLike,
} from "../apps/renderer/src/platform/session/types";


let passed =
  0;

let failed =
  0;


function assert(
  condition:
    unknown,
  message =
    "Assertion failed",
) {
  if (
    !condition
  ) {
    throw new Error(
      message,
    );
  }
}


function assertEqual<T>(
  actual:
    T,
  expected:
    T,
) {
  assert(
    actual ===
      expected,
    `Expected ${String(expected)}, received ${String(actual)}`,
  );
}


function test(
  name:
    string,
  run:
    () => void,
) {
  try {
    run();

    passed +=
      1;

    console.log(
      `PASS ${passed}: ${name}`,
    );
  } catch (
    error
  ) {
    failed +=
      1;

    console.error(
      `FAIL: ${name}`,
    );

    throw error;
  }
}


function createMemoryStorage():
  SessionStorageLike {
  const values =
    new Map<
      string,
      string
    >();


  return {
    getItem(
      key,
    ) {
      return values.get(
        key,
      ) ?? null;
    },

    setItem(
      key,
      value,
    ) {
      values.set(
        key,
        value,
      );
    },

    removeItem(
      key,
    ) {
      values.delete(
        key,
      );
    },
  };
}


function createSession(
  id =
    "session-test",
) {
  return createCreatorSessionRecord({
    id,

    profileId:
      "code",

    projectRoot:
      "/tmp/project",

    activeWorkspace:
      "code",

    layout:
      DEFAULT_WORKSPACE_STATE
        .layout,

    startedAt:
      "2026-09-28T01:00:00.000Z",

    updatedAt:
      "2026-09-28T01:00:00.000Z",

    cleanShutdown:
      false,
  });
}


console.log(
  "\nPL Creators Suite — v1.3.2 Batch 4 Session Recovery Test\n",
);


test(
  "session recovery store starts empty",
  () => {
    const store =
      createEmptyCreatorSessionRecoveryStore();

    assertEqual(
      store.restorePoints.length,
      0,
    );
  },
);


test(
  "automatic restore point snapshots metadata-only session",
  () => {
    const result =
      createCreatorSessionRestorePoint(
        createEmptyCreatorSessionRecoveryStore(),
        createSession(),
        {
          kind:
            "automatic",

          now:
            "2026-09-28T01:01:00.000Z",
        },
      );


    assertEqual(
      result.restorePoint.kind,
      "automatic",
    );

    assertEqual(
      result.restorePoint.session.resumePolicy,
      "metadata-only",
    );
  },
);


test(
  "manual restore points preserve custom label",
  () => {
    const result =
      createCreatorSessionRestorePoint(
        createEmptyCreatorSessionRecoveryStore(),
        createSession(),
        {
          kind:
            "manual",

          label:
            "Before model experiment",

          now:
            "2026-09-28T01:02:00.000Z",
        },
      );


    assertEqual(
      result.restorePoint.label,
      "Before model experiment",
    );
  },
);


test(
  "clean session restores directly from live state",
  () => {
    let sessionStore =
      createEmptyCreatorSessionStore();

    sessionStore =
      captureCreatorSession(
        sessionStore,
        {
          profileId:
            "code",

          projectRoot:
            "/tmp/project",

          activeWorkspace:
            "docs",

          layout:
            DEFAULT_WORKSPACE_STATE
              .layout,
        },
      );

    sessionStore =
      markCreatorSessionClean(
        sessionStore,
      );


    const plan =
      resolveCreatorSessionRestorePlan(
        getActiveCreatorSession(
          sessionStore,
        ),
        createEmptyCreatorSessionRecoveryStore(),
      );


    assertEqual(
      plan.source,
      "live",
    );

    assertEqual(
      plan.interrupted,
      false,
    );
  },
);


test(
  "unclean session prefers latest automatic restore point",
  () => {
    const session =
      createSession();

    const recovery =
      createCreatorSessionRestorePoint(
        createEmptyCreatorSessionRecoveryStore(),
        session,
        {
          kind:
            "automatic",

          now:
            "2026-09-28T01:03:00.000Z",
        },
      );


    const plan =
      resolveCreatorSessionRestorePlan(
        session,
        recovery.store,
      );


    assertEqual(
      plan.source,
      "automatic-fallback",
    );

    assertEqual(
      plan.interrupted,
      true,
    );

    assertEqual(
      plan.restorePointId,
      recovery.restorePoint.id,
    );
  },
);


test(
  "unclean session safely falls back without restore history",
  () => {
    const plan =
      resolveCreatorSessionRestorePlan(
        createSession(),
        createEmptyCreatorSessionRecoveryStore(),
      );


    assertEqual(
      plan.source,
      "unclean-live-fallback",
    );

    assertEqual(
      plan.interrupted,
      true,
    );

    assert(
      Boolean(
        plan.session,
      ),
    );
  },
);


test(
  "latest automatic restore point is scoped to session",
  () => {
    let store =
      createEmptyCreatorSessionRecoveryStore();

    store =
      createCreatorSessionRestorePoint(
        store,
        createSession(
          "session-one",
        ),
        {
          kind:
            "automatic",

          now:
            "2026-09-28T01:04:00.000Z",
        },
      )
        .store;

    store =
      createCreatorSessionRestorePoint(
        store,
        createSession(
          "session-two",
        ),
        {
          kind:
            "automatic",

          now:
            "2026-09-28T01:05:00.000Z",
        },
      )
        .store;


    const found =
      getLatestAutomaticRestorePoint(
        store,
        "session-one",
      );


    assertEqual(
      found?.sourceSessionId,
      "session-one",
    );
  },
);


test(
  "restore point reinstates saved workspace",
  () => {
    let liveStore =
      captureCreatorSession(
        createEmptyCreatorSessionStore(),
        {
          profileId:
            "code",

          projectRoot:
            "/tmp/project",

          activeWorkspace:
            "modeler",

          layout:
            DEFAULT_WORKSPACE_STATE
              .layout,

          now:
            "2026-09-28T01:06:00.000Z",
        },
      );


    const active =
      getActiveCreatorSession(
        liveStore,
      )!;


    const recovery =
      createCreatorSessionRestorePoint(
        createEmptyCreatorSessionRecoveryStore(),
        active,
        {
          kind:
            "manual",

          label:
            "Modeling point",

          now:
            "2026-09-28T01:07:00.000Z",
        },
      );


    liveStore =
      captureCreatorSession(
        liveStore,
        {
          profileId:
            "code",

          projectRoot:
            "/tmp/project",

          activeWorkspace:
            "docs",

          layout:
            DEFAULT_WORKSPACE_STATE
              .layout,

          now:
            "2026-09-28T01:08:00.000Z",
        },
      );


    const restored =
      restoreCreatorSessionFromPoint(
        liveStore,
        recovery.store,
        recovery.restorePoint.id,
      );


    assertEqual(
      getActiveCreatorSession(
        restored,
      )!
        .activeWorkspace,
      "modeler",
    );
  },
);


test(
  "restore point history remains bounded",
  () => {
    let store =
      createEmptyCreatorSessionRecoveryStore();


    for (
      let index =
        0;
      index <
        MAX_CREATOR_SESSION_RESTORE_POINTS +
          5;
      index +=
        1
    ) {
      store =
        createCreatorSessionRestorePoint(
          store,
          createSession(),
          {
            kind:
              "automatic",

            now:
              new Date(
                Date.UTC(
                  2026,
                  8,
                  28,
                  2,
                  0,
                  index,
                ),
              )
                .toISOString(),
          },
        )
          .store;
    }


    assertEqual(
      store.restorePoints.length,
      MAX_CREATOR_SESSION_RESTORE_POINTS,
    );
  },
);


test(
  "recovery storage round-trips restore points",
  () => {
    const storage =
      createMemoryStorage();

    const recovery =
      createCreatorSessionRestorePoint(
        createEmptyCreatorSessionRecoveryStore(),
        createSession(),
        {
          kind:
            "manual",

          label:
            "Round trip",
        },
      );


    saveCreatorSessionRecoveryStore(
      recovery.store,
      storage,
    );


    const loaded =
      loadCreatorSessionRecoveryStore(
        storage,
      );


    assertEqual(
      loaded.restorePoints.length,
      1,
    );

    assertEqual(
      loaded.restorePoints[
        0
      ]
        .label,
      "Round trip",
    );
  },
);


test(
  "corrupt recovery storage falls back safely",
  () => {
    const storage =
      createMemoryStorage();

    storage.setItem(
      "pl.creator-session-recovery.v1",
      "{ definitely-not-json",
    );


    const loaded =
      loadCreatorSessionRecoveryStore(
        storage,
      );


    assertEqual(
      loaded.restorePoints.length,
      0,
    );
  },
);


console.log(
  `\nSession recovery test complete: ${passed} passed, ${failed} failed.\n`,
);
