const fs = require("fs/promises");
const path = require("path");
const { app } = require("electron");

async function readRootPackageJson() {
  const packagePath = path.join(app.getAppPath(), "package.json");
  const raw = await fs.readFile(packagePath, "utf8");
  return JSON.parse(raw);
}

async function getAppMetadata() {
  const pkg = await readRootPackageJson();

  return {
    name: pkg.name || "pl-creators-suite",
    productName: pkg.productName || "PL Creators Suite",
    version: pkg.version || app.getVersion(),
    description: pkg.description || "",
    appId: "com.praecursorlabs.plcreatorssuite",
    isPackaged: app.isPackaged,
  };
}

module.exports = {
  getAppMetadata,
};
