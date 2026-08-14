const assert = require("assert");
const fs = require("fs/promises");
const path = require("path");
const os = require("os");
const Module = require("module");
const { spawn } = require("child_process");

const testRoot = path.join(
  os.tmpdir(),
  `pl-project-format-test-${process.pid}-${Date.now()}`,
);

const fakeUserData = path.join(testRoot, "user-data");
const importsDir = path.join(testRoot, "imports");
const fixturesDir = path.join(testRoot, "fixtures");

const originalLoad = Module._load;

const {
  RESOURCE_STATES,
  createVersionedEnvelope,
  validateVersionedEnvelope,
  validateResourceState,
  validateAssetMetadata,
} = require("../apps/desktop/services/project/schemas");

const {
  writeProjectChecksums,
  validateProjectChecksums,
  writeProjectJournal,
  inspectProjectIntegrity,
  repairProject,
} = require("../apps/desktop/services/project/integrity");

Module._load = function patchedLoad(request, parent, isMain) {
  if (request === "electron") {
    return {
      app: {
        getPath(name) {
          if (name === "userData") {
            return fakeUserData;
          }

          return testRoot;
        },
      },
    };
  }

  return originalLoad.call(this, request, parent, isMain);
};

const {
  PROJECT_SCHEMA_VERSION,
  PROJECT_MANIFEST_NAME,
  validateProjectManifest,
} = require("../apps/desktop/services/project/contract");

const {
  migrateProjectManifest,
} = require("../apps/desktop/services/project/migrations");

const {
  readProjectManifest,
  writeProjectManifest,
} = require("../apps/desktop/services/project/persistence");

const {
  projectExport,
  projectImport,
} = require("../apps/desktop/services/projects");

Module._load = originalLoad;

let passed = 0;
let failed = 0;

function runCmd(cmd, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd,
      stdio: "pipe",
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }

      reject(
        new Error(
          `${cmd} failed (${code}): ${stderr || stdout}`,
        ),
      );
    });
  });
}

