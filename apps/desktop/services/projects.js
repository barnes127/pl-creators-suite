const path = require("path");
const fs = require("fs/promises");
const { spawn } = require("child_process");
const { PROJECTS_DIR } = require("../storage/paths");
const { addRecent } = require("./recents");
const { ensureDir, fileExists, appendLog } = require("../util/fs");
const {
  PROJECT_SCHEME_VERSION,
  PROJECT_MANIFEST_NAME,
} = require("./project/contract");

const {
  readProjectManifest,
  writeProjectManifest,
} = require("./project/persistence");


function runCmd(cmd, args, cwd) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { cwd, stdio: "pipe" });
    let out = "";
    let err = "";
    p.stdout.on("data", (d) => (out += d.toString()));
    p.stderr.on("data", (d) => (err += d.toString()));
    p.on("close", (code) => {
      if (code === 0) return resolve({ out, err });
      reject(new Error(`${cmd} ${args.join(" ")} failed (${code}): ${err || out}`));
    });
  });
}

function validateArchiveEntries(entries) {
  for (const entry of entries) {
    const normalizedEntry = entry.trim();

    if (!normalizedEntry) continue;

    const segments = normalizedEntry
      .replace(/\\/g, "/")
      .split("/")
      .filter(Boolean);

    const isAbsolute =
      normalizedEntry.startsWith("/") ||
      normalizedEntry.startsWith("\\") ||
      /^[A-Za-z]:/.test(normalizedEntry);

    const escapesRoot = segments.includes("..");

    if (isAbsolute || escapesRoot) {
      throw new Error(
        `Unsafe project archive entry: ${normalizedEntry}`,
      );
    }
  }
}

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

  await runCmd("zip", ["-r", outPath, "."], projectRoot);
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

  const listResult = await runCmd(
    "unzip",
    ["-Z1", filePath],
    process.cwd(),
  );

  const archiveEntries = listResult.out.split(/\r?\n/);

  validateArchiveEntries(archiveEntries);

  const stagingRoot = await fs.mkdtemp(
    path.join(baseDir, ".pl-import-"),
  );

  let installed = false;

  try {
    await runCmd(
      "unzip",
      ["-q", filePath, "-d", stagingRoot],
      process.cwd(),
    );

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
