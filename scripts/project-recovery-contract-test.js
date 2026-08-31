const fs =
  require("fs");

const path =
  require("path");


const root =
  path.resolve(
    __dirname,
    "..",
  );


let passed =
  0;

let failed =
  0;


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
      `PASS    ${message}`,
    );

    return;
  }


  failed +=
    1;

  console.error(
    `FAIL    ${message}`,
  );
}


function read(
  relativePath,
) {
  return fs.readFileSync(
    path.join(
      root,
      relativePath,
    ),
    "utf8",
  );
}


console.log(
  "\nPL Creators Suite — Recovery Contract Test\n",
);


const expectedFiles = [
  "packages/platform/src/recovery/types.ts",
  "packages/platform/src/recovery/index.ts",

  "apps/desktop/services/project-platform/recovery/constants.js",
  "apps/desktop/services/project-platform/recovery/paths.js",
  "apps/desktop/services/project-platform/recovery/storage.js",
  "apps/desktop/services/project-platform/recovery/autosave.js",
  "apps/desktop/services/project-platform/recovery/journal.js",
  "apps/desktop/services/project-platform/recovery/session.js",
  "apps/desktop/services/project-platform/recovery/status.js",
  "apps/desktop/services/project-platform/recovery/index.js",
];


for (
  const relativePath
  of expectedFiles
) {
  check(
    fs.existsSync(
      path.join(
        root,
        relativePath,
      ),
    ),
    `recovery module exists: ${relativePath}`,
  );
}


const types =
  read(
    "packages/platform/src/recovery/types.ts",
  );


const autosave =
  read(
    "apps/desktop/services/project-platform/recovery/autosave.js",
  );


const journal =
  read(
    "apps/desktop/services/project-platform/recovery/journal.js",
  );


const session =
  read(
    "apps/desktop/services/project-platform/recovery/session.js",
  );


const status =
  read(
    "apps/desktop/services/project-platform/recovery/status.js",
  );


const indexing =
  read(
    "apps/desktop/services/project-platform/indexing/constants.js",
  );


check(
  types.includes(
    "RecoveryStatus",
  ),
  "shared recovery status contract exists",
);


check(
  types.includes(
    "AutosaveRecord",
  ),
  "shared autosave contract exists",
);


check(
  types.includes(
    "CrashJournalEntry",
  ),
  "shared crash journal contract exists",
);


check(
  autosave.includes(
    "writeAutosave",
  ),
  "autosave writer exists",
);


check(
  autosave.includes(
    "readAutosave",
  ),
  "autosave reader exists",
);


check(
  autosave.includes(
    "deleteAutosave",
  ),
  "autosave cleanup exists",
);


check(
  journal.includes(
    "appendRecoveryJournal",
  ),
  "crash journal append exists",
);


check(
  journal.includes(
    "readRecoveryJournal",
  ),
  "crash journal reader exists",
);


check(
  session.includes(
    "beginRecoverySession",
  ),
  "recovery session start exists",
);


check(
  session.includes(
    "endRecoverySession",
  ),
  "clean recovery session close exists",
);


check(
  session.includes(
    "cleanShutdown",
  ),
  "clean shutdown marker exists",
);


check(
  status.includes(
    "inspectRecoveryStatus",
  ),
  "recovery status inspection exists",
);


check(
  status.includes(
    '"interrupted"',
  ),
  "interrupted recovery state exists",
);


check(
  status.includes(
    '"recoverable"',
  ),
  "recoverable recovery state exists",
);


check(
  indexing.includes(
    '".pl-recovery"',
  ),
  "recovery directory excluded from indexing",
);


console.log(
  `\nRecovery contract test complete: ${passed} passed, ${failed} failed.`,
);


if (
  failed >
  0
) {
  process.exit(
    1,
  );
}
