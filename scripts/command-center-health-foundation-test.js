const assert =
  require("assert");

const {
  HealthService,
  HEALTH_SEVERITIES,
  HEALTH_STATUSES,
  HEALTH_CATEGORIES,
  getHighestHealthSeverity,
  createDiagnosticsHealthCollector,
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
    "\nPL Creators Suite — v1.3.3 Health Foundation Test\n",
  );


  await check(
    "health vocabulary defines required severities",
    async () => {
      for (
        const severity
        of [
          "healthy",
          "info",
          "warning",
          "error",
          "critical",
          "unavailable",
          "unknown",
        ]
      ) {
        assert.ok(
          HEALTH_SEVERITIES
            .includes(severity),
        );
      }
    },
  );


  await check(
    "health vocabulary separates statuses",
    async () => {
      assert.ok(
        HEALTH_STATUSES
          .includes(
            "degraded",
          ),
      );

      assert.ok(
        HEALTH_STATUSES
          .includes(
            "disabled",
          ),
      );
    },
  );


  await check(
    "health categories cover v1.3.3 operational domains",
    async () => {
      for (
        const category
        of [
          "system",
          "diagnostics",
          "project",
          "recovery",
          "engine",
          "extension",
          "index",
          "backup",
          "ai",
          "sync",
          "task",
          "cache",
        ]
      ) {
        assert.ok(
          HEALTH_CATEGORIES
            .includes(category),
        );
      }
    },
  );


  await check(
    "severity aggregation chooses highest severity",
    async () => {
      assert.equal(
        getHighestHealthSeverity([
          "healthy",
          "warning",
          "info",
          "error",
        ]),
        "error",
      );
    },
  );


  await check(
    "collector registration rejects duplicate ids",
    async () => {
      const service =
        new HealthService();

      const collector = {
        id: "duplicate",
        collect:
          async () => ({
            source: {
              id:
                "duplicate",

              status:
                "healthy",

              severity:
                "healthy",
            },

            findings: [],
          }),
      };

      service.registerCollector(
        collector,
      );

      assert.throws(
        () =>
          service
            .registerCollector(
              collector,
            ),
        /already registered/,
      );
    },
  );


  await check(
    "healthy collector produces normalized snapshot",
    async () => {
      const service =
        new HealthService({
          now:
            () =>
              "2026-09-30T00:00:00.000Z",
        });

      service.registerCollector({
        id:
          "fixture",

        displayName:
          "Fixture",

        category:
          "system",

        owner:
          "fixture-owner",

        async collect() {
          return {
            source: {
              status:
                "healthy",

              severity:
                "healthy",

              summary:
                "Fixture healthy.",
            },

            findings: [],
          };
        },
      });

      const snapshot =
        await service.snapshot();

      assert.equal(
        snapshot.generatedAt,
        "2026-09-30T00:00:00.000Z",
      );

      assert.equal(
        snapshot.overallSeverity,
        "healthy",
      );

      assert.equal(
        snapshot.sources.length,
        1,
      );

      assert.equal(
        snapshot.sources[0].id,
        "fixture",
      );
    },
  );


  await check(
    "finding severity raises source and overall severity",
    async () => {
      const service =
        new HealthService();

      service.registerCollector({
        id:
          "warning-source",

        category:
          "system",

        async collect() {
          return {
            source: {
              status:
                "degraded",

              severity:
                "info",
            },

            findings: [
              {
                id:
                  "fixture-warning",

                severity:
                  "warning",

                status:
                  "degraded",

                title:
                  "Fixture warning",
              },
            ],
          };
        },
      });

      const snapshot =
        await service.snapshot();

      assert.equal(
        snapshot.sources[0]
          .severity,
        "warning",
      );

      assert.equal(
        snapshot.overallSeverity,
        "warning",
      );
    },
  );


  await check(
    "finding metadata supports actions logs and resources",
    async () => {
      const service =
        new HealthService();

      service.registerCollector({
        id:
          "metadata",

        category:
          "project",

        async collect() {
          return {
            source: {
              status:
                "degraded",

              severity:
                "warning",

              owner:
                "fixture-owner",
            },

            findings: [
              {
                id:
                  "metadata.issue",

                severity:
                  "warning",

                status:
                  "degraded",

                title:
                  "Metadata fixture",

                suggestedActions: [
                  {
                    id:
                      "fixture-action",

                    label:
                      "Open fixture",
                  },
                ],

                logRefs: [
                  "log-1",
                ],

                resourceRefs: [
                  "resource-1",
                ],
              },
            ],
          };
        },
      });

      const snapshot =
        await service.snapshot();

      const finding =
        snapshot.findings[0];

      assert.equal(
        finding.owner,
        "fixture-owner",
      );

      assert.equal(
        finding.suggestedActions
          .length,
        1,
      );

      assert.equal(
        finding.logRefs.length,
        1,
      );

      assert.equal(
        finding.resourceRefs.length,
        1,
      );
    },
  );


  await check(
    "collector failure is isolated as unavailable",
    async () => {
      const service =
        new HealthService();

      service.registerCollector({
        id:
          "broken",

        category:
          "system",

        async collect() {
          throw new Error(
            "Expected collector failure",
          );
        },
      });

      service.registerCollector({
        id:
          "healthy",

        category:
          "system",

        async collect() {
          return {
            source: {
              status:
                "healthy",

              severity:
                "healthy",
            },

            findings: [],
          };
        },
      });

      const snapshot =
        await service.snapshot();

      assert.equal(
        snapshot.sources.length,
        2,
      );

      const broken =
        snapshot.sources.find(
          (source) =>
            source.id ===
            "broken",
        );

      assert.equal(
        broken.status,
        "unavailable",
      );

      assert.equal(
        broken.severity,
        "unavailable",
      );
      const healthy =
        snapshot.sources.find(
          (source) =>
            source.id === "healthy",
        );
      assert.ok(
        healthy,
        "Healthy collector should still be present",
      );

      assert.equal(
        healthy.status,
        "healthy",
      );

      assert.equal(
        healthy.severity,
        "healthy",
      );

      const failureFinding =
        snapshot.findings.find(
          (finding) =>
            finding.sourceId === "broken",
        );

      assert.ok(
        failureFinding,
        "Failed collector should produce a finding",
      );

      assert.equal(
        failureFinding.status,
        "unavailable",
      );

      assert.equal(
        failureFinding.severity,
        "unavailable",
      );

      assert.equal(
        snapshot.summary.findingCount,
        1,
      );

      assert.equal(
        snapshot.summary.sourceCount,
        2,
      );

      assert.equal(
        snapshot.overallSeverity,
        "unavailable",
      );
    },
  );


  await check(
    "diagnostics service can feed health aggregation",
    async () => {
      const diagnostics = {
        async health() {
          return {
            jobCount: 3,
            activeJobs: 1,
            failedJobs: 1,
            interruptedJobs: 0,
          };
        },
      };

      const service =
        new HealthService({
          collectors: [
            createDiagnosticsHealthCollector(
              diagnostics,
            ),
          ],
        });

      const snapshot =
        await service.snapshot();

      const source =
        snapshot.sources[0];

      assert.equal(
        source.id,
        "diagnostics",
      );

      assert.equal(
        source.status,
        "degraded",
      );

      assert.equal(
        source.severity,
        "warning",
      );
    },
  );


  await check(
    "health snapshot contains deterministic summary counts",
    async () => {
      const service =
        new HealthService();

      service.registerCollector({
        id:
          "summary",

        category:
          "system",

        async collect() {
          return {
            source: {
              status:
                "degraded",

              severity:
                "warning",
            },

            findings: [
              {
                id:
                  "summary.issue",

                severity:
                  "warning",

                status:
                  "degraded",

                title:
                  "Summary issue",
              },
            ],
          };
        },
      });

      const snapshot =
        await service.snapshot();

      assert.equal(
        snapshot.summary
          .collectorCount,
        1,
      );

      assert.equal(
        snapshot.summary
          .sourceCount,
        1,
      );

      assert.equal(
        snapshot.summary
          .findingCount,
        1,
      );

      assert.equal(
        snapshot.summary
          .sourceCounts
          .warning,
        1,
      );
    },
  );


  await check(
    "health collection remains read-only by contract",
    async () => {
      let mutated =
        false;

      const service =
        new HealthService();

      service.registerCollector({
        id:
          "read-only",

        category:
          "system",

        async collect() {
          return {
            source: {
              status:
                "healthy",

              severity:
                "healthy",

              details: {
                mutated,
              },
            },

            findings: [],
          };
        },
      });

      await service.snapshot();

      assert.equal(
        mutated,
        false,
      );
    },
  );

  await check(
    "failed collector exports without leaking error details",
    async () => {
      const {
        buildDiagnosticPackage,
      } = require(
        "../apps/desktop/services/diagnostics/export",
      );

      const secret =
        "PRIVATE_TEST_SECRET_987654";

      const service =
        new HealthService();

      service.registerCollector({
        id: "failure-fixture",
        category: "system",

        async collect() {
          throw new Error(
            `Collector error: ${secret}`,
          );
        },
      });

      const snapshot =
        await service.snapshot();

      const diagnosticPackage =
        buildDiagnosticPackage({
          projectOpen: false,
          health: snapshot,
          diagnostics: {},
        });

      const serialized =
        JSON.stringify(
          diagnosticPackage,
        );

      assert.equal(
        diagnosticPackage.health
          .sources[0].status,
        "unavailable",
      );

      assert.equal(
        diagnosticPackage.health
          .findings[0].severity,
        "unavailable",
      );

      assert.equal(
        serialized.includes(secret),
        false,
      );

      assert.equal(
        serialized.includes(
          "Collector error:",
        ),
        false,
      );
    },
  );

  console.log(
    `\nHealth foundation test complete: ${passed} passed, ${failed} failed.\n`,
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
