import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import promiRoutes from "./routes/promi.js";
import mockRoutes from "./routes/mock.js";
import proposalRoutes from "./routes/proposal.js";
import sourceRoutes from "./routes/sources.js";
import fileRoutes from "./routes/files.js";
import teacherWorkloadRoutes from "./routes/teacherWorkload.js";
import assessmentPackageRoutes from "./routes/assessmentPackages.js";
import studentRoutes from "./routes/students.js";
import { getModelConfig } from "./services/modelRouter.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: clientOrigin }));
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "EduAI MVP API",
    ollamaModel: process.env.OLLAMA_NORMAL_MODEL || process.env.OLLAMA_MODEL || "gemma:2b",
    models: getModelConfig()
  });
});

app.use("/api/promi", promiRoutes);
app.use("/api/mock", mockRoutes);
app.use("/api/proposal", proposalRoutes);
app.use("/api/sources", sourceRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/teacher-workload", teacherWorkloadRoutes);
app.use("/api/assessment-packages", assessmentPackageRoutes);
app.use("/api/students", studentRoutes);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({
    error: "EduAI server error",
    message: error.message || "Something went wrong."
  });
});

app.listen(port, () => {
  console.log(`EduAI API running at http://localhost:${port}`);
});
