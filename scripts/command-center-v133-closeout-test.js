
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(
  __dirname,
  "..",
);

function read(relativePath) {
  return fs.readFileSync(
    path.join(root, relativePath),
    "utf8",
  );
}

function check(condition, label) {
  assert.ok(condition, label);
  console.log(`PASS: ${label}`);
}

const runtime = read(
  "apps/desktop/services/runtime.js",
);

const operations = read(
  "apps/desktop/services/operations.js",
);

const contracts = read(
  "apps/desktop/rpc/contracts.js",
);

const registry = read(
  "apps/desktop/rpc/registry.js",
);

const exporter = read(
  "apps/desktop/services/diagnostics/export.js",
);

const healthRail = read(
  "apps/renderer/src/components/health/HealthContextRail.tsx",
);

const app = read(
  "apps/renderer/src/App.tsx",
);

const platform = read(
  "packages/platform/src/index.ts",
);

const {
  getMethodContract,
  derivePermissions,
} = require(
  "../apps/desktop/rpc/contracts",
);

const exportContract =
  getMethodContract(
    "diagnostics.export",
  );


check(
  runtime.includes(
    "createDiagnosticsHealthCollector",
  ),
  "diagnostics collector registered",
);

check(
  runtime.includes(
    "createSystemHealthCollector",
  ),
  "system collector registered",
);

check(
  runtime.includes(
    "createPluginHealthCollector",
  ),
  "plugin collector registered",
);

check(
  runtime.includes(
    "createLocalAiHealthCollector",
  ),
  "local AI collector registered",
);

check(
  runtime.includes(
    "createRecoveryHealthCollector",
  ),
  "recovery collector registered",
);

check(
  runtime.includes(
    "createIndexHealthCollector",
  ),
  "index collector registered",
);

check(
  runtime.includes(
    "createSyncHealthCollector",
  ),
  "sync collector registered",
);

check(
  runtime.includes(
    "createEngineHealthCollector",
  ),
  "engine collector registered",
);

check(
  operations.includes(
    "exportDiagnostics",
  ),
  "operational export method exists",
);

check(
  contracts.includes(
    '"diagnostics.export"',
  ),
  "diagnostic RPC contract exists",
);

check(
  exportContract !== null,
  "diagnostic export has a registered contract",
);

check(
  exportContract.mutates === true,
  "diagnostic export declares mutation",
);

check(
  exportContract.retryable === false,
  "diagnostic export cannot be automatically retried",
);

check(
  derivePermissions(
    exportContract,
  ).includes(
    "filesystem.write",
  ),
  "diagnostic export requires filesystem write permission",
);

check(
  registry.includes(
    '"diagnostics.export"',
  ),
  "diagnostic RPC registered",
);

check(
  exporter.includes(
    "SCHEMA_VERSION",
  ),
  "diagnostic schema versioned",
);

check(
  exporter.includes(
    "sanitizeHealth",
  ),
  "health export is minimized",
);

check(
  exporter.includes(
    "writeDiagnosticPackage",
  ),
  "diagnostic writer exists",
);

check(
  platform.includes(
    './health',
  ),
  "shared health types exported",
);

check(
  healthRail.includes(
    "Export Diagnostics",
  ),
  "Health Center exposes export action",
);

check(
  app.includes(
    "diagnostics.export",
  ),
  "renderer calls diagnostic export",
);

check(
  app.includes(
    "<ShellContextRail",
  ),
  "Health Center uses right rail",
);

check(
  app.includes(
    "healthSeverity",
  ),
  "health reaches status bar",
);

console.log(
  "PASS: v1.3.3 structural closeout",
);
