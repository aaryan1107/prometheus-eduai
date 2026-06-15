import { Router } from "express";
import { answerScripts, reEvaluationRequests, adminInsights } from "../data/proposalData.js";
import { searchChunks } from "../services/sourceStore.js";

const router = Router();

router.get("/exam-vault", (_req, res) => {
  res.json({ scripts: answerScripts });
});

router.get("/re-evaluations", (_req, res) => {
  res.json({ requests: reEvaluationRequests });
});

router.get("/admin-insights", (_req, res) => {
  res.json({ insights: adminInsights });
});

router.post("/marking-assist", async (req, res) => {
  const { scriptId = "EV-2041", uploadedScript } = req.body || {};
  const uploadedText = uploadedScript?.text || "";
  const script = uploadedText.trim()
    ? buildUploadedScript(uploadedScript)
    : answerScripts.find((item) => item.id === scriptId) || answerScripts[0];
  const analysis = uploadedText.trim()
    ? analyzeUploadedScript(script, uploadedText)
    : analyzeStoredScript(script);
  const markschemeReferences = await findMarkschemeReferences(script, uploadedText);
  analysis.markschemeReferences = markschemeReferences;

  res.json({
    script,
    analysis,
    confidence: analysis.confidence,
    rubricFindings: analysis.rubricFindings,
    suggestedFeedback: analysis.suggestedFeedback
  });
});

async function findMarkschemeReferences(script, uploadedText = "") {
  try {
    const query = [
      script.subject,
      script.exam,
      uploadedText.slice(0, 600),
      "markscheme rubric marking scheme"
    ].filter(Boolean).join(" ");
    const results = await searchChunks(query, 8);
    return results
      .filter((item) => item.type === "markscheme" || /markscheme|marking scheme|rubric/i.test(`${item.title} ${item.chunkText}`))
      .slice(0, 3)
      .map((item) => ({
        title: item.title,
        snippet: item.snippet,
        score: item.score,
        metadata: item.metadata || {}
      }));
  } catch {
    return [];
  }
}

function buildUploadedScript(uploadedScript = {}) {
  const scriptType = uploadedScript.scriptType || "student_answer_script";
  return {
    id: `UP-${Date.now()}`,
    student: uploadedScript.student || "Uploaded Student",
    subject: uploadedScript.subject || "General",
    exam: uploadedScript.exam || uploadedScript.title || "Uploaded Answer Script",
    scriptType,
    uploadedAt: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
    status: "Uploaded for AI review",
    locked: false,
    originalMarks: uploadedScript.originalMarks || "Pending",
    aiSuggestedMarks: "Review",
    finalMarks: "Teacher decision",
    flag: scriptType === "checked_answer_script"
      ? "Checked answer script: Promi should review both student work and teacher annotations."
      : "Student answer script: Promi should identify where marks are lost and where credit may be gained.",
    audit: ["Locked copy reviewed", "AI marking support generated", "Teacher final decision required"]
  };
}

function analyzeStoredScript(script) {
  return {
    confidence: script.confidence || 0.91,
    rubricFindings: [
      "Method evidence and final answer accuracy should be checked separately.",
      "Award method credit where the student's process matches the markscheme, even if the final value slips.",
      "Look for error carried forward when later steps are valid from an earlier wrong value.",
      "Teacher final judgment is required before marks are confirmed."
    ],
    questionBreakdown: [
      { question: "Selected script", evidence: script.flag || "Review the flagged marking point.", recommendation: "Confirm against the official markscheme before changing marks." }
    ],
    markingRisks: ["Do not award marks for unsupported final answers.", "Check whether presentation hides otherwise valid method evidence."],
    nextTeacherActions: ["Open the original script.", "Compare each step with the markscheme.", "Record final marks and feedback."],
    suggestedFeedback: `Good attempt by ${script.student}. Check method evidence, final answer accuracy, and any error-carried-forward opportunities before confirming marks.`
  };
}

