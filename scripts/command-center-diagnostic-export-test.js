const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const {buildDiagnosticPackage, writeDiagnosticPackage} = require("../apps/desktop/services/diagnostics/export");

async function run() {
  const root = await fs.mkdtemp(
    path.join(
      os.tmpdir(),
      "pl-diagnostic-export-",
    ),
  );

  try {
    const secret = "PRIVATE-SESSION-TOKEN-123";
    const privatePath = "/home/example/private/project.txt";
    const input = {
      projectOpen: true,
      health: {
        generatedAt:
          new Date().toISOString(),
        overallSeverity: "warning",
        summary: {
          collectorCount: 2,
          sourceCount: 1,
          findingCount: 1,
          sourceCounts: {warning: 1},
          findingCounts: {warning: 1},
        },
        sources: [{
          id: secret,
          category: "system",
          severity: "warning",
          status: "degraded",
          summary: privatePath,
          details: {token: secret},
        }],
        findings: [{
          id: secret,
          severity: "warning",
          status: "degraded",
          title: privatePath,
          details: {password: secret},
        }],
      },
      diagnostics: {
        logs: [{
          timestamp:
            new Date().toISOString(),
          level: "error",
          message: secret,
          details: {
            password: secret,
            path: privatePath,
          },
        }],
        problems: [{
          severity: "warning",
          message: secret,
        }],
        crashes: [{
          message: privatePath,
          stack: secret,
        }],
        resources: [{
          cpuPercent: 22,
          memoryBytes: 4096,
          details: {secret},
        }],
        jobs: [{
          status: "failed",
          command: secret,
        }],
      },
    };
    const diagnosticPackage = buildDiagnosticPackage(input);
    assert.equal(
      diagnosticPackage.schemaVersion,
      1,
    );
    assert.equal(
      diagnosticPackage.kind,
      "pl-diagnostic-export",
    );
    assert.equal(
      diagnosticPackage.context.projectOpen,
      true,
    );
    assert.equal(
      diagnosticPackage.health.summary.sourceCount,
      1,
    );
    const serialized = JSON.stringify(diagnosticPackage);
    assert.ok(!serialized.includes(secret));
    assert.ok(!serialized.includes(privatePath));
    assert.ok(!serialized.includes('"password"'));
    assert.ok(!serialized.includes('"stack"'));
    const destination = path.join(
      root,
      "exports",
      "diagnostics.json",
    );
    const result =
      await writeDiagnosticPackage(
        diagnosticPackage,
        destination,
      );
    assert.equal(
      result.path,
      destination,
    );
    const written = JSON.parse(
      await fs.readFile(
        destination,
        "utf8",
      ),
    );
    assert.equal(
      written.schemaVersion,
      1,
    );
    await assert.rejects(
      writeDiagnosticPackage(
        diagnosticPackage,
        destination,
      ),
      { code: "EEXIST" },
    );
    const afterFailure = JSON.parse(
      await fs.readFile(
        destination,
        "utf8",
      ),
    );
    assert.deepEqual(
      written,
      afterFailure,
    );
    const entries = await fs.readdir(
      path.dirname(destination),
    );
    assert.deepEqual(
      entries,
      ["diagnostics.json"],
    );
    const emptyPackage =
      buildDiagnosticPackage({
        projectOpen: false,
      });
    assert.equal(
      emptyPackage.context.projectOpen,
      false,
    );
    assert.deepEqual(
      emptyPackage.diagnostics.logs,
      [],
    );
    console.log("PASS: diagnostic export schema");
    console.log("PASS: private content excluded");
    console.log("PASS: atomic exclusive export");
    console.log("PASS: no-project export");
  } finally {
    await fs.rm(root, {
      recursive: true,
      force: true,
    });
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
