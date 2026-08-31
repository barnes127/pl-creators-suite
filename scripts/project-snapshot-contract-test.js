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
  "\nPL Creators Suite — Snapshot Contract Test\n",
);


const files = [
  "apps/desktop/services/project-platform/recovery/snapshots.js",
  "apps/desktop/services/project-platform/recovery/compare.js",
  "apps/desktop/services/project-platform/recovery/restore.js",
  "apps/desktop/services/project-platform/recovery/retention.js",
];


for (
  const file
  of files
) {
  check(
    fs.existsSync(
      path.join(
        root,
        file,
      ),
    ),
    `snapshot module exists: ${file}`,
  );
}


const types =
  read(
    "packages/platform/src/recovery/types.ts",
  );

const snapshots =
  read(
    "apps/desktop/services/project-platform/recovery/snapshots.js",
  );

const compare =
  read(
    "apps/desktop/services/project-platform/recovery/compare.js",
  );

const restore =
  read(
    "apps/desktop/services/project-platform/recovery/restore.js",
  );

const retention =
  read(
    "apps/desktop/services/project-platform/recovery/retention.js",
  );


check(
  types.includes(
    "ProjectSnapshot",
  ),
  "shared project snapshot contract exists",
);


check(
  types.includes(
    "SnapshotDifference",
  ),
  "shared snapshot difference contract exists",
);


check(
  types.includes(
    "SnapshotRetentionPolicy",
  ),
  "shared retention policy exists",
);


check(
  snapshots.includes(
    "createProjectSnapshot",
  ),
  "project snapshot creation exists",
);


check(
  snapshots.includes(
    "createNamedCheckpoint",
  ),
  "named checkpoint creation exists",
);


check(
  snapshots.includes(
    "readProjectSnapshot",
  ),
  "snapshot read exists",
);


check(
  snapshots.includes(
    "listProjectSnapshots",
  ),
  "snapshot listing exists",
);


check(
  snapshots.includes(
    '".pl-recovery"',
  ),
  "snapshot scanner excludes recovery data",
);


check(
  snapshots.includes(
    '".pl-index"',
  ),
  "snapshot scanner excludes derived index data",
);


check(
  snapshots.includes(
    "sha256",
  ),
  "snapshot files use content hashes",
);


check(
  snapshots.includes(
    "assertInsideRoot",
  ),
  "snapshot paths enforce containment",
);


check(
  compare.includes(
    "compareSnapshotToProject",
  ),
  "snapshot to project comparison exists",
);


check(
  compare.includes(
    "compareSnapshots",
  ),
  "snapshot to snapshot comparison exists",
);


check(
  restore.includes(
    "restoreProjectSnapshot",
  ),
  "snapshot restore exists",
);


check(
  restore.includes(
    "assertInsideRoot",
  ),
  "restore enforces root containment",
);


check(
  retention.includes(
    "applySnapshotRetention",
  ),
  "snapshot retention exists",
);


check(
  retention.includes(
    "keepCheckpoints",
  ),
  "retention protects named checkpoints",
);


console.log(
  `\nSnapshot contract test complete: ${passed} passed, ${failed} failed.`,
);


if (
  failed >
  0
) {
  process.exit(
    1,
  );
}
