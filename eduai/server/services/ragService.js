import { searchChunks } from "./sourceStore.js";

export async function retrieveRelevantSources(query, context = {}) {
  const topK = Number(context.topK || 5);
  const searchQuery = [
    query,
    context.subject,
    context.chapter,
    context.mode
  ].filter(Boolean).join(" ");
  const results = await searchChunks(searchQuery, Math.max(topK * 2, 8));
  return filterContextRelevant(results, context).slice(0, topK);
}

export function buildCitationPayload(chunks = []) {
  return chunks.map((chunk, index) => ({
    id: index + 1,
    sourceId: chunk.sourceId,
    chunkId: chunk.chunkId,
    title: chunk.title,
    url: chunk.url,
    type: chunk.type,
    metadata: chunk.metadata || {},
    snippet: chunk.snippet || chunk.chunkText?.slice(0, 280) || ""
  }));
}

function filterContextRelevant(chunks = [], context = {}) {
  const subject = normalize(context.subject);
  const chapter = normalize(context.chapter);
  const isGeneral = !subject || subject === "general study help" || subject === "general";
  const chapterTerms = importantTerms(chapter);

  if (isGeneral && chapterTerms.length === 0) return chunks;

  return chunks.filter((chunk) => {
    const haystack = normalize([
      chunk.title,
      chunk.type,
      chunk.url,
      chunk.metadata?.studentName,
      chunk.metadata?.grade,
      chunk.metadata?.subject,
      chunk.metadata?.chapter,
      chunk.snippet,
      chunk.chunkText
    ].filter(Boolean).join(" "));

    if (chapterTerms.length > 0 && chapter !== "general") {
      return chapterTerms.some((term) => haystack.includes(term));
    }

    if (isGeneral) return true;
    return subjectTerms(subject).some((term) => haystack.includes(term));
  });
}

function subjectTerms(subject = "") {
  const termsBySubject = {
    "mathematics": ["mathematics", "math", "algebra", "geometry", "probability", "equation", "number"],
    "physics": ["physics", "motion", "force", "newton", "electricity", "circuit", "energy"],
    "chemistry": ["chemistry", "atomic", "atom", "bond", "bonding", "chemical", "molecule", "periodic"],
    "biology": ["biology", "cell", "photosynthesis", "organism", "plant", "respiration", "genetics"],
    "english": ["english", "reading", "writing", "grammar", "literature", "comprehension", "essay"],
    "history": ["history", "empire", "revolution", "war", "civilization", "source"],
    "geography": ["geography", "map", "climate", "river", "population", "landform"],
    "economics": ["economics", "demand", "supply", "market", "inflation", "cost"],
    "computer science": ["computer", "programming", "algorithm", "code", "data", "network"],
    "sat preparation": ["sat", "reading", "math", "writing", "passage", "evidence"]
  };
  return termsBySubject[subject] || importantTerms(subject);
}

function importantTerms(value = "") {
  return normalize(value)
    .split(/\s+/)
    .filter((term) => term.length > 2 && !["and", "the", "for", "with", "general"].includes(term));
}

function normalize(value = "") {
  return String(value).toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}
