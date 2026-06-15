const { contextBridge, ipcRenderer } = require("electron");

const allowedMenuChannels = new Set([
  "menu:new-project",
  "menu:open-project",
  "menu:import-project",
  "menu:export-project",
]);

contextBridge.exposeInMainWorld("plMenu", {
  onMenuAction(callback) {
    if (typeof callback !== "function") return;

    const handler = (_event, channel) => {
      if (!allowedMenuChannels.has(channel)) return;
      callback(channel);
    };

    ipcRenderer.on("pl-menu-action", handler);

    return () => {
      ipcRenderer.removeListener("pl-menu-action", handler);
    };
  },
});
