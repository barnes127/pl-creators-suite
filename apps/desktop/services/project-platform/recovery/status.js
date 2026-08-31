const {
  listAutosaves,
} = require(
  "./autosave",
);


const {
  readRecoveryJournal,
} = require(
  "./journal",
);


const {
  readRecoveryStatusRecord,
} = require(
  "./storage",
);


function latestTimestamp(
  values,
) {
  const filtered =
    values
      .filter(
        Boolean,
      )
      .sort();


  return filtered.length
    ? filtered[
        filtered.length -
        1
      ]
    : null;
}


async function inspectRecoveryStatus(
  projectRoot,
) {
  const [
    stored,
    autosaves,
    journal,
  ] =
    await Promise.all([
      readRecoveryStatusRecord(
        projectRoot,
      ),

      listAutosaves(
        projectRoot,
      ),

      readRecoveryJournal(
        projectRoot,
      ),
    ]);


  const entries =
    autosaves.map(
      (
        autosave,
      ) => ({
        id:
          autosave.id,

        kind:
          "autosave",

        resourceId:
          autosave.resourceId,

        createdAt:
          autosave.createdAt,

        updatedAt:
          autosave.updatedAt,

        sourceUpdatedAt:
          autosave.sourceUpdatedAt,

        recoverable:
          true,

        metadata: {},
      }),
    );


  const interrupted =
    stored.cleanShutdown ===
      false;


  const recoverableCount =
    entries.filter(
      (
        entry,
      ) =>
        entry.recoverable,
    ).length;


  let state =
    "clean";


  if (
    interrupted
  ) {
    state =
      "interrupted";
  } else if (
    recoverableCount >
    0
  ) {
    state =
      "recoverable";
  }


  const latestRecoveryAt =
    latestTimestamp([
      ...entries.map(
        (
          entry,
        ) =>
          entry.updatedAt,
      ),

      ...journal.map(
        (
          entry,
        ) =>
          entry.timestamp,
      ),
    ]);


  return {
    state,

    projectRoot,

    sessionId:
      stored.sessionId ??
      null,

    sessionStartedAt:
      stored.sessionStartedAt ??
      null,

    cleanShutdown:
      stored.cleanShutdown !==
      false,

    autosaveCount:
      autosaves.length,

    journalEntryCount:
      journal.length,

    recoverableCount,

    latestRecoveryAt,

    entries,
  };
}


module.exports = {
  inspectRecoveryStatus,
};
