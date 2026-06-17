const { dialog, BrowserWindow } = require("electron");
const path = require("path");

function getWindow() {
  return BrowserWindow.getAllWindows()[0] || null;
}

async function openProjectFolder() {
  const win = getWindow();
  const result = await dialog.showOpenDialog(win || undefined, {
    title: "Open Project Folder",
    properties: ["openDirectory"],
  });

  if (result.canceled || !result.filePaths.length) return null;
  return result.filePaths[0];
}

async function openPlprojFile() {
  const win = getWindow();
  const result = await dialog.showOpenDialog(win || undefined, {
    title: "Import Project",
    properties: ["openFile"],
    filters: [{ name: "PL Project", extensions: ["plproj"] }],
  });

  if (result.canceled || !result.filePaths.length) return null;
  return result.filePaths[0];
}

async function savePlprojFile(defaultName = "project.plproj") {
  const win = getWindow();
  const result = await dialog.showSaveDialog(win || undefined, {
    title: "Export Project",
    defaultPath: path.join(process.cwd(), defaultName),
    filters: [{ name: "PL Project", extensions: ["plproj"] }],
  });

  if (result.canceled || !result.filePath) return null;

  return result.filePath.endsWith(".plproj")
    ? result.filePath
    : `${result.filePath}.plproj`;
}

async function openAssetFile() {
  const win = getWindow();

  const result = await dialog.showOpenDialog(win || undefined, {
    title: "Import Asset",
    properties: ["openFile"],
    filters: [
      { name: "All Supported Assets", extensions: ["png", "jpg", "jpeg", "gif", "webp", "svg", "mp3", "wav", "ogg", "mp4", "mov", "obj", "gltf", "glb", "fbx", "txt", "md", "json", "csv"] },
      { name: "Images", extensions: ["png", "jpg", "jpeg", "gif", "webp", "svg"] },
      { name: "Audio", extensions: ["mp3", "wav", "ogg"] },
      { name: "Video", extensions: ["mp4", "mov"] },
      { name: "Models", extensions: ["obj", "gltf", "glb", "fbx"] },
      { name: "Documents", extensions: ["txt", "md", "json", "csv"] },
      { name: "All Files", extensions: ["*"] },
    ],
  });

  if (result.canceled || !result.filePaths.length) return null;
  return result.filePaths[0];
}

module.exports = {
  openProjectFolder,
  openPlprojFile,
  savePlprojFile,
  openAssetFile,
};
