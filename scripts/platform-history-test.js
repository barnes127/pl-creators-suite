const fs =
  require("fs");

const path =
  require("path");


const root =
  path.resolve(
    __dirname,
    "..",
  );


const historyRoot =
  path.join(
    root,
    "packages",
    "platform",
    "src",
    "history",
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
  file,
) {
  return fs.readFileSync(
    path.join(
      historyRoot,
      file,
    ),
    "utf8",
  );
}


console.log(
  "\nPL Creators Suite — Platform History Test\n",
);


const expectedFiles = [
  "types.ts",
  "transactions.ts",
  "manager.ts",
  "adapters.ts",
  "index.ts",
];


for (
  const file
  of expectedFiles
) {
  check(
    fs.existsSync(
      path.join(
        historyRoot,
        file,
      ),
    ),
    `history module exists: ${file}`,
  );
}


const types =
  read(
    "types.ts",
  );

const transactions =
  read(
    "transactions.ts",
  );

const manager =
  read(
    "manager.ts",
  );

const adapters =
  read(
    "adapters.ts",
  );


check(
  types.includes(
    "HistoryTransaction",
  ),
  "transaction contract exists",
);


check(
  types.includes(
    "HistoryTransactionContext",
  ),
  "transaction context exists",
);


check(
  types.includes(
    "HistoryAdapter",
  ),
  "slice/engine adapter contract exists",
);


check(
  types.includes(
    "branchWarning",
  ),
  "history state exposes branch warning",
);


check(
  transactions.includes(
    "createHistoryTransaction",
  ),
  "transaction factory exists",
);


check(
  manager.includes(
    "class HistoryManager",
  ),
  "history manager exists",
);


check(
  manager.includes(
    "async undo()",
  ),
  "undo exists",
);


check(
  manager.includes(
    "async redo()",
  ),
  "redo exists",
);


check(
  manager.includes(
    "canUndo()",
  ),
  "undo availability exists",
);


check(
  manager.includes(
    "canRedo()",
  ),
  "redo availability exists",
);


check(
  manager.includes(
    "branchWarning",
  ),
  "editing after rollback tracks branch warning",
);


check(
  manager.includes(
    "clear()",
  ),
  "history clearing exists",
);


check(
  adapters.includes(
    "createHistoryAdapter",
  ),
  "history adapter factory exists",
);


console.log(
  `\nPlatform history test complete: ${passed} passed, ${failed} failed.`,
);


if (
  failed >
  0
) {
  process.exit(
    1,
  );
}
