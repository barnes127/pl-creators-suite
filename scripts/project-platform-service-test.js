const assert =
  require("assert");

const fs =
  require("fs/promises");

const os =
  require("os");

const path =
  require("path");


const {
  buildProjectTree,
} =
  require(
    "../apps/desktop/services/project-platform/tree",
  );

const {
  inspectAssets,
  repairMissingAsset,
  resolveInsideProject,
} =
  require(
    "../apps/desktop/services/project-platform/assets",
  );

const {
  writeAssetRegistry,
} =
  require(
    "../apps/desktop/services/assets",
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
    "\nPL Creators Suite — Project Platform Service Test\n",
  );


  const tempRoot =
    await fs.mkdtemp(
      path.join(
        os.tmpdir(),
        "pl-project-platform-",
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
        "hello.md",
      ),
      "# hello\n",
      "utf8",
    );


    await check(
      "project tree builds",
      async () => {
        const tree =
          await buildProjectTree({
            projectRoot,
          });


        assert.equal(
          tree.kind,
          "directory",
        );

        assert.ok(
          tree.children.some(
            (
              node,
            ) =>
              node.name ===
              "docs",
          ),
        );
      },
    );


    await check(
      "project tree exposes nested files",
      async () => {
        const tree =
          await buildProjectTree({
            projectRoot,
          });


        const docs =
          tree.children.find(
            (
              node,
            ) =>
              node.name ===
              "docs",
          );


        assert.ok(
          docs.children.some(
            (
              node,
            ) =>
              node.name ===
              "hello.md",
          ),
        );
      },
    );


    await check(
      "project path guard accepts internal path",
      async () => {
        const resolved =
          resolveInsideProject(
            projectRoot,
            "docs/hello.md",
          );


        assert.equal(
          resolved,
          path.join(
            projectRoot,
            "docs",
            "hello.md",
          ),
        );
      },
    );


    await check(
      "project path guard rejects escape",
      async () => {
        assert.throws(
          () =>
            resolveInsideProject(
              projectRoot,
              "../escape.txt",
            ),
        );
      },
    );


    await writeAssetRegistry(
      projectRoot,
      {
        version:
          1,

        assets: [
          {
            id:
              "fixture-asset",

            name:
              "missing.png",

            type:
              "images",

            relativePath:
              "assets/images/missing.png",

            sourcePath:
              "",

            createdAt:
              new Date()
                .toISOString(),

            updatedAt:
              new Date()
                .toISOString(),
          },
        ],
      },
    );


    await check(
      "missing asset detection works",
      async () => {
        const inspection =
          await inspectAssets({
            projectRoot,
          });


        assert.equal(
          inspection.missing.length,
          1,
        );

        assert.equal(
          inspection.missing[
            0
          ].id,
          "fixture-asset",
        );
      },
    );


    const replacementPath =
      path.join(
        tempRoot,
        "replacement.png",
      );


    await fs.writeFile(
      replacementPath,
      "fixture",
      "utf8",
    );


    await check(
      "missing asset replacement works",
      async () => {
        const result =
          await repairMissingAsset({
            projectRoot,

            assetId:
              "fixture-asset",

            replacementPath,

            mode:
              "replace",
          });


        assert.equal(
          result.repaired,
          true,
        );


        const expectedPath =
          path.join(
            projectRoot,
            "assets",
            "images",
            "missing.png",
          );


        await fs.access(
          expectedPath,
        );
      },
    );


    await check(
      "repaired asset is no longer missing",
      async () => {
        const inspection =
          await inspectAssets({
            projectRoot,
          });


        assert.equal(
          inspection.missing.length,
          0,
        );
      },
    );


    await fs.writeFile(
      path.join(
        projectRoot,
        "docs",
        "replacement.md",
      ),
      "replacement",
      "utf8",
    );


    await check(
      "internal asset relinking works",
      async () => {
        const result =
          await repairMissingAsset({
            projectRoot,

            assetId:
              "fixture-asset",

            replacementPath:
              path.join(
                projectRoot,
                "docs",
                "replacement.md",
              ),

            mode:
              "relink",
          });


        assert.equal(
          result.relativePath,
          "docs/replacement.md",
        );
      },
    );


    await check(
      "external relink target is rejected",
      async () => {
        await assert.rejects(
          () =>
            repairMissingAsset({
              projectRoot,

              assetId:
                "fixture-asset",

              replacementPath,

              mode:
                "relink",
            }),
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
    `\nProject platform service test complete: ${passed} passed, ${failed} failed.`,
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
