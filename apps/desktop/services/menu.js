const { Menu, app } = require("electron");

function createAppMenu({ onNewProject, onOpenProject, onImportProject, onExportProject }) {
  const template = [
    {
      label: "File",
      submenu: [
        {
          label: "New Project",
          accelerator: "CmdOrCtrl+N",
          click: onNewProject,
        },
        {
          label: "Open Project",
          accelerator: "CmdOrCtrl+O",
          click: onOpenProject,
        },
        { type: "separator" },
        {
          label: "Import Project",
          accelerator: "CmdOrCtrl+I",
          click: onImportProject,
        },
        {
          label: "Export Project",
          accelerator: "CmdOrCtrl+E",
          click: onExportProject,
        },
        { type: "separator" },
        {
          label: "Quit",
          accelerator: "CmdOrCtrl+Q",
          click: () => app.quit(),
        },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

module.exports = { createAppMenu };
