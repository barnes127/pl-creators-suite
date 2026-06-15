const { app, BrowserWindow } = require("electron");
const { startRpcServer } = require("./backend");
const { loadWindowState, saveWindowState } = require("./storage/windowState");
const { createAppMenu } = require("./services/menu");

let rpcPort = 38741;

async function createWindow() {
  // Start JSON-RPC server first
  const { port } = await startRpcServer({ port: rpcPort });
  rpcPort = port;

 const state = await loadWindowState();

const win = new BrowserWindow({
  width: state.width,
  height: state.height,
  x: state.x,
  y: state.y,
  // keep all your existing options here
});

createAppMenu({
  onNewProject: () => {
    win.webContents.send("menu:new-project");
  },
  onOpenProject: () => {
    win.webContents.send("menu:open-project");
  },
  onImportProject: () => {
    win.webContents.send("menu:import-project");
  },
  onExportProject: () => {
    win.webContents.send("menu:export-project");
  },
});

if (state.isMaximized) {
  win.maximize();
}

win.on("close", async () => {
  try {
    await saveWindowState(win);
  } catch {}
});

  // Pass port to renderer via query param (dev)
  win.loadURL(`http://localhost:5173/?rpcPort=${rpcPort}`);
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

