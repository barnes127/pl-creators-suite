const http = require("http");
const os = require("os");
const path = require("path");
const fs = require("fs/promises");
const DEFAULT_PROJECTS_DIR = path.join(os.homedir(), "PLProjects");
const RECENTS_DIR = path.join(os.homedir(), ".plcs");
const RECENTS_PATH = path.join(RECENTS_DIR, "recent-projects.json");
const {
  createRpcMethods,
  METHOD_POLICIES
} = require("./rpc/registry");
const {
  RpcMethodNotFoundError,
  normalizeRpcError,
  serializeRpcError,
} = require("./rpc/errors");

const {
  createRpcExecutionManager,
} = require(
  "./rpc/execution",
);

const {
  createRpcAuthorizer,
} = require(
  "./rpc/authorization",
);

const {
  createRpcLogger,
} = require(
  "./rpc/logging",
);

const {
  validateMethodParams,
  assertMethodContractCoverage,
} = require(
  "./rpc/contracts",
);

const {
  validateRpcRequest,
  createCorrelationId,
  makeRpcSuccess,
  makeRpcFailure,
} = require("./rpc/protocol");

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

async function appendLog(projectRoot, line) {
  // If no project is open yet, just skip logging to disk.
  if (!projectRoot) return;

  const logsDir = path.join(projectRoot, "logs");
  await ensureDir(logsDir);
  const logPath = path.join(logsDir, "session.log");
  await fs.appendFile(logPath, `[${nowIso()}] ${line}\n`, "utf8");
}

// ---- JSON-RPC Methods ----

async function logs_export(params) {
  const projectRoot = (params?.projectRoot || "").toString();
  if (!projectRoot) throw new Error("projectRoot is required");

  const logPath = path.join(projectRoot, "logs", "session.log");
  if (!(await fileExists(logPath))) {
    //Create an empty log file if missing
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

let rpcExecutionManager =
  null;

const METHODS =
  createRpcMethods({
    logsExport: logs_export,
    recentList: recent_list,
    recentAdd: recent_add,
    cancelRequest: (requestId) => {
      if (!rpcExecutionManager) {
        return {
          cancelled: false,
          requestId,
          reason: "RPC execution manager is not ready.",
        };
      }

      return (rpcExecutionManager.cancel(requestId));
    },
  });

  assertMethodContractCoverage(
    METHODS,
  );

const rpcAuthorizer =
  createRpcAuthorizer();

const rpcLogger =
  createRpcLogger();

rpcExecutionManager =
  createRpcExecutionManager({
    methods:
      METHODS,

    policies:
      METHOD_POLICIES,

    authorize:
      rpcAuthorizer.authorize,

    onProgress:
      ({
        correlationId,
        method,
        progress,
      }) => {
        rpcLogger.progress({
          correlationId,
          method,
          progress,
        });
      },
  });

function startRpcServer({
  port,
  sessionToken,
 }) {

  if (
    typeof sessionToken !== "string" ||
    sessionToken.length < 32
  ) {
    throw new Error(
      "RPC server requires a valid session token",
    );
  }

  const server = http.createServer(async (req, res) => {
    // CORS for renderer fetch()
  const origin =
    req.headers.origin;

  const allowedOrigins =
    new Set([
      "http://localhost:5173",
      "null",
    ]);

  if (
    origin &&
    allowedOrigins.has(origin)
  ) {
    res.setHeader(
      "Access-Control-Allow-Origin",
      origin,
    );
  }
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "content-type, x-pl-rpc-token");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    const suppliedToken =
      req.headers["x-pl-rpc-token"];

    if (
      typeof suppliedToken !== "string" ||
      suppliedToken !== sessionToken
    ) {
      res.writeHead(403, {
        "Content-Type": "application/json",
      });

      res.end(
        JSON.stringify({
          error: "Forbidden",
        }),
      );

      return;
    }

    if (req.method !== "POST") {
      res.writeHead(405);
      res.end("Method Not Allowed");
      return;
    }

    let body = "";
    let bodyTooLarge = false;

    req.on("data", (chunk) => {
      if (bodyTooLarge) return;

      body += chunk;

      if (
        Buffer.byteLength(
          body,
          "utf8",
        ) > 1024 * 1024
      ) {
        bodyTooLarge = true;

        res.writeHead(413, {
          "Content-Type": "application/json",
        });

        res.end(
          JSON.stringify({
            error: "Request Too Large",
          }),
        );

        req.destroy();
      }
    });
    req.on("end", async () => {
      if (bodyTooLarge) {
        return;
      }
      let requestId = null;
      let requestMethod = null;
      const correlationId =
        createCorrelationId();

      try {
        const parsed =
          JSON.parse(body || "{}");

        const request =
          validateRpcRequest(parsed);

        requestId = request.id;
        requestMethod =
          request.method;

        rpcLogger.request({
          correlationId,
          requestId:
            request.id,
          method:
            request.method,
        });

       if (
         typeof METHODS[
           request.method
         ] !== "function"
       ) {
         throw new RpcMethodNotFoundError(
           request.method,
         );
       }

        const execution =
          await rpcExecutionManager
            .execute({
              requestId:
                request.id,

              method: request.method,

              rawParams: request.params,

              correlationId,
            });

        rpcLogger.success({
          correlationId,
          requestId:
            request.id,
          method:
            request.method,
        });

        const payload =
          makeRpcSuccess(
            request.id,
            execution.result,
            correlationId,
          );

        res.writeHead(200, {
          "Content-Type": "application/json",
        });

        res.end(
          JSON.stringify(payload),
        );
      } catch (error) {
        const normalized =
          normalizeRpcError(error);

        rpcLogger.failure({
          correlationId,
          requestId,
          method:
            requestMethod,
          error:
            normalized,
        });

        const payload =
          makeRpcFailure(
            requestId,
            serializeRpcError(
              normalized,
            ),
            correlationId,
          );

        res.writeHead(200, {
          "Content-Type": "application/json",
        });

        res.end(
          JSON.stringify(payload),
        );
      }
    });
  });

  return new Promise((resolve, reject) => {
    server.on(
      "error",
      reject,
    );

    server.listen(
      port,
      "127.0.0.1",
      () => {
        const address =
          server.address();

        const boundPort =
          typeof address === "object" &&
          address !== null
            ? address.port
            : port;

        resolve({
          server,
          port: boundPort,
        });
      },
    );
  });
}

module.exports = { startRpcServer, DEFAULT_PROJECTS_DIR };
