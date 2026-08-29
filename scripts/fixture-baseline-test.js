const fs =
  require("fs");

const path =
  require("path");


const root =
  path.resolve(
    __dirname,
    "..",
  );

const fixtureRoot =
  path.join(
    root,
    "fixtures",
    "baseline",
  );

const manifestPath =
  path.join(
    fixtureRoot,
    "manifest.json",
  );


let passed = 0;
let failed = 0;


function check(
  condition,
  message,
) {
  if (condition) {
    passed += 1;

    console.log(
      `PASS    ${message}`,
    );

    return;
  }

  failed += 1;

  console.error(
    `FAIL    ${message}`,
  );
}


function readJson(
  filePath,
) {
  return JSON.parse(
    fs.readFileSync(
      filePath,
      "utf8",
    ),
  );
}


console.log(
  "\nPL Creators Suite — Baseline Fixture Test\n",
);


check(
  fs.existsSync(
    manifestPath,
  ),
  "baseline fixture manifest exists",
);


const manifest =
  readJson(
    manifestPath,
  );


check(
  manifest.fixtureVersion ===
    1,
  "fixture manifest version is 1",
);


check(
  manifest.suiteBaseline ===
    "v1.1",
  "fixture baseline targets v1.1",
);


check(
  Array.isArray(
    manifest.fixtures,
  ),
  "fixture manifest contains fixture list",
);


check(
  manifest.fixtures.length ===
    6,
  "six canonical slice fixtures are registered",
);


const expectedSlices =
  new Set([
    "docs",
    "sheets",
    "code",
    "modeling",
    "movie",
    "game",
  ]);


const actualSlices =
  new Set(
    manifest.fixtures.map(
      (fixture) =>
        fixture.slice,
    ),
  );


check(
  expectedSlices.size ===
    actualSlices.size &&
    [...expectedSlices].every(
      (slice) =>
        actualSlices.has(
          slice,
        ),
    ),
  "all six official slice fixture categories exist",
);


for (
  const fixture
  of manifest.fixtures
) {
  const directory =
    path.join(
      fixtureRoot,
      fixture.path,
    );

  check(
    fs.existsSync(
      directory,
    ),
    `${fixture.id} directory exists`,
  );


  const fixtureMetadataPath =
    path.join(
      directory,
      "fixture.json",
    );

  check(
    fs.existsSync(
      fixtureMetadataPath,
    ),
    `${fixture.id} metadata exists`,
  );


  if (
    fs.existsSync(
      fixtureMetadataPath,
    )
  ) {
    const metadata =
      readJson(
        fixtureMetadataPath,
      );

    check(
      metadata.id ===
        fixture.id,
      `${fixture.id} metadata ID matches manifest`,
    );

    check(
      metadata.slice ===
        fixture.slice,
      `${fixture.id} slice matches manifest`,
    );

    check(
      metadata.expectedState ===
        "valid",
      `${fixture.id} declares valid expected state`,
    );

    check(
      Array.isArray(
        metadata.knownLimitations,
      ),
      `${fixture.id} records known limitations`,
    );
  }


  for (
    const requiredFile
    of fixture.requiredFiles
  ) {
    const requiredPath =
      path.join(
        directory,
        requiredFile,
      );

    check(
      fs.existsSync(
        requiredPath,
      ),
      `${fixture.id} contains ${requiredFile}`,
    );


    if (
      requiredFile.endsWith(
        ".json",
      ) &&
      fs.existsSync(
        requiredPath,
      )
    ) {
      try {
        readJson(
          requiredPath,
        );

        check(
          true,
          `${fixture.id}/${requiredFile} parses as JSON`,
        );
      } catch {
        check(
          false,
          `${fixture.id}/${requiredFile} parses as JSON`,
        );
      }
    }
  }
}


console.log(
  `\nBaseline fixture test complete: ${passed} passed, ${failed} failed.`,
);


if (failed > 0) {
  process.exit(1);
}
