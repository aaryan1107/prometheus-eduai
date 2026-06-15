export const users = [
  { id: "stu-1", name: "Aarav Mehta", role: "student", grade: "10", section: "A" },
  { id: "tea-1", name: "Ms. Rao", role: "teacher", grade: "10", section: "A" },
  { id: "hod-1", name: "Academic HOD", role: "admin", grade: "All", section: "All" }
];

export const subjects = [
  { id: "math-10", name: "Mathematics", grade: "10", color: "bg-blue-50" },
  { id: "physics-10", name: "Physics", grade: "10", color: "bg-emerald-50" },
  { id: "english-10", name: "English", grade: "10", color: "bg-violet-50" }
];

export const chapters = [
  { id: "probability", subjectId: "math-10", name: "Probability" },
  { id: "algebra", subjectId: "math-10", name: "Algebra" },
  { id: "electricity", subjectId: "physics-10", name: "Electricity" },
  { id: "reading", subjectId: "english-10", name: "Reading Skills" }
];

export const resources = [
  {
    id: "res-1",
    title: "Probability teacher notes",
    subject: "Mathematics",
    chapter: "Probability",
    uploadedBy: "Ms. Rao",
    type: "Notes",
    fileUrl: "#"
  },
  {
    id: "res-2",
    title: "Probability previous questions",
    subject: "Mathematics",
    chapter: "Probability",
    uploadedBy: "Ms. Rao",
    type: "Question Bank",
    fileUrl: "#"
  },
  {
    id: "res-ms-1",
    title: "MYP mathematics marking principles",
    subject: "Mathematics",
    chapter: "Assessment Skills",
    uploadedBy: "Academic Team",
    type: "Markscheme Guide",
    fileUrl: "#"
  },
  {
    id: "res-3",
    title: "Electricity formula sheet",
    subject: "Physics",
    chapter: "Electricity",
    uploadedBy: "Mr. Sen",
    type: "Formula Sheet",
    fileUrl: "#"
  },
  {
    id: "res-4",
    title: "Reading answer structure guide",
    subject: "English",
    chapter: "Reading Skills",
    uploadedBy: "Ms. Kapoor",
    type: "Guide",
    fileUrl: "#"
  }
];

export const mockTests = [
  {
    id: "math-probability-1",
    subject: "Mathematics",
    chapter: "Probability",
    grade: "10",
    durationMinutes: 10,
    questions: [
      {
        id: "q1",
        question: "A bag contains 2 red balls and 3 blue balls. What is the probability of selecting a blue ball?",
        options: ["2/5", "3/5", "1/2", "3/2"],
        correctAnswer: "3/5",
        concept: "Basic probability",
        solution: "There are 5 total balls and 3 blue balls, so probability = 3/5."
      },
      {
        id: "q2",
        question: "A fair coin is tossed once. What is the probability of getting heads?",
        options: ["1", "1/4", "1/2", "0"],
        correctAnswer: "1/2",
        concept: "Equally likely outcomes",
        solution: "A fair coin has two equally likely outcomes, and heads is one of them."
      },
      {
        id: "q3",
        question: "If P(E) = 0.35, what is P(not E)?",
        options: ["0.35", "0.65", "1.35", "0"],
        correctAnswer: "0.65",
        concept: "Complementary events",
        solution: "P(not E) = 1 - P(E) = 1 - 0.35 = 0.65."
      },
      {
        id: "q4",
        question: "A dice is rolled. What is the probability of getting an even number?",
        options: ["1/6", "1/3", "1/2", "2/3"],
        correctAnswer: "1/2",
        concept: "Favourable outcomes",
        solution: "Even numbers on a dice are 2, 4 and 6. That is 3 favourable outcomes out of 6."
      }
    ]
  }
];

export const mistakes = [
  {
    id: "m-1",
    studentId: "stu-1",
    subject: "Mathematics",
    chapter: "Probability",
    question: "Complement of an event",
    mistakeType: "Concept gap",
    feedback: "You mixed up event probability and complement probability.",
    nextStep: "Revise P(not E) = 1 - P(E), then try 3 similar questions."
  },
  {
    id: "m-2",
    studentId: "stu-1",
    subject: "Mathematics",
    chapter: "Algebra",
    question: "Linear equation simplification",
    mistakeType: "Calculation error",
    feedback: "The method was right, but one subtraction step slipped.",
    nextStep: "Do two slow accuracy drills before the next timed mock."
  },
  {
    id: "m-3",
    studentId: "stu-1",
    subject: "English",
    chapter: "Reading Skills",
    question: "Evidence-based answer",
    mistakeType: "Presentation issue",
    feedback: "The answer was close, but the evidence was not linked clearly.",
    nextStep: "Use point, evidence, explanation for the next answer."
  }
];

