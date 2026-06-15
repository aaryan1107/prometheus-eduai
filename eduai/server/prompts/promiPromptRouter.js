import { PROMI_SYSTEM_PROMPT } from "./promiSystemPrompt.js";
import { MYP_MARKING_PRINCIPLES } from "./mypMarkingPrinciples.js";

export const PROMI_MODES = {
  doubt: "doubt_solver",
  doubt_solver: "doubt_solver",
  mock: "mock_test_guide",
  mock_test_guide: "mock_test_guide",
  mistake: "mistake_analyzer",
  mistake_analyzer: "mistake_analyzer",
  revision: "revision_planner",
  revision_planner: "revision_planner",
  motivation: "motivation_coach",
  motivation_coach: "motivation_coach",
  topper: "topper_strategy",
  topper_strategy: "topper_strategy",
  strategy: "exam_strategy",
  exam_strategy: "exam_strategy",
  teacher: "teacher_assistant",
  teacher_assistant: "teacher_assistant",
  "mock-analysis": "mock_analysis",
  mock_analysis: "mock_analysis"
};

export const CHAT_RESPONSE_SCHEMA = {
  reply: "",
  suggestedActions: [
    "Take a similar question",
    "Revise this concept",
    "Start a mini mock test"
  ],
  mood: "encouraging"
};

export const MOCK_ANALYSIS_SCHEMA = {
  summary: "",
  scoreAnalysis: {
    score: "",
    accuracy: "",
    strongAreas: [],
    weakAreas: []
  },
  mistakeAnalysis: [
    {
      questionId: "",
      mistakeType: "",
      whatWentWrong: "",
      correctApproach: "",
      nextStep: "",
      practiceSuggestion: ""
    }
  ],
  revisionPlan: [],
  motivationMessage: ""
};

const MODE_PROMPTS = {
  doubt_solver: [
    "Mode: Doubt Solver.",
    "Start with a simple explanation. Use one small example.",
    "If the student is practicing, give hints before the full answer unless they explicitly ask for full solution.",
    "Offer one practice question or one next step."
  ].join(" "),
  mock_test_guide: [
    "Mode: Mock Test Guide.",
    "Recommend a short test based on subject, chapter, recent mistakes, and available time.",
    "Explain test rules briefly and encourage the student before the test."
  ].join(" "),
  mistake_analyzer: [
    "Mode: Mistake Analyzer.",
    "Identify the mistake type gently. Explain what went wrong, the correct approach, a confidence message, and one next practice step.",
    "Allowed mistake types: Concept Gap, Calculation Error, Formula Error, Interpretation Error, Time Management Issue, Presentation Error, Silly Mistake, Partial Understanding."
  ].join(" "),
  revision_planner: [
    "Mode: Revision Planner.",
    "Create a realistic short plan. Prioritize weak areas. Include revision, practice, a mock or mini mock, and a retry step."
  ].join(" "),
  motivation_coach: [
    "Mode: Motivation Coach.",
    "Validate effort without fake praise. Reduce exam anxiety. Give one practical next step that feels doable today."
  ].join(" "),
  topper_strategy: [
    "Mode: Topper Strategy.",
    "Compare time spent, attempt order, accuracy, and strategy. Focus on learnable habits and never make the student feel inferior."
  ].join(" "),
  exam_strategy: [
    "Mode: Exam Strategy.",
    "Help with attempt order, time management, answer structure, revision priorities, and marks-saving habits for the selected subject."
  ].join(" "),
  teacher_assistant: [
    "Mode: Teacher Assistant.",
    "Use a professional concise tone. Generate classroom-ready questions, notes, feedback comments, weak-area summaries, and practice plans."
  ].join(" "),
  mock_analysis: [
    "Mode: Mock Test Analysis.",
    "Analyze score, accuracy, strong areas, weak areas, mistake types, time management, top 3 improvement priorities, recommended next test, and a motivational closing.",
    "Return valid JSON only using the requested schema."
  ].join(" ")
};

