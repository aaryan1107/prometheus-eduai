import { Router } from "express";
import { askOllama } from "../services/ollamaClient.js";
import { fallbackChatResponse } from "../services/fallbackPromi.js";
import { selectPromiModel } from "../services/modelRouter.js";
import { buildCitationPayload, retrieveRelevantSources } from "../services/ragService.js";
import { buildChatPrompt } from "../prompts/promiPromptRouter.js";

const router = Router();

router.post("/chat", async (req, res) => {
  const { message, context = {} } = req.body || {};

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "message is required" });
  }

  const quickReply = getQuickReply(message, context);
  if (quickReply) {
    return res.json({
      ...quickReply,
      source: "instant",
      citations: [],
      grounding: {
        usedSources: false,
        sourceCount: 0
      }
    });
  }

  const sourceChunks = await retrieveRelevantSources(message, context).catch(() => []);
  const citations = buildCitationPayload(sourceChunks);
  let modelDecision = null;

  try {
    const prompt = buildChatPrompt({ message, context, sourceChunks });
    modelDecision = selectPromiModel({ message, context, format: prompt.format });
    let raw = await askOllama({
      message,
      context,
      model: modelDecision.model,
      numPredict: modelDecision.numPredict,
      systemPrompt: prompt.systemPrompt,
      userPrompt: prompt.userPrompt,
      format: prompt.format
    });
    if (needsPromiRetry(message, raw)) {
      raw = await askOllama({
        message,
        context,
        model: process.env.OLLAMA_NORMAL_MODEL || process.env.OLLAMA_MODEL || modelDecision.model,
        numPredict: 180,
        systemPrompt: prompt.systemPrompt,
        userPrompt: [
          prompt.userPrompt,
          "",
          "Your previous answer misunderstood the user. Answer directly as Promi. No grammar lesson, no animal example, no philosophical identity question."
        ].join("\n"),
        format: prompt.format
      });
    }
    const parsed = parseJsonObject(raw);
    const reply = cleanPromiReply(parsed.reply || raw, citations);
    res.json({
      reply,
      suggestedActions: Array.isArray(parsed.suggestedActions) && parsed.suggestedActions.length
        ? parsed.suggestedActions
        : getDefaultActions(context.mode),
      mood: parsed.mood || "encouraging",
      source: "ollama",
      model: modelDecision.model,
      modelMode: modelDecision.mode,
      citations,
      grounding: {
        usedSources: citations.length > 0,
        sourceCount: citations.length
      }
    });
  } catch (error) {
    if (sourceChunks.length > 0) {
      return res.json({
        reply: buildSourceGroundedReply(message, context, sourceChunks),
        suggestedActions: [
          "Ask for an example",
          "Try one similar question",
          "Review the cited note"
        ],
        mood: "steady",
        source: "source-grounded",
        model: modelDecision?.model,
        modelMode: modelDecision?.mode,
        citations,
        grounding: {
          usedSources: true,
          sourceCount: citations.length
        }
      });
    }

    res.json({
      ...fallbackChatResponse(message, context),
      source: "fallback",
      offlineReason: error.message,
      citations,
      grounding: {
        usedSources: citations.length > 0,
        sourceCount: citations.length
      }
    });
  }
});

function cleanPromiReply(reply = "", citations = []) {
  let clean = String(reply || "")
    .replace(/^sure,?\s+here\s+(is|are|'s)\s+(a|the)?\s*(response|answer)(\s+to\s+the\s+user'?s?\s+question)?\s*:\s*/i, "")
    .replace(/^here\s+(is|are|'s)\s+(a|the)?\s*(response|answer)\s*:\s*/i, "")
    .trim();

  if (citations.length > 0 && !/\[\d+\]/.test(clean)) {
    clean = `${clean} [1]`;
  }

  return clean;
}

function getDefaultActions(mode = "") {
  if (String(mode).includes("mistake")) {
    return ["Identify the error", "Retry one similar question", "Save this mistake"];
  }
  if (String(mode).includes("revision") || String(mode).includes("plan")) {
    return ["Make a 10-minute plan", "Revise weak notes", "Start a mini mock"];
  }
  return ["Ask for an example", "Try one practice question", "Review the cited note"];
}

function buildSourceGroundedReply(message = "", context = {}, sourceChunks = []) {
  const firstChunk = sourceChunks[0];
  const subject = context.subject || "this topic";
  const chapter = context.chapter || subject;
  const excerpt = String(firstChunk.chunkText || firstChunk.snippet || "")
    .replace(/\s+/g, " ")
    .trim();
  const compactExcerpt = excerpt.length > 360 ? `${excerpt.slice(0, 357).trim()}...` : excerpt;

  if (!compactExcerpt) {
    return `I found a trusted source for ${chapter}, but it does not contain enough readable text to answer confidently yet. Add a clearer source or ask me to search a narrower concept.`;
  }

  return [
    `From the trusted ${firstChunk.type} I found: ${compactExcerpt} [1]`,
    "",
    `So, for your question "${message}", use the source rule first and then try one similar ${subject} question to lock it in.`
  ].join("\n");
}

function needsPromiRetry(message = "", raw = "") {
  const prompt = message.toLowerCase();
  const reply = raw.toLowerCase();
  const isIdentityAsk = prompt.includes("who are you") || prompt.includes("what are you") || prompt.includes("your name");
  return isIdentityAsk && (reply.includes("what makes you a dog") || reply.includes("imagine you are a dog") || reply.includes("identity of someone"));
}

function getQuickReply(message = "", context = {}) {
  const text = message.trim().toLowerCase();
  const compact = text.replace(/[!?.\s]/g, "");
  const firstName = context.name || "there";

  if (["hi", "hii", "hello", "hey", "yo", "sup", "namaste"].includes(compact)) {
    return {
      reply: `Hi ${firstName}! I am Promi. Tell me the topic, question, or mistake you want to work on.`,
      suggestedActions: [
        "Explain a concept",
        "Analyze a mistake",
        "Make a mini plan"
      ],
      mood: "friendly"
    };
  }

  if (["thanks", "thankyou", "ty", "ok", "okay"].includes(compact)) {
    return {
      reply: "Anytime. Send me the next question when you are ready.",
      suggestedActions: [
        "Try one practice question",
        "Review mistakes",
        "Start a mini mock"
      ],
      mood: "encouraging"
    };
  }

  return null;
}

function parseJsonObject(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return {};
    try {
      return JSON.parse(match[0]);
    } catch {
      return {};
    }
  }
}

export default router;
