const fs = require("fs/promises");
const path = require("path");

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
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

async function writeJsonFileAtomic(filePath, data) {
  const dir = path.dirname(filePath);
  await ensureDir(dir);

  const tmpPath = `${filePath}.tmp`;
  const payload = JSON.stringify(data, null, 2);

  await fs.writeFile(tmpPath, payload, "utf-8");
  await fs.rename(tmpPath, filePath);
}

async function appendLog(projectRoot, line) {
  // simple file log inside project
  const logPath = path.join(projectRoot, "pl.log");
  const msg = `[${nowIso()}] ${line}\n`;
  await fs.appendFile(logPath, msg, "utf-8");
  return logPath;
}

module.exports = {
  ensureDir,
  fileExists,
  nowIso,
  writeJsonFileAtomic,
  appendLog,
};
