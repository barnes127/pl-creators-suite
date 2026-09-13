const fs =
  require(
    "node:fs",
  );

const path =
  require(
    "node:path",
  );


const root =
  path.resolve(
    __dirname,
    "..",
  );

const storagePath =
  path.join(
    root,
    "apps/renderer/src/platform/shell/storage.ts",
  );

const storage =
  fs.readFileSync(
    storagePath,
    "utf8",
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


check(
  storage.includes(
    "pl.shell.workspace-state.v1",
  ),
  "current versioned shell state key exists",
);


check(
  storage.includes(
    "pl.layout.copilotDrawerOpen",
  ),
  "v1.1 Copilot persistence key remains supported",
);


check(
  storage.includes(
    "pl.layout.physicsDrawerOpen",
  ),
  "v1.1 physics persistence key remains supported",
);


check(
  storage.includes(
    "readLegacyBoolean",
  ),
  "legacy shell settings migration helper exists",
);


check(
  storage.includes(
    "migrated.layout.visibility.copilot",
  ),
  "legacy Copilot setting migrates into shell state",
);


check(
  storage.includes(
    "migrated.layout.visibility.physics",
  ),
  "legacy physics setting migrates into shell state",
);


check(
  storage.includes(
    "state.layout.visibility.copilot",
  ),
  "current Copilot state is written for rollback compatibility",
);


check(
  storage.includes(
    "state.layout.visibility.physics",
  ),
  "current physics state is written for rollback compatibility",
);


console.log(
  `\nShell settings compatibility test complete: ${passed} passed, ${failed} failed.`,
);


if (
  failed >
  0
) {
  throw new Error(
    `${failed} shell settings compatibility checks failed`,
  );
}
