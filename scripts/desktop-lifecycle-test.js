const fs =
  require("fs");

const path =
  require("path");


const root =
  path.resolve(__dirname, "..");

const mainPath =
  path.join(
    root,
    "apps/desktop/main.js",
  );

const source =
  fs.readFileSync(
    mainPath,
    "utf8",
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


console.log(
  "\nPL Creators Suite — Desktop Lifecycle Test\n",
);


check(
  source.includes(
    "let rpcServer = null",
  ),
  "desktop owns RPC server reference",
);


check(
  source.includes(
    "let rpcServerPromise = null",
  ),
  "desktop tracks RPC startup promise",
);


check(
  source.includes(
    "async function ensureRpcServer()",
  ),
  "RPC server has application-level ensure function",
);


check(
  source.includes(
    "await ensureRpcServer();",
  ),
  "window creation reuses application RPC server",
);


check(
  !source.includes(
    "rpcSesionToken",
  ),
  "legacy RPC session token typo is absent",
);


check(
  source.includes(
    'app.on(\n  "will-quit"'
  ) ||
    source.includes(
      'app.on("will-quit"'
    ),
  "RPC shutdown is tied to application lifecycle",
);


check(
  source.includes(
    "rpcServer.close()",
  ),
  "RPC server is explicitly closed during shutdown",
);


const createWindowIndex =
  source.indexOf(
    "async function createWindow()",
  );

const ensureServerIndex =
  source.indexOf(
    "async function ensureRpcServer()",
  );

check(
  ensureServerIndex >= 0 &&
    ensureServerIndex <
      createWindowIndex,
  "RPC lifecycle helper is defined outside window lifecycle",
);


console.log(
  `\nDesktop lifecycle test complete: ${passed} passed, ${failed} failed.`,
);

if (failed > 0) {
  process.exit(1);
}
