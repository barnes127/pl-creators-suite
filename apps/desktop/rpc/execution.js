const {
  RpcCancelledError,
  RpcTimeoutError,
  normalizeRpcError,
} = require("./errors");

const {
  getMethodContract,
  validateMethodParams,
} = require("./contracts");


function normalizeProgress(
  progress,
) {
  if (
    !progress ||
    typeof progress !== "object" ||
    Array.isArray(progress)
  ) {
    return {
      phase: "running",
      percent: null,
      message: "",
    };
  }

  const rawPercent =
    progress.percent;

  const percent =
    Number.isFinite(rawPercent)
      ? Math.max(
          0,
          Math.min(100, rawPercent),
        )
      : null;

  return {
    phase:
      typeof progress.phase ===
      "string"
        ? progress.phase
        : "running",

    percent,

    message:
      typeof progress.message ===
      "string"
        ? progress.message
        : "",
  };
}


function createRpcExecutionManager({
  methods,
  policies = {},
  onProgress = null,
}) {
  const activeRequests =
    new Map();


  function getActiveRequest(
    requestId,
  ) {
    return (
      activeRequests.get(
        requestId,
      ) ||
      null
    );
  }


  function cancel(
    requestId,
  ) {
    const active =
      getActiveRequest(
        requestId,
      );

    if (!active) {
      return {
        cancelled: false,
        requestId,
        reason:
          "Request is not active.",
      };
    }

    if (
      !active.contract
        .supportsCancellation
    ) {
      return {
        cancelled: false,
        requestId,
        reason:
          "Request does not support cancellation.",
      };
    }

    active.controller.abort();

    return {
      cancelled: true,
      requestId,
    };
  }


  async function invokeOnce({
    method,
    params,
    contract,
    policy,
    context,
  }) {
    const fn = methods[method];

    if (context.signal.aborted) {
      throw new RpcCancelledError(
        `RPC method "${method}" was cancelled`,
      );
    }

    if (
      !policy ||
      !Number.isInteger(
        policy.timeoutMs,
      ) ||
      policy.timeoutMs <= 0
    ) {
      return fn(
        params,
        context,
      );
    }

    let timeoutId;

    try {
      return await Promise.race([
        fn(
          params,
          context,
        ),

        new Promise(
          (_, reject) => {
            timeoutId =
              setTimeout(() => {
                if (
                  contract
                    .supportsCancellation
                ) {
                  context
                    .controller
                    .abort();
                }

                reject(
                  new RpcTimeoutError(
                    method,
                    policy.timeoutMs,
                  ),
                );
              }, policy.timeoutMs);
          },
        ),
      ]);
    } finally {
      clearTimeout(
        timeoutId,
      );
    }
  }


  async function execute({
    requestId,
    method,
    rawParams,
    correlationId,
  }) {
    const fn =
      methods[method];

    if (
      typeof fn !== "function"
    ) {
      return null;
    }

    const contract =
      getMethodContract(
        method,
      );

    const params =
      validateMethodParams(
        method,
        rawParams,
      );

    const policy =
      policies[method] ||
      null;

    const controller =
      new AbortController();

    let lastProgress = null;

    const reportProgress =
      (progress) => {
        const normalized =
          normalizeProgress(
            progress,
          );

        lastProgress =
          normalized;

        if (
          typeof onProgress ===
          "function"
        ) {
          onProgress({
            requestId,
            correlationId,
            method,
            progress:
              normalized,
          });
        }

        return normalized;
      };


    const context = {
      requestId,
      correlationId,
      method,
      signal:
        controller.signal,
      controller,
      reportProgress,
    };


    activeRequests.set(
      requestId,
      {
        method,
        contract,
        controller,
        correlationId,
      },
    );


    const maxAttempts =
      contract.retryable
        ? Math.max(
            1,
            Number(
              contract.maxAttempts ||
              2,
            ),
          )
        : 1;

    let attempt = 0;


    try {
      while (
        attempt < maxAttempts
      ) {
        attempt += 1;

        if (
          controller
            .signal
            .aborted
        ) {
          throw new RpcCancelledError(
            `RPC method "${method}" was cancelled`,
          );
        }

        try {
          reportProgress({
            phase:
              attempt === 1
                ? "running"
                : "retrying",

            percent: null,

            message:
              attempt === 1
                ? "RPC operation started."
                : `Retry attempt ${attempt} of ${maxAttempts}.`,
          });


          const result =
            await invokeOnce({
              method,
              params,
              contract,
              policy,
              context,
            });


          reportProgress({
            phase: "complete",
            percent: 100,
            message:
              "RPC operation completed.",
          });


          return {
            result,
            execution: {
              attempts: attempt,
              progress:
                lastProgress,
            },
          };
        } catch (error) {
          if (
            controller
              .signal
              .aborted
          ) {
            throw new RpcCancelledError(
              `RPC method "${method}" was cancelled`,
            );
          }

          const normalized =
            normalizeRpcError(
              error,
            );

          const mayRetry =
            contract.retryable ===
              true &&
            contract.mutates ===
              false &&
            normalized.retryable ===
              true &&
            attempt <
              maxAttempts;

          if (!mayRetry) {
            throw error;
          }
        }
      }

      throw new Error(
        `RPC execution exhausted attempts for ${method}`,
      );
    } finally {
      activeRequests.delete(
        requestId,
      );
    }
  }


  function snapshot() {
    return [
      ...activeRequests.entries(),
    ].map(
      ([
        requestId,
        active,
      ]) => ({
        requestId,
        method:
          active.method,
        correlationId:
          active.correlationId,
        cancellable:
          active.contract
            .supportsCancellation ===
          true,
      }),
    );
  }


  return {
    execute,
    cancel,
    snapshot,
    getActiveRequest,
  };
}


module.exports = {
  normalizeProgress,
  createRpcExecutionManager,
};
