const fs =
  require("fs/promises");

const path =
  require("path");

const os =
  require("os");

const Module =
  require("module");

const {
  performance,
} = require("perf_hooks");


const root =
  path.resolve(
    __dirname,
    "..",
  );

const baselineRoot =
  path.join(
    root,
    "fixtures",
    "baseline",
  );

const outputDir =
  path.join(
    root,
    "docs",
    "releases",
  );

const jsonOutputPath =
  path.join(
    outputDir,
    "v1.1-performance-baseline.json",
  );

const markdownOutputPath =
  path.join(
    outputDir,
    "v1.1-performance-baseline.md",
  );


const testRoot =
  path.join(
    os.tmpdir(),
    `pl-performance-baseline-${process.pid}-${Date.now()}`,
  );

const fakeUserData =
  path.join(
    testRoot,
    "user-data",
  );

const projectsRoot =
  path.join(
    testRoot,
    "projects",
  );

const importsRoot =
  path.join(
    testRoot,
    "imports",
  );

const archivesRoot =
  path.join(
    testRoot,
    "archives",
  );


const ITERATIONS = 5;


const originalLoad =
  Module._load;


Module._load =
  function patchedLoad(
    request,
    parent,
    isMain,
  ) {
    if (
      request ===
      "electron"
    ) {
      return {
        app: {
          getPath(name) {
            if (
              name ===
              "userData"
            ) {
              return fakeUserData;
            }

            return testRoot;
          },
        },
      };
    }

    return originalLoad.call(
      this,
      request,
      parent,
      isMain,
    );
  };


const {
  projectCreate,
  projectOpen,
  projectExport,
  projectImport,
} = require(
  "../apps/desktop/services/projects",
);

const {
  writeProjectChecksums,
  validateProjectChecksums,
  inspectProjectIntegrity,
} = require(
  "../apps/desktop/services/project/integrity",
);


Module._load =
  originalLoad;


function round(
  value,
) {
  return Number(
    value.toFixed(3),
  );
}


function median(
  values,
) {
  const sorted =
    [...values]
      .sort(
        (a, b) =>
          a - b,
      );

  const middle =
    Math.floor(
      sorted.length / 2,
    );

  if (
    sorted.length % 2 ===
    0
  ) {
    return (
      sorted[middle - 1] +
      sorted[middle]
    ) / 2;
  }

  return sorted[middle];
}


function summarize(
  values,
) {
  const total =
    values.reduce(
      (sum, value) =>
        sum + value,
      0,
    );

  return {
    samples:
      values.length,

    minMs:
      round(
        Math.min(
          ...values,
        ),
      ),

    medianMs:
      round(
        median(
          values,
        ),
      ),

    averageMs:
      round(
        total /
          values.length,
      ),

    maxMs:
      round(
        Math.max(
          ...values,
        ),
      ),
  };
}


async function measure(
  fn,
) {
  const started =
    performance.now();

  const result =
    await fn();

  const finished =
    performance.now();

  return {
    result,
    duration:
      finished -
      started,
  };
}


async function readJson(
  filePath,
) {
  return JSON.parse(
    await fs.readFile(
      filePath,
      "utf8",
    ),
  );
}


async function makeDirectories() {
  await fs.rm(
    testRoot,
    {
      recursive: true,
      force: true,
    },
  );

  await fs.mkdir(
    fakeUserData,
    {
      recursive: true,
    },
  );

  await fs.mkdir(
    projectsRoot,
    {
      recursive: true,
    },
  );

  await fs.mkdir(
    importsRoot,
    {
      recursive: true,
    },
  );

  await fs.mkdir(
    archivesRoot,
    {
      recursive: true,
    },
  );

  await fs.mkdir(
    outputDir,
    {
      recursive: true,
    },
  );
}


function createMetricStore() {
  return {
    projectCreate: [],
    projectOpen: [],
    checksumWrite: [],
    checksumValidate: [],
    integrityInspect: [],
    projectExport: [],
    projectImport: [],
    importedProjectOpen: [],
  };
}


async function copyFixture(
  fixture,
  projectRoot,
) {
  const source =
    path.join(
      baselineRoot,
      fixture.path,
    );

  const destination =
    path.join(
      projectRoot,
      "fixture-data",
      fixture.slice,
    );

  await fs.cp(
    source,
    destination,
    {
      recursive: true,
    },
  );
}


