const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const repositoryRoot = path.resolve(__dirname, "..");

function runCommand(command, args = []) {
  try {
    return execFileSync(command, args, {
      cwd: repositoryRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  } catch {
    return "unavailable";
  }
}

function readJson(relativePath) {
  const filePath = path.join(repositoryRoot, relativePath);

  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function fileStatus(relativePath) {
  const filePath = path.join(repositoryRoot, relativePath);
  return fs.existsSync(filePath) ? "present" : "missing";
}

const rootPackage = readJson("package.json");
const desktopPackage = readJson("apps/desktop/package.json");
const rendererPackage = readJson("apps/renderer/package.json");

const report = {
  generatedAt: new Date().toISOString(),

  system: {
    platform: os.platform(),
    release: os.release(),
    architecture: os.arch(),
    cpuCount: os.cpus().length,
    totalMemoryGiB: Number(
      (os.totalmem() / 1024 / 1024 / 1024).toFixed(2),
    ),
  },

  toolchain: {
    nodeRuntime: process.version,
    nodeDeclared: rootPackage?.engines?.node ?? "not declared",
    pnpmRuntime: runCommand("pnpm", ["--version"]),
    pnpmDeclared: rootPackage?.engines?.pnpm ?? "not declared",
    packageManager:
      rootPackage?.packageManager ?? "not declared",
    git: runCommand("git", ["--version"]),
    electron:
      rootPackage?.devDependencies?.electron ??
      desktopPackage?.dependencies?.electron ??
      "not declared",
    electronBuilder:
      rootPackage?.devDependencies?.["electron-builder"] ??
      "not declared",
    typescript:
      rendererPackage?.devDependencies?.typescript ??
      desktopPackage?.devDependencies?.typescript ??
      "not declared",
    vite:
      rendererPackage?.devDependencies?.vite ??
      "not declared",
    react:
      rendererPackage?.dependencies?.react ??
      "not declared",
    three:
      rendererPackage?.dependencies?.three ??
      "not declared",
  },

  repository: {
    root: repositoryRoot,
    branch: runCommand("git", ["branch", "--show-current"]),
    commit: runCommand("git", ["rev-parse", "--short", "HEAD"]),
    nearestTag: runCommand("git", [
      "describe",
      "--tags",
      "--always",
    ]),
    workingTree: runCommand("git", [
      "status",
      "--short",
    ]) || "clean",
  },

  files: {
    nodeVersion: fileStatus(".node-version"),
    lockfile: fileStatus("pnpm-lock.yaml"),
    workspace: fileStatus("pnpm-workspace.yaml"),
    desktopEntry: fileStatus("apps/desktop/main.js"),
    backendEntry: fileStatus("apps/desktop/backend.js"),
    rendererSource: fileStatus("apps/renderer/src/App.tsx"),
    rendererBuild: fileStatus("apps/renderer/dist/index.html"),
  },
};

console.log(
  "PL Creators Suite — Environment Report",
);
console.log(
  JSON.stringify(report, null, 2),
);
