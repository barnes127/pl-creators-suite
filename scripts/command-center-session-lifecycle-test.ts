import {
  createEmptyCreatorSessionStore,
} from "../apps/renderer/src/platform/session/defaults";

import {
  captureCreatorSession,
  getActiveCreatorSession,
  markCreatorSessionClean,
} from "../apps/renderer/src/platform/session/lifecycle";

import {
  DEFAULT_WORKSPACE_STATE,
} from "../apps/renderer/src/platform/shell/defaults";


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


console.log(
  "\nPL Creators Suite — v1.3.2 Batch 3 Session Lifecycle Test\n",
);


test(
  "empty store has no active session",
  () => {
    const store =
      createEmptyCreatorSessionStore();

    assertEqual(
      getActiveCreatorSession(
        store,
      ),
      undefined,
    );
  },
);


test(
  "capture creates an active session",
  () => {
    const store =
      captureCreatorSession(
        createEmptyCreatorSessionStore(),
        {
          profileId:
            "code",

          projectRoot:
            "/tmp/project",

          activeWorkspace:
            "code",

          layout:
            DEFAULT_WORKSPACE_STATE
              .layout,

          now:
            "2026-09-27T12:00:00.000Z",
        },
      );

    assert(
      Boolean(
        store.activeSessionId,
      ),
    );

    assertEqual(
      store.sessions.length,
      1,
    );
  },
);


test(
  "capture stores project and workspace context",
  () => {
    const store =
      captureCreatorSession(
        createEmptyCreatorSessionStore(),
        {
          profileId:
            "modeling",

          projectRoot:
            "/tmp/model-project",

          activeWorkspace:
            "modeler",

          layout:
            DEFAULT_WORKSPACE_STATE
              .layout,

          now:
            "2026-09-27T12:01:00.000Z",
        },
      );

    const session =
      getActiveCreatorSession(
        store,
      );

    assert(
      Boolean(
        session,
      ),
    );

    assertEqual(
      session!.profileId,
      "modeling",
    );

    assertEqual(
      session!.projectRoot,
      "/tmp/model-project",
    );

    assertEqual(
      session!.activeWorkspace,
      "modeler",
    );
  },
);


test(
  "capture keeps metadata-only resume policy",
  () => {
    const store =
      captureCreatorSession(
        createEmptyCreatorSessionStore(),
        {
          profileId:
            "code",

          projectRoot:
            null,

          activeWorkspace:
            "command-center",

          layout:
            DEFAULT_WORKSPACE_STATE
              .layout,
        },
      );

    const session =
      getActiveCreatorSession(
        store,
      );

    assertEqual(
      session!.resumePolicy,
      "metadata-only",
    );
  },
);


test(
  "selected resource references are captured",
  () => {
    const store =
      captureCreatorSession(
        createEmptyCreatorSessionStore(),
        {
          profileId:
            "docs",

          projectRoot:
            "/tmp/project",

          activeWorkspace:
            "docs",

          layout:
            DEFAULT_WORKSPACE_STATE
              .layout,

          selectedResources: [
            {
              kind:
                "doc",

              id:
                "notes.md",
            },
          ],
        },
      );

    const session =
      getActiveCreatorSession(
        store,
      );

    assertEqual(
      session!
        .selectedResources[
          0
        ]
        .kind,
      "doc",
    );

    assertEqual(
      session!
        .selectedResources[
          0
        ]
        .id,
      "notes.md",
    );
  },
);


test(
  "repeated capture updates instead of duplicating session",
  () => {
    const first =
      captureCreatorSession(
        createEmptyCreatorSessionStore(),
        {
          profileId:
            "code",

          projectRoot:
            "/tmp/project",

          activeWorkspace:
            "code",

          layout:
            DEFAULT_WORKSPACE_STATE
              .layout,

          now:
            "2026-09-27T12:02:00.000Z",
        },
      );

    const second =
      captureCreatorSession(
        first,
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
            "2026-09-27T12:03:00.000Z",
        },
      );

    assertEqual(
      second.sessions.length,
      1,
    );

    assertEqual(
      getActiveCreatorSession(
        second,
      )!
        .activeWorkspace,
      "docs",
    );
  },
);


test(
  "live capture marks session unclean",
  () => {
    let store =
      captureCreatorSession(
        createEmptyCreatorSessionStore(),
        {
          profileId:
            "code",

          projectRoot:
            null,

          activeWorkspace:
            "code",

          layout:
            DEFAULT_WORKSPACE_STATE
              .layout,
        },
      );

    store =
      markCreatorSessionClean(
        store,
      );

    assertEqual(
      getActiveCreatorSession(
        store,
      )!
        .cleanShutdown,
      true,
    );

    store =
      captureCreatorSession(
        store,
        {
          profileId:
            "code",

          projectRoot:
            null,

          activeWorkspace:
            "docs",

          layout:
            DEFAULT_WORKSPACE_STATE
              .layout,
        },
      );

    assertEqual(
      getActiveCreatorSession(
        store,
      )!
        .cleanShutdown,
      false,
    );
  },
);


test(
  "clean shutdown preserves active session for restart restore",
  () => {
    const active =
      captureCreatorSession(
        createEmptyCreatorSessionStore(),
        {
          profileId:
            "research",

          projectRoot:
            "/tmp/research",

          activeWorkspace:
            "command-center",

          layout:
            DEFAULT_WORKSPACE_STATE
              .layout,
        },
      );

    const clean =
      markCreatorSessionClean(
        active,
        true,
        "2026-09-27T12:04:00.000Z",
      );

    assert(
      Boolean(
        clean.activeSessionId,
      ),
    );

    assertEqual(
      clean.sessions.length,
      1,
    );

    assertEqual(
      getActiveCreatorSession(
        clean,
      )!
        .cleanShutdown,
      true,
    );
  },
);


console.log(
  `\nSession lifecycle test complete: ${passed} passed, ${failed} failed.\n`,
);