function buildMarkdown(
  report,
) {
  const lines = [
    "# PL Creators Suite v1.1 Performance Baseline",
    "",
    "## Purpose",
    "",
    "This document records repeatable performance measurements captured during Wave 1.1.5.",
    "",
    "These numbers are a comparison baseline, not release-blocking performance budgets.",
    "",
    "## Environment",
    "",
    `- Platform: ${report.environment.platform}`,
    `- Architecture: ${report.environment.arch}`,
    `- Node: ${report.environment.node}`,
    `- CPU: ${report.environment.cpu}`,
    `- CPU logical cores: ${report.environment.cpuCount}`,
    `- Total memory: ${report.environment.totalMemoryGb} GB`,
    `- Iterations per slice: ${report.iterations}`,
    "",
    "## Aggregate Results",
    "",
    "| Operation | Samples | Min ms | Median ms | Average ms | Max ms |",
    "| --- | ---: | ---: | ---: | ---: | ---: |"
  ];


  for (
    const [
      operation,
      result,
    ]
    of Object.entries(
      report.aggregate,
    )
  ) {
    lines.push(
      `| ${operation} | ${result.samples} | ${result.minMs} | ${result.medianMs} | ${result.averageMs} | ${result.maxMs} |`,
    );
  }


  lines.push(
    "",
    "## Slice Results",
    "",
  );


  for (
    const fixture
    of report.fixtures
  ) {
    lines.push(
      `### ${fixture.slice}`,
      "",
      "| Operation | Samples | Min ms | Median ms | Average ms | Max ms |",
      "| --- | ---: | ---: | ---: | ---: | ---: |"
    );


    for (
      const [
        operation,
        result,
      ]
      of Object.entries(
        fixture.metrics,
      )
    ) {
      lines.push(
        `| ${operation} | ${result.samples} | ${result.minMs} | ${result.medianMs} | ${result.averageMs} | ${result.maxMs} |`,
      );
    }


    lines.push(
      "",
    );
  }


  lines.push(
    "## Interpretation",
    "",
    "The v1.1 performance baseline measures the current native project persistence path across all six canonical slice fixtures.",
    "",
    "Future versions can compare equivalent measurements against this report to detect meaningful regressions.",
    "",
    "The measurements intentionally exclude UI rendering latency, GPU frame timing, engine workloads, local-model inference, cloud latency, and future worker systems. Those require dedicated benchmark infrastructure in later roadmap stages.",
    "",
  );


  return (
    lines.join(
      "\n",
    ) +
    "\n"
  );
}


