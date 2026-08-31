const assert =
  require("assert");

const fs =
  require("fs/promises");

const os =
  require("os");

const path =
  require("path");


const {
  createProjectSnapshot,
  listProjectSnapshots,
  restoreProjectSnapshot,
  inspectRecoveryStatus,
  getRecoveryStatusPath,
  getRecoveryJournalPath,
  writeAutosave,
  getAutosavePath,
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
    "\nPL Creators Suite — Recovery Drill Test\n",
  );


  const root =
    await fs.mkdtemp(
      path.join(
        os.tmpdir(),
        "pl-recovery-drill-",
      ),
    );


  try {
    const source =
      path.join(
        root,
        "document.txt",
      );


    await fs.writeFile(
      source,
      "known good",
      "utf8",
    );


    let snapshot;


    await test(
      "baseline snapshot can be created",
      async () => {
        snapshot =
          await createProjectSnapshot({
            projectRoot:
              root,
          });


        assert.ok(
          snapshot.id,
        );
      },
    );


    await test(
      "restore creates pre-destructive backup",
      async () => {
        await fs.writeFile(
          source,
          "current unsaved state",
          "utf8",
        );


        const result =
          await restoreProjectSnapshot({
            projectRoot:
              root,

            snapshotId:
              snapshot.id,
          });


        assert.ok(
          result.backupSnapshotId,
        );


        const snapshots =
          await listProjectSnapshots(
            root,
          );


        assert.ok(
          snapshots.some(
            (
              item,
            ) =>
              item.id ===
              result.backupSnapshotId,
          ),
        );
      },
    );


    await test(
      "restore returns project to known-good data",
      async () => {
        assert.equal(
          await fs.readFile(
            source,
            "utf8",
          ),
          "known good",
        );
      },
    );


    await test(
      "corrupt recovery status is detected",
      async () => {
        await fs.mkdir(
          path.dirname(
            getRecoveryStatusPath(
              root,
            ),
          ),
          {
            recursive:
              true,
          },
        );


        await fs.writeFile(
          getRecoveryStatusPath(
            root,
          ),
          "{ invalid",
          "utf8",
        );


        await assert.rejects(
          () =>
            inspectRecoveryStatus(
              root,
            ),
          (
            error,
          ) =>
            error.code ===
            "CORRUPT_RECOVERY_STATUS",
        );


        await fs.rm(
          getRecoveryStatusPath(
            root,
          ),
          {
            force:
              true,
          },
        );
      },
    );


    await test(
      "corrupt crash journal is detected",
      async () => {
        await fs.writeFile(
          getRecoveryJournalPath(
            root,
          ),
          "{ broken journal\n",
          "utf8",
        );


        await assert.rejects(
          () =>
            inspectRecoveryStatus(
              root,
            ),
          (
            error,
          ) =>
            error.code ===
            "CORRUPT_RECOVERY_JOURNAL",
        );


        await fs.rm(
          getRecoveryJournalPath(
            root,
          ),
          {
            force:
              true,
          },
        );
      },
    );


    await test(
      "corrupt autosave is detected",
      async () => {
        await writeAutosave({
          projectRoot:
            root,

          resourceId:
            "document.txt",

          payload: {
            content:
              "draft",
          },
        });


        await fs.writeFile(
          getAutosavePath(
            root,
            "document.txt",
          ),
          "{ corrupt",
          "utf8",
        );


        await assert.rejects(
          () =>
            inspectRecoveryStatus(
              root,
            ),
          (
            error,
          ) =>
            error.code ===
            "CORRUPT_AUTOSAVE",
        );
      },
    );
  } finally {
    await fs.rm(
      root,
      {
        recursive:
          true,

        force:
          true,
      },
    );
  }


  console.log(
    `\nRecovery drill test complete: ${passed} passed, ${failed} failed.`,
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
