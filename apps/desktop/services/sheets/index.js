const fs = require("fs/promises");
const path = require("path");

const DEFAULT_ROWS = 12;
const DEFAULT_COLUMNS = 6;
const SHEET_EXTENSION = ".plsheet.json";

function cleanProjectRoot(projectRoot) {
  const root = String(projectRoot || "").trim();
  if (!root) throw new Error("projectRoot is required");
  return root;
}

function getSheetsDir(projectRoot) {
  return path.join(cleanProjectRoot(projectRoot), "sheets");
}

function safeSheetName(name) {
  const clean = String(name || "").trim();

  if (!clean) throw new Error("Sheet name is required");

  if (clean.includes("..") || clean.includes("/") || clean.includes("\\")) {
    throw new Error("Sheet name must be a simple filename");
  }

  if (clean.endsWith(SHEET_EXTENSION)) return clean;
  if (clean.endsWith(".json")) return clean;

  return `${clean}${SHEET_EXTENSION}`;
}

function createEmptyGrid(rows = DEFAULT_ROWS, columns = DEFAULT_COLUMNS) {
  return Array.from({ length: rows }, () =>
    Array.from({ length: columns }, () => "")
  );
}

function createDefaultSheet(name) {
  return {
    version: 1,
    name,
    rows: DEFAULT_ROWS,
    columns: DEFAULT_COLUMNS,
    cells: createEmptyGrid(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function normalizeSheet(sheet, fallbackName) {
  const rows = Number(sheet?.rows || DEFAULT_ROWS);
  const columns = Number(sheet?.columns || DEFAULT_COLUMNS);
  const rawCells = Array.isArray(sheet?.cells) ? sheet.cells : [];

  const cells = Array.from({ length: rows }, (_, rowIndex) =>
    Array.from({ length: columns }, (_, columnIndex) => {
      const value = rawCells?.[rowIndex]?.[columnIndex];
      return value == null ? "" : String(value);
    })
  );

  return {
    version: 1,
    name: String(sheet?.name || fallbackName || "Untitled Sheet"),
    rows,
    columns,
    cells,
    createdAt: String(sheet?.createdAt || new Date().toISOString()),
    updatedAt: String(sheet?.updatedAt || new Date().toISOString()),
  };
}

async function ensureSheetsStorage(projectRoot) {
  const sheetsDir = getSheetsDir(projectRoot);
  await fs.mkdir(sheetsDir, { recursive: true });

  return { sheetsDir };
}

async function listSheets(params) {
  const sheetsDir = getSheetsDir(params?.projectRoot);
  await ensureSheetsStorage(params?.projectRoot);

  const entries = await fs.readdir(sheetsDir, { withFileTypes: true });

  const sheets = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => ({
      name: entry.name,
      path: path.join(sheetsDir, entry.name),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return { sheets };
}

async function createSheet(params) {
  const sheetsDir = getSheetsDir(params?.projectRoot);
  await ensureSheetsStorage(params?.projectRoot);

  const name = safeSheetName(params?.name || "untitled");
  const sheetPath = path.join(sheetsDir, name);
  const sheet = createDefaultSheet(name);

  try {
    await fs.writeFile(sheetPath, JSON.stringify(sheet, null, 2), {
      encoding: "utf8",
      flag: "wx",
    });
  } catch (error) {
    if (error.code === "EEXIST") {
      throw new Error(`Sheet already exists: ${name}`);
    }

    throw error;
  }

  return {
    name,
    path: sheetPath,
    sheet,
  };
}

async function readSheet(params) {
  const sheetsDir = getSheetsDir(params?.projectRoot);
  const name = safeSheetName(params?.name);
  const sheetPath = path.join(sheetsDir, name);

  const raw = await fs.readFile(sheetPath, "utf8");
  const parsed = JSON.parse(raw);
  const sheet = normalizeSheet(parsed, name);

  return {
    name,
    path: sheetPath,
    sheet,
  };
}

async function saveSheet(params) {
  const sheetsDir = getSheetsDir(params?.projectRoot);
  await ensureSheetsStorage(params?.projectRoot);

  const name = safeSheetName(params?.name);
  const sheetPath = path.join(sheetsDir, name);

  const sheet = normalizeSheet(
    {
      ...params?.sheet,
      name,
      updatedAt: new Date().toISOString(),
    },
    name
  );

  const tmpPath = `${sheetPath}.tmp`;

  await fs.writeFile(tmpPath, JSON.stringify(sheet, null, 2), "utf8");
  await fs.rename(tmpPath, sheetPath);

  return {
    name,
    path: sheetPath,
    sheet,
  };
}

module.exports = {
  getSheetsDir,
  ensureSheetsStorage,
  listSheets,
  createSheet,
  readSheet,
  saveSheet,
};
