const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

const APP_PATH = path.join(
  ROOT,
  "apps/renderer/src/App.tsx"
);

const WORKSPACES_DIR = path.join(
  ROOT,
  "apps/renderer/src/components/workspaces"
);

const REQUIRED_WORKSPACES = [
  "CodeWorkspace.tsx",
  "DocsWorkspace.tsx",
  "SheetsWorkspace.tsx",
  "MovieWorkspace.tsx",
  "ModelingWorkspace.tsx",
  "GameWorkspace.tsx",
  "WorkspaceErrorBoundary.tsx",
  "index.ts",
];

let failures = 0;

function pass(message) {
  console.log(`PASS: ${message}`);
}

function fail(message) {
  failures += 1;
  console.error(`FAIL: ${message}`);
}

for (const file of REQUIRED_WORKSPACES) {
  const fullPath = path.join(
    WORKSPACES_DIR,
    file
  );

  if (fs.existsSync(fullPath)) {
    pass(`workspace file exists: ${file}`);
  } else {
    fail(`missing workspace file: ${file}`);
  }
}

const appSource = fs.readFileSync(
  APP_PATH,
  "utf8"
);

const expectedComponents = [
  "CodeWorkspace",
  "DocsWorkspace",
  "SheetsWorkspace",
  "MovieWorkspace",
  "ModelingWorkspace",
  "GameWorkspace",
  "WorkspaceErrorBoundary",
];

for (const component of expectedComponents) {
  if (appSource.includes(component)) {
    pass(`App references ${component}`);
  } else {
    fail(`App does not reference ${component}`);
  }
}

for (const file of REQUIRED_WORKSPACES) {
  if (
    file === "index.ts" ||
    file === "WorkspaceErrorBoundary.tsx"
  ) {
    continue;
  }

  const source = fs.readFileSync(
    path.join(WORKSPACES_DIR, file),
    "utf8"
  );

  if (
    source.includes('from "../../rpc"') ||
    source.includes('from "../rpc"') ||
    source.includes('from "../../../rpc"')
  ) {
    fail(
      `${file} imports renderer RPC directly`
    );
  } else {
    pass(
      `${file} has no direct renderer RPC dependency`
    );
  }
}

const appLineCount =
  appSource.split(/\r?\n/).length;

console.log(
  `INFO: App.tsx line count: ${appLineCount}`
);

if (failures > 0) {
  console.error(
    `Renderer architecture checks failed: ${failures}`
  );

  process.exit(1);
}

console.log(
  "Renderer architecture checks passed."
);
