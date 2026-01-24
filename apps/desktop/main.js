const { app, BrowserWindow } = require("electron");
const { startRpcServer } = require("./backend");

let rpcPort = 38741;

async function createWindow() {
  // Start JSON-RPC server first
  const { port } = await startRpcServer({ port: rpcPort });
  rpcPort = port;

  const win = new BrowserWindow({
    width: 1280,
    height: 800,
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

