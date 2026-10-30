const fs =
  require("fs");

const path =
  require("path");
const os =
  require("os");
const assert =
  require("assert");
const fsPromises =
  require("fs/promises");
const {
  getIndexPath,
  readProjectIndex,
  writeProjectIndex,
} = require(
  "../apps/desktop/services/project-platform/indexing/storage",
);


const root =
  path.resolve(
    __dirname,
    "..",
  );


const indexingRoot =
  path.join(
    root,
    "apps",
    "desktop",
    "services",
    "project-platform",
    "indexing",
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
      indexingRoot,
      file,
    ),
    "utf8",
  );
}


console.log(
  "\nPL Creators Suite — Project Indexing Contract Test\n",
);


const expectedFiles = [
  "constants.js",
  "storage.js",
  "hash.js",
  "scanner.js",
  "cancellation.js",
  "diff.js",
  "indexer.js",
  "status.js",
  "jobs.js",
  "index.js",
];


for (
  const file
  of expectedFiles
) {
  check(
    fs.existsSync(
      path.join(
        indexingRoot,
        file,
      ),
    ),
    `indexing module exists: ${file}`,
  );
}


const constants =
  read(
    "constants.js",
  );

const storage =
  read(
    "storage.js",
  );

const hash =
  read(
    "hash.js",
  );

const scanner =
  read(
    "scanner.js",
  );

const cancellation =
  read(
    "cancellation.js",
  );

const diff =
  read(
    "diff.js",
  );

const indexer =
  read(
    "indexer.js",
  );

const status =
  read(
    "status.js",
  );

const jobs =
  read(
    "jobs.js",
  );


check(
  constants.includes(
    ".pl-index",
  ),
  "dedicated project index directory exists",
);


check(
  storage.includes(
    "fs.rename",
  ),
  "index persistence atomically replaces file",
);


check(
  hash.includes(
    "sha256",
  ),
  "SHA-256 content hashing exists",
);


check(
  hash.includes(
    "createReadStream",
  ),
  "hashing streams file contents",
);


check(
  scanner.includes(
    "withFileTypes",
  ),
  "index scanner uses filesystem metadata",
);


check(
  scanner.includes(
    "modifiedTimeMs",
  ),
  "index scanner captures modification time",
);


check(
  cancellation.includes(
    "IndexCancellationError",
  ),
  "typed cancellation error exists",
);


check(
  cancellation.includes(
    "throwIfCancelled",
  ),
  "cooperative cancellation boundary exists",
);


check(
  diff.includes(
    "classifyIndexChanges",
  ),
  "incremental change classification exists",
);


check(
  diff.includes(
    "removed",
  ),
  "removed files are tracked",
);


check(
  indexer.includes(
    "requiresHash",
  ),
  "indexer hashes only added and changed files",
);


check(
  indexer.includes(
    "onProgress",
  ),
  "indexing progress reporting exists",
);


check(
  status.includes(
    "getIndexStatus",
  ),
  "stale-index status inspection exists",
);


check(
  status.includes(
    "current:",
  ),
  "index exposes current/stale state",
);


check(
  jobs.includes(
    "ProjectIndexJobManager",
  ),
  "index job manager exists",
);


check(
  jobs.includes(
    "cancel(",
  ),
  "running index jobs can be cancelled",
);


check(
  jobs.includes(
    'status:\n        "running"',
  ) ||
  jobs.includes(
    '"running"',
  ),
  "job status tracking exists",
);


async function verifyTemporaryWriteAndRename() {
  const projectRoot = await fsPromises.mkdtemp(
    path.join(os.tmpdir(), "pl-index-contract-"),
  );
  const originalRename = fsPromises.rename;
  const finalPath = getIndexPath(projectRoot);
  const generatedAt = "2026-01-01T00:00:00.000Z";
  let renameObserved = false;

  try {
    fsPromises.rename = async (source, destination) => {
      assert.equal(destination, finalPath);
      assert.match(source, /\.tmp$/);
      const temporaryIndex = JSON.parse(
        await fsPromises.readFile(source, "utf8"),
      );
      assert.equal(temporaryIndex.generatedAt, generatedAt);
      assert.deepEqual(temporaryIndex.files, {});
      renameObserved = true;
      return originalRename(source, destination);
    };

    await writeProjectIndex(projectRoot, {
      generatedAt,
      files: {},
    });

    assert.equal(renameObserved, true);
    const finalIndex = await readProjectIndex(projectRoot);
    assert.equal(finalIndex.generatedAt, generatedAt);
    assert.deepEqual(finalIndex.files, {});
    const files = await fsPromises.readdir(path.dirname(finalPath));
    assert.deepEqual(files, [path.basename(finalPath)]);
  } finally {
    fsPromises.rename = originalRename;
    await fsPromises.rm(projectRoot, {recursive: true, force: true});
  }
}

verifyTemporaryWriteAndRename()
  .then(() => {
    check(true, "index persistence writes and renames a valid final index");
  })
  .catch((error) => {
    console.error(error);
    check(false, "index persistence writes and renames a valid final index");
  })
  .finally(() => {
    console.log(
      `\nProject indexing contract test complete: ${passed} passed, ${failed} failed.`,
    );
    if (failed > 0) process.exitCode = 1;
  });