function analyzeUploadedScript(script, text = "") {
  const lower = text.toLowerCase();
  const hasWorking = /(therefore|because|=|step|working|method|so)/i.test(text);
  const hasUnits = /(cm|m\/s|kg|a\b|v\b|ohm|marks?|degrees?)/i.test(text);
  const hasFinalAnswer = /(answer|final|therefore|=)/i.test(text);
  const hasBlank = /(blank|not answered|left|skip|skipped)/i.test(text);
  const hasTeacherMarking = /(tick|cross|teacher|marks?|\/\s*\d+|awarded|deduct|comment|red ink|correction|remark)/i.test(text);
  const hasHandwritingRisk = /(unclear|illegible|hard to read|smudge|overwritten|crossed out)/i.test(text);
  const possibleQuestions = Math.max(1, (text.match(/\bq(uestion)?\.?\s*\d+/gi) || []).length);

  const rubricFindings = [
    hasWorking
      ? "Working evidence is visible, so method marks should be considered separately from the final answer."
      : "Working evidence is limited; ask the student to show method steps before awarding method credit.",
    hasFinalAnswer
      ? "A final answer appears to be present; verify that it follows from the shown method."
      : "A clear final answer is not obvious; mark presentation separately from concept understanding.",
    hasUnits
      ? "Units or labels appear in the script; check whether they are correct and consistently applied."
      : "Units or labels are not clearly visible; deduct only where the markscheme requires them.",
    hasBlank
      ? "One or more skipped responses may need no-response handling."
      : "No obvious skipped response was detected from the uploaded text.",
    hasTeacherMarking
      ? "Teacher marks or annotations appear in the upload; compare them against the student's visible method and the markscheme."
      : "No teacher annotations were clearly detected; treat this as an unchecked or lightly checked answer script unless the image shows otherwise.",
    hasHandwritingRisk
      ? "Handwriting or overwritten work may affect OCR; inspect the original image before changing marks."
      : "No explicit handwriting warning was detected, but original handwriting should still be visually checked."
  ];

  const questionBreakdown = Array.from({ length: possibleQuestions }).slice(0, 6).map((_, index) => ({
    question: `Q${index + 1}`,
    evidence: inferEvidence(lower, index),
    recommendation: "State where the student lost marks, where credit may be recovered, and whether teacher checking appears consistent with the markscheme."
  }));

  const markingRisks = [
    "OCR may miss handwriting, diagrams, crossed-out work, teacher ticks/crosses, and red-ink comments; inspect the original upload visually.",
    "Promi can give an independent marking opinion, but teacher confirmation is required before final marks change.",
    "If the student used an alternate method, compare subject validity, module notes, library markschemes, and general academic knowledge before rejecting it.",
    "If this is a checked answer sheet, verify whether the teacher deducted marks for the right reason and whether any method credit was missed."
  ];

  const nextTeacherActions = [
    "Review Promi's marks-lost and marks-gain suggestions beside the original answer sheet.",
    "Compare student working with the official markscheme and relevant Library material.",
    "Check teacher annotations, ticks, crosses, comments, and awarded marks for consistency.",
    "Record final teacher decision and feedback after human review."
  ];

  return {
    confidence: hasWorking ? 0.82 : 0.64,
    rubricFindings,
    questionBreakdown,
    markingRisks,
    nextTeacherActions,
    suggestedFeedback: `${script.student} appears to need targeted feedback on visible working, final-answer accuracy, and markscheme evidence. Promi's opinion should be compared with teacher annotations and the original handwritten script before final marks are confirmed.`
  };
}

function inferEvidence(lowerText, index) {
  if (lowerText.includes("diagram")) return "Diagram or labelled-work evidence may be present; inspect the original upload visually.";
  if (lowerText.includes("formula")) return "Formula use is mentioned; check substitution and final calculation.";
  if (lowerText.includes("because") || lowerText.includes("therefore")) return "Reasoning language is present; check whether the explanation supports the answer.";
  return index === 0
    ? "General answer text detected; inspect the exact method and final value."
    : "No distinct question evidence detected in text; use the original script for final judgment.";
}

router.post("/lock-script", (req, res) => {
  const {
    student = "New Student",
    subject = "Mathematics",
    exam = "Uploaded Assessment",
    extractedText = "",
    fileName = "",
    extractionMethod = "",
    scriptType = "student_answer_script"
  } = req.body || {};
  if (!String(extractedText || "").trim()) {
    return res.status(400).json({
      error: "Answer script required.",
      message: "Upload or paste the answered/checked answer script before locking it in Vault."
    });
  }
  const id = `EV-${Math.floor(3000 + Math.random() * 6000)}`;

  res.json({
    record: {
      id,
      student,
      subject,
      exam,
      uploadedAt: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      status: "Locked",
      locked: true,
      scriptType,
      fileName,
      extractionMethod,
      extractedTextPreview: extractedText ? extractedText.slice(0, 260) : "",
      audit: [
        fileName ? `Uploaded ${fileName}` : "Script uploaded",
        extractionMethod ? `${extractionMethod.toUpperCase()} text extraction recorded` : "Timestamp recorded",
        "Digital original locked"
      ]
    }
  });
});

export default router;
