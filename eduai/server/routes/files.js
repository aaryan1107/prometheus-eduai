import { Router } from "express";
import multer from "multer";
import { PDFParse } from "pdf-parse";
import Tesseract from "tesseract.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 12 * 1024 * 1024
  }
});

router.post("/extract", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "file is required" });
    }

    const extracted = await extractFileText(req.file);
    res.json({
      ok: true,
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      extractionMethod: extracted.method,
      text: extracted.text,
      warning: extracted.warning || ""
    });
  } catch (error) {
    next(error);
  }
});

async function extractFileText(file) {
  const mimeType = file.mimetype || "";
  const fileName = file.originalname || "upload";

  if (mimeType === "application/pdf" || /\.pdf$/i.test(fileName)) {
    const parser = new PDFParse({ data: file.buffer });
    try {
      const parsed = await parser.getText();
      const text = normalizeText(parsed.text);
      if (text) return { method: "pdf", text };

      const screenshotResult = await parser.getScreenshot({
        imageBuffer: true,
        desiredWidth: 1600
      });
      const ocrText = [];
      for (const page of screenshotResult.pages.slice(0, 5)) {
        if (!page.data?.length) continue;
        const result = await Tesseract.recognize(Buffer.from(page.data), "eng");
        const pageText = normalizeText(result.data?.text || "");
        if (pageText) ocrText.push(pageText);
      }
      const scannedText = normalizeText(ocrText.join("\n\n"));
      return {
        method: scannedText ? "pdf-ocr" : "pdf",
        text: scannedText,
        warning: scannedText ? "" : "PDF was readable but no selectable or OCR text was found."
      };
    } finally {
      await parser.destroy();
    }
  }

  if (mimeType.startsWith("image/") || /\.(png|jpe?g|webp|bmp|tiff?)$/i.test(fileName)) {
    const result = await Tesseract.recognize(file.buffer, "eng");
    const text = normalizeText(result.data?.text || "");
    return {
      method: "ocr",
      text,
      warning: text ? "" : "OCR could not read useful text from this image."
    };
  }

  if (mimeType.startsWith("text/") || /\.(txt|md|csv|json)$/i.test(fileName)) {
    return {
      method: "text",
      text: normalizeText(file.buffer.toString("utf8"))
    };
  }

  throw new Error("Unsupported file type. Upload a PDF, image, or readable document file.");
}

function normalizeText(value = "") {
  return String(value)
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export default router;