async function test(name, fn) {
  try {
    await fn();
    passed += 1;
    console.log(`PASS    ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`FAIL    ${name}`);
    console.error(`        ${error.message}`);
  }
}

function makeManifest(overrides = {}) {
  const now = new Date().toISOString();

  return {
    schemaVersion: PROJECT_SCHEMA_VERSION,
    name: "Test Project",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

async function makeProject(root, manifest = makeManifest()) {
  await fs.mkdir(root, { recursive: true });

  await writeProjectManifest(
    path.join(root, PROJECT_MANIFEST_NAME),
    manifest,
  );

  await fs.writeFile(
    path.join(root, "sample.txt"),
    "project fixture\n",
    "utf8",
  );
}

async function makeArchive(sourceRoot, archivePath) {
  await runCmd(
    "zip",
    ["-q", "-r", archivePath, "."],
    sourceRoot,
  );
}

async function listStagingDirectories() {
  let entries = [];

  try {
    entries = await fs.readdir(importsDir);
  } catch {
    return [];
  }

  return entries.filter((entry) =>
    entry.startsWith(".pl-import-"),
  );
}

async function main() {
  console.log(
    "\nPL Creators Suite — Project Format Test\n",
  );

  await fs.rm(testRoot, {
    recursive: true,
    force: true,
  });

  await fs.mkdir(fakeUserData, { recursive: true });
  await fs.mkdir(importsDir, { recursive: true });
  await fs.mkdir(fixturesDir, { recursive: true });

  await test(
    "valid schema-1 manifest is accepted",
    async () => {
      const manifest = makeManifest();

      const result = validateProjectManifest(manifest);

      assert.strictEqual(
        result.schemaVersion,
        PROJECT_SCHEMA_VERSION,
      );
    },
  );

  await test(
    "future schema version is rejected",
    async () => {
      const manifest = makeManifest({
        schemaVersion: PROJECT_SCHEMA_VERSION + 1,
      });

      assert.throws(
        () => validateProjectManifest(manifest),
        (error) =>
          error.code === "PROJECT_FROM_NEWER_VERSION",
      );
    },
  );

  await test(
    "migration layer rejects future schema",
    async () => {
      const manifest = makeManifest({
        schemaVersion: PROJECT_SCHEMA_VERSION + 1,
      });

      assert.throws(
        () => migrateProjectManifest(manifest),
        (error) =>
          error.code === "PROJECT_FROM_NEWER_VERSION",
      );
    },
  );

  await test(
    "corrupt manifest JSON is detected",
    async () => {
      const root = path.join(
        fixturesDir,
        "corrupt-json",
      );

      await fs.mkdir(root, { recursive: true });

      const manifestPath = path.join(
        root,
        PROJECT_MANIFEST_NAME,
      );

      await fs.writeFile(
        manifestPath,
        "{ definitely not valid json",
        "utf8",
      );

      await assert.rejects(
        () => readProjectManifest(manifestPath),
        (error) => error.code === "CORRUPT_MANIFEST",
      );
    },
  );

  await test(
    "atomic manifest write produces readable data",
    async () => {
      const root = path.join(
        fixturesDir,
        "atomic-write",
      );

      await fs.mkdir(root, { recursive: true });

      const manifestPath = path.join(
        root,
        PROJECT_MANIFEST_NAME,
      );

      const manifest = makeManifest({
        name: "Atomic Test",
      });

      await writeProjectManifest(
        manifestPath,
        manifest,
      );

      const result =
        await readProjectManifest(manifestPath);

      assert.strictEqual(
        result.manifest.name,
        "Atomic Test",
      );
    },
  );

  await test(
    "backup is created before protected rewrite",
    async () => {
      const root = path.join(
        fixturesDir,
        "backup-test",
      );

      await fs.mkdir(root, { recursive: true });

      const manifestPath = path.join(
        root,
        PROJECT_MANIFEST_NAME,
      );

      await writeProjectManifest(
        manifestPath,
        makeManifest({
          name: "Before Backup",
        }),
      );

      await writeProjectManifest(
        manifestPath,
        makeManifest({
          name: "After Backup",
        }),
        {
          backupExisting: true,
        },
      );

      const backupRaw = await fs.readFile(
        `${manifestPath}.bak`,
        "utf8",
      );

      const backup = JSON.parse(backupRaw);

      assert.strictEqual(
        backup.name,
        "Before Backup",
      );
    },
  );

  await test(
    "valid project export/import round trip works",
    async () => {
      const sourceRoot = path.join(
        fixturesDir,
        "RoundTripSource",
      );

      await makeProject(
        sourceRoot,
        makeManifest({
          name: "RoundTripSource",
        }),
      );

      const archivePath = path.join(
        testRoot,
        "RoundTripProject.plproj",
      );

      await projectExport({
        projectRoot: sourceRoot,
        outPath: archivePath,
      });

      const result = await projectImport({
        filePath: archivePath,
        baseDir: importsDir,
      });

      assert.strictEqual(
        result.manifest.name,
        "RoundTripSource",
      );

      const importedFile = await fs.readFile(
        path.join(
          result.projectRoot,
          "sample.txt",
        ),
        "utf8",
      );

      assert.strictEqual(
        importedFile,
        "project fixture\n",
      );
    },
  );

  await test(
    "missing manifest import fails and cleans staging",
    async () => {
      const badRoot = path.join(
        fixturesDir,
        "missing-manifest",
      );

      await fs.mkdir(badRoot, {
        recursive: true,
      });

      await fs.writeFile(
        path.join(badRoot, "orphan.txt"),
        "bad fixture\n",
        "utf8",
      );

      const archivePath = path.join(
        testRoot,
        "MissingManifest.plproj",
      );

      await makeArchive(
        badRoot,
        archivePath,
      );

      await assert.rejects(
        () =>
          projectImport({
            filePath: archivePath,
            baseDir: importsDir,
          }),
        /missing manifest/i,
      );

      const finalPath = path.join(
        importsDir,
        "MissingManifest",
      );

      await assert.rejects(
        () => fs.access(finalPath),
      );

      const stagingDirs =
        await listStagingDirectories();

      assert.strictEqual(
        stagingDirs.length,
        0,
      );
    },
  );

  await test(
    "future-schema import fails and cleans staging",
    async () => {
      const badRoot = path.join(
        fixturesDir,
        "future-schema",
      );

      await makeProject(
        badRoot,
        makeManifest({
          schemaVersion:
            PROJECT_SCHEMA_VERSION + 1,
        }),
      ).catch(async () => {
        await fs.mkdir(
          badRoot,
          {
            recursive: true,
          },
        );

        await fs.writeFile(
          path.join(
            badRoot,
            PROJECT_MANIFEST_NAME,
          ),
          JSON.stringify(
            makeManifest({
              schemaVersion:
                PROJECT_SCHEMA_VERSION + 1,
            }),
            null,
            2,
          ),
          "utf8",
        );
      });

      const archivePath = path.join(
        testRoot,
        "FutureSchema.plproj",
      );

      await makeArchive(
        badRoot,
        archivePath,
      );

      await assert.rejects(
        () =>
          projectImport({
            filePath: archivePath,
            baseDir: importsDir,
          }),
        (error) =>
          error.code === "PROJECT_FROM_NEWER_VERSION",
      );

      const finalPath = path.join(
        importsDir,
        "FutureSchema",
      );

      await assert.rejects(
        () => fs.access(finalPath),
      );

      const stagingDirs =
        await listStagingDirectories();

      assert.strictEqual(
        stagingDirs.length,
        0,
      );
    },
  );

  await test(
    "all official resource states validate",
    async () => {
      for (const state of RESOURCE_STATES) {
        assert.strictEqual(
          validateResourceState(state),
          state,
        );
      }
    },
  );

  await test(
    "invalid resource state is rejected",
    async () => {
      assert.throws(
        () =>
          validateResourceState(
            "random-state",
          ),
        (error) =>
          error.code ===
          "INVALID_RESOURCE_STATE",
      );
    },
  );

  await test(
    "versioned subsystem envelope validates",
    async () => {
      const envelope =
        createVersionedEnvelope(
          "workflow",
          {
            id: "workflow-test",
          },
        );

      const result =
        validateVersionedEnvelope(
          envelope,
          {
            expectedKind: "workflow",
          },
        );

      assert.strictEqual(
        result.kind,
        "workflow",
      );
    },
  );

  await test(
    "future subsystem schema is rejected",
    async () => {
      const envelope = {
        schemaVersion: 999,
        kind: "slice",
        data: {},
      };

      assert.throws(
        () =>
          validateVersionedEnvelope(
            envelope,
            {
              expectedKind: "slice",
            },
          ),
        (error) =>
          error.code ===
          "DATA_FROM_NEWER_VERSION",
      );
    },
  );

  await test(
    "asset metadata validates resource state",
    async () => {
      const asset =
        createVersionedEnvelope(
          "asset",
          {
            id: "asset-test",
            state: "embedded",
          },
        );

      const result =
        validateAssetMetadata(asset);

      assert.strictEqual(
        result.data.state,
        "embedded",
      );
    },
  );

  await test(
    "project checksum validates unchanged manifest",
    async () => {
      const root = path.join(
        fixturesDir,
        "checksum-valid",
      );

      await makeProject(root);

      await writeProjectChecksums(root);

      const result =
        await validateProjectChecksums(
          root,
        );

      assert.strictEqual(
        result.valid,
        true,
      );
    },
  );

  await test(
    "project checksum detects changed manifest",
    async () => {
      const root = path.join(
        fixturesDir,
        "checksum-changed",
      );

      await makeProject(root);

      await writeProjectChecksums(root);

      const manifestPath = path.join(
        root,
        PROJECT_MANIFEST_NAME,
      );

      const manifest = makeManifest({
        name: "Changed After Checksum",
      });

      await writeProjectManifest(
        manifestPath,
        manifest,
      );

      const result =
        await validateProjectChecksums(
          root,
        );

      assert.strictEqual(
        result.valid,
        false,
      );

      assert.strictEqual(
        result.mismatches[0].reason,
        "CHECKSUM_MISMATCH",
      );
    },
  );

  await test(
    "project journal records integrity action",
    async () => {
      const root = path.join(
        fixturesDir,
        "journal-test",
      );

      await makeProject(root);

      const result =
        await writeProjectJournal(
          root,
          {
            type: "test",
            message:
              "Journal fixture",
          },
        );

      assert.strictEqual(
        result.journal.entries.length,
        1,
      );

      assert.strictEqual(
        result.journal.entries[0].type,
        "test",
      );
    },
  );

  await test(
    "integrity inspection reports healthy project",
    async () => {
      const root = path.join(
        fixturesDir,
        "integrity-healthy",
      );

      await makeProject(root);

      await writeProjectChecksums(root);

      const result =
        await inspectProjectIntegrity(
          root,
        );

      assert.strictEqual(
        result.healthy,
        true,
      );
    },
  );

  await test(
    "repair entry point restores manifest backup",
    async () => {
      const root = path.join(
        fixturesDir,
        "repair-backup",
      );

      await fs.mkdir(root, {
        recursive: true,
      });

      const manifestPath = path.join(
        root,
        PROJECT_MANIFEST_NAME,
      );

      await writeProjectManifest(
        manifestPath,
        makeManifest({
          name: "Good Manifest",
        }),
      );

      await writeProjectManifest(
        manifestPath,
        makeManifest({
          name: "Temporary Manifest",
        }),
        {
          backupExisting: true,
        },
      );

      await fs.writeFile(
        manifestPath,
        "{ corrupt",
        "utf8",
      );

      const repair =
        await repairProject(
          root,
          {
            restoreManifestBackup: true,
          },
        );

      assert.strictEqual(
        repair.repaired,
        true,
      );

      const restored =
        await readProjectManifest(
          manifestPath,
        );

      assert.strictEqual(
        restored.manifest.name,
        "Good Manifest",
      );
    },
  );

  await fs.rm(testRoot, {
    recursive: true,
    force: true,
  });

  console.log(
    `\nProject format test complete: ${passed} passed, ${failed} failed.`,
  );

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main().catch(async (error) => {
  console.error(error);

  await fs.rm(testRoot, {
    recursive: true,
    force: true,
  }).catch(() => {});

  process.exitCode = 1;
});