export const leaderboardPreview = [
  { name: "Aarav", label: "Most Improved", value: "+14%" },
  { name: "Mira", label: "Best Accuracy", value: "94%" },
  { name: "Kabir", label: "Consistency Streak", value: "6 days" }
];

export const arenaHighlights = [
  { name: "Aarav Mehta", badge: "Most Improved", subject: "Mathematics", change: "+14%", note: "Recovered complement probability mistakes" },
  { name: "Mira Rao", badge: "Best Accuracy", subject: "Physics", change: "94%", note: "Careful circuit-diagram answers" },
  { name: "Kabir Sen", badge: "Consistency Streak", subject: "English", change: "6 days", note: "Daily reading practice" },
  { name: "Diya Shah", badge: "Best Comeback", subject: "Mathematics", change: "+11 marks", note: "Retest after mistake notebook" }
];

export const topperStrategy = [
  { step: "Fast scan", detail: "Top scorer spent 90 seconds sorting direct, medium and long questions." },
  { step: "Easy marks first", detail: "Direct probability questions were completed before application questions." },
  { step: "Checkpoints", detail: "They checked denominators and complements before final answers." },
  { step: "Time saved", detail: "Less time on direct questions protected 6 minutes for the final application item." }
];

export const answerScripts = [
  {
    id: "EV-2041",
    student: "Aarav Mehta",
    subject: "Mathematics",
    exam: "Grade 10 Probability Mock",
    uploadedAt: "12 Jun 2026, 10:42 AM",
    status: "AI reviewed",
    locked: true,
    originalMarks: 7,
    aiSuggestedMarks: 8,
    finalMarks: 8,
    flag: "Method mark missed in Q3",
    audit: ["Script scanned", "Hash locked", "AI reviewed", "Teacher confirmed +1"]
  },
  {
    id: "EV-2042",
    student: "Mira Rao",
    subject: "Physics",
    exam: "Electricity Unit Test",
    uploadedAt: "11 Jun 2026, 1:18 PM",
    status: "Locked",
    locked: true,
    originalMarks: 18,
    aiSuggestedMarks: 18,
    finalMarks: 18,
    flag: "No change recommended",
    audit: ["Script scanned", "Hash locked", "Teacher confirmed"]
  },
  {
    id: "EV-2043",
    student: "Kabir Sen",
    subject: "English",
    exam: "Reading Skills",
    uploadedAt: "10 Jun 2026, 9:05 AM",
    status: "HOD flag",
    locked: true,
    originalMarks: 14,
    aiSuggestedMarks: 16,
    finalMarks: 15,
    flag: "Accepted alternate evidence",
    audit: ["Script scanned", "AI flagged alternate answer", "HOD review pending"]
  }
];

export const reEvaluationRequests = [
  {
    id: "REQ-91",
    student: "Aarav Mehta",
    exam: "Grade 10 Probability Mock",
    question: "Q3 Complement probability",
    reason: "Method mark missed",
    originalMarks: "1/2",
    aiSuggestion: "2/2",
    teacherDecision: "Approved +1",
    status: "Decision recorded"
  },
  {
    id: "REQ-92",
    student: "Diya Shah",
    exam: "Electricity Unit Test",
    question: "Q5 Circuit diagram",
    reason: "Label accepted in class notes",
    originalMarks: "2/4",
    aiSuggestion: "2/4",
    teacherDecision: "No change",
    status: "Teacher reply ready"
  },
  {
    id: "REQ-93",
    student: "Kabir Sen",
    exam: "Reading Skills",
    question: "Q2 Evidence answer",
    reason: "Alternate evidence used",
    originalMarks: "1/3",
    aiSuggestion: "2/3",
    teacherDecision: "HOD review",
    status: "Needs HOD"
  }
];

export const adminInsights = [
  { title: "Class 9 Probability", value: "70%", detail: "Students struggled with tree diagrams", action: "Schedule reteach block" },
  { title: "Marking Consistency", value: "92%", detail: "Rubric alignment across reviewed maths scripts", action: "Share best-practice note" },
  { title: "Re-evaluation Pattern", value: "14", detail: "Most requests are method-mark disputes", action: "Clarify markscheme examples" },
  { title: "Integrity Layer", value: "247", detail: "Scripts locked this month", action: "Review 2 open alerts" }
];
