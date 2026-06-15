import { Router } from "express";
import { clearStudents, getStudentRoster, importStudents } from "../services/studentStore.js";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    res.json(await getStudentRoster());
  } catch (error) {
    next(error);
  }
});

router.post("/import", async (req, res, next) => {
  try {
    const { students = [], sourceFile = "", academicSession = "", sessionEndDate = "" } = req.body || {};
    const result = await importStudents(students, { sourceFile, academicSession, sessionEndDate });
    res.status(201).json({ ok: true, ...result });
  } catch (error) {
    next(error);
  }
});

router.delete("/", async (_req, res, next) => {
  try {
    res.json({ ok: true, ...(await clearStudents()) });
  } catch (error) {
    next(error);
  }
});

export default router;
