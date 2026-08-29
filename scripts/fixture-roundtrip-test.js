const assert =
  require("assert");

const fs =
  require("fs/promises");

const path =
  require("path");

const os =
  require("os");

const Module =
  require("module");


const root =
  path.resolve(
    __dirname,
    "..",
  );

const baselineRoot =
  path.join(
    root,
    "fixtures",
    "baseline",
  );

const testRoot =
  path.join(
    os.tmpdir(),
    `pl-fixture-roundtrip-${process.pid}-${Date.now()}`,
  );

const fakeUserData =
  path.join(
    testRoot,
    "user-data",
  );

const projectsRoot =
  path.join(
    testRoot,
    "projects",
  );

const importsRoot =
  path.join(
    testRoot,
    "imports",
  );

const archivesRoot =
  path.join(
    testRoot,
    "archives",
  );


const originalLoad =
  Module._load;


Module._load =
  function patchedLoad(
    request,
    parent,
    isMain,
  ) {
    if (
      request ===
      "electron"
    ) {
      return {
        app: {
          getPath(name) {
            if (
              name ===
              "userData"
            ) {
              return fakeUserData;
            }

            return testRoot;
          },
        },
      };
    }

    return originalLoad.call(
      this,
      request,
      parent,
      isMain,
    );
  };


const {
  PROJECT_SCHEMA_VERSION,
  PROJECT_MANIFEST_NAME,
} = require(
  "../apps/desktop/services/project/contract",
);

const {
  readProjectManifest,
} = require(
  "../apps/desktop/services/project/persistence",
);

const {
  writeProjectChecksums,
  validateProjectChecksums,
  inspectProjectIntegrity,
} = require(
  "../apps/desktop/services/project/integrity",
);

const {
  projectCreate,
  projectOpen,
  projectExport,
  projectImport,
} = require(
  "../apps/desktop/services/projects",
);


Module._load =
  originalLoad;


let passed = 0;
let failed = 0;


async function test(
  name,
  fn,
) {
  try {
    await fn();

    passed += 1;

    console.log(
      `PASS    ${name}`,
    );
  } catch (error) {
    failed += 1;

    console.error(
      `FAIL    ${name}`,
    );

    console.error(
      `        ${error.message}`,
    );
  }
}


async function copyDirectory(
  source,
  destination,
) {
  await fs.cp(
    source,
    destination,
    {
      recursive: true,
    },
  );
}


async function readJson(
  filePath,
) {
  const raw =
    await fs.readFile(
      filePath,
      "utf8",
    );

  return JSON.parse(
    raw,
  );
}


async function fileExists(
  filePath,
) {
  try {
    await fs.access(
      filePath,
    );

    return true;
  } catch {
    return false;
  }
}


