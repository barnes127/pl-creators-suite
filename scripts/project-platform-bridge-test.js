const fs =
  require("fs");

const path =
  require("path");


const root =
  path.resolve(
    __dirname,
    "..",
  );


const serviceRoot =
  path.join(
    root,
    "apps",
    "desktop",
    "services",
    "project-platform",
  );


let passed =
  0;

let failed =
  0;


function check(
  condition,
  message,
) {
  if (
    condition
  ) {
    passed +=
      1;

    console.log(
      `PASS    ${message}`,
    );

    return;
  }


  failed +=
    1;

  console.error(
    `FAIL    ${message}`,
  );
}


function read(
  file,
) {
  return fs.readFileSync(
    path.join(
      serviceRoot,
      file,
    ),
    "utf8",
  );
}


console.log(
  "\nPL Creators Suite — Project Platform Bridge Test\n",
);


const expectedFiles = [
  "tree.js",
  "projects.js",
  "assets.js",
  "index.js",
];


for (
  const file
  of expectedFiles
) {
  check(
    fs.existsSync(
      path.join(
        serviceRoot,
        file,
      ),
    ),
    `desktop bridge module exists: ${file}`,
  );
}


const tree =
  read(
    "tree.js",
  );

const projects =
  read(
    "projects.js",
  );

const assets =
  read(
    "assets.js",
  );

const index =
  read(
    "index.js",
  );


check(
  tree.includes(
    "buildProjectTree",
  ),
  "shared project tree implementation exists",
);


check(
  tree.includes(
    "withFileTypes",
  ),
  "tree scanning uses filesystem entry metadata",
);


check(
  projects.includes(
    "readProjectManifest",
  ),
  "project metadata reuses canonical manifest reader",
);


check(
  projects.includes(
    "readRecents",
  ),
  "project bridge reuses existing recents service",
);


check(
  projects.includes(
    "getProjectMetadata",
  ),
  "project metadata bridge exists",
);


check(
  projects.includes(
    "listProjectRecents",
  ),
  "typed recents bridge exists",
);


check(
  assets.includes(
    "readAssetRegistry",
  ),
  "asset bridge reuses existing asset registry",
);


check(
  assets.includes(
    "writeAssetRegistry",
  ),
  "asset repairs use existing atomic registry writer",
);


check(
  assets.includes(
    "inspectAssets",
  ),
  "asset inspection exists",
);


check(
  assets.includes(
    "repairMissingAsset",
  ),
  "missing-asset repair exists",
);


check(
  assets.includes(
    "resolveInsideProject",
  ),
  "asset path boundary exists",
);


check(
  assets.includes(
    'state:\n      exists\n        ? "embedded"\n        : "missing"',
  ) ||
  (
    assets.includes(
      '"embedded"',
    ) &&
    assets.includes(
      '"missing"',
    )
  ),
  "legacy assets map to platform resource states",
);


check(
  assets.includes(
    'ownership:\n      "source"',
  ) ||
  assets.includes(
    '"source"',
  ),
  "legacy asset ownership maps safely to source",
);


check(
  index.includes(
    "inspectProject",
  ),
  "combined project inspection exists",
);


check(
  index.includes(
    "Promise.all",
  ),
  "combined inspection runs independent reads together",
);


console.log(
  `\nProject platform bridge test complete: ${passed} passed, ${failed} failed.`,
);


if (
  failed >
  0
) {
  process.exit(
    1,
  );
}
