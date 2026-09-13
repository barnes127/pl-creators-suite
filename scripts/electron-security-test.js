const assert =
  require(
    "assert",
  );

const fs =
  require(
    "fs",
  );

const path =
  require(
    "path",
  );


const root =
  path.resolve(
    __dirname,
    "..",
  );

const mainSource =
  fs.readFileSync(
    path.join(
      root,
      "apps",
      "desktop",
      "main.js",
    ),
    "utf8",
  );

const rendererHtml =
  fs.readFileSync(
    path.join(
      root,
      "apps",
      "renderer",
      "index.html",
    ),
    "utf8",
  );


function test(
  name,
  callback,
) {
  try {
    callback();

    console.log(
      `PASS    ${name}`,
    );
  } catch (
    error
  ) {
    console.error(
      `FAIL    ${name}`,
    );

    throw error;
  }
}


console.log(
  "\nPL Creators Suite — Electron Security Perimeter Test\n",
);


test(
  "renderer uses context isolation",
  () => {
    assert.match(
      mainSource,
      /contextIsolation\s*:\s*true/,
    );
  },
);


test(
  "renderer disables Node integration",
  () => {
    assert.match(
      mainSource,
      /nodeIntegration\s*:\s*false/,
    );
  },
);


test(
  "renderer sandbox is explicitly enabled",
  () => {
    assert.match(
      mainSource,
      /sandbox\s*:\s*true/,
    );
  },
);


test(
  "new renderer windows are denied",
  () => {
    assert.match(
      mainSource,
      /setWindowOpenHandler/,
    );

    assert.match(
      mainSource,
      /action\s*:\s*["']deny["']/,
    );
  },
);


test(
  "renderer navigation is intercepted",
  () => {
    assert.match(
      mainSource,
      /will-navigate/,
    );

    assert.match(
      mainSource,
      /event\.preventDefault\(\)/,
    );
  },
);


test(
  "webview attachment is intercepted",
  () => {
    assert.match(
      mainSource,
      /will-attach-webview/,
    );
  },
);


test(
  "permission requests are explicitly handled",
  () => {
    assert.match(
      mainSource,
      /setPermissionRequestHandler/,
    );
  },
);


test(
  "renderer declares a content security policy",
  () => {
    assert.match(
      rendererHtml,
      /Content-Security-Policy/,
    );

    assert.match(
      rendererHtml,
      /object-src\s+'none'/,
    );
  },
);


console.log(
  "\nElectron security perimeter test complete.\n",
);
