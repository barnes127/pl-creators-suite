const path = require("path");
const fs = require("fs/promises");
const { app, screen } = require("electron");
const { ensureDir, writeJsonFileAtomic } = require("../util/fs");

function getStatePath() {
  return path.join(app.getPath("userData"), "window-state.json");
}

function clampToVisibleDisplay(bounds) {
  const displays = screen.getAllDisplays();

  const visible = displays.some((d) => {
    const wa = d.workArea;
    return (
      bounds.x < wa.x + wa.width &&
      bounds.x + bounds.width > wa.x &&
      bounds.y < wa.y + wa.height &&
      bounds.y + bounds.height > wa.y
    );
  });

  if (visible) return bounds;

  const primary = screen.getPrimaryDisplay().workArea;
  return {
    width: bounds.width,
    height: bounds.height,
    x: Math.round(primary.x + primary.width / 2 - bounds.width / 2),
    y: Math.round(primary.y + primary.height / 2 - bounds.height / 2),
  };
}

async function loadWindowState() {
  try {
    const raw = await fs.readFile(getStatePath(), "utf8");
    const data = JSON.parse(raw);

    const state = {
      width: Number(data.width) || 1100,
      height: Number(data.height) || 720,
      x: Number.isFinite(data.x) ? data.x : undefined,
      y: Number.isFinite(data.y) ? data.y : undefined,
      isMaximized: !!data.isMaximized,
    };

    if (Number.isFinite(state.x) && Number.isFinite(state.y)) {
      return { ...clampToVisibleDisplay(state), isMaximized: state.isMaximized };
    }

    return state;
  } catch {
    return { width: 1100, height: 720, isMaximized: false };
  }
}

async function saveWindowState(win) {
  if (!win) return;

  const bounds = win.getBounds();
  const data = {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    isMaximized: win.isMaximized(),
    updatedAt: new Date().toISOString(),
  };

  await ensureDir(path.dirname(getStatePath()));
  await writeJsonFileAtomic(getStatePath(), data);
}

module.exports = { loadWindowState, saveWindowState };
