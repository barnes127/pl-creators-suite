const assert =
  require("assert");

const fs =
  require("fs/promises");
const fsSync = require("fs");

const os =
  require("os");

const path =
  require("path");
const {spawnSync} = require("child_process");

const testHome = fsSync.mkdtempSync(path.join(os.tmpdir(), "pl-index-home-"));
process.env.HOME = testHome;

const desktopTasks = require("../apps/desktop/services/tasks");
const {desktopRuntime} = require("../apps/desktop/services/runtime");

const {
  indexProject,
  getIndexStatus,
  createIndexCancellationToken,
  ProjectIndexJobManager,
} =
  require(
    "../apps/desktop/services/project-platform/indexing",
  );

const {
  getIndexPath,
  readProjectIndex,
  writeProjectIndex,
} = require(
  "../apps/desktop/services/project-platform/indexing/storage",
);

let passed =
  0;

let failed =
  0;

const expectedDiagnosticStates =
  new Map();


async function check(
  message,
  operation,
) {
  try {
    await operation();

    passed +=
      1;

    console.log(
      `PASS    ${message}`,
    );
  } catch (
    error
  ) {
    failed +=
      1;

    console.error(
      `FAIL    ${message}`,
    );

    console.error(
      error,
    );
  }
}


async function waitForExpectedDiagnostics() {
  const timeoutAt =
    Date.now() +
    5000;

  while (
    true
  ) {
    try {
      const latestJobs =
        await desktopRuntime
          .diagnostics
          .getLatestJobs();

      const latestById =
        new Map(
          latestJobs.map(
            (job) => [
              job.id,
              job.status,
            ],
          ),
        );

      const complete =
        Array.from(
          expectedDiagnosticStates,
        ).every(
          ([id, status]) =>
            latestById.get(id) ===
            status,
        );

      if (
        complete
      ) {
        return;
      }
    } catch (
      error
    ) {
      if (
        error?.code !==
        "CORRUPT_DIAGNOSTICS_RECORD"
      ) {
        throw error;
      }
    }

    if (
      Date.now() >=
      timeoutAt
    ) {
      throw new Error(
        "Timed out waiting for isolated task diagnostics to finish.",
      );
    }

    await new Promise(
      (resolve) =>
        setImmediate(
          resolve,
        ),
    );
  }
}


