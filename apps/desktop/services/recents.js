// apps/desktop/services/recents.js
const path = require("path");
const fs = require("fs/promises");

const { RECENTS_PATH } = require("../storage/paths");

// NOTE: ensureDir + nowIso are currently in backend.js.
// For now, we will keep small copies here to avoid circular imports.
// Later we can move them into util/.

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

function nowIso() {
  return new Date().toISOString();
}

function normalizeRecentItem(it) {
  if (!it || typeof it !== "object") return null;

  const projectRoot = typeof it.projectRoot === "string" ? it.projectRoot : "";
  if (!projectRoot) return null;

  const name =
    typeof it.name === "string" && it.name.trim()
      ? it.name.trim()
      : path.basename(projectRoot) || "Untitled";

  const lastOpenedAt =
    typeof it.lastOpenedAt === "string" && it.lastOpenedAt.trim()
      ? it.lastOpenedAt.trim()
      : nowIso();

  return { projectRoot, name, lastOpenedAt };
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
  await fs.rename(tmpPath, filePath);
}

async function readRecentsDb() {
  const fallback = { schemaVersion: 1, items: [] };
  const raw = await readJsonFileSafe(RECENTS_PATH, fallback);

  // Accept either v1 object or older array/object shapes
  let items = [];
  if (raw && raw.schemaVersion === 1 && Array.isArray(raw.items)) {
    items = raw.items;
  } else if (Array.isArray(raw)) {
    items = raw;
  } else if (raw && Array.isArray(raw.items)) {
    items = raw.items;
  }

  const normalized = items.map(normalizeRecentItem).filter(Boolean);
  const db = { schemaVersion: 1, items: normalized };

  // Heal/migrate on disk if needed
  if (!raw || raw.schemaVersion !== 1) {
    await writeJsonFileAtomic(RECENTS_PATH, db);
  }

  return db;
}

async function readRecents() {
  const db = await readRecentsDb();
  return [...db.items].sort((a, b) => (a.lastOpenedAt < b.lastOpenedAt ? 1 : -1));
}

async function addRecent(projectRoot, manifest) {
  const db = await readRecentsDb();

  const name =
    (manifest && typeof manifest.name === "string" && manifest.name.trim()) ||
    path.basename(projectRoot) ||
    "Untitled";

  const now = nowIso();

  // de-dupe then unshift newest
  const filtered = db.items.filter((it) => it.projectRoot !== projectRoot);
  filtered.unshift({ projectRoot, name: name.toString(), lastOpenedAt: now });

  db.items = filtered.slice(0, 50);

  await writeJsonFileAtomic(RECENTS_PATH, db);
  return db.items;
}


module.exports = {
  readRecents,
  addRecent,
};
