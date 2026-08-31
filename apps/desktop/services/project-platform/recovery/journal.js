const fs =
  require("fs/promises");


const {
  ensureDir,
} = require(
  "../../../util/fs",
);


const {
  getRecoveryDir,
  getRecoveryJournalPath,
} = require(
  "./paths",
);


const {
  RecoveryDataError,
} = require(
  "./errors",
);

let journalSequence =
  0;


function createJournalEntry(
  params = {},
) {
  journalSequence +=
    1;


  return {
    id:
      `journal-${Date.now()}-${journalSequence}`,

    timestamp:
      new Date()
        .toISOString(),

    sessionId:
      String(
        params.sessionId ||
        "",
      ),

    type:
      String(
        params.type ||
        "",
      ),

    resourceId:
      params.resourceId ??
      null,

    metadata:
      params.metadata ??
      {},
  };
}


async function appendRecoveryJournal(
  params = {},
) {
  if (
    !params.projectRoot
  ) {
    throw new Error(
      "projectRoot is required",
    );
  }


  if (
    !params.sessionId
  ) {
    throw new Error(
      "sessionId is required",
    );
  }


  if (
    !params.type
  ) {
    throw new Error(
      "journal type is required",
    );
  }


  const entry =
    createJournalEntry(
      params,
    );


  await ensureDir(
    getRecoveryDir(
      params.projectRoot,
    ),
  );


  await fs.appendFile(
    getRecoveryJournalPath(
      params.projectRoot,
    ),
    `${JSON.stringify(
      entry,
    )}\n`,
    "utf8",
  );


  return entry;
}


async function readRecoveryJournal(
  projectRoot,
) {
  let raw;

  try {
    raw =
      await fs.readFile(
        getRecoveryJournalPath(
          projectRoot,
        ),
        "utf8",
      );
  } catch (
    error
  ) {
    if (
      error?.code ===
      "ENOENT"
    ) {
      return [];
    }


    throw error;
  }

  const lines =
    raw
      .split(
        /\r?\n/,
      )
      .filter(
        Boolean,
      );

  return lines.map(
    (
      line,
      index,
    ) => {
      try {
        return JSON.parse(
          line,
        );
      } catch {
        throw new RecoveryDataError(
          `Recovery journal entry ${index + 1} contains invalid JSON`,
          "CORRUPT_RECOVERY_JOURNAL",
          {
            line:
              index +
              1,
          },
        );
      }
    },
  );
}


async function clearRecoveryJournal(
  projectRoot,
) {
  await fs.rm(
    getRecoveryJournalPath(
      projectRoot,
    ),
    {
      force:
        true,
    },
  );
}


module.exports = {
  createJournalEntry,
  appendRecoveryJournal,
  readRecoveryJournal,
  clearRecoveryJournal,
};
