const http = require("http");

const OLLAMA_HOST = "127.0.0.1";
const OLLAMA_PORT = 11434;

function requestJson({ hostname, port, path, method = "GET", body = null, timeoutMs = 1500, signal = null }) {
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
          if (
            signal &&
            abortHandler
          ) {
            signal.removeEventListener(
              "abort",
              abortHandler,
            );
          }
          try {
            const parsed = raw ? JSON.parse(raw) : null;
            resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, statusCode: res.statusCode, data: parsed });
          } catch (error) {
            reject(new Error(`Invalid JSON response: ${error.message}`));
          }
        });
      }
    );

    let abortHandler = null;

    if (signal) {
      abortHandler = () => {
        req.destroy(
          new Error(
            "Request cancelled",
          ),
        );
      };

      if (signal.aborted) {
        abortHandler();
      } else {
        signal.addEventListener(
          "abort",
          abortHandler,
          {
            once: true,
          },
        );
      }
    }

    req.on("timeout", () => {
      req.destroy(new Error("Request timed out"));
    });

    req.on(
      "error",
      (error) => {
        if (
          signal &&
          abortHandler
        ) {
          signal.removeEventListener(
            "abort",
            abortHandler,
          );
        }

        reject(error);
      },
    );

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

async function chat(params, context = {}) {
  const signal = context?.signal || null;
  const reportProgress = typeof context ?.reportProgress === "function" ? context.reportProgress : () => {};
  const prompt = String(params?.prompt || "").trim();
  const requestedModel = String(params?.model || "").trim();
  const allowProjectContext = Boolean(params?.allowProjectContext);
  const projectRoot = String(params?.projectRoot || "").trim();

  if (!prompt) {
    throw new Error("prompt is required");
  }

  reportProgress({
    phase:
      "checking-provider",
    percent: 10,
    message:
      "Checking local AI provider.",
  });

  const status = await getLocalAiStatus();

  if (!status.available) {
    return {
      ok: false,
      message: "Local AI is not available. Start Ollama or install a local model runner.",
      response: "",
      status,
    };
  }

  const model = requestedModel || status.model;

  if (!model) {
    return {
      ok: false,
      message: "No local model is available. Pull a model in Ollama first.",
      response: "",
      status,
    };
  }

  const finalPrompt =
    allowProjectContext && projectRoot
      ? `Project context is allowed for this request.\nProject root: ${projectRoot}\n\nUser prompt:\n${prompt}`
      : prompt;

  reportProgress({
    phase:
      "generating",
    percent: 30,
    message:
      "Generating local AI response.",
  });

  const result = await requestJson({
    hostname: OLLAMA_HOST,
    port: OLLAMA_PORT,
    path: "/api/generate",
    method: "POST",
    signal,
    timeoutMs: 120000,
    body: {
      model,
      prompt: finalPrompt,
      stream: false,
    },
  });

  if (!result.ok) {
    return {
      ok: false,
      message: `Ollama generation failed with HTTP ${result.statusCode}`,
      response: "",
      status,
    };
  }

  reportProgress({
    phase:
      "finalizing",
    percent: 90,
    message:
      "Finalizing local AI response.",
  });

  return {
    ok: true,
    message: "Generated response",
    response: String(result.data?.response || ""),
    model,
    status,
  };
}

module.exports = {
  getLocalAiStatus,
  chat,
};
