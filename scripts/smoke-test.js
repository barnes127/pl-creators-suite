const fs = require("node:fs");
const path = require("node:path");

const repositoryRoot = path.resolve(__dirname, "..");

let passed = 0;
let failed = 0;

function pass(message) {
  console.log(`PASS    ${message}`);
  passed += 1;
}

function fail(message) {
  console.error(`FAIL    ${message}`);
  failed += 1;
}

function check(condition, message) {
  if (condition) {
    pass(message);
  } else {
    fail(message);
  }
}

function readJson(relativePath) {
  const absolutePath = path.join(repositoryRoot, relativePath);

  try {
    return JSON.parse(fs.readFileSync(absolutePath, "utf8"));
  } catch (error) {
    fail(`${relativePath} is valid readable JSON`);
    console.error(`        ${error.message}`);
    return null;
  }
}

function fileExists(relativePath) {
  return fs.existsSync(path.join(repositoryRoot, relativePath));
}

console.log("PL Creators Suite — Repository Smoke Test");
console.log("");

const rootPackage = readJson("package.json");
const desktopPackage = readJson("apps/desktop/package.json");
const rendererPackage = readJson("apps/renderer/package.json");

check(rootPackage !== null, "root package.json loads");
check(desktopPackage !== null, "desktop package.json loads");
check(rendererPackage !== null, "renderer package.json loads");

const requiredFiles = [
  ".node-version",
  "pnpm-lock.yaml",
  "pnpm-workspace.yaml",
  "apps/desktop/main.js",
  "apps/desktop/backend.js",
  "apps/renderer/index.html",
  "apps/renderer/src/App.tsx",
  "apps/renderer/dist/index.html",
];

for (const relativePath of requiredFiles) {
  check(fileExists(relativePath), `${relativePath} exists`);
}

if (rootPackage) {
  check(
    rootPackage.packageManager === "pnpm@10.31.0",
    "root packageManager is pnpm@10.31.0",
  );

  check(
    rootPackage.engines?.node === "22.12.0",
    "declared Node version is 22.12.0",
  );

  check(
    rootPackage.engines?.pnpm === "10.31.0",
    "declared pnpm version is 10.31.0",
  );

  check(
    rootPackage.scripts?.["build:renderer"] !== undefined,
    "build:renderer script is registered",
  );

  check(
    rootPackage.scripts?.["env:report"] !== undefined,
    "env:report script is registered",
  );

  check(
    rootPackage.scripts?.["clean:build"] !== undefined,
    "clean:build script is registered",
  );
}

if (desktopPackage) {
  check(
    desktopPackage.main === "main.js",
    "desktop entry point is main.js",
  );

  check(
    desktopPackage.dependencies?.electron === "41.10.3",
    "desktop Electron version is 41.10.3",
  );
}

if (rendererPackage) {
  check(
    rendererPackage.dependencies?.react === "19.2.3",
    "renderer React version is 19.2.3",
  );

  check(
    rendererPackage.dependencies?.three === "0.184.0",
    "renderer Three.js version is 0.184.0",
  );

  check(
    rendererPackage.devDependencies?.typescript === "5.9.3",
    "renderer TypeScript version is 5.9.3",
  );

  check(
    rendererPackage.devDependencies?.vite === "7.3.2",
    "renderer Vite version is 7.3.2",
  );
}

console.log("");
console.log(`Smoke test complete: ${passed} passed, ${failed} failed.`);

if (failed > 0) {
  process.exitCode = 1;
}
