const DEFAULT_CHUNK_SIZE = 900;
const DEFAULT_OVERLAP = 140;

export function chunkSourceText({ sourceId, title, url = "", text, type, metadata = {} }) {
  const cleanText = String(text || "").replace(/\s+/g, " ").trim();
  if (!cleanText) return [];

  const chunks = [];
  let start = 0;
  let index = 1;

  while (start < cleanText.length) {
    const end = Math.min(start + DEFAULT_CHUNK_SIZE, cleanText.length);
    const slice = cleanText.slice(start, end).trim();
    if (slice.length >= 40) {
      chunks.push({
        sourceId,
        chunkId: `${sourceId}-chunk-${index}`,
        title,
        type,
        url,
        metadata,
        chunkText: slice
      });
      index += 1;
    }

    if (end >= cleanText.length) break;
    start = Math.max(0, end - DEFAULT_OVERLAP);
  }

  return chunks;
}
