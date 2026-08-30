const fs =
  require("fs/promises");

const path =
  require("path");

const {
  INDEX_SCHEMA_VERSION,
  INDEX_DIR_NAME,
  INDEX_FILE_NAME,
} =
  require(
    "./constants",
  );


function cleanProjectRoot(
  projectRoot,
) {
  const root =
    String(
      projectRoot ||
      "",
    ).trim();


  if (
    !root
  ) {
    throw new Error(
      "projectRoot is required",
    );
  }


  return path.resolve(
    root,
  );
}


function getIndexDir(
  projectRoot,
) {
  return path.join(
    cleanProjectRoot(
      projectRoot,
    ),
    INDEX_DIR_NAME,
  );
}


function getIndexPath(
  projectRoot,
) {
  return path.join(
    getIndexDir(
      projectRoot,
    ),
    INDEX_FILE_NAME,
  );
}


function createEmptyIndex() {
  return {
    schemaVersion:
      INDEX_SCHEMA_VERSION,

    generatedAt:
      null,

    files:
      {},
  };
}


function normalizeRecord(
  record,
) {
  return {
    relativePath:
      String(
        record?.relativePath ||
        "",
      ),

    size:
      Number(
        record?.size ||
        0,
      ),

    modifiedTimeMs:
      Number(
        record?.modifiedTimeMs ||
        0,
      ),

    contentHash:
      String(
        record?.contentHash ||
        "",
      ),

    indexedAt:
      String(
        record?.indexedAt ||
        "",
      ),

    stale:
      Boolean(
        record?.stale,
      ),
  };
}


async function readProjectIndex(
  projectRoot,
) {
  const indexPath =
    getIndexPath(
      projectRoot,
    );


  try {
    const raw =
      await fs.readFile(
        indexPath,
        "utf8",
      );


    const parsed =
      JSON.parse(
        raw,
      );


    const files =
      {};


    for (
      const [
        key,
        record,
      ]
      of Object.entries(
        parsed?.files ||
        {},
      )
    ) {
      const normalized =
        normalizeRecord(
          record,
        );


      if (
        normalized.relativePath
      ) {
        files[
          key
        ] =
          normalized;
      }
    }


    return {
      schemaVersion:
        INDEX_SCHEMA_VERSION,

      generatedAt:
        parsed?.generatedAt ??
        null,

      files,
    };
  } catch {
    return createEmptyIndex();
  }
}


async function writeProjectIndex(
  projectRoot,
  index,
) {
  const indexDir =
    getIndexDir(
      projectRoot,
    );


  await fs.mkdir(
    indexDir,
    {
      recursive:
        true,
    },
  );


  const safeIndex = {
    schemaVersion:
      INDEX_SCHEMA_VERSION,

    generatedAt:
      index.generatedAt ??
      new Date()
        .toISOString(),

    files:
      index.files ??
      {},
  };


  const indexPath =
    getIndexPath(
      projectRoot,
    );


  const tempPath =
    `${indexPath}.tmp`;


  await fs.writeFile(
    tempPath,
    JSON.stringify(
      safeIndex,
      null,
      2,
    ),
    "utf8",
  );


  await fs.rename(
    tempPath,
    indexPath,
  );


  return safeIndex;
}


module.exports = {
  cleanProjectRoot,
  getIndexDir,
  getIndexPath,
  createEmptyIndex,
  readProjectIndex,
  writeProjectIndex,
};
