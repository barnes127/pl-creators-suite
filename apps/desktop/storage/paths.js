const { app } = require("electron");
const path = require("path");
const os = require("os");

const PROJECTS_DIR = path.join(os.homedir(), "PLProjects");

const USER_DATA_DIR = app.getPath("userData");
const RECENTS_PATH = path.join(USER_DATA_DIR, "recents.json");

module.exports = { USER_DATA_DIR, RECENTS_PATH, PROJECTS_DIR };
