const http = require("http");

const OLLAMA_HOST = "127.0.0.1";
const OLLAMA_PORT = 11434;

function requestJson({ hostname, port, path, method = "GET", body = null, timeoutMs = 1500 }) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;

    const req = http.request(
      {
        hostname,
        port,
        path,
        method,
        headers: payload
          ? {
              "Content-Type": "application/json",
              "Content-Length": Buffer.byteLength(payload),
            }
          : undefined,
        timeout: timeoutMs,
      },
      (res) => {
        let raw = "";

        res.on("data", (chunk) => {
          raw += chunk.toString();
        });

        res.on("end", () => {
          try {
            const parsed = raw ? JSON.parse(raw) : null;
            resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, statusCode: res.statusCode, data: parsed });
          } catch (error) {
            reject(new Error(`Invalid JSON response: ${error.message}`));
          }
        });
      }
    );

    req.on("timeout", () => {
      req.destroy(new Error("Request timed out"));
    });

    req.on("error", reject);

    if (payload) req.write(payload);
    req.end();
  });
}

async function getOllamaStatus() {
  try {
    const result = await requestJson({
      hostname: OLLAMA_HOST,
      port: OLLAMA_PORT,
      path: "/api/tags",
    });

    const models = Array.isArray(result.data?.models)
      ? result.data.models.map((model) => ({
          name: String(model?.name || ""),
          modifiedAt: String(model?.modified_at || ""),
          size: Number(model?.size || 0),
        }))
      : [];

    return {
      available: result.ok,
      provider: "ollama",
      host: `${OLLAMA_HOST}:${OLLAMA_PORT}`,
      models,
      model: models[0]?.name || null,
      reason: result.ok ? "" : `Ollama returned HTTP ${result.statusCode}`,
    };
  } catch (error) {
    return {
      available: false,
      provider: "ollama",
      host: `${OLLAMA_HOST}:${OLLAMA_PORT}`,
      models: [],
      model: null,
      reason: error.message || String(error),
    };
  }
}

async function getLocalAiStatus() {
  const ollama = await getOllamaStatus();

  return {
    available: ollama.available,
    provider: ollama.provider,
    model: ollama.model,
    models: ollama.models,
    reason: ollama.available ? "" : ollama.reason,
    host: ollama.host,
  };
}

async function chat(params) {
  const prompt = String(params?.prompt || "").trim();
  const model = String(params?.model || "").trim();

  if (!prompt) {
    throw new Error("prompt is required");
  }

  const status = await getLocalAiStatus();

  if (!status.available) {
    return {
      ok: false,
      message: "Local AI is not available. Start Ollama or install a local model runner.",
      status,
    };
  }

  return {
    ok: false,
    message: "Local AI chat provider is detected, but generation is not wired yet.",
    status: {
      ...status,
      selectedModel: model || status.model,
    },
  };
}

module.exports = {
  getLocalAiStatus,
  chat,
};
