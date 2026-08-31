const fs =
  require("fs/promises");


const {
  ensureDir,
  writeJsonFileAtomic,
} = require(
  "../../../util/fs",
);


const {
  RECOVERY_SCHEMA_VERSION,
} = require(
  "./constants",
);


const {
  getRecoveryDir,
  getRecoveryStatusPath,
} = require(
  "./paths",
);


const {
  RecoveryDataError,
} = require(
  "./errors",
);

function createEmptyRecoveryStatus(
  projectRoot,
) {
  return {
    schemaVersion:
      RECOVERY_SCHEMA_VERSION,

    projectRoot,

    sessionId:
      null,

    sessionStartedAt:
      null,

    cleanShutdown:
      true,

    updatedAt:
      new Date()
        .toISOString(),
  };
}


async function readRecoveryStatusRecord(
  projectRoot,
) {
  const statusPath =
    getRecoveryStatusPath(
      projectRoot,
    );


  let raw;


  try {
    raw =
      await fs.readFile(
        statusPath,
        "utf8",
      );
  } catch (
    error
  ) {
    if (
      error?.code ===
      "ENOENT"
    ) {
      return createEmptyRecoveryStatus(
        projectRoot,
      );
    }


    throw error;
  }


  let parsed;

  try {
    parsed =
      JSON.parse(
        raw,
      );
  } catch {
    throw new RecoveryDataError(
      "Recovery status contains invalid JSON",
      "CORRUPT_RECOVERY_STATUS",
    );
  }

  return {
    ...createEmptyRecoveryStatus(
      projectRoot,
    ),

    ...parsed,

    projectRoot,
  };
}


async function writeRecoveryStatusRecord(
  projectRoot,
  status,
) {
  await ensureDir(
    getRecoveryDir(
      projectRoot,
    ),
  );


  const next = {
    ...status,

    schemaVersion:
      RECOVERY_SCHEMA_VERSION,

    projectRoot,

    updatedAt:
      new Date()
        .toISOString(),
  };


  await writeJsonFileAtomic(
    getRecoveryStatusPath(
      projectRoot,
    ),
    next,
  );


  return next;
}


module.exports = {
  createEmptyRecoveryStatus,
  readRecoveryStatusRecord,
  writeRecoveryStatusRecord,
};
