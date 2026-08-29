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

const {
  spawn,
} = require("child_process");


const testRoot =
  path.join(
    os.tmpdir(),
    `pl-recovery-baseline-${process.pid}-${Date.now()}`,
  );

const fakeUserData =
  path.join(
    testRoot,
    "user-data",
  );

const fixturesRoot =
  path.join(
    testRoot,
    "fixtures",
  );

const importsRoot =
  path.join(
    testRoot,
    "imports",
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
  writeProjectManifest,
} = require(
  "../apps/desktop/services/project/persistence",
);

const {
  writeProjectChecksums,
  validateProjectChecksums,
  inspectProjectIntegrity,
  repairProject,
} = require(
  "../apps/desktop/services/project/integrity",
);

const {
  projectOpen,
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


function makeManifest(
  overrides = {},
) {
  const now =
    new Date()
      .toISOString();

  return {
    schemaVersion:
      PROJECT_SCHEMA_VERSION,

    name:
      "Recovery Fixture",

    createdAt:
      now,

    updatedAt:
      now,

    ...overrides,
  };
}


async function makeProject(
  root,
  manifest =
    makeManifest(),
) {
  await fs.mkdir(
    root,
    {
      recursive: true,
    },
  );

  await writeProjectManifest(
    path.join(
      root,
      PROJECT_MANIFEST_NAME,
    ),
    manifest,
  );
}


function runCmd(
  cmd,
  args,
  cwd,
) {
  return new Promise(
    (
      resolve,
      reject,
    ) => {
      const child =
        spawn(
          cmd,
          args,
          {
            cwd,
            stdio:
              "pipe",
          },
        );

      let stdout = "";
      let stderr = "";

      child.stdout.on(
        "data",
        (data) => {
          stdout +=
            data.toString();
        },
      );

      child.stderr.on(
        "data",
        (data) => {
          stderr +=
            data.toString();
        },
      );

      child.on(
        "close",
        (code) => {
          if (
            code === 0
          ) {
            resolve({
              stdout,
              stderr,
            });

            return;
          }

          reject(
            new Error(
              `${cmd} failed (${code}): ${stderr || stdout}`,
            ),
          );
        },
      );
    },
  );
}


async function makeArchive(
  sourceRoot,
  archivePath,
) {
  await runCmd(
    "zip",
    [
      "-q",
      "-r",
      archivePath,
      ".",
    ],
    sourceRoot,
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


async function listStaging() {
  let entries = [];

  try {
    entries =
      await fs.readdir(
        importsRoot,
      );
  } catch {
    return [];
  }

  return entries.filter(
    (entry) =>
      entry.startsWith(
        ".pl-import-",
      ),
  );
}


async function main() {
  console.log(
    "\nPL Creators Suite — Recovery Baseline Test\n",
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
    fixturesRoot,
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


  await test(
    "missing manifest project fails visibly",
    async () => {
      const root =
        path.join(
          fixturesRoot,
          "missing-manifest",
        );

      await fs.mkdir(
        root,
        {
          recursive: true,
        },
      );

      await assert.rejects(
        () =>
          projectOpen({
            projectRoot:
              root,
          }),
        /missing manifest/i,
      );
    },
  );


  await test(
    "corrupt manifest JSON is rejected",
    async () => {
      const root =
        path.join(
          fixturesRoot,
          "corrupt-manifest",
        );

      await fs.mkdir(
        root,
        {
          recursive: true,
        },
      );

      const manifestPath =
        path.join(
          root,
          PROJECT_MANIFEST_NAME,
        );

      await fs.writeFile(
        manifestPath,
        "{ broken json",
        "utf8",
      );

      await assert.rejects(
        () =>
          readProjectManifest(
            manifestPath,
          ),
        (error) =>
          error.code ===
          "CORRUPT_MANIFEST",
      );
    },
  );


  await test(
    "future project schema is rejected",
    async () => {
      const root =
        path.join(
          fixturesRoot,
          "future-schema",
        );

      await fs.mkdir(
        root,
        {
          recursive: true,
        },
      );

      const manifestPath =
        path.join(
          root,
          PROJECT_MANIFEST_NAME,
        );

      await fs.writeFile(
        manifestPath,
        JSON.stringify(
          makeManifest({
            schemaVersion:
              PROJECT_SCHEMA_VERSION +
              1,
          }),
          null,
          2,
        ),
        "utf8",
      );

      await assert.rejects(
        () =>
          projectOpen({
            projectRoot:
              root,
          }),
        (error) =>
          error.code ===
          "PROJECT_FROM_NEWER_VERSION",
      );
    },
  );


  await test(
    "checksum detects manifest corruption",
    async () => {
      const root =
        path.join(
          fixturesRoot,
          "checksum-corruption",
        );

      await makeProject(
        root,
      );

      await writeProjectChecksums(
        root,
      );

      await fs.writeFile(
        path.join(
          root,
          PROJECT_MANIFEST_NAME,
        ),
        JSON.stringify(
          makeManifest({
            name:
              "Tampered",
          }),
          null,
          2,
        ),
        "utf8",
      );

      const result =
        await validateProjectChecksums(
          root,
        );

      assert.strictEqual(
        result.valid,
        false,
      );

      assert.ok(
        result.mismatches.length >
          0,
      );
    },
  );


  await test(
    "integrity inspection reports damaged project",
    async () => {
      const root =
        path.join(
          fixturesRoot,
          "integrity-damaged",
        );

      await makeProject(
        root,
      );

      await writeProjectChecksums(
        root,
      );

      await fs.writeFile(
        path.join(
          root,
          PROJECT_MANIFEST_NAME,
        ),
        JSON.stringify(
          makeManifest({
            name:
              "Damaged After Baseline",
          }),
          null,
          2,
        ),
        "utf8",
      );

      const result =
        await inspectProjectIntegrity(
          root,
        );

      assert.strictEqual(
        result.healthy,
        false,
      );
    },
  );


  await test(
    "manifest backup can be restored",
    async () => {
      const root =
        path.join(
          fixturesRoot,
          "repair-backup",
        );

      const manifestPath =
        path.join(
          root,
          PROJECT_MANIFEST_NAME,
        );

      await fs.mkdir(
        root,
        {
          recursive: true,
        },
      );

      await writeProjectManifest(
        manifestPath,
        makeManifest({
          name:
            "Before Damage",
        }),
      );

      await writeProjectManifest(
        manifestPath,
        makeManifest({
          name:
            "After Rewrite",
        }),
        {
          backupExisting:
            true,
        },
      );

      await fs.writeFile(
        manifestPath,
        "{ corrupt after rewrite",
        "utf8",
      );

      const repair =
        await repairProject(
          root,
          {
            restoreManifestBackup:
              true,
          },
        );

      assert.strictEqual(
        repair.repaired,
        true,
      );

      assert.ok(
        repair.actions.includes(
          "RESTORED_MANIFEST_BACKUP",
        ),
      );

      const restored =
        await readProjectManifest(
          manifestPath,
        );

      assert.strictEqual(
        restored.manifest.name,
        "Before Damage",
      );
    },
  );


  await test(
    "failed import with missing manifest cleans staging",
    async () => {
      const source =
        path.join(
          fixturesRoot,
          "bad-import-missing-manifest",
        );

      await fs.mkdir(
        source,
        {
          recursive: true,
        },
      );

      await fs.writeFile(
        path.join(
          source,
          "orphan.txt",
        ),
        "orphan",
        "utf8",
      );

      const archive =
        path.join(
          testRoot,
          "BadMissingManifest.plproj",
        );

      await makeArchive(
        source,
        archive,
      );

      await assert.rejects(
        () =>
          projectImport({
            filePath:
              archive,
            baseDir:
              importsRoot,
          }),
        /missing manifest/i,
      );

      const staging =
        await listStaging();

      assert.strictEqual(
        staging.length,
        0,
      );
    },
  );


  await test(
    "failed future-schema import cleans staging",
    async () => {
      const source =
        path.join(
          fixturesRoot,
          "bad-import-future-schema",
        );

      await fs.mkdir(
        source,
        {
          recursive: true,
        },
      );

      await fs.writeFile(
        path.join(
          source,
          PROJECT_MANIFEST_NAME,
        ),
        JSON.stringify(
          makeManifest({
            schemaVersion:
              PROJECT_SCHEMA_VERSION +
              1,
          }),
          null,
          2,
        ),
        "utf8",
      );

      const archive =
        path.join(
          testRoot,
          "BadFutureSchema.plproj",
        );

      await makeArchive(
        source,
        archive,
      );

      await assert.rejects(
        () =>
          projectImport({
            filePath:
              archive,
            baseDir:
              importsRoot,
          }),
        (error) =>
          error.code ===
          "PROJECT_FROM_NEWER_VERSION",
      );

      const staging =
        await listStaging();

      assert.strictEqual(
        staging.length,
        0,
      );
    },
  );


  await test(
    "failed import does not install destination project",
    async () => {
      const source =
        path.join(
          fixturesRoot,
          "failed-install",
        );

      await fs.mkdir(
        source,
        {
          recursive: true,
        },
      );

      await fs.writeFile(
        path.join(
          source,
          "invalid.txt",
        ),
        "invalid",
        "utf8",
      );

      const archive =
        path.join(
          testRoot,
          "FailedInstall.plproj",
        );

      await makeArchive(
        source,
        archive,
      );

      await assert.rejects(
        () =>
          projectImport({
            filePath:
              archive,
            baseDir:
              importsRoot,
          }),
      );

      assert.strictEqual(
        await exists(
          path.join(
            importsRoot,
            "FailedInstall",
          ),
        ),
        false,
      );
    },
  );


  await fs.rm(
    testRoot,
    {
      recursive: true,
      force: true,
    },
  );


  console.log(
    `\nRecovery baseline test complete: ${passed} passed, ${failed} failed.`,
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
