const assert =
  require("assert");

const {
  createRpcAuthorizer,
  DEFAULT_DESKTOP_PERMISSIONS,
} = require(
  "../apps/desktop/rpc/authorization"
);

const {
  PERMISSION,
  getMethodContract,
} = require(
  "../apps/desktop/rpc/contracts"
);

const {
  RpcPermissionError,
} = require(
  "../apps/desktop/rpc/errors"
);


let passed = 0;
let failed = 0;


function test(name, fn) {
  try {
    fn();

    passed += 1;

    console.log(
      `PASS    ${name}`
    );
  } catch (error) {
    failed += 1;

    console.error(
      `FAIL    ${name}`
    );

    console.error(error);
  }
}


console.log(
  "\nPL Creators Suite — RPC Authorization Test\n"
);


test(
  "default desktop permission set is populated",
  () => {
    assert.ok(
      DEFAULT_DESKTOP_PERMISSIONS
        .length > 0
    );
  },
);


test(
  "unprivileged metadata call is allowed",
  () => {
    const authorizer =
      createRpcAuthorizer({
        allowedPermissions: [],
      });

    const result =
      authorizer.authorize(
        "app.metadata",
        getMethodContract(
          "app.metadata",
        ),
      );

    assert.strictEqual(
      result.allowed,
      true,
    );
  },
);


test(
  "filesystem read call is denied without permission",
  () => {
    const authorizer =
      createRpcAuthorizer({
        allowedPermissions: [],
      });

    assert.throws(
      () =>
        authorizer.authorize(
          "docs.list",
          getMethodContract(
            "docs.list",
          ),
        ),
      RpcPermissionError,
    );
  },
);


test(
  "filesystem read call is allowed with permission",
  () => {
    const authorizer =
      createRpcAuthorizer({
        allowedPermissions: [
          PERMISSION.FILESYSTEM_READ,
        ],
      });

    const result =
      authorizer.authorize(
        "docs.list",
        getMethodContract(
          "docs.list",
        ),
      );

    assert.strictEqual(
      result.allowed,
      true,
    );
  },
);


test(
  "filesystem mutation requires write permission",
  () => {
    const authorizer =
      createRpcAuthorizer({
        allowedPermissions: [
          PERMISSION.FILESYSTEM_READ,
        ],
      });

    assert.throws(
      () =>
        authorizer.authorize(
          "docs.save",
          getMethodContract(
            "docs.save",
          ),
        ),
      RpcPermissionError,
    );
  },
);


test(
  "local AI requires AI and local-network permissions",
  () => {
    const authorizer =
      createRpcAuthorizer({
        allowedPermissions: [
          PERMISSION.AI_ACCESS,
        ],
      });

    assert.throws(
      () =>
        authorizer.authorize(
          "ai.local.chat",
          getMethodContract(
            "ai.local.chat",
          ),
        ),
      RpcPermissionError,
    );
  },
);


test(
  "default desktop session permits local AI",
  () => {
    const authorizer =
      createRpcAuthorizer();

    const result =
      authorizer.authorize(
        "ai.local.chat",
        getMethodContract(
          "ai.local.chat",
        ),
      );

    assert.strictEqual(
      result.allowed,
      true,
    );
  },
);


test(
  "permission denial stays typed",
  () => {
    const authorizer =
      createRpcAuthorizer({
        allowedPermissions: [],
      });

    try {
      authorizer.authorize(
        "plugins.setEnabled",
        getMethodContract(
          "plugins.setEnabled",
        ),
      );

      assert.fail(
        "expected permission denial"
      );
    } catch (error) {
      assert.ok(
        error instanceof
          RpcPermissionError
      );

      assert.strictEqual(
        error.type,
        "PERMISSION_DENIED",
      );

      assert.strictEqual(
        error.code,
        -32002,
      );
    }
  },
);


console.log(
  `\nRPC authorization test complete: ${passed} passed, ${failed} failed.`
);

if (failed > 0) {
  process.exit(1);
}
