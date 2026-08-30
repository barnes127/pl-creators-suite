const assert =
  require("assert");

const fs =
  require("fs/promises");

const os =
  require("os");

const path =
  require("path");

const {
  indexProject,
  getIndexStatus,
  readProjectIndex,
  createIndexCancellationToken,
  ProjectIndexJobManager,
} =
  require(
    "../apps/desktop/services/project-platform/indexing",
  );


let passed =
  0;

let failed =
  0;


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
          new ProjectIndexJobManager();


        const {
          jobId,
          promise,
        } =
          manager.start({
            projectRoot,
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
      },
    );
  } finally {
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
