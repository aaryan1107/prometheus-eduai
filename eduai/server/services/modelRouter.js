const FALLBACK_MODELS = {
  normal: "gemma:2b",
  fast: "gemma3:1b"
};

export function getModelConfig() {
  return {
    normal: process.env.OLLAMA_NORMAL_MODEL || process.env.OLLAMA_MODEL || FALLBACK_MODELS.normal,
    fast: process.env.OLLAMA_FAST_MODEL || FALLBACK_MODELS.fast
  };
}

export function selectPromiModel({ context = {} } = {}) {
  const models = getModelConfig();
  const requestedMode = String(context.promiMode || context.modelMode || context.speed || "normal").toLowerCase();

  if (requestedMode === "fast") {
    return {
      mode: "fast",
      model: models.fast,
      numPredict: Number(process.env.OLLAMA_FAST_NUM_PREDICT || 120)
    };
  }

  return {
    mode: "normal",
    model: models.normal,
    numPredict: Number(process.env.OLLAMA_NORMAL_NUM_PREDICT || 220)
  };
}
