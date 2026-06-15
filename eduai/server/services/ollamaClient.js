import { PROMI_SYSTEM_PROMPT } from "../prompts/promiSystemPrompt.js";

const DEFAULT_OLLAMA_TIMEOUT_MS = 90000;

export async function askOllama({ message, context = {}, format, systemPrompt, userPrompt, model: selectedModel, numPredict }) {
  const baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
  const model = selectedModel || process.env.OLLAMA_MODEL || "llama3.1";
  const timeoutMs = Number(process.env.OLLAMA_TIMEOUT_MS || DEFAULT_OLLAMA_TIMEOUT_MS);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const finalSystemPrompt = systemPrompt || PROMI_SYSTEM_PROMPT;
  const finalUserPrompt = userPrompt || [
    `Context JSON: ${JSON.stringify(context, null, 2)}`,
    "",
    message
  ].join("\n");

  try {
    if (!format) {
      const response = await fetch(`${baseUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          model,
          stream: false,
          prompt: `${finalSystemPrompt}\n\n${finalUserPrompt}`,
          keep_alive: process.env.OLLAMA_KEEP_ALIVE || "30m",
          options: {
            num_predict: Number(numPredict || process.env.OLLAMA_NUM_PREDICT || 180),
            temperature: Number(process.env.OLLAMA_TEMPERATURE || 0.35)
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama responded with ${response.status}`);
      }

      const data = await response.json();
      return data?.response?.trim() || "";
    }

    const response = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        stream: false,
        format,
        keep_alive: process.env.OLLAMA_KEEP_ALIVE || "30m",
        options: {
          num_predict: Number(numPredict || process.env.OLLAMA_NUM_PREDICT || 180),
          temperature: Number(process.env.OLLAMA_TEMPERATURE || 0.35)
        },
        messages: [
          { role: "system", content: finalSystemPrompt },
          { role: "user", content: finalUserPrompt }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama responded with ${response.status}`);
    }

    const data = await response.json();
    return data?.message?.content?.trim() || "";
  } finally {
    clearTimeout(timeout);
  }
}
