const assert =
  require("assert");

const os =
  require("os");

const {
  HealthService,
  getCpuSummary,
  getMemorySummary,
  getDiskSummary,
  getQueueSummary,
  getWorkerSummary,
  getGpuSummary,
  getCacheSummary,
  createSystemHealthCollector,
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
    "\nPL Creators Suite — v1.3.3 System Telemetry Test\n",
  );


  await check(
    "CPU summary reports real host information",
    async () => {
      const cpu =
        getCpuSummary();

      assert.ok(
        cpu.logicalCpuCount >
          0,
      );

      assert.equal(
        typeof cpu.model,
        "string",
      );

      assert.ok(
        cpu.model.length >
          0,
      );

      assert.ok(
        Number.isFinite(
          cpu.loadAverage1m,
        ),
      );
    },
  );


  await check(
    "memory summary reports bounded usage",
    async () => {
      const memory =
        getMemorySummary();

      assert.ok(
        memory.totalBytes >
          0,
      );

      assert.ok(
        memory.freeBytes >=
          0,
      );

      assert.ok(
        memory.usedBytes >=
          0,
      );

      assert.ok(
        memory.usedPercent >=
          0,
      );

      assert.ok(
        memory.usedPercent <=
          100,
      );
    },
  );


  await check(
    "disk summary reports real local volume capacity",
    async () => {
      const disk =
        await getDiskSummary(
          os.homedir(),
        );

      assert.equal(
        disk.available,
        true,
      );

      assert.ok(
        disk.totalBytes >
          0,
      );

      assert.ok(
        disk.availableBytes >=
          0,
      );

      assert.ok(
        disk.usedBytes >=
          0,
      );
    },
  );


  await check(
    "disk telemetry failure is represented explicitly",
    async () => {
      const disk =
        await getDiskSummary(
          "/pl-health-path-that-does-not-exist",
        );

      assert.equal(
        disk.available,
        false,
      );

      assert.equal(
        typeof disk.reason,
        "string",
      );
    },
  );


  await check(
    "queue summary uses live task manager state",
    async () => {
      const taskManager = {
        list() {
          return [
            {
              status:
                "queued",
            },
            {
              status:
                "running",
            },
            {
              status:
                "completed",
            },
            {
              status:
                "failed",
            },
          ];
        },
      };

      const queue =
        getQueueSummary(
          taskManager,
        );

      assert.equal(
        queue.available,
        true,
      );

      assert.equal(
        queue.total,
        4,
      );

      assert.equal(
        queue.active,
        2,
      );

      assert.equal(
        queue.failed,
        1,
      );
    },
  );


  await check(
    "missing task manager is not fabricated as an empty queue",
    async () => {
      const queue =
        getQueueSummary();

      assert.equal(
        queue.available,
        false,
      );
    },
  );


  await check(
    "worker state is explicit until runtime registry exists",
    async () => {
      const worker =
        getWorkerSummary();

      assert.equal(
        worker.available,
        false,
      );

      assert.ok(
        worker.reason,
      );
    },
  );


  await check(
    "GPU state is explicit until portable provider exists",
    async () => {
      const gpu =
        getGpuSummary();

      assert.equal(
        gpu.available,
        false,
      );

      assert.ok(
        gpu.reason,
      );
    },
  );


  await check(
    "cache state is explicit until shared provider exists",
    async () => {
      const cache =
        getCacheSummary();

      assert.equal(
        cache.available,
        false,
      );

      assert.ok(
        cache.reason,
      );
    },
  );


  await check(
    "system collector produces a normalized health source",
    async () => {
      const service =
        new HealthService({
          collectors: [
            createSystemHealthCollector({
              taskManager: {
                list() {
                  return [];
                },
              },
            }),
          ],
        });

      const snapshot =
        await service.snapshot();

      assert.equal(
        snapshot.sources.length,
        1,
      );

      const source =
        snapshot.sources[0];

      assert.equal(
        source.id,
        "system",
      );

      assert.equal(
        source.category,
        "system",
      );

      assert.ok(
        source.details.cpu,
      );

      assert.ok(
        source.details.memory,
      );

      assert.ok(
        source.details.disk,
      );

      assert.ok(
        source.details.queue,
      );
    },
  );


  await check(
    "system telemetry includes existing process resource snapshot",
    async () => {
      const collector =
        createSystemHealthCollector({
          taskManager: {
            list() {
              return [];
            },
          },
        });

      const result =
        await collector.collect();

      assert.ok(
        result
          .source
          .details
          .process
          .memoryBytes >
          0,
      );

      assert.ok(
        result
          .source
          .details
          .process
          .details
          .uptimeSeconds >=
          0,
      );
    },
  );


  await check(
    "system telemetry contains no fake GPU worker or cache values",
    async () => {
      const collector =
        createSystemHealthCollector({
          taskManager: {
            list() {
              return [];
            },
          },
        });

      const result =
        await collector.collect();

      const details =
        result.source.details;

      assert.equal(
        details.gpu.available,
        false,
      );

      assert.equal(
        details.worker.available,
        false,
      );

      assert.equal(
        details.cache.available,
        false,
      );
    },
  );


  console.log(
    `\nSystem telemetry test complete: ${passed} passed, ${failed} failed.\n`,
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
