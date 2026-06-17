const http = require("http");
const os = require("os");
const path = require("path");
const fs = require("fs/promises");
const DEFAULT_PROJECTS_DIR = path.join(os.homedir(), "PLProjects");
const RECENTS_DIR = path.join(os.homedir(), ".plcs");
const RECENTS_PATH = path.join(RECENTS_DIR, "recent-projects.json");
const { spawn } = require("child_process");
const { app, dialog } = require("electron");
const projects = require("./services/projects");
const dialogs = require("./services/dialogs");
const plugins = require("./services/plugins/registry");
const pluginManifest = require("./services/plugins/manifest");
const pluginDiscovery = require("./services/plugins/discovery");
const entitlements = require("./services/entitlements");
const localAi = require("./services/ai/local");
const appMetadata = require("./services/app/metadata");
const assets = require("./services/assets");


async function readRecents() {
  try {
    const txt = await fs.readFile(RECENTS_PATH, "utf8");
    const data = JSON.parse(txt);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function writeRecents(list) {
  await ensureDir(RECENTS_DIR);
  await fs.writeFile(RECENTS_PATH, JSON.stringify(list, null, 2), "utf8");
}

async function addRecent(projectRoot, manifest) {
  const name = manifest?.name || path.basename(projectRoot);
  const now = nowIso();
  const list = await readRecents();

  const next = [
    { projectRoot, name, lastOpenedAt: now },
    ...list.filter((x) => x?.projectRoot !== projectRoot),
  ].slice(0, 10);

  await writeRecents(next);
  return next;
}

async function readJsonFileSafe(filePath, fallback) {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function writeJsonFileAtomic(filePath, data) {
  const dir = path.dirname(filePath);
  await ensureDir(dir);

  const tmpPath = `${filePath}.tmp`;
  const payload = JSON.stringify(data, null, 2);

  await fs.writeFile(tmpPath, payload, "utf-8");
  // rename is atomic on same filesystem
  await fs.rename(tmpPath, filePath);
}

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

function nowIso() {
  return new Date().toISOString();
}

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

async function appendLog(projectRoot, line) {
  // If no project is open yet, just skip logging to disk.
  if (!projectRoot) return;

  const logsDir = path.join(projectRoot, "logs");
  await ensureDir(logsDir);
  const logPath = path.join(logsDir, "session.log");
  await fs.appendFile(logPath, `[${nowIso()}] ${line}\n`, "utf8");
}

async function writeManifest(projectRoot, manifest) {
  const manifestPath = path.join(projectRoot, "pl-project.json");
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
  return manifestPath;
}

async function readManifest(projectRoot) {
  const manifestPath = path.join(projectRoot, "pl-project.json");
  const text = await fs.readFile(manifestPath, "utf8");
  return JSON.parse(text);
}

// ---- JSON-RPC Methods ----

async function project_create(params) {
  const name = (params?.name || "Untitled").toString().trim();
  const baseDir = (params?.baseDir || DEFAULT_PROJECTS_DIR).toString();
  const folderName = name.replace(/[<>:"/\\|?*\x00-\x1F]/g, "").slice(0, 64) || "Untitled";

  await ensureDir(baseDir);

  const projectRoot = path.join(baseDir, folderName);

  if (await fileExists(projectRoot)) {
    // avoid clobbering existing folder
    throw new Error(`Project folder already exists: ${projectRoot}`);
  }

  await ensureDir(projectRoot);

  const manifest = {
    schemaVersion: 1,
    name,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  const manifestPath = await writeManifest(projectRoot, manifest);
  await addRecent(projectRoot, manifest);
  await appendLog(projectRoot, `Created project "${name}"`);

  return { projectRoot, manifestPath, manifest };
}

async function project_open(params) {
  const projectRoot = (params?.projectRoot || "").toString();
  if (!projectRoot) throw new Error("projectRoot is required");

  const manifestPath = path.join(projectRoot, "pl-project.json");
  if (!(await fileExists(manifestPath))) {
    throw new Error(`Manifest not found: ${manifestPath}`);
  }

  const manifest = await readManifest(projectRoot);
  await addRecent(projectRoot, manifest);
  await appendLog(projectRoot, `Opened project "${manifest?.name || "Unknown"}"`);

  return { projectRoot, manifestPath, manifest };
}
async function project_export(params) {
  const projectRoot = (params?.projectRoot || "").toString();
  let outPath = (params?.outPath || "").toString();

  if (!projectRoot) throw new Error("projectRoot is required");

  const manifestPath = path.join(projectRoot, "pl-project.json");
  if (!(await fileExists(manifestPath))) {
    throw new Error(`Manifest not found: ${manifestPath}`);
  }

  if (!outPath) {
    const folderName = path.basename(projectRoot);
    outPath = path.join(path.dirname(projectRoot), `${folderName}.plproj`);
  }

  if (!outPath.endsWith(".plproj")) outPath += ".plproj";

  // Zip project root contents so pl-project.json sits at archive root
  await runCmd("zip", ["-r", outPath, "."], projectRoot);

  await appendLog(projectRoot, `Exported project to "${outPath}"`);
  return { outPath };
}
async function project_import(params) {
  const filePath = (params?.filePath || "").toString();
  const baseDir = (params?.baseDir || DEFAULT_PROJECTS_DIR).toString();

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

  // Unzip archive into projectRoot
  await runCmd("unzip", [filePath, "-d", projectRoot], process.cwd());

  const manifestPath = path.join(projectRoot, "pl-project.json");
  if (!(await fileExists(manifestPath))) {
    throw new Error(`Imported project missing manifest: ${manifestPath}`);
  }

  const manifestRaw = await fs.readFile(manifestPath, "utf-8");
  const manifest = JSON.parse(manifestRaw);

  await addRecent(projectRoot, manifest);
  await appendLog(projectRoot, `Imported project from "${filePath}"`);

  return { projectRoot, manifest };
}

async function logs_export(params) {
  const projectRoot = (params?.projectRoot || "").toString();
  if (!projectRoot) throw new Error("projectRoot is required");

  const logPath = path.join(projectRoot, "logs", "session.log");
  if (!(await fileExists(logPath))) {
    // Create an empty log file if missing
    await appendLog(projectRoot, "Log initialized");
  }

  return { logPath };
}

function normalizeRecentItem(it) {
  if (!it || typeof it !== "object") return null;

  const projectRoot = typeof it.projectRoot === "string" ? it.projectRoot : "";
  if (!projectRoot) return null;

  const name = typeof it.name === "string" && it.name.trim() ? it.name.trim() : path.basename(projectRoot) || "Untitled";
  const lastOpenedAt =
    typeof it.lastOpenedAt === "string" && it.lastOpenedAt.trim() ? it.lastOpenedAt.trim() : nowIso();

  return { projectRoot, name, lastOpenedAt };
}

function migrateRecentsToV1(maybeOld) {
  // v1 shape:
  // { schemaVersion: 1, items: [ {projectRoot, name, lastOpenedAt} ] }

  if (!maybeOld) return { schemaVersion: 1, items: [] };

  // Already v1?
  if (maybeOld.schemaVersion === 1 && Array.isArray(maybeOld.items)) {
    const items = maybeOld.items.map(normalizeRecentItem).filter(Boolean);
    return { schemaVersion: 1, items };
  }

  // Older/loose shapes:
  // - array directly
  // - { items: [...] } but no schemaVersion
  // - anything else => reset
  const arr = Array.isArray(maybeOld)
    ? maybeOld
    : Array.isArray(maybeOld.items)
      ? maybeOld.items
      : [];

  const items = arr.map(normalizeRecentItem).filter(Boolean);
  return { schemaVersion: 1, items };
}

async function readRecentsDb() {
  const fallback = { schemaVersion: 1, items: [] };
  const raw = await readJsonFileSafe(RECENTS_PATH, fallback);
  const db = migrateRecentsToV1(raw);

  // If migration changed shape, persist it (heals old/corrupt files)
  if (!raw || raw.schemaVersion !== 1) {
    await writeJsonFileAtomic(RECENTS_PATH, db);
  }

  return db;
}

async function writeRecentsDb(db) {
  await writeJsonFileAtomic(RECENTS_PATH, db);
}

async function readRecents() {
  const db = await readRecentsDb();

  // newest first
  const sorted = [...db.items].sort((a, b) => (a.lastOpenedAt < b.lastOpenedAt ? 1 : -1));
  return sorted;
}

async function addRecent(projectRoot, manifest) {
  const db = await readRecentsDb();

  const name =
    (manifest && typeof manifest.name === "string" && manifest.name.trim()) ||
    path.basename(projectRoot) ||
    "Untitled";

  const now = nowIso();

  // remove existing item
  const filtered = db.items.filter((it) => it.projectRoot !== projectRoot);

  filtered.unshift({
    projectRoot,
    name: name.toString(),
    lastOpenedAt: now,
  });

  // cap list size (adjust if you want)
  db.items = filtered.slice(0, 50);

  await writeRecentsDb(db);
  return db.items;
}

async function recent_list() {
  const list = await readRecents();
  return { items: list };
}

async function recent_add(params) {
  const projectRoot = (params?.projectRoot || "").toString();
  const manifest = params?.manifest || null;
  if (!projectRoot) throw new Error("projectRoot is required");
  const items = await addRecent(projectRoot, manifest);
  return { items };
}

async function dialog_open_plproj() {
  const result = await dialog.showOpenDialog({
    title: "Import Project (.plproj)",
    properties: ["openFile"],
    filters: [{ name: "PL Project", extensions: ["plproj"] }],
  });

  if (result.canceled || !result.filePaths?.length) {
    return { canceled: true };
  }

  return { canceled: false, filePath: result.filePaths[0] };
}

const METHODS = {
  "project.create": projects.projectCreate,
  "project.open": projects.projectOpen,
  "logs.export": logs_export,
  "recent.list": recent_list,
  "recent.add": recent_add,
  "project.export": projects.projectExport,
  "project.import": projects.projectImport,
  "assets.import": async (params) => {
    return assets.importAsset(params);
  },
  "assets.register": async (params) => {
    return assets.registerAsset(params);
  },
  "assets.ensure": async (params) => {
    return assets.ensureAssetStorage(params?.projectRoot);
  },
  "assets.list": async (params) => {
    return assets.listAssets(params);
  },
  "app.metadata": async () => {
    return { metadata: await appMetadata.getAppMetadata() };
  },
  "ai.local.status": async () => {
    return { status: await localAi.getLocalAiStatus() };
  },
  "ai.local.chat": async (params) => {
    return localAi.chat(params);
  },
  "entitlements.flags": async () => {
    return { flags: await entitlements.getFeatureFlags() };
  },
  "plugins.setEnabled": async (params) => {
    const plugin = await plugins.setPluginEnabled(params?.pluginId, params?.enabled);
    return { plugin, plugins: await plugins.listPlugins() };
  },
  "plugins.refreshDiscovered": async () => {
    const repoRoot = path.resolve(__dirname, "../..");
    return pluginDiscovery.refreshDiscoveredPlugins(repoRoot);
  },
  "plugins.validateManifest": async (params) => {
    return pluginManifest.validateManifest(params?.manifest);
  },
  "dialog.openProjectFolder": async () => {
  const folder = await dialogs.openProjectFolder();
  if (!folder) return { canceled: true };
  return { canceled: false, projectRoot: folder };
  },
  "dialog.openPlproj": async () => {
    const file = await dialogs.openPlprojFile();
    if (!file) return { canceled: true };
    return { canceled: false, filePath: file };
  },
  "dialog.savePlproj": async (params) => {
    const name = params?.defaultName || "project.plproj";
    const file = await dialogs.savePlprojFile(name);
    if (!file) return { canceled: true };
    return { canceled: false, filePath: file };
  },
  "dialog.openAssetFile": async () => {
    const file = await dialogs.openAssetFile();
    if (!file) return { canceled: true };
    return { canceled: false, filePath: file };
  },
  "plugins.list": async () => {
    return { plugins: await plugins.listPlugins() };
  },

};

function makeJsonRpcResponse(id, result, error) {
  if (error) {
    return {
      jsonrpc: "2.0",
      id: id ?? null,
      error: { code: -32000, message: error.message || String(error) },
    };
  }
  return { jsonrpc: "2.0", id: id ?? null, result };
}

function startRpcServer({ port }) {
  const server = http.createServer(async (req, res) => {
    // CORS for renderer fetch()
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "content-type");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.method !== "POST") {
      res.writeHead(405);
      res.end("Method Not Allowed");
      return;
    }

    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      try {
        const msg = JSON.parse(body || "{}");
        const { id, method, params } = msg;

        const fn = METHODS[method];
        if (!fn) throw new Error(`Unknown method: ${method}`);

        const result = await fn(params);
        const payload = makeJsonRpcResponse(id, result, null);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(payload));
      } catch (err) {
        const payload = makeJsonRpcResponse(null, null, err);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(payload));
      }
    });
  });

  return new Promise((resolve, reject) => {
    server.on("error", reject);
    server.listen(port, "127.0.0.1", () => {
      resolve({ server, port });
    });
  });
}

module.exports = { startRpcServer, DEFAULT_PROJECTS_DIR };
