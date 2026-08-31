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
  "\nPL Creators Suite — v1.2.4 Recovery Closeout Test\n",
);


const backup =
  read(
    "apps/desktop/services/project-platform/recovery/backup.js",
  );

const restore =
  read(
    "apps/desktop/services/project-platform/recovery/restore.js",
  );

const registry =
  read(
    "apps/desktop/rpc/registry.js",
  );

const contracts =
  read(
    "apps/desktop/rpc/contracts.js",
  );

const app =
  read(
    "apps/renderer/src/App.tsx",
  );

const panel =
  read(
    "apps/renderer/src/components/recovery/RecoveryPanel.tsx",
  );


check(
  backup.includes(
    "createPreDestructiveBackup",
  ),
  "pre-destructive backup coordinator exists",
);


check(
  backup.includes(
    "runPreDestructiveOperation",
  ),
  "generic destructive operation wrapper exists",
);


check(
  restore.includes(
    "backupSnapshotId",
  ),
  "snapshot restore reports safety backup",
);


check(
  registry.includes(
    '"recovery.status"',
  ),
  "recovery status RPC exists",
);


check(
  registry.includes(
    '"recovery.restore"',
  ),
  "recovery restore RPC exists",
);


check(
  contracts.includes(
    '"recovery.status"',
  ),
  "recovery status RPC contract exists",
);


check(
  contracts.includes(
    '"recovery.restore"',
  ),
  "recovery restore RPC contract exists",
);


check(
  fs.existsSync(
    path.join(
      root,
      "apps/renderer/src/components/recovery/RecoveryPanel.tsx",
    ),
  ),
  "recovery UI exists",
);


check(
  app.includes(
    "Project Recovery",
  ),
  "recovery UI is mounted in application shell",
);


check(
  panel.includes(
    "Restore",
  ),
  "recovery UI exposes restore action",
);


check(
  panel.includes(
    "cleanShutdown",
  ),
  "recovery UI exposes session recovery status",
);


console.log(
  `\nRecovery closeout test complete: ${passed} passed, ${failed} failed.`,
);


if (
  failed >
  0
) {
  process.exit(
    1,
  );
}
