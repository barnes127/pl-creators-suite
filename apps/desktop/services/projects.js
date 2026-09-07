const path = require("path");
const fs = require("fs/promises");
const { PROJECTS_DIR } = require("../storage/paths");
const { addRecent } = require("./recents");
const { ensureDir, fileExists, appendLog } = require("../util/fs");
const {
  PROJECT_SCHEMA_VERSION,
  PROJECT_MANIFEST_NAME,
} = require("./project/contract");

const {
  readProjectManifest,
  writeProjectManifest,
} = require("./project/persistence");

const {
  createZipArchive,
  extractZipArchive,
  listZipArchiveEntries,
  validateArchiveEntries,
} = require("./formats/archive");

/**
 * Create a new project
 */
async function projectCreate({ name, baseDir }) {
  const safeName = (name || "Untitled")
    .toString()
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
    .slice(0, 64) || "Untitled";

  const rootDir = baseDir || PROJECTS_DIR;
  await ensureDir(rootDir);

  const projectRoot = path.join(rootDir, safeName);

  if (await fileExists(projectRoot)) {
    throw new Error("Project already exists");
  }

  await ensureDir(projectRoot);

  const createdAt = new Date().toISOString();

  const manifest = {
    schemaVersion: PROJECT_SCHEMA_VERSION,
    name: safeName,
    createdAt,
    updatedAt: createdAt,
  };

  const manifestPath = path.join(
    projectRoot,
    PROJECT_MANIFEST_NAME,
  );

  await writeProjectManifest(manifestPath, manifest);

  await addRecent(projectRoot, manifest);

  return { projectRoot, manifestPath, manifest };
}

/**
 * Open an existing project
 */
async function projectOpen({ projectRoot }) {
  if (!projectRoot) throw new Error("projectRoot required");

  const manifestPath = path.join(
    projectRoot,
    PROJECT_MANIFEST_NAME,
  );

  if (!(await fileExists(manifestPath))) {
    throw new Error("Invalid project (missing manifest)");
  }

  const {
    manifest,
    migrated,
  } = await readProjectManifest(manifestPath);

  if (migrated) {
    await writeProjectManifest(
      manifestPath,
      manifest,
      { backupExisting: true },
    );
  }

  await addRecent(projectRoot, manifest);

  return { projectRoot, manifestPath, manifest };
}

async function projectExport(params = {}) {
  const projectRoot = (params.projectRoot || "").toString().trim();
  let outPath = (params.outPath || "").toString().trim();

  if (!projectRoot) throw new Error("projectRoot is required");

  if (!outPath) {
    const folderName = path.basename(projectRoot);
    outPath = path.join(path.dirname(projectRoot), `${folderName}.plproj`);
  }
  if (!outPath.endsWith(".plproj")) outPath += ".plproj";

  await createZipArchive(projectRoot, outPath);
  await appendLog(projectRoot, `Exported project to "${outPath}"`);

  return { outPath };
}

async function projectImport(params = {}) {
  const filePath = (params.filePath || "").toString().trim();
  const baseDir = (params.baseDir || PROJECTS_DIR).toString();

  if (!filePath) {
    throw new Error("filePath is required");
  }

  if (!filePath.endsWith(".plproj")) {
    throw new Error("Expected a .plproj file");
  }

  if (!(await fileExists(filePath))) {
    throw new Error(`Project archive does not exist: ${filePath}`);
  }

  await ensureDir(baseDir);

  const baseName = path
    .basename(filePath)
    .replace(/\.plproj$/i, "");

  const folderName =
    baseName
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
      .slice(0, 64) || "ImportedProject";

  const projectRoot = path.join(baseDir, folderName);

  if (await fileExists(projectRoot)) {
    throw new Error(
      `Project folder already exists: ${projectRoot}`,
    );
  }

  const archiveEntries =
    await listZipArchiveEntries(filePath);

  validateArchiveEntries(archiveEntries);

  const stagingRoot = await fs.mkdtemp(
    path.join(baseDir, ".pl-import-"),
  );

  let installed = false;

  try {
    await extractZipArchive(filePath, stagingRoot);

    const manifestPath = path.join(
      stagingRoot,
      PROJECT_MANIFEST_NAME,
    );

    if (!(await fileExists(manifestPath))) {
      throw new Error(
        "Imported project missing manifest",
      );
    }

    const {
      manifest,
      migrated,
    } = await readProjectManifest(manifestPath);

    if (migrated) {
      await writeProjectManifest(
        manifestPath,
        manifest,
        { backupExisting: true },
      );
    }

    await fs.rename(stagingRoot, projectRoot);

    installed = true;

    await addRecent(projectRoot, manifest);

    await appendLog(
      projectRoot,
      `Imported project from "${filePath}"`,
    );

    return {
      projectRoot,
      manifest,
    };
  } finally {
    if (!installed) {
      await fs.rm(
        stagingRoot,
        {
          recursive: true,
          force: true,
        },
      );
    }
  }
}

module.exports = {
  projectCreate,
  projectOpen,
  projectExport,
  projectImport,
};
