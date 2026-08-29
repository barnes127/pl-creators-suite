const assert =
  require("assert");

const fs =
  require("fs");

const path =
  require("path");


const root =
  path.resolve(
    __dirname,
    "..",
  );

const reportPath =
  path.join(
    root,
    "docs",
    "releases",
    "v1.1-performance-baseline.json",
  );


let passed = 0;
let failed = 0;


function test(
  name,
  fn,
) {
  try {
    fn();

    passed += 1;

    console.log(
      `PASS    ${name}`,
    );
  } catch (
    error
  ) {
    failed += 1;

    console.error(
      `FAIL    ${name}`,
    );

    console.error(
      `        ${error.message}`,
    );
  }
}


console.log(
  "\nPL Creators Suite — Performance Baseline Test\n",
);


test(
  "performance report exists",
  () => {
    assert.ok(
      fs.existsSync(
        reportPath,
      ),
    );
  },
);


const report =
  JSON.parse(
    fs.readFileSync(
      reportPath,
      "utf8",
    ),
  );


test(
  "performance baseline targets v1.1",
  () => {
    assert.strictEqual(
      report.baseline,
      "v1.1",
    );
  },
);


test(
  "performance report records environment",
  () => {
    assert.ok(
      report.environment,
    );

    assert.ok(
      report.environment.node,
    );

    assert.ok(
      report.environment.cpu,
    );
  },
);


test(
  "performance report contains six fixtures",
  () => {
    assert.strictEqual(
      report.fixtures.length,
      6,
    );
  },
);


const requiredMetrics = [
  "projectCreate",
  "projectOpen",
  "checksumWrite",
  "checksumValidate",
  "integrityInspect",
  "projectExport",
  "projectImport",
  "importedProjectOpen",
];


for (
  const metric
  of requiredMetrics
) {
  test(
    `aggregate metric exists: ${metric}`,
    () => {
      assert.ok(
        report.aggregate[
          metric
        ],
      );
    },
  );


  test(
    `aggregate metric has samples: ${metric}`,
    () => {
      assert.ok(
        report.aggregate[
          metric
        ].samples >
          0,
      );
    },
  );


  test(
    `aggregate metric is non-negative: ${metric}`,
    () => {
      assert.ok(
        report.aggregate[
          metric
        ].medianMs >=
          0,
      );
    },
  );
}


for (
  const fixture
  of report.fixtures
) {
  test(
    `${fixture.slice} records all metrics`,
    () => {
      for (
        const metric
        of requiredMetrics
      ) {
        assert.ok(
          fixture.metrics[
            metric
          ],
        );

        assert.strictEqual(
          fixture.metrics[
            metric
          ].samples,
          report.iterations,
        );
      }
    },
  );
}


console.log(
  `\nPerformance baseline test complete: ${passed} passed, ${failed} failed.`,
);


if (
  failed > 0
) {
  process.exit(1);
}
