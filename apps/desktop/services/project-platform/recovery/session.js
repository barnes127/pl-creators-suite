const {
  readRecoveryStatusRecord,
  writeRecoveryStatusRecord,
} = require(
  "./storage",
);


const {
  appendRecoveryJournal,
} = require(
  "./journal",
);


let sessionSequence =
  0;


function createRecoverySessionId() {
  sessionSequence +=
    1;


  return [
    "session",
    Date.now(),
    process.pid,
    sessionSequence,
  ].join(
    "-",
  );
}


async function beginRecoverySession(
  projectRoot,
) {
  const previous =
    await readRecoveryStatusRecord(
      projectRoot,
    );


  const sessionId =
    createRecoverySessionId();


  const next =
    await writeRecoveryStatusRecord(
      projectRoot,
      {
        ...previous,

        sessionId,

        sessionStartedAt:
          new Date()
            .toISOString(),

        cleanShutdown:
          false,
      },
    );


  await appendRecoveryJournal({
    projectRoot,

    sessionId,

    type:
      "session.started",
  });


  return next;
}


async function endRecoverySession(
  projectRoot,
) {
  const previous =
    await readRecoveryStatusRecord(
      projectRoot,
    );


  if (
    previous.sessionId
  ) {
    await appendRecoveryJournal({
      projectRoot,

      sessionId:
        previous.sessionId,

      type:
        "session.closed",
    });
  }


  return writeRecoveryStatusRecord(
    projectRoot,
    {
      ...previous,

      cleanShutdown:
        true,

      sessionId:
        null,

      sessionStartedAt:
        null,
    },
  );
}


module.exports = {
  createRecoverySessionId,
  beginRecoverySession,
  endRecoverySession,
};
