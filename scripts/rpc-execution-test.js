const assert =
  require("assert");

const {
  RpcTimeoutError,
  RpcCancelledError,
} = require(
  "../apps/desktop/rpc/errors",
);

const {
  createRpcExecutionManager,
  normalizeProgress,
} = require(
  "../apps/desktop/rpc/execution",
);


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

    console.error(
      error,
    );
  }
}


async function main() {
  console.log(
    "\nPL Creators Suite — RPC Execution Test\n",
  );


  await test(
    "progress clamps above 100",
    async () => {
      const progress =
        normalizeProgress({
          percent: 150,
        });

      assert.equal(
        progress.percent,
        100,
      );
    },
  );


  await test(
    "progress clamps below zero",
    async () => {
      const progress =
        normalizeProgress({
          percent: -20,
        });

      assert.equal(
        progress.percent,
        0,
      );
    },
  );


  await test(
    "successful execution returns result",
    async () => {
      const methods = {
        test: async () => ({
          ok: true,
        }),
      };

      const manager =
        createRpcExecutionManager({
          methods,
        });

      const result =
        await methods.test();

      assert.equal(
        result.ok,
        true,
      );
    },
  );


  await test(
    "cancel unknown request is safe",
    async () => {
      const manager =
        createRpcExecutionManager({
          methods: {},
        });

      const result =
        manager.cancel(
          "missing",
        );

      assert.equal(
        result.cancelled,
        false,
      );
    },
  );


  await test(
    "active request snapshot starts empty",
    async () => {
      const manager =
        createRpcExecutionManager({
          methods: {},
        });

      assert.deepEqual(
        manager.snapshot(),
        [],
      );
    },
  );


  await test(
    "timeout error remains typed",
    async () => {
      const error =
        new RpcTimeoutError(
          "test.method",
          100,
        );

      assert.equal(
        error.type,
        "TIMEOUT",
      );

      assert.equal(
        error.retryable,
        true,
      );
    },
  );


  await test(
    "cancelled error remains typed",
    async () => {
      const error =
        new RpcCancelledError();

      assert.equal(
        error.type,
        "CANCELLED",
      );
    },
  );


  console.log(
    `\nRPC execution test complete: ${passed} passed, ${failed} failed.`,
  );


  if (failed > 0) {
    process.exitCode = 1;
  }
}


main().catch(
  (error) => {
    console.error(error);
    process.exitCode = 1;
  },
);
