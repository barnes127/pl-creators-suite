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
  createIndexCancellationToken,
} =
  require(
    "../apps/desktop/services/project-platform/indexing",
  );

const {
  searchProject,
  inferSearchKind,
} =
  require(
    "../apps/desktop/services/project-platform/search",
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
    "\nPL Creators Suite — Project Global Search Test\n",
  );


  const tempRoot =
    await fs.mkdtemp(
      path.join(
        os.tmpdir(),
        "pl-global-search-",
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


    await fs.mkdir(
      path.join(
        projectRoot,
        "workflows",
      ),
      {
        recursive:
          true,
      },
    );


    await fs.mkdir(
      path.join(
        projectRoot,
        "scenes",
      ),
      {
        recursive:
          true,
      },
    );


    await fs.mkdir(
      path.join(
        projectRoot,
        "extensions",
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
        "notes.md",
      ),
      "The orbital renderer is ready.\nSecond line.",
      "utf8",
    );


    await fs.writeFile(
      path.join(
        projectRoot,
        "workflows",
        "render.json",
      ),
      JSON.stringify({
        name:
          "Orbital Render Workflow",
      }),
      "utf8",
    );


    await fs.writeFile(
      path.join(
        projectRoot,
        "scenes",
        "orbit.json",
      ),
      JSON.stringify({
        name:
          "Orbital Scene",
      }),
      "utf8",
    );


    await fs.writeFile(
      path.join(
        projectRoot,
        "extensions",
        "orbital-tool.json",
      ),
      JSON.stringify({
        name:
          "Orbital Tool",
      }),
      "utf8",
    );


    await indexProject({
      projectRoot,
    });


    await check(
      "global search finds file content",
      async () => {
        const result =
          await searchProject({
            projectRoot,

            query:
              "orbital",
          });


        assert.ok(
          result.count >
          0,
        );


        assert.ok(
          result.results.some(
            (
              item,
            ) =>
              item.preview
                ?.toLowerCase()
                .includes(
                  "orbital",
                ),
          ),
        );
      },
    );


    await check(
      "search results expose line navigation",
      async () => {
        const result =
          await searchProject({
            projectRoot,

            query:
              "renderer",
          });


        const match =
          result.results.find(
            (
              item,
            ) =>
              item.projectRelativePath ===
              "docs/notes.md",
          );


        assert.equal(
          match.line,
          1,
        );


        assert.ok(
          match.column >
          0,
        );
      },
    );


    await check(
      "workflow content is classified",
      async () => {
        assert.equal(
          inferSearchKind(
            "workflows/render.json",
          ),
          "workflow",
        );
      },
    );


    await check(
      "scene content is classified",
      async () => {
        assert.equal(
          inferSearchKind(
            "scenes/orbit.json",
          ),
          "scene",
        );
      },
    );


    await check(
      "extension content is classified",
      async () => {
        assert.equal(
          inferSearchKind(
            "extensions/orbital-tool.json",
          ),
          "extension",
        );
      },
    );


    await check(
      "search can filter by kind",
      async () => {
        const result =
          await searchProject({
            projectRoot,

            query:
              "orbital",

            kinds: [
              "workflow",
            ],
          });


        assert.ok(
          result.results.length >
          0,
        );


        assert.equal(
          result.results.every(
            (
              item,
            ) =>
              item.kind ===
              "workflow",
          ),
          true,
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
              "orbital-texture",

            name:
              "Orbital Texture",

            type:
              "images",

            relativePath:
              "assets/images/orbital.png",

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
      "global search includes asset registry",
      async () => {
        const result =
          await searchProject({
            projectRoot,

            query:
              "texture",
          });


        assert.ok(
          result.results.some(
            (
              item,
            ) =>
              item.kind ===
              "asset" &&
              item.metadata
                ?.assetId ===
              "orbital-texture",
          ),
        );
      },
    );


    await check(
      "search obeys result limit",
      async () => {
        const result =
          await searchProject({
            projectRoot,

            query:
              "orbital",

            limit:
              2,
          });


        assert.ok(
          result.results.length <=
          2,
        );
      },
    );


    await check(
      "pre-cancelled search aborts safely",
      async () => {
        const token =
          createIndexCancellationToken();


        token.cancel();


        await assert.rejects(
          () =>
            searchProject({
              projectRoot,

              query:
                "orbital",

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
    `\nProject global search test complete: ${passed} passed, ${failed} failed.`,
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