async function main() {
  console.log(
    "\nPL Creators Suite — Performance Baseline\n",
  );


  await makeDirectories();


  const manifest =
    await readJson(
      path.join(
        baselineRoot,
        "manifest.json",
      ),
    );


  const aggregateStore =
    createMetricStore();

  const fixtureResults = [];


  for (
    const fixture
    of manifest.fixtures
  ) {
    console.log(
      `Measuring ${fixture.id}...`,
    );


    const metrics =
      createMetricStore();


    for (
      let iteration = 0;
      iteration < ITERATIONS;
      iteration += 1
    ) {
      const suffix =
        `${fixture.slice}-${iteration}-${Date.now()}`;

      const createMeasurement =
        await measure(
          () =>
            projectCreate({
              name:
                `Perf-${suffix}`,

              baseDir:
                projectsRoot,
            }),
        );

      metrics.projectCreate.push(
        createMeasurement.duration,
      );

      aggregateStore.projectCreate.push(
        createMeasurement.duration,
      );


      const created =
        createMeasurement.result;


      await copyFixture(
        fixture,
        created.projectRoot,
      );


      const checksumWrite =
        await measure(
          () =>
            writeProjectChecksums(
              created.projectRoot,
            ),
        );

      metrics.checksumWrite.push(
        checksumWrite.duration,
      );

      aggregateStore.checksumWrite.push(
        checksumWrite.duration,
      );


      const checksumValidate =
        await measure(
          () =>
            validateProjectChecksums(
              created.projectRoot,
            ),
        );

      metrics.checksumValidate.push(
        checksumValidate.duration,
      );

      aggregateStore.checksumValidate.push(
        checksumValidate.duration,
      );


      const openMeasurement =
        await measure(
          () =>
            projectOpen({
              projectRoot:
                created.projectRoot,
            }),
        );

      metrics.projectOpen.push(
        openMeasurement.duration,
      );

      aggregateStore.projectOpen.push(
        openMeasurement.duration,
      );


      const integrityMeasurement =
        await measure(
          () =>
            inspectProjectIntegrity(
              created.projectRoot,
            ),
        );

      metrics.integrityInspect.push(
        integrityMeasurement.duration,
      );

      aggregateStore.integrityInspect.push(
        integrityMeasurement.duration,
      );


      const archivePath =
        path.join(
          archivesRoot,
          `${suffix}.plproj`,
        );


      const exportMeasurement =
        await measure(
          () =>
            projectExport({
              projectRoot:
                created.projectRoot,

              outPath:
                archivePath,
            }),
        );

      metrics.projectExport.push(
        exportMeasurement.duration,
      );

      aggregateStore.projectExport.push(
        exportMeasurement.duration,
      );


      const importMeasurement =
        await measure(
          () =>
            projectImport({
              filePath:
                archivePath,

              baseDir:
                importsRoot,
            }),
        );

      metrics.projectImport.push(
        importMeasurement.duration,
      );

      aggregateStore.projectImport.push(
        importMeasurement.duration,
      );


      const importedOpen =
        await measure(
          () =>
            projectOpen({
              projectRoot:
                importMeasurement
                  .result
                  .projectRoot,
            }),
        );

      metrics.importedProjectOpen.push(
        importedOpen.duration,
      );

      aggregateStore.importedProjectOpen.push(
        importedOpen.duration,
      );
    }


    const summarized = {};


    for (
      const [
        operation,
        values,
      ]
      of Object.entries(
        metrics,
      )
    ) {
      summarized[operation] =
        summarize(
          values,
        );
    }


    fixtureResults.push({
      id:
        fixture.id,

      slice:
        fixture.slice,

      metrics:
        summarized,
    });
  }


  const aggregate = {};


  for (
    const [
      operation,
      values,
    ]
    of Object.entries(
      aggregateStore,
    )
  ) {
    aggregate[operation] =
      summarize(
        values,
      );
  }


  const cpuInfo =
    os.cpus();


  const report = {
    baseline:
      "v1.1",

    generatedAt:
      new Date()
        .toISOString(),

    iterations:
      ITERATIONS,

    environment: {
      platform:
        os.platform(),

      release:
        os.release(),

      arch:
        os.arch(),

      node:
        process.version,

      cpu:
        cpuInfo[0]?.model ||
        "unknown",

      cpuCount:
        cpuInfo.length,

      totalMemoryGb:
        Number(
          (
            os.totalmem() /
            1024 /
            1024 /
            1024
          ).toFixed(
            2,
          ),
        ),
    },

    aggregate,
    fixtures:
      fixtureResults,
  };


  await fs.writeFile(
    jsonOutputPath,
    JSON.stringify(
      report,
      null,
      2,
    ) +
      "\n",
    "utf8",
  );


  await fs.writeFile(
    markdownOutputPath,
    buildMarkdown(
      report,
    ),
    "utf8",
  );


  console.log(
    "\nAggregate performance baseline:\n",
  );


  for (
    const [
      operation,
      result,
    ]
    of Object.entries(
      aggregate,
    )
  ) {
    console.log(
      `${operation.padEnd(22)} median ${result.medianMs.toFixed(3)} ms | avg ${result.averageMs.toFixed(3)} ms | max ${result.maxMs.toFixed(3)} ms`,
    );
  }


  console.log(
    `\nJSON: ${jsonOutputPath}`,
  );

  console.log(
    `Markdown: ${markdownOutputPath}`,
  );


  await fs.rm(
    testRoot,
    {
      recursive: true,
      force: true,
    },
  );
}


main().catch(
  async (
    error,
  ) => {
    console.error(
      error,
    );

    await fs.rm(
      testRoot,
      {
        recursive: true,
        force: true,
      },
    ).catch(
      () => {},
    );

    process.exit(1);
  },
);
