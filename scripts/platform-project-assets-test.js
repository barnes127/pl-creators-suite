const fs =
  require("fs");

const path =
  require("path");


const root =
  path.resolve(
    __dirname,
    "..",
  );


const platformRoot =
  path.join(
    root,
    "packages",
    "platform",
    "src",
  );


let passed = 0;
let failed = 0;


function check(
  condition,
  message,
) {
  if (
    condition
  ) {
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


function read(
  ...parts
) {
  return fs.readFileSync(
    path.join(
      platformRoot,
      ...parts,
    ),
    "utf8",
  );
}


console.log(
  "\nPL Creators Suite — Project and Asset Platform Test\n",
);


const expectedFiles = [
  [
    "projects",
    "types.ts",
  ],
  [
    "projects",
    "index.ts",
  ],
  [
    "assets",
    "types.ts",
  ],
  [
    "assets",
    "registry.ts",
  ],
  [
    "assets",
    "dependencyGraph.ts",
  ],
  [
    "assets",
    "cache.ts",
  ],
  [
    "assets",
    "index.ts",
  ],
];


for (
  const parts
  of expectedFiles
) {
  check(
    fs.existsSync(
      path.join(
        platformRoot,
        ...parts,
      ),
    ),
    `platform module exists: ${parts.join("/")}`,
  );
}


const projectTypes =
  read(
    "projects",
    "types.ts",
  );

const assetTypes =
  read(
    "assets",
    "types.ts",
  );

const assetRegistry =
  read(
    "assets",
    "registry.ts",
  );

const dependencyGraph =
  read(
    "assets",
    "dependencyGraph.ts",
  );

const cache =
  read(
    "assets",
    "cache.ts",
  );

const platformIndex =
  read(
    "index.ts",
  );

const runtime =
  read(
    "runtime.ts",
  );


const resourceStates = [
  "embedded",
  "linked",
  "external",
  "generated",
  "cached",
  "stale",
  "missing",
  "shared",
  "derived",
];


for (
  const state
  of resourceStates
) {
  check(
    projectTypes.includes(
      `"${state}"`,
    ),
    `project resource state exists: ${state}`,
  );
}


check(
  projectTypes.includes(
    "ProjectMetadata",
  ),
  "shared project metadata contract exists",
);


check(
  projectTypes.includes(
    "ProjectRecentItem",
  ),
  "shared recent project contract exists",
);


check(
  projectTypes.includes(
    "ProjectTreeNode",
  ),
  "shared project tree contract exists",
);


check(
  assetTypes.includes(
    "AssetRecord",
  ),
  "typed asset record exists",
);


check(
  assetTypes.includes(
    "AssetOwnership",
  ),
  "source and derived ownership contract exists",
);


check(
  assetTypes.includes(
    "AssetReference",
  ),
  "typed asset reference exists",
);


check(
  assetTypes.includes(
    "contentHash",
  ),
  "asset contract supports content hashes",
);


check(
  assetRegistry.includes(
    "class AssetRegistry",
  ),
  "shared asset registry exists",
);


check(
  assetRegistry.includes(
    "findMissing(",
  ),
  "asset registry exposes missing assets",
);


check(
  assetRegistry.includes(
    "findDerived(",
  ),
  "asset registry exposes derived assets",
);


check(
  dependencyGraph.includes(
    "class AssetDependencyGraph",
  ),
  "dependency graph exists",
);


check(
  dependencyGraph.includes(
    "dependenciesOf(",
  ),
  "dependency traversal exists",
);


check(
  dependencyGraph.includes(
    "dependentsOf(",
  ),
  "reverse dependency traversal exists",
);


check(
  dependencyGraph.includes(
    "references(",
  ),
  "reference navigation foundation exists",
);


check(
  cache.includes(
    "collectDerivedInvalidations",
  ),
  "derived cache invalidation exists",
);


check(
  platformIndex.includes(
    'export * from "./projects"',
  ),
  "platform exports project contracts",
);


check(
  platformIndex.includes(
    'export * from "./assets"',
  ),
  "platform exports asset contracts",
);


check(
  runtime.includes(
    "AssetRegistry",
  ),
  "platform runtime owns asset registry",
);


check(
  runtime.includes(
    "AssetDependencyGraph",
  ),
  "platform runtime owns dependency graph",
);


console.log(
  `\nProject and asset platform test complete: ${passed} passed, ${failed} failed.`,
);


if (
  failed > 0
) {
  process.exit(1);
}
