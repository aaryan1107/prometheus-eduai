const DEFAULT_EMBED_MODEL = "nomic-embed-text";

export async function embedText(text = "") {
  const baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
  const model = process.env.OLLAMA_EMBED_MODEL || DEFAULT_EMBED_MODEL;
  const cleanText = String(text).replace(/\s+/g, " ").trim();

  if (!cleanText) {
    throw new Error("Cannot embed empty text.");
  }

  const response = await fetch(`${baseUrl}/api/embeddings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt: cleanText
    })
  });

  if (!response.ok) {
    throw new Error(`Ollama embeddings responded with ${response.status}`);
  }

  const data = await response.json();
  if (Array.isArray(data.embedding)) return data.embedding;
  if (Array.isArray(data.embeddings?.[0])) return data.embeddings[0];
  throw new Error("Ollama embedding response did not include an embedding.");
}
