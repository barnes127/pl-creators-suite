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

// ---- paste your recents logic below ----

module.exports = {
  readRecents,
  addRecent,
};
