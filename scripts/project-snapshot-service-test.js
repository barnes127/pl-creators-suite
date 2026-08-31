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
  createNamedCheckpoint,
  readProjectSnapshot,
  listProjectSnapshots,
  compareSnapshotToProject,
  compareSnapshots,
  restoreProjectSnapshot,
  applySnapshotRetention,
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


async function write(
  root,
  relativePath,
  contents,
) {
  const target =
    path.join(
      root,
      relativePath,
    );


  await fs.mkdir(
    path.dirname(
      target,
    ),
    {
      recursive:
        true,
    },
  );


  await fs.writeFile(
    target,
    contents,
    "utf8",
  );
}


async function exists(
  target,
) {
  try {
    await fs.access(
      target,
    );

    return true;
  } catch {
    return false;
  }
}


async function main() {
  console.log(
    "\nPL Creators Suite — Snapshot Service Test\n",
  );


  const projectRoot =
    await fs.mkdtemp(
      path.join(
        os.tmpdir(),
        "pl-snapshot-service-",
      ),
    );


  try {
    await write(
      projectRoot,
      "project.json",
      "{\"name\":\"Snapshot Fixture\"}",
    );


    await write(
      projectRoot,
      "docs/readme.md",
      "version one",
    );


    await write(
      projectRoot,
      ".pl-index/ignored.json",
      "{\"derived\":true}",
    );


    let firstSnapshot;


    await test(
      "project snapshot captures project files",
      async () => {
        firstSnapshot =
          await createProjectSnapshot({
            projectRoot,
          });


        assert.ok(
          firstSnapshot.files.some(
            (
              file,
            ) =>
              file.relativePath ===
              "docs/readme.md",
          ),
        );


        assert.ok(
          !firstSnapshot.files.some(
            (
              file,
            ) =>
              file.relativePath.startsWith(
                ".pl-recovery/",
              ),
          ),
        );


        assert.ok(
          !firstSnapshot.files.some(
            (
              file,
            ) =>
              file.relativePath.startsWith(
                ".pl-index/",
              ),
          ),
        );
      },
    );


    await test(
      "snapshot metadata can be read",
      async () => {
        const loaded =
          await readProjectSnapshot(
            projectRoot,
            firstSnapshot.id,
          );


        assert.equal(
          loaded.id,
          firstSnapshot.id,
        );
      },
    );


    await write(
      projectRoot,
      "docs/readme.md",
      "version two",
    );


    await write(
      projectRoot,
      "docs/new.md",
      "new file",
    );


    await test(
      "snapshot comparison detects added and changed files",
      async () => {
        const difference =
          await compareSnapshotToProject(
            projectRoot,
            firstSnapshot.id,
          );


        assert.ok(
          difference.changed.includes(
            "docs/readme.md",
          ),
        );


        assert.ok(
          difference.added.includes(
            "docs/new.md",
          ),
        );
      },
    );


    let checkpoint;


    await test(
      "named checkpoint stores name and description",
      async () => {
        checkpoint =
          await createNamedCheckpoint({
            projectRoot,

            name:
              "Before Refactor",

            description:
              "Known-good project state",
          });


        assert.equal(
          checkpoint.kind,
          "checkpoint",
        );


        assert.equal(
          checkpoint.name,
          "Before Refactor",
        );
      },
    );


    await test(
      "snapshot comparison compares two stored states",
      async () => {
        const difference =
          await compareSnapshots(
            projectRoot,
            firstSnapshot.id,
            checkpoint.id,
          );


        assert.ok(
          difference.changed.includes(
            "docs/readme.md",
          ),
        );


        assert.ok(
          difference.added.includes(
            "docs/new.md",
          ),
        );
      },
    );


    await write(
      projectRoot,
      "docs/readme.md",
      "broken state",
    );


    await write(
      projectRoot,
      "temporary.txt",
      "remove me",
    );


    await test(
      "snapshot restore restores contents and removes later files",
      async () => {
        const result =
          await restoreProjectSnapshot({
            projectRoot,

            snapshotId:
              firstSnapshot.id,
          });


        assert.ok(
          result.restored.includes(
            "docs/readme.md",
          ),
        );


        const restored =
          await fs.readFile(
            path.join(
              projectRoot,
              "docs/readme.md",
            ),
            "utf8",
          );


        assert.equal(
          restored,
          "version one",
        );


        assert.equal(
          await exists(
            path.join(
              projectRoot,
              "temporary.txt",
            ),
          ),
          false,
        );


        assert.equal(
          await exists(
            path.join(
              projectRoot,
              ".pl-recovery",
            ),
          ),
          true,
        );
      },
    );


    await test(
      "restored project matches snapshot",
      async () => {
        const difference =
          await compareSnapshotToProject(
            projectRoot,
            firstSnapshot.id,
          );


        assert.deepEqual(
          difference.added,
          [],
        );


        assert.deepEqual(
          difference.changed,
          [],
        );


        assert.deepEqual(
          difference.removed,
          [],
        );
      },
    );


    await test(
      "multiple snapshots can coexist",
      async () => {
        await createProjectSnapshot({
          projectRoot,
        });


        await createProjectSnapshot({
          projectRoot,
        });


        const snapshots =
          await listProjectSnapshots(
            projectRoot,
          );


        assert.ok(
          snapshots.length >=
          4,
        );
      },
    );


    await test(
      "retention removes excess automatic snapshots",
      async () => {
        const result =
          await applySnapshotRetention(
            projectRoot,
            {
              maxSnapshots:
                1,

              keepCheckpoints:
                true,
            },
          );


        assert.ok(
          result.removed.length >=
          1,
        );


        const remaining =
          await listProjectSnapshots(
            projectRoot,
          );


        const automatic =
          remaining.filter(
            (
              snapshot,
            ) =>
              snapshot.kind !==
              "checkpoint",
          );


        assert.ok(
          automatic.length <=
          1,
        );
      },
    );


    await test(
      "retention preserves named checkpoints",
      async () => {
        const remaining =
          await listProjectSnapshots(
            projectRoot,
          );


        assert.ok(
          remaining.some(
            (
              snapshot,
            ) =>
              snapshot.id ===
              checkpoint.id,
          ),
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
    `\nSnapshot service test complete: ${passed} passed, ${failed} failed.`,
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
