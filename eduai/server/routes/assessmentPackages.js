import express from "express";
import {
  assessmentPackages,
  createStudentGroup,
  createAssessmentPackage,
  getEvaluationVault,
  recordEvaluationAudit,
  updateAssessmentGradingStatus,
  updateAssessmentUploadStatus,
  withReadiness
} from "../data/assessmentPackages.js";

const router = express.Router();
const allowedStatuses = ["Not Started", "In Progress", "Submitted", "AI Reviewed", "HOD Review Pending", "Finalized"];

router.get("/", (_req, res) => {
  res.json({ packages: assessmentPackages.map(withReadiness) });
});

router.get("/vault/audit", (_req, res) => {
  res.json(getEvaluationVault());
});

router.get("/:packageId", (req, res) => {
  const assessmentPackage = assessmentPackages.find((item) => item.packageId === req.params.packageId);
  if (!assessmentPackage) return res.status(404).json({ error: "Assessment package not found." });
  res.json({ package: withReadiness(assessmentPackage) });
});

router.post("/", (req, res) => {
  const assessmentPackage = createAssessmentPackage(req.body);
  res.status(201).json({ package: assessmentPackage });
});

router.patch("/:packageId/upload-status", (req, res) => {
  const part = String(req.body.part || "");
  const assessmentPackage = updateAssessmentUploadStatus(req.params.packageId, part, req.body);

  if (!assessmentPackage) {
    return res.status(400).json({ error: "Assessment package or upload part not found." });
  }

  const audit = recordEvaluationAudit({
    packageId: assessmentPackage.packageId,
    assessmentName: assessmentPackage.assessmentName,
    studentName: assessmentPackage.studentName,
    grade: assessmentPackage.grade,
    classSection: assessmentPackage.classSection,
    action: `${part} linked`,
    detail: `${req.body.fileName || "File"} linked by ${req.body.selectionSource || "upload"}.`,
    actor: assessmentPackage.assignedTeacher
  });

  res.json({ package: assessmentPackage, audit });
});

router.patch("/:packageId/grading-status", (req, res) => {
  const gradingStatus = String(req.body.gradingStatus || "");
  if (!allowedStatuses.includes(gradingStatus)) {
    return res.status(400).json({ error: "Unsupported grading status." });
  }

  const assessmentPackage = updateAssessmentGradingStatus(req.params.packageId, gradingStatus);
  if (!assessmentPackage) return res.status(404).json({ error: "Assessment package not found." });

  res.json({ package: assessmentPackage });
});

router.post("/vault/audit", (req, res) => {
  const audit = recordEvaluationAudit(req.body || {});
  res.status(201).json({ audit });
});

router.post("/groups", (req, res) => {
  const group = createStudentGroup(req.body || {});
  res.status(201).json({ group, vault: getEvaluationVault() });
});

export default router;
