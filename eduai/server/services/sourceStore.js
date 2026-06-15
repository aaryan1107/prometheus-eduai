import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { embedText } from "./embeddingService.js";
import { chunkSourceText } from "./sourceChunker.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STORE_PATH = path.resolve(__dirname, "../data/sourceStore.json");
const SOURCE_TYPES = new Set([
  "teacher_note",
  "school_pdf",
  "question_paper",
  "question_bank",
  "markscheme",
  "student_answer_script",
  "website",
  "general_reference"
]);

export async function addSource({
  title,
  type = "teacher_note",
  url = "",
  text,
  uploadedBy = "teacher",
  approved = true,
  studentName = "",
  grade = "",
  subject = "",
  chapter = "",
  fileName = "",
  questionPaperFileName = "",
  questionPaperText = "",
  comment = ""
}) {
  if (!title?.trim()) throw new Error("Source title is required.");
  if (!text?.trim()) throw new Error("Source text is required.");
  if (!SOURCE_TYPES.has(type)) throw new Error(`Unsupported source type: ${type}`);

  const store = await readStore();
  const sourceId = `src-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const createdAt = new Date().toISOString();
  const source = {
    sourceId,
    title: title.trim(),
    type,
    url: url?.trim() || "",
    studentName: studentName?.trim() || "",
    grade: grade?.trim() || "",
    subject: subject?.trim() || "",
    chapter: chapter?.trim() || "",
    fileName: fileName?.trim() || "",
    questionPaperFileName: questionPaperFileName?.trim() || "",
    questionPaperText: questionPaperText?.trim() || "",
    comment: comment?.trim() || "",
    contentText: text.slice(0, 30000),
    uploadedBy,
    approved: Boolean(approved),
    createdAt
  };
  const metadata = {
    studentName: source.studentName,
    grade: source.grade,
    subject: source.subject,
    chapter: source.chapter
  };
  const indexedText = [
    source.subject && `Subject: ${source.subject}`,
    source.chapter && `Chapter: ${source.chapter}`,
    source.grade && `Grade: ${source.grade}`,
    source.studentName && `Student: ${source.studentName}`,
    text
  ].filter(Boolean).join("\n");
  const chunks = chunkSourceText({ sourceId, title: source.title, url: source.url, text: indexedText, type, metadata });
  const embeddedChunks = [];

  for (const chunk of chunks) {
    let embedding = null;
    try {
      embedding = await embedText(chunk.chunkText);
    } catch {
      embedding = null;
    }
    embeddedChunks.push({
      ...chunk,
      uploadedBy,
      approved: source.approved,
      createdAt,
      embedding
    });
  }

  store.sources.unshift(source);
  store.chunks.unshift(...embeddedChunks);
  await writeStore(store);

  return {
    source,
    chunksAdded: embeddedChunks.length
  };
}

export async function listSources() {
  const store = await readStore();
  return store.sources.map((source) => {
    const chunkCount = store.chunks.filter((chunk) => chunk.sourceId === source.sourceId).length;
    return { ...source, chunkCount };
  });
}

export async function updateSourceComment(sourceId, comment = "") {
  const store = await readStore();
  const source = store.sources.find((item) => item.sourceId === sourceId);
  if (!source) return null;

  source.comment = String(comment || "").trim();
  source.updatedAt = new Date().toISOString();
  await writeStore(store);
  const chunkCount = store.chunks.filter((chunk) => chunk.sourceId === source.sourceId).length;
  return { ...source, chunkCount };
}

export async function deleteSource(sourceId) {
  const store = await readStore();
  const existing = store.sources.find((item) => item.sourceId === sourceId);
  if (!existing) return null;

  store.sources = store.sources.filter((source) => source.sourceId !== sourceId);
  store.chunks = store.chunks.filter((chunk) => chunk.sourceId !== sourceId);
  await writeStore(store);
  return existing;
}

export async function getAllChunks() {
  const store = await readStore();
  return store.chunks.filter((chunk) => chunk.approved !== false);
}

export async function searchChunks(query, topK = 5) {
  const chunks = await getAllChunks();
  const cleanQuery = String(query || "").trim();
  if (!cleanQuery) return [];

  let queryEmbedding = null;
  try {
    queryEmbedding = await embedText(cleanQuery);
  } catch {
    queryEmbedding = null;
  }

  const scored = chunks.map((chunk) => {
    const vectorScore = queryEmbedding && Array.isArray(chunk.embedding)
      ? cosineSimilarity(queryEmbedding, chunk.embedding)
      : 0;
    const keywordScore = keywordSimilarity(cleanQuery, chunk.chunkText);
    const score = vectorScore ? (vectorScore * 0.82) + (keywordScore * 0.18) : keywordScore;
    return { ...chunk, score };
  });

  return scored
    .filter((chunk) => chunk.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, Number(topK) || 5)
    .map(toSearchResult);
}

function toSearchResult(chunk, index) {
  return {
    id: index + 1,
    sourceId: chunk.sourceId,
    chunkId: chunk.chunkId,
    title: chunk.title,
    url: chunk.url,
    type: chunk.type,
    metadata: chunk.metadata || {},
    snippet: chunk.chunkText.slice(0, 280),
    chunkText: chunk.chunkText,
    score: Number(chunk.score.toFixed(4))
  };
}

async function readStore() {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return {
      sources: Array.isArray(parsed.sources) ? parsed.sources : [],
      chunks: Array.isArray(parsed.chunks) ? parsed.chunks : []
    };
  } catch {
    return { sources: [], chunks: [] };
  }
}

async function writeStore(store) {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2));
}

function cosineSimilarity(a, b) {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  const length = Math.min(a.length, b.length);
  for (let index = 0; index < length; index += 1) {
    dot += a[index] * b[index];
    normA += a[index] * a[index];
    normB += b[index] * b[index];
  }
  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function keywordSimilarity(query, text) {
  const queryTerms = tokenize(query);
  if (!queryTerms.length) return 0;
  const textTerms = new Set(tokenize(text));
  const matches = queryTerms.filter((term) => textTerms.has(term)).length;
  return matches / queryTerms.length;
}

function tokenize(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((term) => term.length > 2);
}
