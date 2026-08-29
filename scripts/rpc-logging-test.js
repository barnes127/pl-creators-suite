const assert =
  require("assert");

const {
  createRpcLogger,
} = require(
  "../apps/desktop/rpc/logging",
);


let passed = 0;
let failed = 0;


function test(
  name,
  fn,
) {
  try {
    fn();

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


function makeSink() {
  const lines = [];

  return {
    lines,

    log(line) {
      lines.push(line);
    },

    warn(line) {
      lines.push(line);
    },

    error(line) {
      lines.push(line);
    },
  };
}


console.log(
  "\nPL Creators Suite — RPC Logging Test\n",
);


test(
  "request log is structured JSON",
  () => {
    const sink =
      makeSink();

    const logger =
      createRpcLogger({
        sink,

        now:
          () =>
            "2026-01-01T00:00:00.000Z",
      });

    logger.request({
      correlationId:
        "corr-1",

      requestId:
        "req-1",

      method:
        "app.metadata",
    });

    const entry =
      JSON.parse(
        sink.lines[0],
      );

    assert.strictEqual(
      entry.subsystem,
      "rpc",
    );

    assert.strictEqual(
      entry.event,
      "request",
    );

    assert.strictEqual(
      entry.method,
      "app.metadata",
    );
  },
);


test(
  "progress log preserves normalized progress",
  () => {
    const sink =
      makeSink();

    const logger =
      createRpcLogger({
        sink,
      });

    logger.progress({
      correlationId:
        "corr-2",

      method:
        "ai.local.chat",

      progress: {
        phase:
          "generating",

        percent:
          30,

        message:
          "Generating",
      },
    });

    const entry =
      JSON.parse(
        sink.lines[0],
      );

    assert.strictEqual(
      entry.phase,
      "generating",
    );

    assert.strictEqual(
      entry.percent,
      30,
    );
  },
);


test(
  "failure log records typed error without stack",
  () => {
    const sink =
      makeSink();

    const logger =
      createRpcLogger({
        sink,
      });

    logger.failure({
      correlationId:
        "corr-3",

      requestId:
        "req-3",

      method:
        "project.open",

      error: {
        type:
          "INVALID_PARAMS",

        code:
          -32602,

        retryable:
          false,

        stack:
          "secret stack",
      },
    });

    const entry =
      JSON.parse(
        sink.lines[0],
      );

    assert.strictEqual(
      entry.errorType,
      "INVALID_PARAMS",
    );

    assert.strictEqual(
      entry.errorCode,
      -32602,
    );

    assert.strictEqual(
      "stack" in entry,
      false,
    );
  },
);


test(
  "logger does not serialize request parameters",
  () => {
    const sink =
      makeSink();

    const logger =
      createRpcLogger({
        sink,
      });

    logger.request({
      correlationId:
        "corr-4",

      requestId:
        "req-4",

      method:
        "docs.save",

      params: {
        secret:
          "do-not-log",
      },
    });

    assert.strictEqual(
      sink.lines[0]
        .includes(
          "do-not-log",
        ),
      false,
    );
  },
);


console.log(
  `\nRPC logging test complete: ${passed} passed, ${failed} failed.`,
);

if (failed > 0) {
  process.exit(1);
}
