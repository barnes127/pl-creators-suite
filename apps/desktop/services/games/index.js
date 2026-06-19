const fs = require("fs/promises");
const path = require("path");

const GAME_EXTENSION = ".plgame.json";

function cleanProjectRoot(projectRoot) {
  const root = String(projectRoot || "").trim();
  if (!root) throw new Error("projectRoot is required");
  return root;
}

function getGamesDir(projectRoot) {
  return path.join(cleanProjectRoot(projectRoot), "games");
}

function safeGameName(name) {
  const clean = String(name || "").trim();

  if (!clean) throw new Error("Game name is required");

  if (clean.includes("..") || clean.includes("/") || clean.includes("\\")) {
    throw new Error("Game name must be a simple filename");
  }

  if (clean.endsWith(GAME_EXTENSION)) return clean;
  if (clean.endsWith(".json")) return clean;

  return `${clean}${GAME_EXTENSION}`;
}

function createDefaultGame(name) {
  const now = new Date().toISOString();

  return {
    version: 1,
    name,
    title: name.replace(GAME_EXTENSION, ""),
    targetPlatform: "desktop",
    genre: "prototype",
    scenes: [
      {
        id: "scene-main",
        name: "Main Scene",
        entities: [],
      },
    ],
    notes: "Start planning your game here.",
    createdAt: now,
    updatedAt: now,
  };
}

function normalizeGameEntity(entity) {
  return {
    id: String(entity?.id || `entity-${Date.now()}`),
    name: String(entity?.name || "Entity"),
    type: String(entity?.type || "object"),
    x: Number(entity?.x || 0),
    y: Number(entity?.y || 0),
    properties:
      entity?.properties && typeof entity.properties === "object"
        ? entity.properties
        : {},
  };
}

function normalizeGameScene(scene) {
  return {
    id: String(scene?.id || `scene-${Date.now()}`),
    name: String(scene?.name || "Scene"),
    entities: Array.isArray(scene?.entities)
      ? scene.entities.map(normalizeGameEntity)
      : [],
  };
}

function normalizeGame(game, fallbackName) {
  const now = new Date().toISOString();

  return {
    version: 1,
    name: String(game?.name || fallbackName || "untitled.plgame.json"),
    title: String(game?.title || fallbackName || "Untitled Game"),
    targetPlatform: String(game?.targetPlatform || "desktop"),
    genre: String(game?.genre || "prototype"),
    scenes: Array.isArray(game?.scenes)
      ? game.scenes.map(normalizeGameScene)
      : [],
    notes: String(game?.notes || ""),
    createdAt: String(game?.createdAt || now),
    updatedAt: String(game?.updatedAt || now),
  };
}

async function ensureGamesStorage(projectRoot) {
  const gamesDir = getGamesDir(projectRoot);
  await fs.mkdir(gamesDir, { recursive: true });

  return { gamesDir };
}

async function listGames(params) {
  const gamesDir = getGamesDir(params?.projectRoot);
  await ensureGamesStorage(params?.projectRoot);

  const entries = await fs.readdir(gamesDir, { withFileTypes: true });

  const games = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => ({
      name: entry.name,
      path: path.join(gamesDir, entry.name),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return { games };
}

async function createGame(params) {
  const gamesDir = getGamesDir(params?.projectRoot);
  await ensureGamesStorage(params?.projectRoot);

  const name = safeGameName(params?.name || "untitled");
  const gamePath = path.join(gamesDir, name);
  const game = createDefaultGame(name);

  try {
    await fs.writeFile(gamePath, JSON.stringify(game, null, 2), {
      encoding: "utf8",
      flag: "wx",
    });
  } catch (error) {
    if (error.code === "EEXIST") {
      throw new Error(`Game already exists: ${name}`);
    }

    throw error;
  }

  return {
    name,
    path: gamePath,
    game,
  };
}

async function readGame(params) {
  const gamesDir = getGamesDir(params?.projectRoot);
  const name = safeGameName(params?.name);
  const gamePath = path.join(gamesDir, name);

  const raw = await fs.readFile(gamePath, "utf8");
  const parsed = JSON.parse(raw);
  const game = normalizeGame(parsed, name);

  return {
    name,
    path: gamePath,
    game,
  };
}

async function saveGame(params) {
  const gamesDir = getGamesDir(params?.projectRoot);
  await ensureGamesStorage(params?.projectRoot);

  const name = safeGameName(params?.name);
  const gamePath = path.join(gamesDir, name);

  const game = normalizeGame(
    {
      ...params?.game,
      name,
      updatedAt: new Date().toISOString(),
    },
    name
  );

  const tmpPath = `${gamePath}.tmp`;

  await fs.writeFile(tmpPath, JSON.stringify(game, null, 2), "utf8");
  await fs.rename(tmpPath, gamePath);

  return {
    name,
    path: gamePath,
    game,
  };
}

module.exports = {
  getGamesDir,
  ensureGamesStorage,
  listGames,
  createGame,
  readGame,
  saveGame,
};
