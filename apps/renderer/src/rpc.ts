type RpcMeta = {
  correlationId?: string;
};

type JsonRpcOk<T> = {
  jsonrpc: "2.0";
  id: number | string | null;
  result: T;
  meta?: RpcMeta;
};

type JsonRpcErrorData = {
  type?: string;
  retryable?: boolean;
  details?: unknown;
};

type JsonRpcErr = {
  jsonrpc: "2.0";
  id: number | string | null;
  error: {
    code: number;
    message: string;
    data?: JsonRpcErrorData;
  };
  meta?: RpcMeta;
};

export class RpcClientError extends Error {
  readonly code: number;
  readonly type: string;
  readonly retryable: boolean;
  readonly details: unknown;
  readonly correlationId?: string;

  constructor(
    message: string,
    options: {
      code: number;
      type?: string;
      retryable?: boolean;
      details?: unknown;
      correlationId?: string;
    },
  ) {
    super(message);

    this.name = "RpcClientError";
    this.code = options.code;
    this.type =
      options.type || "RPC_ERROR";

    this.retryable =
      options.retryable === true;

    this.details =
      options.details;

    this.correlationId =
      options.correlationId;
  }
}

function getRpcPort(): number {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("rpcPort");
  const port = raw ? Number(raw) : NaN;
  return Number.isFinite(port) ? port : 38741;
}

function getRpcToken(): string {
  const params =
    new URLSearchParams(
      window.location.search,
    );

  return params.get("rpcToken") || "";
}

function rpcUrl(): string {
  return `http://127.0.0.1:${getRpcPort()}/`;
}

let nextId = 1;

export async function rpc<T>(method: string, params?: any): Promise<T> {
  const id = nextId++;
  const res = await fetch(rpcUrl(), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-pl-rpc-token": getRpcToken(),
    },
    body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
  });

  const data = (await res.json()) as JsonRpcOk<T> | JsonRpcErr;
  if ("error" in data) {
    throw new RpcClientError(
      data.error.message,
      {
        code: data.error.code,
        type: data.error.data?.type,
        retryable:
          data.error.data?.retryable,
        details:
          data.error.data?.details,
        correlationId:
          data.meta?.correlationId,
      },
    );
  }
  return data.result;
}
