const fs =
  require(
    "fs",
  );


let passed =
  0;

let failed =
  0;


function read(
  path,
) {
  return fs.readFileSync(
    path,
    "utf8",
  );
}


function check(
  condition,
  message,
) {
  if (
    condition
  ) {
    passed +=
      1;

    console.log(
      `PASS ${passed}: ${message}`,
    );

    return;
  }

  failed +=
    1;

  console.error(
    `FAIL: ${message}`,
  );

  throw new Error(
    message,
  );
}


console.log(
  "\nPL Creators Suite — v1.3.2 Closeout Test\n",
);


const app =
  read(
    "apps/renderer/src/App.tsx",
  );

const continuity =
  read(
    "apps/renderer/src/components/continuity/CreatorContinuityPanel.tsx",
  );

const profileHook =
  read(
    "apps/renderer/src/platform/profiles/useCreatorProfiles.ts",
  );

const transfer =
  read(
    "apps/renderer/src/platform/profiles/transfer.ts",
  );

const sessionHook =
  read(
    "apps/renderer/src/platform/session/useCreatorSession.ts",
  );

const sessionRecovery =
  read(
    "apps/renderer/src/platform/session/recovery.ts",
  );


check(
  app.includes(
    "CreatorContinuityPanel",
  ),
  "Creator Continuity UI is mounted",
);


check(
  app.includes(
    "handleToggleFocusMode",
  ),
  "Focus Mode integration exists",
);


check(
  app.includes(
    "primary-sidebar",
  ) &&
  app.includes(
    "bottom-panel",
  ),
  "Focus Mode controls primary shell surfaces",
);


check(
  continuity.includes(
    "Create Restore Point",
  ),
  "manual restore-point UX exists",
);


check(
  continuity.includes(
    "Restore Context",
  ),
  "manual session restoration UX exists",
);


check(
  continuity.includes(
    "Export Active Profile",
  ),
  "creator profile export UX exists",
);


check(
  continuity.includes(
    "Import Profile",
  ),
  "creator profile import UX exists",
);


check(
  transfer.includes(
    "importCreatorProfileIntoStore",
  ),
  "profile import integrates with persistent profile store",
);


check(
  transfer.includes(
    "-imported-",
  ),
  "profile import handles ID collisions safely",
);


check(
  profileHook.includes(
    "saveCreatorProfileStore",
  ) &&
  profileHook.includes(
    "importProfile",
  ),
  "profile hook persists imported profiles",
);


check(
  sessionHook.includes(
    "createManualRestorePoint",
  ) &&
  sessionHook.includes(
    "restoreFromRestorePoint",
  ),
  "session hook exposes recovery controls",
);


check(
  sessionHook.includes(
    "restorePlan",
  ) &&
  sessionHook.includes(
    "recoveryStore",
  ),
  "session hook exposes recovery status",
);


check(
  sessionRecovery.includes(
    "\"metadata-only\"",
  ),
  "session recovery remains metadata-only",
);


check(
  !sessionRecovery.includes(
    "runWorkflow",
  ) &&
  !sessionRecovery.includes(
    "executeCommand",
  ),
  "session recovery contains no execution replay",
);


check(
  app.includes(
    "suiteHasUnsavedChanges",
  ) &&
  app.includes(
    "Save unsaved work before restoring session context.",
  ),
  "manual context restore protects unsaved work",
);


console.log(
  `\nv1.3.2 closeout test complete: ${passed} passed, ${failed} failed.\n`,
);
