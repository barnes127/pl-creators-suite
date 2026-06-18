const fs = require("fs/promises");
const path = require("path");

const MOVIE_EXTENSION = ".plmovie.json";

function cleanProjectRoot(projectRoot) {
  const root = String(projectRoot || "").trim();
  if (!root) throw new Error("projectRoot is required");
  return root;
}

function getMoviesDir(projectRoot) {
  return path.join(cleanProjectRoot(projectRoot), "movies");
}

function safeMovieName(name) {
  const clean = String(name || "").trim();

  if (!clean) throw new Error("Movie name is required");

  if (clean.includes("..") || clean.includes("/") || clean.includes("\\")) {
    throw new Error("Movie name must be a simple filename");
  }

  if (clean.endsWith(MOVIE_EXTENSION)) return clean;
  if (clean.endsWith(".json")) return clean;

  return `${clean}${MOVIE_EXTENSION}`;
}

function createDefaultMovie(name) {
  const now = new Date().toISOString();

  return {
    version: 1,
    name,
    title: name.replace(MOVIE_EXTENSION, ""),
    fps: 24,
    durationSeconds: 10,
    width: 1920,
    height: 1080,
    tracks: [
      {
        id: "track-video-1",
        name: "Video Track 1",
        type: "video",
        clips: [],
      },
      {
        id: "track-audio-1",
        name: "Audio Track 1",
        type: "audio",
        clips: [],
      },
    ],
    notes: "Start planning your movie or animation here.",
    createdAt: now,
    updatedAt: now,
  };
}

function normalizeMovie(movie, fallbackName) {
  const now = new Date().toISOString();

  return {
    version: 1,
    name: String(movie?.name || fallbackName || "untitled.plmovie.json"),
    title: String(movie?.title || fallbackName || "Untitled Movie"),
    fps: Number(movie?.fps || 24),
    durationSeconds: Number(movie?.durationSeconds || 10),
    width: Number(movie?.width || 1920),
    height: Number(movie?.height || 1080),
    tracks: Array.isArray(movie?.tracks) ? movie.tracks : [],
    notes: String(movie?.notes || ""),
    createdAt: String(movie?.createdAt || now),
    updatedAt: String(movie?.updatedAt || now),
  };
}

async function ensureMoviesStorage(projectRoot) {
  const moviesDir = getMoviesDir(projectRoot);
  await fs.mkdir(moviesDir, { recursive: true });

  return { moviesDir };
}

async function listMovies(params) {
  const moviesDir = getMoviesDir(params?.projectRoot);
  await ensureMoviesStorage(params?.projectRoot);

  const entries = await fs.readdir(moviesDir, { withFileTypes: true });

  const movies = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => ({
      name: entry.name,
      path: path.join(moviesDir, entry.name),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return { movies };
}

async function createMovie(params) {
  const moviesDir = getMoviesDir(params?.projectRoot);
  await ensureMoviesStorage(params?.projectRoot);

  const name = safeMovieName(params?.name || "untitled");
  const moviePath = path.join(moviesDir, name);
  const movie = createDefaultMovie(name);

  try {
    await fs.writeFile(moviePath, JSON.stringify(movie, null, 2), {
      encoding: "utf8",
      flag: "wx",
    });
  } catch (error) {
    if (error.code === "EEXIST") {
      throw new Error(`Movie already exists: ${name}`);
    }

    throw error;
  }

  return {
    name,
    path: moviePath,
    movie,
  };
}

async function readMovie(params) {
  const moviesDir = getMoviesDir(params?.projectRoot);
  const name = safeMovieName(params?.name);
  const moviePath = path.join(moviesDir, name);

  const raw = await fs.readFile(moviePath, "utf8");
  const parsed = JSON.parse(raw);
  const movie = normalizeMovie(parsed, name);

  return {
    name,
    path: moviePath,
    movie,
  };
}

async function saveMovie(params) {
  const moviesDir = getMoviesDir(params?.projectRoot);
  await ensureMoviesStorage(params?.projectRoot);

  const name = safeMovieName(params?.name);
  const moviePath = path.join(moviesDir, name);

  const movie = normalizeMovie(
    {
      ...params?.movie,
      name,
      updatedAt: new Date().toISOString(),
    },
    name
  );

  const tmpPath = `${moviePath}.tmp`;

  await fs.writeFile(tmpPath, JSON.stringify(movie, null, 2), "utf8");
  await fs.rename(tmpPath, moviePath);

  return {
    name,
    path: moviePath,
    movie,
  };
}

module.exports = {
  getMoviesDir,
  ensureMoviesStorage,
  listMovies,
  createMovie,
  readMovie,
  saveMovie,
};
