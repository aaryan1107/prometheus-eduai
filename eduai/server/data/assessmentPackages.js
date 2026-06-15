export const assessmentPackages = [];

export const evaluationAudit = [];

export const studentGroups = [];

export function getAssessmentReadiness(assessmentPackage) {
  const requiredItems = [
    ["Question paper", assessmentPackage.questionPaper?.uploaded],
    ["Marking scheme", assessmentPackage.markingScheme?.uploaded],
    ["Student answer scripts", assessmentPackage.studentScripts?.uploaded]
  ];
  const missingItems = requiredItems.filter(([, uploaded]) => !uploaded).map(([label]) => label);

  return {
    isReady: missingItems.length === 0,
    missingItems,
    uploadedCount: requiredItems.length - missingItems.length,
    requiredCount: requiredItems.length
  };
}

export function withReadiness(assessmentPackage) {
  return {
    ...assessmentPackage,
    readiness: getAssessmentReadiness(assessmentPackage)
  };
}

export function updateAssessmentUploadStatus(packageId, part, payload = {}) {
  const assessmentPackage = assessmentPackages.find((item) => item.packageId === packageId);
  if (!assessmentPackage || !["questionPaper", "markingScheme", "studentScripts"].includes(part)) {
    return null;
  }

  assessmentPackage[part] = {
    ...assessmentPackage[part],
    uploaded: Boolean(payload.uploaded ?? true),
    fileName: payload.fileName || assessmentPackage[part].fileName || `${part}-uploaded.pdf`,
    uploadedAt: payload.uploadedAt || new Date().toISOString().slice(0, 10),
    selectionSource: payload.selectionSource || assessmentPackage[part].selectionSource || "upload",
    extractedText: payload.extractedText || assessmentPackage[part].extractedText || ""
  };

  if (part === "studentScripts") {
    assessmentPackage.studentScripts.count = Number(payload.count || assessmentPackage.studentScripts.count || 1);
  }

  return withReadiness(assessmentPackage);
}

export function updateAssessmentGradingStatus(packageId, gradingStatus) {
  const assessmentPackage = assessmentPackages.find((item) => item.packageId === packageId);
  if (!assessmentPackage) return null;
  assessmentPackage.gradingStatus = gradingStatus;
  return withReadiness(assessmentPackage);
}

export function createAssessmentPackage(payload = {}) {
  const packageId = `pkg-${Date.now()}`;
  const assessmentPackage = {
    packageId,
    assessmentName: payload.assessmentName || "Untitled Assessment",
    grade: payload.grade || "Grade 10",
    classSection: payload.classSection || "TBD",
    subject: payload.subject || "General",
    studentName: payload.studentName || "",
    assignedTeacher: payload.assignedTeacher || "Unassigned",
    microsoftOwner: payload.microsoftOwner || "",
    gradingStatus: "Not Started",
    questionPaper: { uploaded: false, fileName: "", uploadedAt: "" },
    markingScheme: { uploaded: false, fileName: "", uploadedAt: "" },
    studentScripts: { uploaded: false, fileName: "", count: 0, uploadedAt: "", extractedText: "", selectionSource: "" }
  };

  assessmentPackages.unshift(assessmentPackage);
  recordEvaluationAudit({
    packageId,
    assessmentName: assessmentPackage.assessmentName,
    studentName: assessmentPackage.studentName,
    grade: assessmentPackage.grade,
    classSection: assessmentPackage.classSection,
    action: "Package created",
    detail: `${assessmentPackage.assessmentName} created for ${assessmentPackage.studentName || "unassigned student"}.`,
    actor: assessmentPackage.assignedTeacher
  });
  return withReadiness(assessmentPackage);
}

export function recordEvaluationAudit(payload = {}) {
  const audit = {
    auditId: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    packageId: payload.packageId || "",
    assessmentName: payload.assessmentName || "",
    studentName: payload.studentName || "",
    grade: payload.grade || "",
    classSection: payload.classSection || "",
    action: payload.action || "Evaluation update",
    detail: payload.detail || "",
    actor: payload.actor || "Teacher",
    createdAt: new Date().toISOString()
  };
  evaluationAudit.unshift(audit);
  return audit;
}

export function createStudentGroup(payload = {}) {
  const group = {
    groupId: `group-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    studentName: payload.studentName || "",
    grade: payload.grade || "Grade 10",
    classSection: payload.classSection || "",
    subject: payload.subject || "General",
    assignedTeacher: payload.assignedTeacher || "Unassigned",
    createdAt: new Date().toISOString()
  };
  studentGroups.unshift(group);
  recordEvaluationAudit({
    studentName: group.studentName,
    grade: group.grade,
    classSection: group.classSection,
    action: "Student group created",
    detail: `${group.studentName || "Student"} mapped to ${group.grade} ${group.classSection || ""} for ${group.subject}.`,
    actor: group.assignedTeacher
  });
  return group;
}

export function getEvaluationVault() {
  return {
    audit: evaluationAudit,
    groups: studentGroups
  };
}