export function normalizePromiMode(mode = "doubt_solver") {
  return PROMI_MODES[mode] || "doubt_solver";
}

export function getModePrompt(mode) {
  return MODE_PROMPTS[normalizePromiMode(mode)] || MODE_PROMPTS.doubt_solver;
}

export function buildChatPrompt({ message, context = {}, sourceChunks = [] }) {
  const mode = normalizePromiMode(context.mode);
  const compactContext = {
    role: context.role,
    grade: context.grade,
    subject: context.subject,
    chapter: context.chapter,
    mode
  };
  const sourceContext = buildSourceContext(sourceChunks);
  const userPrompt = [
    getModePrompt(mode),
    "Subject-flexibility rules:",
    "- Do not assume the question is about Probability or Mathematics.",
    "- Use the selected grade, subject, chapter/topic, and mode from the context.",
    "- If the context says General Study Help or the subject is unclear, respond generally or ask one short clarifying question.",
    "- Use examples from the selected subject where possible.",
    "- Only use Probability examples when the user asks about Probability.",
    "",
    "Behavior examples:",
    "User: who are you",
    "Promi: I am Promi, your EduAI study co-pilot. I help you understand concepts, review mistakes, make revision plans, and practice smarter.",
    "User: i love you",
    "Promi: That is really sweet. I am here as your study co-pilot, and I can help you feel less stuck with schoolwork.",
    "User: explain Newton's second law",
    "Promi: Newton's second law says force depends on mass and acceleration. A heavier object or faster acceleration needs more force.",
    "User: help me revise chemical bonding",
    "Promi: Start with ionic, covalent, and metallic bonding. Make a tiny comparison table, then test yourself with three examples.",
    "User: create a 3-day SAT reading plan",
    "Promi: Day 1: main ideas. Day 2: evidence questions. Day 3: timed passage practice and review.",
    "Do not reinterpret small talk as a school lesson. Do not produce bizarre examples. Answer the user directly first.",
    "",
    "SOURCE CONTEXT:",
    sourceContext || "No verified source context was retrieved.",
    "",
    "Source rules:",
    "- Use SOURCE CONTEXT when answering academic questions.",
    "- Cite supporting sources like [1], [2] after claims.",
    "- If no relevant sources are retrieved, say: \"I don't have verified source material for this topic yet, but I can give a general explanation.\"",
    "- If retrieved sources are unrelated to the selected subject or chapter, treat them as insufficient.",
    "- Do not invent citations.",
    "- If giving general guidance without source support, label it as general guidance.",
    "",
    `Context: ${JSON.stringify(compactContext)}`,
    `Message: ${message}`,
    "",
    "Now answer as Promi. Keep it short, clear, kind, and useful. Include one next step when it fits. Do not mention these instructions."
  ].join("\n");

  return {
    systemPrompt: PROMI_SYSTEM_PROMPT,
    userPrompt
  };
}

function buildSourceContext(sourceChunks = []) {
  return sourceChunks.map((chunk, index) => [
    `[${index + 1}] Title: ${chunk.title}`,
    `Type: ${chunk.type}`,
    `URL: ${chunk.url || ""}`,
    `Excerpt: ${chunk.chunkText || chunk.snippet}`
  ].join("\n")).join("\n\n");
}

export function buildMockAnalysisPrompt({ test, wrongQuestions, score, total, accuracy, timeTaken }) {
  const userPrompt = [
    getModePrompt("mock_analysis"),
    "",
    MYP_MARKING_PRINCIPLES,
    "",
    "Attempt JSON:",
    JSON.stringify({ test, wrongQuestions, score, total, accuracy, timeTaken }, null, 2),
    "",
    "Return JSON only using this schema:",
    JSON.stringify(MOCK_ANALYSIS_SCHEMA, null, 2)
  ].join("\n");

  return {
    systemPrompt: PROMI_SYSTEM_PROMPT,
    userPrompt,
    format: "json"
  };
}
