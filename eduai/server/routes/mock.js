import { Router } from "express";
import { mockTests } from "../data/mockTests.js";
import { askOllama } from "../services/ollamaClient.js";
import { fallbackMockAnalysis } from "../services/fallbackPromi.js";
import { selectPromiModel } from "../services/modelRouter.js";
import { buildMockAnalysisPrompt } from "../prompts/promiPromptRouter.js";

const router = Router();

router.get("/tests", (_req, res) => {
  res.json({ tests: mockTests });
});

router.post("/analyze", async (req, res) => {
  const { studentAnswers = [], test, timeTaken = "Not recorded" } = req.body || {};
  const activeTest = test || mockTests[0];

  if (!activeTest?.questions?.length) {
    return res.status(400).json({ error: "A valid test is required." });
  }

  const answerMap = new Map(studentAnswers.map((item) => [item.questionId, item.answer]));
  const total = activeTest.questions.length;
  const score = activeTest.questions.reduce((count, question) => (
    answerMap.get(question.id) === question.correctAnswer ? count + 1 : count
  ), 0);
  const accuracy = `${Math.round((score / total) * 100)}%`;
  const wrongQuestions = activeTest.questions
    .filter((question) => answerMap.get(question.id) !== question.correctAnswer)
    .map((question) => ({ question, answer: answerMap.get(question.id) || "" }));

  if (wrongQuestions.length === 0) {
    return res.json({
      score,
      total,
      accuracy,
      timeTaken,
      mistakes: [],
      overallFeedback: "Excellent attempt. You got every question right. Try a slightly harder mock next."
    });
  }

  try {
    const prompt = buildMockAnalysisPrompt({
      test: activeTest,
      wrongQuestions,
      score,
      total,
      accuracy,
      timeTaken
    });
    const modelDecision = selectPromiModel({
      message: "Analyze this mock test attempt.",
      context: {
        role: "student",
        grade: activeTest.grade,
        subject: activeTest.subject,
        chapter: activeTest.chapter,
        mode: "mock-analysis"
      },
      format: prompt.format
    });

    const raw = await askOllama({
      message: "Analyze this mock test attempt.",
      context: {
        role: "student",
        grade: activeTest.grade,
        subject: activeTest.subject,
        chapter: activeTest.chapter,
        mode: "mock-analysis"
      },
      model: modelDecision.model,
      numPredict: modelDecision.numPredict,
      systemPrompt: prompt.systemPrompt,
      userPrompt: prompt.userPrompt,
      format: prompt.format
    });

    const parsed = parseJsonObject(raw);
    const mistakeAnalysis = Array.isArray(parsed.mistakeAnalysis) ? parsed.mistakeAnalysis : [];
    return res.json({
      score,
      total,
      accuracy,
      timeTaken,
      mistakes: mistakeAnalysis.map((mistake) => ({
        ...mistake,
        feedback: mistake.whatWentWrong || mistake.feedback || "Review this step carefully.",
        nextStep: mistake.nextStep || "Try one similar question."
      })),
      analysis: parsed,
      overallFeedback: parsed.summary || parsed.motivationMessage || "Good attempt. Review the missed concepts and try similar questions.",
      source: "ollama",
      model: modelDecision.model,
      modelMode: modelDecision.mode
    });
  } catch (error) {
    return res.json({
      ...fallbackMockAnalysis({ test: activeTest, wrongQuestions, score, total, accuracy, timeTaken }),
      source: "fallback",
      offlineReason: error.message
    });
  }
});

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
