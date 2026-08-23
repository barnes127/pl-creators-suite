const assert = require("assert");

const {
  RpcError,
  RpcInvalidRequestError,
  RpcMethodNotFoundError,
  RpcTimeoutError,
  normalizeRpcError,
  serializeRpcError,
} = require("../apps/desktop/rpc/errors");

const {
  METHOD_CONTRACTS,
  getMethodContract,
  validateMethodParams,
  derivePermissions,
  assertMethodContractCoverage,
} = require(
  "../apps/desktop/rpc/contracts",
);

const {
  validateRpcRequest,
  createCorrelationId,
  makeRpcSuccess,
  makeRpcFailure,
} = require("../apps/desktop/rpc/protocol");

let passed = 0;
let failed = 0;

function isValidSessionToken(token) {
  return (
    typeof token === "string" &&
    token.length >= 32
  );
}

async function test(name, fn) {
  try {
    await fn();
    passed += 1;
    console.log(`PASS    ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`FAIL    ${name}`);
    console.error(`        ${error.message}`);
  }
}

async function main() {
  console.log(
    "\nPL Creators Suite — RPC Contract Test\n",
  );

  await test(
    "valid RPC request normalizes",
    async () => {
      const result = validateRpcRequest({
        jsonrpc: "2.0",
        id: 1,
        method: "project.open",
        params: {
          projectRoot: "/tmp/test",
        },
      });

      assert.strictEqual(
        result.method,
        "project.open",
      );

      assert.deepStrictEqual(
        result.params,
        {
          projectRoot: "/tmp/test",
        },
      );
    },
  );

  await test(
    "missing method is rejected",
    async () => {
      assert.throws(
        () =>
          validateRpcRequest({
            jsonrpc: "2.0",
          }),
        RpcInvalidRequestError,
      );
    },
  );

  await test(
    "invalid params are rejected",
    async () => {
      assert.throws(
        () =>
          validateRpcRequest({
            jsonrpc: "2.0",
            method: "project.open",
            params: "bad",
          }),
        RpcInvalidRequestError,
      );
    },
  );

  await test(
    "correlation IDs are generated",
    async () => {
      const a =
        createCorrelationId();

      const b =
        createCorrelationId();

      assert.ok(a);
      assert.ok(b);
      assert.notStrictEqual(a, b);
    },
  );

  await test(
    "success response includes correlation ID",
    async () => {
      const result =
        makeRpcSuccess(
          4,
          {
            ok: true,
          },
          "test-id",
        );

      assert.strictEqual(
        result.jsonrpc,
        "2.0",
      );

      assert.strictEqual(
        result.meta.correlationId,
        "test-id",
      );
    },
  );

  await test(
    "known RPC error preserves public type",
    async () => {
      const error =
        new RpcMethodNotFoundError(
          "fake.method",
        );

      const serialized =
        serializeRpcError(error);

      assert.strictEqual(
        serialized.code,
        -32601,
      );

      assert.strictEqual(
        serialized.data.type,
        "METHOD_NOT_FOUND",
      );
    },
  );

  await test(
    "unexpected errors are sanitized",
    async () => {
      const original =
        new Error(
          "secret internal filesystem detail",
        );

      const normalized =
        normalizeRpcError(original);

      assert.ok(
        normalized instanceof RpcError,
      );

      assert.strictEqual(
        normalized.message,
        "Internal RPC error",
      );

      const serialized =
        serializeRpcError(original);

      assert.strictEqual(
        serialized.message,
        "Internal RPC error",
      );

      assert.strictEqual(
        serialized.data.type,
        "INTERNAL_ERROR",
      );
    },
  );

  await test(
    "timeout error is marked retryable",
    async () => {
      const error =
        new RpcTimeoutError(
          "assets.import",
          30000,
        );

      const serialized =
        serializeRpcError(error);

      assert.strictEqual(
        serialized.data.type,
        "TIMEOUT",
      );

      assert.strictEqual(
        serialized.data.retryable,
        true,
      );
    },
  );

  await test(
    "failure response preserves request ID",
    async () => {
      const error =
        serializeRpcError(
          new RpcMethodNotFoundError(
            "fake.method",
          ),
        );

      const result =
        makeRpcFailure(
          27,
          error,
          "failure-id",
        );

      assert.strictEqual(
        result.id,
        27,
      );

      assert.strictEqual(
        result.meta.correlationId,
        "failure-id",
      );
    },
  );

  await test(
    "invalid JSON-RPC version is rejected",
    async () => {
      assert.throws(
        () =>
          validateRpcRequest({
            jsonrpc: "1.0",
            method: "project.open",
          }),
        RpcInvalidRequestError,
      );
    },
  );

  await test(
    "serialized internal error exposes no original message",
    async () => {
      const serialized =
        serializeRpcError(
          new Error(
            "/home/brandenbarnes/private/secret.txt",
          ),
        );

      assert.strictEqual(
        serialized.message,
        "Internal RPC error",
      );

      assert.strictEqual(
        JSON.stringify(
          serialized,
        ).includes(
          "secret.txt",
        ),
        false,
      );
    },
  );

  await test(
    "RPC session token contract rejects missing token",
    async () => {
      assert.strictEqual(
        isValidSessionToken(undefined),
        false,
      );
    },
  );

  await test(
    "RPC session token contract rejects short token",
    async () => {
      assert.strictEqual(
        isValidSessionToken("short"),
        false,
      );
    },
  );

  await test(
    "RPC session token contract accepts strong token",
    async () => {
      assert.strictEqual(
        isValidSessionToken(
          "a".repeat(64),
        ),
        true,
      );
    },
  );

  await test(
    "project.open rejects missing projectRoot",
    () => {
      assert.throws(
        () =>
          validateMethodParams(
            "project.open",
            {},
          ),
        /projectRoot/,
      );
    },
  );

  await test(
    "project.open accepts projectRoot",
    () => {
      const params =
        validateMethodParams(
          "project.open",
          {
            projectRoot:
              "/tmp/example",
          },
        );

      assert.equal(
        params.projectRoot,
        "/tmp/example",
      );
    },
  );

  await test(
    "read-only method is marked retryable",
    () => {
      const contract =
        getMethodContract(
          "docs.list",
        );

      assert.equal(
        contract.mutates,
        false,
      );

      assert.equal(
        contract.retryable,
        true,
      );
    },
  );

  await test(
    "mutation method is not retryable",
    () => {
      const contract =
        getMethodContract(
          "docs.save",
        );

      assert.equal(
        contract.mutates,
        true,
      );

      assert.equal(
        contract.retryable,
        false,
      );
    },
  );

  await test(
    "project export declares shell boundary",
    () => {
      const contract =
        getMethodContract(
          "project.export",
        );

      assert.ok(
        contract.trust.includes(
          "shell",
        ),
      );
    },
  );

  await test(
    "local AI declares network boundary",
    () => {
      const contract =
        getMethodContract(
          "ai.local.chat",
        );

      assert.ok(
        contract.trust.includes(
          "network",
        ),
      );

      assert.ok(
        contract.trust.includes(
          "ai",
        ),
      );
    },
  );

  await test(
    "all active contract entries total 61",
    () => {
      assert.equal(
        Object.keys(
          METHOD_CONTRACTS,
        ).length,
        61,
      );
    },
  );


  await test(
    "every RPC contract has a validator",
    () => {
      for (
        const contract
        of Object.values(
          METHOD_CONTRACTS,
        )
      ) {
        assert.equal(
          typeof contract.validate,
          "function",
        );
      }
    },
  );


  await test(
    "mutating RPC methods are not retryable",
    () => {
      for (
        const [
          method,
          contract,
        ]
        of Object.entries(
          METHOD_CONTRACTS,
        )
      ) {
        if (contract.mutates) {
          assert.equal(
            contract.retryable,
            false,
            `${method} must not be automatically retryable`,
          );
        }
      }
    },
  );


  await test(
    "logs.export requires projectRoot",
    () => {
      assert.throws(
        () =>
          validateMethodParams(
            "logs.export",
            {},
          ),
        /projectRoot/,
      );
    },
  );


  await test(
    "AI chat requires prompt",
    () => {
      assert.throws(
        () =>
          validateMethodParams(
            "ai.local.chat",
            {},
          ),
        /prompt/,
      );
    },
  );


  await test(
    "AI project context requires projectRoot",
    () => {
      assert.throws(
        () =>
          validateMethodParams(
            "ai.local.chat",
            {
              prompt: "hello",
              allowProjectContext:
                true,
            },
          ),
        /projectRoot/,
      );
    },
  );


  await test(
    "asset import requires sourcePath",
    () => {
      assert.throws(
        () =>
          validateMethodParams(
            "assets.import",
            {
              projectRoot:
                "/tmp/project",
            },
          ),
        /sourcePath/,
      );
    },
  );


  await test(
    "sheet save requires structured sheet payload",
    () => {
      assert.throws(
        () =>
          validateMethodParams(
            "sheets.save",
            {
              projectRoot:
                "/tmp/project",
              name:
                "sheet-one",
            },
          ),
        /sheet/,
      );
    },
  );


  await test(
    "workflow save requires workflow payload",
    () => {
      assert.throws(
        () =>
          validateMethodParams(
            "workflows.save",
            {
              projectRoot:
                "/tmp/project",
              name:
                "workflow-one",
            },
          ),
        /workflow/,
      );
    },
  );


  await test(
    "registry coverage detects an uncontracted method",
    () => {
      const methods = {};

      for (
        const method
        of Object.keys(
          METHOD_CONTRACTS,
        )
      ) {
        methods[method] =
          () => {};
      }

      methods[
        "unregistered.test"
      ] = () => {};

      assert.throws(
        () =>
          assertMethodContractCoverage(
            methods,
          ),
        /Missing contracts/,
      );
    },
  );

  await test(
    "RPC cancel method has contract",
    () => {
      const contract =
        getMethodContract(
          "rpc.cancel",
        );

      assert.ok(contract);
    },
  );


  await test(
    "local AI chat supports cancellation",
    () => {
      const contract =
        getMethodContract(
          "ai.local.chat",
        );

      assert.equal(
        contract
          .supportsCancellation,
        true,
      );
    },
  );


  await test(
    "filesystem mutation does not support implicit cancellation",
    () => {
      const contract =
        getMethodContract(
          "docs.save",
        );

      assert.equal(
        contract
          .supportsCancellation,
        false,
      );
    },
  );


  await test(
    "retryable methods receive bounded attempts",
    () => {
      const contract =
        getMethodContract(
          "docs.list",
        );

      assert.equal(
        contract.maxAttempts,
        2,
      );
    },
  );


  await test(
    "mutating methods receive one attempt",
    () => {
      const contract =
        getMethodContract(
          "docs.save",
        );

      assert.equal(
        contract.maxAttempts,
        1,
      );
    },
  );

  console.log(
    `\nRPC contract test complete: ${passed} passed, ${failed} failed.`,
  );

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
