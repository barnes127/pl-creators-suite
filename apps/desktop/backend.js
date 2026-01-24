const http = require("http");
const os = require("os");
const path = require("path");
const fs = require("fs/promises");

const DEFAULT_PROJECTS_DIR = path.join(os.homedir(), "PLProjects");

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
  await appendLog(projectRoot, `Opened project "${manifest?.name || "Unknown"}"`);

  return { projectRoot, manifestPath, manifest };
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

const METHODS = {
  "project.create": project_create,
  "project.open": project_open,
  "logs.export": logs_export,
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
