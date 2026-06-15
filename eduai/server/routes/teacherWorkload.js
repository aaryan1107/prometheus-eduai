import express from "express";
import {
  getFlatAssignments,
  getTeacherWorkloadSummary,
  teacherWorkload,
  updateAssignmentStatus
} from "../data/teacherWorkload.js";

const router = express.Router();

router.get("/", (_req, res) => {
  res.json({
    teachers: teacherWorkload,
    assignments: getFlatAssignments()
  });
});

router.get("/summary", (_req, res) => {
  res.json({ summary: getTeacherWorkloadSummary() });
});

router.get("/teacher/:teacherId", (req, res) => {
  const teacher = teacherWorkload.find((item) => item.teacherId === req.params.teacherId);
  if (!teacher) return res.status(404).json({ error: "Teacher workload not found." });
  res.json({ teacher });
});

router.patch("/:assignmentId/status", (req, res) => {
  const allowedStatuses = ["Not Started", "In Progress", "Submitted", "AI Reviewed", "HOD Review Pending", "Finalized"];
  const status = String(req.body.status || "");

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ error: "Unsupported grading status." });
  }

  const assignment = updateAssignmentStatus(req.params.assignmentId, status);
  if (!assignment) return res.status(404).json({ error: "Assignment not found." });

  res.json({
    assignment,
    summary: getTeacherWorkloadSummary()
  });
});

export default router;
