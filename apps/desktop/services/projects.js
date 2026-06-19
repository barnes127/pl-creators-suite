const path = require("path");
const fs = require("fs/promises");
const { spawn } = require("child_process");
const { PROJECTS_DIR } = require("../storage/paths");
const { addRecent } = require("./recents");
const { ensureDir, fileExists, nowIso, appendLog } = require("../util/fs");


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

  const manifest = {
    schemaVersion: 1,
    name: safeName,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const manifestPath = path.join(projectRoot, "pl-project.json");
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf8");

  await addRecent(projectRoot, manifest);

  return { projectRoot, manifestPath, manifest };
}

/**
 * Open an existing project
 */
async function projectOpen({ projectRoot }) {
  if (!projectRoot) throw new Error("projectRoot required");

  const manifestPath = path.join(projectRoot, "pl-project.json");
  if (!(await fileExists(manifestPath))) {
    throw new Error("Invalid project (missing manifest)");
  }

  const raw = await fs.readFile(manifestPath, "utf8");
  const manifest = JSON.parse(raw);

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

  if (!filePath) throw new Error("filePath is required");
  if (!filePath.endsWith(".plproj")) throw new Error("Expected a .plproj file");

  await ensureDir(baseDir);

  const baseName = path.basename(filePath).replace(/\.plproj$/i, "");
  const folderName =
    baseName.replace(/[<>:"/\\|?*\x00-\x1F]/g, "").slice(0, 64) || "ImportedProject";

  const projectRoot = path.join(baseDir, folderName);

  if (await fileExists(projectRoot)) {
    throw new Error(`Project folder already exists: ${projectRoot}`);
  }

  await ensureDir(projectRoot);
  await runCmd("unzip", [filePath, "-d", projectRoot], process.cwd());

  const manifestPath = path.join(projectRoot, "pl-project.json");
  if (!(await fileExists(manifestPath))) {
    throw new Error(`Imported project missing manifest`);
  }

  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
  await addRecent(projectRoot, manifest);
  await appendLog(projectRoot, `Imported project from "${filePath}"`);

  return { projectRoot, manifest };
}

module.exports = {
  projectCreate,
  projectOpen,
  projectExport,
  projectImport,
};
