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
  "\nPL Creators Suite — Global Search Contract Test\n",
);


const expectedFiles = [
  [
    "search",
    "types.ts",
  ],
  [
    "search",
    "registry.ts",
  ],
  [
    "search",
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
    `search module exists: ${parts.join("/")}`,
  );
}


const types =
  read(
    "search",
    "types.ts",
  );

const registry =
  read(
    "search",
    "registry.ts",
  );

const platformIndex =
  read(
    "index.ts",
  );

const runtime =
  read(
    "runtime.ts",
  );


const kinds = [
  "file",
  "document",
  "cell",
  "symbol",
  "asset",
  "scene",
  "shot",
  "task",
  "workflow",
  "extension",
];


for (
  const kind
  of kinds
) {
  check(
    types.includes(
      `"${kind}"`,
    ),
    `search kind exists: ${kind}`,
  );
}


check(
  types.includes(
    "SearchProvider",
  ),
  "search provider contract exists",
);


check(
  types.includes(
    "SearchResult",
  ),
  "typed search result exists",
);


check(
  types.includes(
    "cancellationToken",
  ),
  "search contract supports cancellation",
);


check(
  registry.includes(
    "class SearchProviderRegistry",
  ),
  "search provider registry exists",
);


check(
  registry.includes(
    "providersForKinds(",
  ),
  "search providers can be selected by result kind",
);


check(
  registry.includes(
    "async search(",
  ),
  "shared search orchestration exists",
);


check(
  platformIndex.includes(
    'export * from "./search"',
  ),
  "platform exports search contracts",
);


check(
  runtime.includes(
    "SearchProviderRegistry",
  ),
  "platform runtime owns global search registry",
);


console.log(
  `\nGlobal search contract test complete: ${passed} passed, ${failed} failed.`,
);


if (
  failed >
  0
) {
  process.exit(
    1,
  );
}
