const assert =
  require("assert");

const http =
  require("http");

const Module =
  require("module");


const originalLoad =
  Module._load;


Module._load = function (
  request,
  parent,
  isMain,
) {
  if (request === "electron") {
    return {
      app: {
        getPath(name) {
          if (name === "userData") {
            return "/tmp/pl-creators-suite-test-user-data";
          }

          return "/tmp/pl-creators-suite-test";
        },

        getAppPath() {
          return process.cwd();
        },

        getVersion() {
          return "0.0.1-test";
        },
      },

      dialog: {
        showOpenDialog:
          async () => ({
            canceled: true,
            filePaths: [],
          }),

        showSaveDialog:
          async () => ({
            canceled: true,
            filePath: null,
          }),
      },

      BrowserWindow: {
        getAllWindows:
          () => [],
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
  startRpcServer,
} = require(
  "../apps/desktop/backend",
);


Module._load =
  originalLoad;


function request({
  port,
  token,
  body,
}) {
  return new Promise(
    (resolve, reject) => {
      const payload =
        JSON.stringify(body);

      const req =
        http.request(
          {
            hostname:
              "127.0.0.1",

            port,

            method:
              "POST",

            path: "/",

            headers: {
              "content-type":
                "application/json",

              "content-length":
                Buffer.byteLength(
                  payload,
                ),

              "x-pl-rpc-token":
                token,
            },
          },

          (res) => {
            let raw = "";

            res.setEncoding(
              "utf8",
            );

            res.on(
              "data",
              (chunk) => {
                raw += chunk;
              },
            );

            res.on(
              "end",
              () => {
                resolve({
                  statusCode:
                    res.statusCode,

                  body:
                    raw
                      ? JSON.parse(
                          raw,
                        )
                      : null,
                });
              },
            );
          },
        );

      req.on(
        "error",
        reject,
      );

      req.write(
        payload,
      );

      req.end();
    },
  );
}


let passed = 0;
let failed = 0;


async function test(
  name,
  fn,
) {
  try {
    await fn();

    passed += 1;

    console.log(
      `PASS    ${name}`,
    );
  } catch (error) {
    failed += 1;

    console.error(
      `FAIL    ${name}`,
    );

    console.error(error);
  }
}


async function main() {
  console.log(
    "\nPL Creators Suite — RPC Backend Integration Test\n",
  );


  const token =
    "integration-test-token-1234567890abcdef";


  const {
    server,
    port,
  } =
    await startRpcServer({
      port: 0,
      sessionToken:
        token,
    });


  try {
    await test(
      "server binds to loopback",
      async () => {
        const address =
          server.address();

        assert.strictEqual(
          address.address,
          "127.0.0.1",
        );
      },
    );


    await test(
      "valid metadata request succeeds",
      async () => {
        const response =
          await request({
            port,
            token,

            body: {
              jsonrpc:
                "2.0",

              id:
                "integration-1",

              method:
                "app.metadata",

              params: {},
            },
          });

        assert.strictEqual(
          response.statusCode,
          200,
        );

        assert.strictEqual(
          response.body.jsonrpc,
          "2.0",
        );

        assert.strictEqual(
          response.body.id,
          "integration-1",
        );

        assert.ok(
          response.body.result,
        );
      },
    );


    await test(
      "unknown method returns typed RPC failure",
      async () => {
        const response =
          await request({
            port,
            token,

            body: {
              jsonrpc:
                "2.0",

              id:
                "integration-2",

              method:
                "missing.method",

              params: {},
            },
          });

        assert.strictEqual(
          response.statusCode,
          200,
        );

        assert.strictEqual(
          response.body.error.code,
          -32601,
        );
      },
    );


    await test(
      "wrong session token is rejected",
      async () => {
        const response =
          await request({
            port,

            token:
              "wrong-token",

            body: {
              jsonrpc:
                "2.0",

              id:
                "integration-3",

              method:
                "app.metadata",

              params: {},
            },
          });

        assert.strictEqual(
          response.statusCode,
          403,
        );

        assert.strictEqual(
          response.body.error,
          "Forbidden",
        );
      },
    );


    await test(
      "invalid params return typed failure",
      async () => {
        const response =
          await request({
            port,
            token,

            body: {
              jsonrpc:
                "2.0",

              id:
                "integration-4",

              method:
                "project.open",

              params: {},
            },
          });

        assert.strictEqual(
          response.statusCode,
          200,
        );

        assert.strictEqual(
          response.body.error.code,
          -32602,
        );
      },
    );
  } finally {
    await new Promise(
      (resolve) =>
        server.close(
          resolve,
        ),
    );
  }


  console.log(
    `\nRPC backend integration test complete: ${passed} passed, ${failed} failed.`,
  );


  if (failed > 0) {
    process.exit(1);
  }
}


main().catch(
  (error) => {
    console.error(error);
    process.exit(1);
  },
);
