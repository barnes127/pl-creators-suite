const assert =
  require("assert");

const fs =
  require("fs/promises");

const os =
  require("os");

const path =
  require("path");


const {
  writeAutosave,
  readAutosave,
  deleteAutosave,
  listAutosaves,
  appendRecoveryJournal,
  readRecoveryJournal,
  beginRecoverySession,
  endRecoverySession,
  inspectRecoveryStatus,
  getRecoveryDir,
} = require(
  "../apps/desktop/services/project-platform/recovery",
);


let passed =
  0;

let failed =
  0;


async function test(
  name,
  fn,
) {
  try {
    await fn();

    passed +=
      1;

    console.log(
      `PASS    ${name}`,
    );
  } catch (
    error
  ) {
    failed +=
      1;

    console.error(
      `FAIL    ${name}`,
    );

    console.error(
      error,
    );
  }
}


async function main() {
  console.log(
    "\nPL Creators Suite — Recovery Service Test\n",
  );


  const projectRoot =
    await fs.mkdtemp(
      path.join(
        os.tmpdir(),
        "pl-recovery-service-",
      ),
    );


  try {
    await test(
      "new project begins clean",
      async () => {
        const status =
          await inspectRecoveryStatus(
            projectRoot,
          );


        assert.equal(
          status.state,
          "clean",
        );


        assert.equal(
          status.recoverableCount,
          0,
        );
      },
    );


    let session;


    await test(
      "recovery session marks project interrupted until clean close",
      async () => {
        session =
          await beginRecoverySession(
            projectRoot,
          );


        assert.equal(
          session.cleanShutdown,
          false,
        );


        const status =
          await inspectRecoveryStatus(
            projectRoot,
          );


        assert.equal(
          status.state,
          "interrupted",
        );
      },
    );


    await test(
      "journal records session start",
      async () => {
        const journal =
          await readRecoveryJournal(
            projectRoot,
          );


        assert.ok(
          journal.some(
            (
              entry,
            ) =>
              entry.type ===
              "session.started",
          ),
        );
      },
    );


    await test(
      "autosave persists resource payload",
      async () => {
        await writeAutosave({
          projectRoot,

          resourceId:
            "docs/readme.md",

          payload: {
            text:
              "unsaved recovery text",
          },

          sourceUpdatedAt:
            "2026-08-30T20:00:00.000Z",
        });


        const autosave =
          await readAutosave({
            projectRoot,

            resourceId:
              "docs/readme.md",
          });


        assert.equal(
          autosave.payload.text,
          "unsaved recovery text",
        );
      },
    );


    await test(
      "autosave appears in recovery status",
      async () => {
        const status =
          await inspectRecoveryStatus(
            projectRoot,
          );


        assert.equal(
          status.autosaveCount,
          1,
        );


        assert.equal(
          status.recoverableCount,
          1,
        );
      },
    );


    await test(
      "multiple resource autosaves can coexist",
      async () => {
        await writeAutosave({
          projectRoot,

          resourceId:
            "code/main.ts",

          payload: {
            text:
              "const value = 1;",
          },
        });


        const autosaves =
          await listAutosaves(
            projectRoot,
          );


        assert.equal(
          autosaves.length,
          2,
        );
      },
    );


    await test(
      "journal accepts resource activity",
      async () => {
        await appendRecoveryJournal({
          projectRoot,

          sessionId:
            session.sessionId,

          type:
            "resource.changed",

          resourceId:
            "docs/readme.md",
        });


        const journal =
          await readRecoveryJournal(
            projectRoot,
          );


        assert.ok(
          journal.some(
            (
              entry,
            ) =>
              entry.type ===
                "resource.changed" &&
              entry.resourceId ===
                "docs/readme.md",
          ),
        );
      },
    );


    await test(
      "clean close clears interrupted state",
      async () => {
        await endRecoverySession(
          projectRoot,
        );


        const status =
          await inspectRecoveryStatus(
            projectRoot,
          );


        assert.equal(
          status.cleanShutdown,
          true,
        );


        assert.equal(
          status.state,
          "recoverable",
        );
      },
    );


    await test(
      "autosave can be deleted after authoritative save",
      async () => {
        await deleteAutosave({
          projectRoot,

          resourceId:
            "docs/readme.md",
        });


        const autosave =
          await readAutosave({
            projectRoot,

            resourceId:
              "docs/readme.md",
          });


        assert.equal(
          autosave,
          null,
        );
      },
    );


    await test(
      "recovery directory is isolated from source files",
      async () => {
        const recoveryDir =
          getRecoveryDir(
            projectRoot,
          );


        assert.equal(
          path.dirname(
            recoveryDir,
          ),
          projectRoot,
        );


        assert.equal(
          path.basename(
            recoveryDir,
          ),
          ".pl-recovery",
        );
      },
    );
  } finally {
    await fs.rm(
      projectRoot,
      {
        recursive:
          true,

        force:
          true,
      },
    );
  }


  console.log(
    `\nRecovery service test complete: ${passed} passed, ${failed} failed.`,
  );


  if (
    failed >
    0
  ) {
    process.exit(
      1,
    );
  }
}


main().catch(
  (
    error,
  ) => {
    console.error(
      error,
    );

    process.exit(
      1,
    );
  },
);
