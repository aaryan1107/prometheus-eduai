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
