type JsonRpcOk<T> = { jsonrpc: "2.0"; id: number | string | null; result: T };
type JsonRpcErr = { jsonrpc: "2.0"; id: number | string | null; error: { code: number; message: string } };

function getRpcPort(): number {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("rpcPort");
  const port = raw ? Number(raw) : NaN;
  return Number.isFinite(port) ? port : 38741;
}

function rpcUrl(): string {
  return `http://127.0.0.1:${getRpcPort()}/`;
}

let nextId = 1;

export async function rpc<T>(method: string, params?: any): Promise<T> {
  const id = nextId++;
  const res = await fetch(rpcUrl(), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
  });

  const data = (await res.json()) as JsonRpcOk<T> | JsonRpcErr;
  if ("error" in data) throw new Error(data.error.message);
  return data.result;
}
