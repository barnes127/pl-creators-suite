const assert =
  require("assert");

const {
  HealthService,
  createPluginHealthCollector,
  createLocalAiHealthCollector,
  createRecoveryHealthCollector,
  createIndexHealthCollector,
  createSyncHealthCollector,
  createEngineHealthCollector,
} = require(
  "../apps/desktop/services/health",
);


let passed = 0;
let failed = 0;


async function check(
  message,
  operation,
) {
  try {
    await operation();

    passed += 1;

    console.log(
      `PASS    ${message}`,
    );
  } catch (error) {
    failed += 1;

    console.error(
      `FAIL    ${message}`,
    );

    console.error(error);
  }
}


async function main() {
  console.log(
    "\nPL Creators Suite — v1.3.3 Service Health Test\n",
  );


  await check(
    "extension health uses real registry state",
    async () => {
      const collector =
        createPluginHealthCollector({
          async listPlugins() {
            return [
              {
                id: "a",
                name: "A",
                version: "1.0.0",
                type: "tool",
                enabled: true,
                apiVersion: "1",
              },
              {
                id: "b",
                name: "B",
                version: "1.0.0",
                type: "tool",
                enabled: false,
                apiVersion: "1",
              },
            ];
          },
        });

      const result =
        await collector.collect();

      assert.equal(
        result.source
          .details.total,
        2,
      );

      assert.equal(
        result.source
          .details.enabled,
        1,
      );

      assert.equal(
        result.source.status,
        "healthy",
      );
    },
  );


  await check(
    "unavailable optional AI is not treated as suite failure",
    async () => {
      const collector =
        createLocalAiHealthCollector({
          async getLocalAiStatus() {
            return {
              available: false,
              provider: "ollama",
              model: null,
              models: [],
              reason: "offline",
              host: "127.0.0.1:11434",
            };
          },
        });

      const result =
        await collector.collect();

      assert.equal(
        result.source.status,
        "disabled",
      );

      assert.equal(
        result.source.severity,
        "healthy",
      );
    },
  );


  await check(
    "available local AI reports provider and model",
    async () => {
      const collector =
        createLocalAiHealthCollector({
          async getLocalAiStatus() {
            return {
              available: true,
              provider: "ollama",
              model: "fixture",
              models: [
                {
                  name: "fixture",
                },
              ],
              reason: "",
              host: "127.0.0.1:11434",
            };
          },
        });

      const result =
        await collector.collect();

      assert.equal(
        result.source.status,
        "healthy",
      );

      assert.equal(
        result.source
          .details.model,
        "fixture",
      );
    },
  );


  await check(
    "recovery source is neutral without open project",
    async () => {
      const collector =
        createRecoveryHealthCollector({
          async inspectRecoveryStatus() {
            throw new Error(
              "should not run",
            );
          },
        });

      const result =
        await collector.collect({});

      assert.equal(
        result.source.status,
        "disabled",
      );
    },
  );


  await check(
    "interrupted project recovery becomes warning",
    async () => {
      const collector =
        createRecoveryHealthCollector({
          async inspectRecoveryStatus() {
            return {
              state:
                "interrupted",

              cleanShutdown:
                false,

              autosaveCount:
                1,

              journalEntryCount:
                2,

              recoverableCount:
                1,

              latestRecoveryAt:
                "2026-09-30T00:00:00.000Z",

              entries: [
                {
                  kind:
                    "snapshot",
                },
              ],
            };
          },
        });

      const result =
        await collector.collect({
          projectRoot:
            "/tmp/project",
        });

      assert.equal(
        result.source.status,
        "degraded",
      );

      assert.equal(
        result.source.severity,
        "warning",
      );

      assert.equal(
        result.findings.length,
        1,
      );
    },
  );


  await check(
    "recovery health exposes real backup availability",
    async () => {
      const collector =
        createRecoveryHealthCollector({
          async inspectRecoveryStatus() {
            return {
              state:
                "recoverable",

              cleanShutdown:
                true,

              autosaveCount:
                0,

              journalEntryCount:
                0,

              recoverableCount:
                1,

              latestRecoveryAt:
                "2026-09-30T00:00:00.000Z",

              entries: [
                {
                  kind:
                    "checkpoint",
                },
              ],
            };
          },
        });

      const result =
        await collector.collect({
          projectRoot:
            "/tmp/project",
        });

      assert.equal(
        result.source
          .details
          .backup
          .available,
        true,
      );

      assert.equal(
        result.source
          .details
          .backup
          .snapshotCount,
        1,
      );
    },
  );


  await check(
    "index source is neutral without open project",
    async () => {
      const collector =
        createIndexHealthCollector({
          async getIndexStatus() {
            throw new Error(
              "should not run",
            );
          },
        });

      const result =
        await collector.collect({});

      assert.equal(
        result.source.status,
        "disabled",
      );
    },
  );


  await check(
    "stale project index is informational degradation",
    async () => {
      const collector =
        createIndexHealthCollector({
          async getIndexStatus() {
            return {
              generatedAt:
                "2026-09-30T00:00:00.000Z",

              indexedFiles:
                10,

              scannedFiles:
                11,

              stale:
                1,

              current:
                false,

              changes: {
                added: [
                  "new.txt",
                ],

                changed: [],
                removed: [],
              },
            };
          },
        });

      const result =
        await collector.collect({
          projectRoot:
            "/tmp/project",
        });

      assert.equal(
        result.source.status,
        "degraded",
      );

      assert.equal(
        result.source.severity,
        "info",
      );

      assert.equal(
        result.findings.length,
        1,
      );
    },
  );


  await check(
    "local-only sync is a healthy disabled state",
    async () => {
      const collector =
        createSyncHealthCollector();

      const result =
        await collector.collect();

      assert.equal(
        result.source.status,
        "disabled",
      );

      assert.equal(
        result.source.severity,
        "healthy",
      );
    },
  );


  await check(
    "engine aggregation does not fabricate healthy state",
    async () => {
      const collector =
        createEngineHealthCollector();

      const result =
        await collector.collect();

      assert.equal(
        result.source.status,
        "unavailable",
      );

      assert.equal(
        result.source.severity,
        "unknown",
      );
    },
  );


  await check(
    "service collectors aggregate with project context",
    async () => {
      const service =
        new HealthService({
          collectors: [
            createSyncHealthCollector(),
            createEngineHealthCollector(),
          ],
        });

      const snapshot =
        await service.snapshot({
          projectRoot:
            "/tmp/project",
        });

      assert.equal(
        snapshot.sources.length,
        2,
      );

      assert.ok(
        snapshot.sources.some(
          (source) =>
            source.id ===
            "sync",
        ),
      );

      assert.ok(
        snapshot.sources.some(
          (source) =>
            source.id ===
            "engines",
        ),
      );
    },
  );


  console.log(
    `\nService health test complete: ${passed} passed, ${failed} failed.\n`,
  );

  if (
    failed > 0
  ) {
    process.exitCode = 1;
  }
}


main().catch(
  (error) => {
    console.error(error);
    process.exitCode = 1;
  },
);