async function main() {
  console.log(
    "\nPL Creators Suite — Project Indexing Service Test\n",
  );


  const tempRoot =
    await fs.mkdtemp(
      path.join(
        os.tmpdir(),
        "pl-indexing-",
      ),
    );


  try {
    const projectRoot =
      path.join(
        tempRoot,
        "FixtureProject",
      );


    await fs.mkdir(
      path.join(
        projectRoot,
        "docs",
      ),
      {
        recursive:
          true,
      },
    );


    await fs.writeFile(
      path.join(
        projectRoot,
        "docs",
        "alpha.txt",
      ),
      "alpha",
      "utf8",
    );


    await fs.writeFile(
      path.join(
        projectRoot,
        "docs",
        "beta.txt",
      ),
      "beta",
      "utf8",
    );


    await check(
      "initial indexing hashes all files",
      async () => {
        const result =
          await indexProject({
            projectRoot,
          });


        assert.equal(
          result.summary.scanned,
          2,
        );

        assert.equal(
          result.summary.hashed,
          2,
        );
      },
    );


    await check(
      "index persists SHA-256 hashes",
      async () => {
        const index =
          await readProjectIndex(
            projectRoot,
          );


        assert.equal(
          Object.keys(
            index.files,
          ).length,
          2,
        );


        assert.equal(
          index.files[
            "docs/alpha.txt"
          ].contentHash.length,
          64,
        );
      },
    );


    await check(
      "unchanged project performs incremental no-op",
      async () => {
        const result =
          await indexProject({
            projectRoot,
          });


        assert.equal(
          result.summary.hashed,
          0,
        );

        assert.equal(
          result.summary.unchanged,
          2,
        );
      },
    );


    await fs.writeFile(
      path.join(
        projectRoot,
        "docs",
        "alpha.txt",
      ),
      "alpha changed",
      "utf8",
    );


    await check(
      "changed file is detected as stale",
      async () => {
        const status =
          await getIndexStatus({
            projectRoot,
          });


        assert.equal(
          status.current,
          false,
        );

        assert.ok(
          status.changes.changed.includes(
            "docs/alpha.txt",
          ),
        );
      },
    );


    await check(
      "incremental update hashes changed file only",
      async () => {
        const result =
          await indexProject({
            projectRoot,
          });


        assert.equal(
          result.summary.changed,
          1,
        );

        assert.equal(
          result.summary.hashed,
          1,
        );
      },
    );


    await fs.writeFile(
      path.join(
        projectRoot,
        "docs",
        "gamma.txt",
      ),
      "gamma",
      "utf8",
    );


    await check(
      "new file is detected",
      async () => {
        const status =
          await getIndexStatus({
            projectRoot,
          });


        assert.ok(
          status.changes.added.includes(
            "docs/gamma.txt",
          ),
        );
      },
    );


    await indexProject({
      projectRoot,
    });


    await fs.rm(
      path.join(
        projectRoot,
        "docs",
        "beta.txt",
      ),
    );


    await check(
      "deleted file is detected",
      async () => {
        const status =
          await getIndexStatus({
            projectRoot,
          });


        assert.ok(
          status.changes.removed.includes(
            "docs/beta.txt",
          ),
        );
      },
    );


    await check(
      "deleted file is removed from persisted index",
      async () => {
        await indexProject({
          projectRoot,
        });


        const index =
          await readProjectIndex(
            projectRoot,
          );


        assert.equal(
          index.files[
            "docs/beta.txt"
          ],
          undefined,
        );
      },
    );


    await check(
      "missing index returns empty baseline",
      async () => {
        const projectRoot =
          await fs.mkdtemp(
            path.join(
              os.tmpdir(),
              "pl-index-missing-",
            ),
          );

        const index =
          await readProjectIndex(
            projectRoot,
          );

        assert.deepEqual(
          index.files,
          {},
        );
      },
    );

    await check(
      "corrupt persisted index fails visibly",
      async () => {
        const projectRoot =
          await fs.mkdtemp(
            path.join(
              os.tmpdir(),
              "pl-index-corrupt-",
            ),
          );

        await writeProjectIndex(
          projectRoot,
          {
            schemaVersion:
              1,

            generatedAt:
              new Date()
                .toISOString(),

            files:
              {},
          },
        );

        const indexPath =
          getIndexPath(
            projectRoot,
          );

        await fs.writeFile(
          indexPath,
          "{ corrupt",
          "utf8",
        );

        await assert.rejects(
          () =>
            readProjectIndex(
              projectRoot,
            ),
          /Failed to read project index/,
        );
      },
    );

    await check(
      "index directory does not index itself",
      async () => {
        const result =
          await indexProject({
            projectRoot,
          });


        const indexedPaths =
          Object.keys(
            result.index.files,
          );


        assert.equal(
          indexedPaths.some(
            (
              relativePath,
            ) =>
              relativePath.startsWith(
                ".pl-index/",
              ),
          ),
          false,
        );
      },
    );


    await check(
      "pre-cancelled indexing aborts safely",
      async () => {
        const token =
          createIndexCancellationToken();


        token.cancel();


        await assert.rejects(
          () =>
            indexProject({
              projectRoot,

              cancellationToken:
                token,
            }),
          (
            error,
          ) =>
            error.name ===
            "IndexCancellationError",
        );
      },
    );


    await check(
      "index progress callback reports completion",
      async () => {
        const progress =
          [];


        await indexProject({
          projectRoot,

          onProgress(
            update,
          ) {
            progress.push(
              update,
            );
          },
        });


        assert.equal(
          progress[
            progress.length -
            1
          ].phase,
          "complete",
        );
      },
    );


    await check(
      "index job manager tracks successful job",
      async () => {
        const manager =
          new ProjectIndexJobManager(desktopTasks.createDesktopTaskManager());
        const updates = [];


        const {
          jobId,
          promise,
        } =
          manager.start({
            projectRoot,
            onProgress(update) {
              updates.push(update);
            },
          });


        await promise;


        const job =
          manager.get(
            jobId,
          );


        assert.equal(
          job.status,
          "complete",
        );
        assert.equal(updates.at(-1).phase, "complete");
        assert.equal(updates.at(-1).relativePath, null);
      },
    );

    await check("default indexing manager shares runtime ownership", async () => {
      const facade = new ProjectIndexJobManager();
      assert.strictEqual(desktopTasks.desktopTaskManager, desktopRuntime.taskManager);
      assert.strictEqual(facade.taskManager, desktopRuntime.taskManager);
      const isolated = desktopTasks.createDesktopTaskManager();
      assert.notStrictEqual(isolated, desktopRuntime.taskManager);
      assert.notStrictEqual(new ProjectIndexJobManager(isolated).taskManager,
        desktopRuntime.taskManager);
    });

    await check("legacy and canonical cancellation target the same queued jobs", async () => {
      const facade = new ProjectIndexJobManager();
      const first = facade.start({projectRoot});
      expectedDiagnosticStates.set(first.jobId, "queued");
      const firstCancelled = facade.cancel(first.jobId);
      const firstState = desktopRuntime.taskManager.get(first.jobId);
      expectedDiagnosticStates.set(first.jobId, firstState.status);
      await first.promise;
      assert.strictEqual(firstCancelled, true);
      assert.equal(firstState.status, "cancelled");
      assert.equal(facade.get(first.jobId).status, "cancelled");
      assert.strictEqual(facade.cancel(first.jobId), false);

      const second = facade.start({projectRoot});
      expectedDiagnosticStates.set(second.jobId, "queued");
      const secondCancellation = desktopRuntime.taskManager.cancel(second.jobId);
      const secondState = desktopRuntime.taskManager.get(second.jobId);
      expectedDiagnosticStates.set(second.jobId, secondState.status);
      await second.promise;
      assert.equal(secondCancellation.status, "cancelled");
      assert.equal(secondState.status, "cancelled");
      assert.equal(facade.get(second.jobId).status, "cancelled");
      assert.ok(facade.list().some((job) => job.id === second.jobId));
    });

    await check("CommonJS import orders have stable ownership and no diagnostic writes", async () => {
      const home = path.join(tempRoot, "isolated-home");
      await fs.mkdir(home);
      const modules = [
        "./apps/desktop/services/tasks",
        "./apps/desktop/services/project-platform/indexing/jobs",
        "./apps/desktop/services/runtime",
      ];
      for (const order of [[0, 1, 2], [1, 2, 0], [2, 0, 1]]) {
        const script = `
          const paths = ${JSON.stringify(modules)};
          ${JSON.stringify(order)}.forEach((index) => require(paths[index]));
          const tasks = require(paths[0]);
          const {ProjectIndexJobManager} = require(paths[1]);
          const {desktopRuntime} = require(paths[2]);
          if (tasks.desktopTaskManager !== desktopRuntime.taskManager ||
              new ProjectIndexJobManager().taskManager !== desktopRuntime.taskManager ||
              tasks.desktopTaskManager !== tasks.desktopTaskManager) process.exit(2);
        `;
        const result = spawnSync(process.execPath, ["-e", script], {
          cwd: path.join(__dirname, ".."),
          env: {...process.env, HOME: home},
          encoding: "utf8",
        });
        assert.equal(result.status, 0, result.stderr);
        await assert.rejects(fs.stat(path.join(home, ".plcs", "diagnostics")),
          {code: "ENOENT"});
      }
    });
  } finally {
    let diagnosticsComplete =
      false;

    try {
      await waitForExpectedDiagnostics();
      diagnosticsComplete =
        true;
    } catch (
      error
    ) {
      failed +=
        1;

      console.error(
        "FAIL    isolated diagnostics completed before HOME cleanup",
      );
      console.error(
        error,
      );
      console.error(
        `Retained isolated HOME for review: ${testHome}`,
      );
    }

    if (
      diagnosticsComplete
    ) {
      try {
        await fs.rm(
          testHome,
          {
            recursive:
              true,

            force:
              true,
          },
        );
      } catch (
        error
      ) {
        failed +=
          1;

        console.error(
          "FAIL    isolated test HOME cleanup",
        );
        console.error(
          error,
        );
      }
    }

    await fs.rm(
      tempRoot,
      {
        recursive:
          true,

        force:
          true,
      },
    );
  }


  console.log(
    `\nProject indexing service test complete: ${passed} passed, ${failed} failed.`,
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