async function main() {
  console.log(
    "\nPL Creators Suite — Baseline Fixture Round-Trip Test\n",
  );


  await fs.rm(
    testRoot,
    {
      recursive: true,
      force: true,
    },
  );

  await fs.mkdir(
    fakeUserData,
    {
      recursive: true,
    },
  );

  await fs.mkdir(
    projectsRoot,
    {
      recursive: true,
    },
  );

  await fs.mkdir(
    importsRoot,
    {
      recursive: true,
    },
  );

  await fs.mkdir(
    archivesRoot,
    {
      recursive: true,
    },
  );


  const baselineManifest =
    await readJson(
      path.join(
        baselineRoot,
        "manifest.json",
      ),
    );


  for (
    const fixture
    of baselineManifest.fixtures
  ) {
    const fixtureRoot =
      path.join(
        baselineRoot,
        fixture.path,
      );

    const projectName =
      `Fixture-${fixture.slice}`;

    const created =
      await projectCreate({
        name:
          projectName,

        baseDir:
          projectsRoot,
      });


    await test(
      `${fixture.id} creates schema-${PROJECT_SCHEMA_VERSION} project`,
      async () => {
        assert.strictEqual(
          created.manifest.schemaVersion,
          PROJECT_SCHEMA_VERSION,
        );

        assert.strictEqual(
          await fileExists(
            created.manifestPath,
          ),
          true,
        );
      },
    );


    const fixtureDestination =
      path.join(
        created.projectRoot,
        "fixture-data",
        fixture.slice,
      );


    await copyDirectory(
      fixtureRoot,
      fixtureDestination,
    );


    await test(
      `${fixture.id} payload copies into project`,
      async () => {
        for (
          const requiredFile
          of fixture.requiredFiles
        ) {
          assert.strictEqual(
            await fileExists(
              path.join(
                fixtureDestination,
                requiredFile,
              ),
            ),
            true,
          );
        }
      },
    );


    await writeProjectChecksums(
      created.projectRoot,
    );


    await test(
      `${fixture.id} checksum baseline is valid`,
      async () => {
        const result =
          await validateProjectChecksums(
            created.projectRoot,
          );

        assert.strictEqual(
          result.valid,
          true,
        );
      },
    );


    await test(
      `${fixture.id} reopens through real project service`,
      async () => {
        const reopened =
          await projectOpen({
            projectRoot:
              created.projectRoot,
          });

        assert.strictEqual(
          reopened.manifest.name,
          projectName,
        );

        assert.strictEqual(
          reopened.manifest.schemaVersion,
          PROJECT_SCHEMA_VERSION,
        );
      },
    );


    await test(
      `${fixture.id} integrity inspection is healthy`,
      async () => {
        const result =
          await inspectProjectIntegrity(
            created.projectRoot,
          );

        assert.strictEqual(
          result.healthy,
          true,
        );
      },
    );


    const archivePath =
      path.join(
        archivesRoot,
        `${projectName}.plproj`,
      );


    await projectExport({
      projectRoot:
        created.projectRoot,

      outPath:
        archivePath,
    });


    await test(
      `${fixture.id} exports .plproj archive`,
      async () => {
        assert.strictEqual(
          await fileExists(
            archivePath,
          ),
          true,
        );
      },
    );


    const imported =
      await projectImport({
        filePath:
          archivePath,

        baseDir:
          importsRoot,
      });


    await test(
      `${fixture.id} imports exported archive`,
      async () => {
        assert.strictEqual(
          imported.manifest.name,
          projectName,
        );

        assert.strictEqual(
          imported.manifest.schemaVersion,
          PROJECT_SCHEMA_VERSION,
        );
      },
    );


    await test(
      `${fixture.id} imported payload remains present`,
      async () => {
        for (
          const requiredFile
          of fixture.requiredFiles
        ) {
          assert.strictEqual(
            await fileExists(
              path.join(
                imported.projectRoot,
                "fixture-data",
                fixture.slice,
                requiredFile,
              ),
            ),
            true,
          );
        }
      },
    );


    await test(
      `${fixture.id} imported project reopens`,
      async () => {
        const reopened =
          await projectOpen({
            projectRoot:
              imported.projectRoot,
          });

        assert.strictEqual(
          reopened.manifest.name,
          projectName,
        );
      },
    );


    await test(
      `${fixture.id} manifest remains readable after round trip`,
      async () => {
        const result =
          await readProjectManifest(
            path.join(
              imported.projectRoot,
              PROJECT_MANIFEST_NAME,
            ),
          );

        assert.strictEqual(
          result.manifest.schemaVersion,
          PROJECT_SCHEMA_VERSION,
        );
      },
    );
  }


  await fs.rm(
    testRoot,
    {
      recursive: true,
      force: true,
    },
  );


  console.log(
    `\nFixture round-trip test complete: ${passed} passed, ${failed} failed.`,
  );


  if (
    failed > 0
  ) {
    process.exit(1);
  }
}


main().catch(
  (error) => {
    console.error(error);

    process.exit(1);
  },
);
