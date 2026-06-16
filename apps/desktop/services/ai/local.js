const LOCAL_AI_STATUS = Object.freeze({
  available: false,
  provider: "none",
  model: null,
  reason: "Local AI runner is not configured yet",
});

async function getLocalAiStatus() {
  return { ...LOCAL_AI_STATUS };
}

async function chat(params) {
  const prompt = String(params?.prompt || "").trim();

  if (!prompt) {
    throw new Error("prompt is required");
  }

  const status = await getLocalAiStatus();

  if (!status.available) {
    return {
      ok: false,
      message: "Local AI is not configured yet. This is a Stage 2 service stub.",
      status,
    };
  }

  return {
    ok: false,
    message: "Local AI provider integration is not implemented yet.",
    status,
  };
}

module.exports = {
  getLocalAiStatus,
  chat,
};
