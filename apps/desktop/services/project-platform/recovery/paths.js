const path =
  require("path");


const {
  RECOVERY_DIR_NAME,
  AUTOSAVE_DIR_NAME,
  STATUS_FILE_NAME,
  JOURNAL_FILE_NAME,
} = require(
  "./constants",
);


function cleanProjectRoot(
  projectRoot,
) {
  const cleaned =
    String(
      projectRoot ||
      "",
    ).trim();


  if (
    !cleaned
  ) {
    throw new Error(
      "projectRoot is required",
    );
  }


  return path.resolve(
    cleaned,
  );
}


function getRecoveryDir(
  projectRoot,
) {
  return path.join(
    cleanProjectRoot(
      projectRoot,
    ),
    RECOVERY_DIR_NAME,
  );
}


function getAutosaveDir(
  projectRoot,
) {
  return path.join(
    getRecoveryDir(
      projectRoot,
    ),
    AUTOSAVE_DIR_NAME,
  );
}


function getRecoveryStatusPath(
  projectRoot,
) {
  return path.join(
    getRecoveryDir(
      projectRoot,
    ),
    STATUS_FILE_NAME,
  );
}


function getRecoveryJournalPath(
  projectRoot,
) {
  return path.join(
    getRecoveryDir(
      projectRoot,
    ),
    JOURNAL_FILE_NAME,
  );
}


function sanitizeResourceId(
  resourceId,
) {
  const cleaned =
    String(
      resourceId ||
      "",
    )
      .trim()
      .replace(
        /[^a-zA-Z0-9._-]+/g,
        "_",
      );


  if (
    !cleaned
  ) {
    throw new Error(
      "resourceId is required",
    );
  }


  return cleaned;
}


function getAutosavePath(
  projectRoot,
  resourceId,
) {
  return path.join(
    getAutosaveDir(
      projectRoot,
    ),
    `${sanitizeResourceId(
      resourceId,
    )}.json`,
  );
}


module.exports = {
  cleanProjectRoot,
  getRecoveryDir,
  getAutosaveDir,
  getRecoveryStatusPath,
  getRecoveryJournalPath,
  getAutosavePath,
  sanitizeResourceId,
};
