import { Router } from "express";
import { addSource, deleteSource, listSources, searchChunks, updateSourceComment } from "../services/sourceStore.js";
import { fetchUrlSource } from "../services/urlSourceFetcher.js";

const router = Router();

router.post("/add-text", async (req, res, next) => {
  try {
    const {
      title,
      type = "teacher_note",
      text,
      url = "",
      uploadedBy = "teacher",
      approved = true,
      studentName = "",
      grade = "",
      subject = "",
      chapter = "",
      fileName = "",
      questionPaperFileName = "",
      questionPaperText = "",
      comment = ""
    } = req.body || {};
    const result = await addSource({ title, type, text, url, uploadedBy, approved, studentName, grade, subject, chapter, fileName, questionPaperFileName, questionPaperText, comment });
    res.json({
      ok: true,
      source: {
        ...result.source,
        chunkCount: result.chunksAdded
      },
      sourceId: result.source.sourceId,
      chunksAdded: result.chunksAdded
    });
  } catch (error) {
    next(error);
  }
});

router.post("/add-url", async (req, res, next) => {
  try {
    const {
      url,
      title = "",
      type = "website",
      uploadedBy = "teacher",
      approved = true,
      studentName = "",
      grade = "",
      subject = "",
      chapter = "",
      comment = ""
    } = req.body || {};
    const fetched = await fetchUrlSource({ url, title, type });
    const result = await addSource({
      ...fetched,
      uploadedBy,
      approved,
      studentName,
      grade,
      subject,
      chapter,
      comment
    });
    res.json({
      ok: true,
      source: {
        ...result.source,
        chunkCount: result.chunksAdded
      },
      sourceId: result.source.sourceId,
      chunksAdded: result.chunksAdded
    });
  } catch (error) {
    next(error);
  }
});

router.get("/", async (_req, res, next) => {
  try {
    res.json({ sources: await listSources() });
  } catch (error) {
    next(error);
  }
});

router.post("/search", async (req, res, next) => {
  try {
    const { query = "", topK = 5 } = req.body || {};
    const results = await searchChunks(query, topK);
    res.json({ results });
  } catch (error) {
    next(error);
  }
});

router.patch("/:sourceId/comment", async (req, res, next) => {
  try {
    const source = await updateSourceComment(req.params.sourceId, req.body?.comment || "");
    if (!source) return res.status(404).json({ error: "Source not found." });
    res.json({ ok: true, source });
  } catch (error) {
    next(error);
  }
});

router.delete("/:sourceId", async (req, res, next) => {
  try {
    const source = await deleteSource(req.params.sourceId);
    if (!source) return res.status(404).json({ error: "Source not found." });
    res.json({ ok: true, sourceId: req.params.sourceId });
  } catch (error) {
    next(error);
  }
});

export default router;
