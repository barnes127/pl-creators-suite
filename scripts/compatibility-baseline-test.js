const fs =
  require("fs");

const path =
  require("path");


const root =
  path.resolve(
    __dirname,
    "..",
  );

const registryPath =
  path.join(
    root,
    "fixtures",
    "compatibility",
    "compatibility.json",
  );

const reportPath =
  path.join(
    root,
    "docs",
    "releases",
    "v1.1-file-compatibility.md",
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


function makeReport(
  registry,
) {
  const lines = [
    "# PL Creators Suite v1.1 File Compatibility Baseline",
    "",
    "## Purpose",
    "",
    "This document records file and project formats explicitly validated during the v1.1 stabilization baseline.",
    "",
    "A format marked `validated` is only certified for the behavior listed here. The absence of a format from the validated set does not necessarily mean the application cannot interact with it; it means v1.1.5 has not certified that compatibility.",
    "",
    "## Validated Formats",
    "",
    "| Scope | Format | Direction | Status |",
    "| --- | --- | --- | --- |"
  ];


  for (
    const format
    of registry.formats
  ) {
    lines.push(
      `| ${format.scope} | ${format.format} | ${format.direction.join(", ")} | ${format.status} |`,
    );
  }


  lines.push(
    "",
    "## Validation Notes",
    "",
  );


  for (
    const format
    of registry.formats
  ) {
    lines.push(
      `### ${format.id}`,
      "",
      format.notes,
      "",
      `Validation: ${format.validation.join(", ")}`,
      "",
    );
  }


  lines.push(
    "## External Formats Not Baselined",
    "",
    "The following external formats are intentionally not certified by the v1.1 baseline:",
    "",
  );


  for (
    const entry
    of registry.externalFormats
  ) {
    lines.push(
      `- **${entry.scope}:** ${entry.formats.join(", ")} — ${entry.status}`,
    );
  }


  lines.push(
    "",
    "## Native Project Archive",
    "",
    "The native `.plproj` format is the principal project-level compatibility target for v1.1.",
    "",
    "The validation suite exercises project creation, reopen, checksum validation, integrity inspection, export, import, payload preservation, and reopen after import across all six canonical slice fixtures.",
    "",
  );


  return (
    lines.join("\n") +
    "\n"
  );
}


console.log(
  "\nPL Creators Suite — File Compatibility Baseline Test\n",
);


check(
  fs.existsSync(
    registryPath,
  ),
  "compatibility registry exists",
);


const registry =
  readJson(
    registryPath,
  );


check(
  registry.compatibilityVersion ===
    1,
  "compatibility registry version is 1",
);


check(
  registry.suiteBaseline ===
    "v1.1",
  "compatibility registry targets v1.1",
);


check(
  Array.isArray(
    registry.formats,
  ),
  "validated format list exists",
);


check(
  registry.formats.length >=
    8,
  "native compatibility baseline contains expected entries",
);


const ids =
  new Set();


for (
  const format
  of registry.formats
) {
  check(
    typeof format.id ===
      "string" &&
      format.id.length >
        0,
    "compatibility entry has ID",
  );


  check(
    !ids.has(
      format.id,
    ),
    `${format.id} ID is unique`,
  );


  ids.add(
    format.id,
  );


  check(
    format.status ===
      "validated",
    `${format.id} is explicitly validated`,
  );


  check(
    Array.isArray(
      format.direction,
    ) &&
      format.direction.length >
        0,
    `${format.id} records compatibility direction`,
  );


  check(
    Array.isArray(
      format.validation,
    ) &&
      format.validation.length >
        0,
    `${format.id} records validation evidence`,
  );


  for (
    const validationPath
    of format.validation
  ) {
    check(
      fs.existsSync(
        path.join(
          root,
          validationPath,
        ),
      ),
      `${format.id} validation exists: ${validationPath}`,
    );
  }
}


check(
  Array.isArray(
    registry.externalFormats,
  ),
  "external-format baseline list exists",
);


for (
  const entry
  of registry.externalFormats
) {
  check(
    entry.status ===
      "not-baselined",
    `${entry.scope} external formats are explicitly unvalidated`,
  );
}


fs.mkdirSync(
  path.dirname(
    reportPath,
  ),
  {
    recursive: true,
  },
);


fs.writeFileSync(
  reportPath,
  makeReport(
    registry,
  ),
  "utf8",
);


check(
  fs.existsSync(
    reportPath,
  ),
  "compatibility report generated",
);


console.log(
  `\nFile compatibility baseline test complete: ${passed} passed, ${failed} failed.`,
);

console.log(
  `Report: ${reportPath}`,
);


if (
  failed > 0
) {
  process.exit(1);
}
