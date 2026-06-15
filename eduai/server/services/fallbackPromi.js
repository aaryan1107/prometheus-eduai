export function fallbackPromiReply(message = "", context = {}) {
  const lower = message.toLowerCase();
  const subject = context.subject || "General Study Help";
  const chapter = context.chapter || "General";
  const focus = subject === "General Study Help" || chapter === "General"
    ? subject
    : `${subject} - ${chapter}`;
  const sourceNote = "I don't have verified source material for this topic yet, but I can give a general study suggestion.";

  if (lower.includes("revision") || lower.includes("plan")) {
    return `Promi is offline right now. ${sourceNote} For ${focus}: review the core ideas for 10 minutes, solve 5 short questions, and note any repeated mistakes. You are close; let's strengthen this step by step.`;
  }

  if (lower.includes("mistake") || lower.includes("wrong")) {
    return `Promi is offline right now. ${sourceNote} For ${focus}: this may be a concept gap, interpretation issue, or presentation slip. Find the exact step where your thinking changed, then try one similar question.`;
  }

  if (lower.includes("practice") || lower.includes("question")) {
    return `Promi is offline right now. ${sourceNote} For ${focus}: create one short question, solve it slowly, and mark whether the issue was concept, recall, interpretation, timing, or presentation.`;
  }

  return `Promi is offline right now. ${sourceNote} For ${focus}: review the relevant notes, identify one unclear point, and try one similar question. Nice try; you are building the right habit.`;
}

export function fallbackChatResponse(message = "", context = {}) {
  return {
    reply: fallbackPromiReply(message, context),
    suggestedActions: [
      "Take a similar question",
      "Revise this concept",
      "Start a mini mock test"
    ],
    mood: "encouraging"
  };
}

export function fallbackMockAnalysis({ test, wrongQuestions, score, total, accuracy, timeTaken }) {
  const mistakes = wrongQuestions.map(({ question, answer }) => ({
    questionId: question.id,
    mistakeType: classifyMistake(question, answer),
    whatWentWrong: friendlyFeedback(question, answer),
    correctApproach: `${question.solution} In written work, Promi would look for the method marks and then apply answer marks or error-carried-forward where appropriate.`,
    confidenceMessage: "This is fixable with focused practice.",
    nextStep: `Revise ${question.concept}, then try 3 similar questions before your next timed attempt.`,
    practiceSuggestion: `Do a short ${test.chapter} mini set and write your working clearly so method credit is visible.`,
    feedback: friendlyFeedback(question, answer)
  }));

  return {
    score,
    total,
    accuracy,
    timeTaken,
    mistakes,
    analysis: {
      summary: mistakes.length
        ? `You got ${score}/${total}. The main improvement area is ${test.chapter}.`
        : `You got ${score}/${total}. Great work keeping your method steady.`,
      scoreAnalysis: {
        score: `${score}/${total}`,
        accuracy,
        strongAreas: findStrongAreas(test, wrongQuestions),
        weakAreas: mistakes.map((mistake) => mistake.mistakeType)
      },
      mistakeAnalysis: mistakes,
      revisionPlan: [
        `Revise ${test.chapter} notes for 10 minutes.`,
        "Retry the missed questions slowly and show each method step.",
        "Take a mini mock after one practice set."
      ],
      motivationMessage: mistakes.length
        ? "Good attempt. This is fixable with focused practice."
        : "Excellent attempt. Try a slightly harder test next."
    },
    overallFeedback: mistakes.length
      ? `Good attempt. Focus on ${mistakes[0].mistakeType.toLowerCase()} patterns in ${test.chapter}, then retry a short practice set.`
      : "Excellent attempt. Keep the habit going by trying a slightly harder question next."
  };
}

function classifyMistake(question, answer) {
  if (!answer) return "Time management issue";
  if (question.concept.toLowerCase().includes("complement")) return "Concept gap";
  if (question.solution.toLowerCase().includes("total")) return "Question interpretation error";
  return "Silly mistake";
}

function friendlyFeedback(question, answer) {
  if (!answer) {
    return "You left this unanswered. That may be a timing issue rather than a concept issue.";
  }

  return `You chose ${answer}. The correct idea is: ${question.solution}`;
}

function findStrongAreas(test, wrongQuestions) {
  const wrongIds = new Set(wrongQuestions.map(({ question }) => question.id));
  return test.questions
    .filter((question) => !wrongIds.has(question.id))
    .map((question) => question.concept)
    .slice(0, 3);
}
