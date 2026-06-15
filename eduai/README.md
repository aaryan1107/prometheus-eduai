# EduAI MVP

EduAI is an independent school-focused academic improvement platform. This MVP demonstrates the core learning loop:

- Students continue learning from a Study Library.
- Students take short mock tests.
- EduAI analyzes mistakes and gives friendly next steps.
- Promi Bot acts as a local AI study companion through Ollama.
- Promi can retrieve teacher-approved source chunks and cite them in answers.
- Teachers can see upload and mock-test creation placeholders.
- Admin/HOD users can preview class analytics and weak chapters.

Promi Bot is intentionally supportive and non-judgmental. It should help students improve without making them feel bad.

## Features

- Role-based mock entry points: Student, Teacher, Admin/HOD
- Student dashboard
- Study Library with subjects, chapters and resources
- Mock Test page with multiple choice sample questions
- Multi-subject mock catalog with filters for grade, subject, chapter and test type
- Mock Test Result page with score, accuracy, review and mistake classification
- Mistake Notebook
- Promi Bot chat page
- Express API for Promi chat
- Express API for mock analysis
- Ollama integration with fallback logic when Ollama is offline
- Tailwind CSS frontend
- Promi behavior handbook with mode prompts, rubrics, schemas, safety templates and examples
- MYP-style marking principles for method marks, partial credit and error carried forward
- Source-grounded RAG flow using a local JSON store, chunking, Ollama embeddings, selected subject/chapter context and citations

Advanced answer-script evaluation, ExamVault, re-evaluation workflows and production authentication are intentionally left out of this MVP.

## Tech Stack

- Frontend: React + Vite
- Styling: Tailwind CSS
- Backend: Node.js + Express
- Local AI: Ollama
- Data: JSON/sample in-memory data for MVP
- Authentication: role-based mock navigation

## Project Structure

```text
eduai/
  client/
    src/
      components/
      pages/
      data/
      utils/
  server/
    routes/
    services/
    prompts/
    data/
    server.js
  .env.example
  README.md
```

## Install Dependencies

From the `eduai` folder:

```bash
npm run install:all
```

Or install each part manually:

```bash
npm install
npm --prefix client install
npm --prefix server install
```

## Configure Environment

Copy `.env.example` to `.env` inside the `eduai` folder:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Example:

```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gemma:2b
OLLAMA_NORMAL_MODEL=gemma:2b
OLLAMA_FAST_MODEL=gemma3:1b
OLLAMA_EMBED_MODEL=nomic-embed-text
OLLAMA_TIMEOUT_MS=90000
OLLAMA_NUM_PREDICT=180
OLLAMA_NORMAL_NUM_PREDICT=220
OLLAMA_FAST_NUM_PREDICT=120
OLLAMA_TEMPERATURE=0.35
OLLAMA_KEEP_ALIVE=30m
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
```

## Start Ollama

Install and run Ollama locally, then pull a model:

```bash
ollama pull gemma:2b
ollama pull gemma3:1b
ollama pull nomic-embed-text
ollama serve
```

Promi uses two chat modes:

- Normal mode: `gemma:2b`
- Fast mode: `gemma3:1b`
- Embeddings: `nomic-embed-text`

This is not fine-tuning. Promi is source-grounded through retrieval augmented generation: trusted material is stored, chunked, embedded, retrieved for each question, and shown as citations in the chat UI.

## Run Backend

```bash
npm --prefix server run dev
```

Backend runs at:

```text
http://localhost:4000
```

Useful health check:

```text
http://localhost:4000/api/health
```

## Run Frontend

```bash
npm --prefix client run dev
```

Frontend runs at:

```text
http://localhost:5173
```

## Run Both Together

```bash
npm run dev
```

## Promi Behavior Design

Promi's full behavior spec lives at:

```text
server/prompts/promiBehavior.md
```

Runtime prompt templates and schemas live at:

```text
server/prompts/promiPromptRouter.js
```

The backend routes use this prompt router for chat and mock-test analysis, so the documented behavior is also reflected in the local Ollama calls.

MYP-style marking principles live at:

```text
server/prompts/mypMarkingPrinciples.js
```

The local PDF markscheme remains a source reference in the project workspace; the app uses paraphrased marking principles and does not publish the confidential PDF.

## API Routes

### Promi Chat

```http
POST /api/promi/chat
```

Request:

```json
{
  "message": "Explain chemical bonding in simple words",
  "context": {
    "role": "student",
    "grade": "Grade 10",
    "subject": "Chemistry",
    "chapter": "Chemical Bonding",
    "recentMistakes": [],
    "mode": "doubt"
  }
}
```

More Promi examples:

```json
{
  "message": "Explain Newton's second law with an example",
  "context": {
    "role": "student",
    "grade": "Grade 9",
    "subject": "Physics",
    "chapter": "Motion",
    "mode": "doubt"
  }
}
```

```json
{
  "message": "How can I write better answers in literature?",
  "context": {
    "role": "student",
    "grade": "Grade 10",
    "subject": "English",
    "chapter": "Writing Skills",
    "mode": "exam_strategy"
  }
}
```

```json
{
  "message": "Create a 3-day SAT reading revision plan",
  "context": {
    "role": "student",
    "grade": "SAT / External Exam",
    "subject": "SAT Preparation",
    "chapter": "Reading",
    "mode": "revision_planner"
  }
}
```

Response:

```json
{
  "reply": "Promi's answer here",
  "source": "ollama",
  "model": "gemma:2b",
  "modelMode": "normal",
  "citations": [
    {
      "id": 1,
      "title": "Chemical Bonding Notes",
      "type": "teacher_note",
      "snippet": "Ionic bonding involves electron transfer..."
    }
  ],
  "grounding": {
    "usedSources": true,
    "sourceCount": 1
  }
}
```

If Ollama is not running, the server returns a friendly fallback response with `source: "fallback"`.

### Source Library

```http
POST /api/sources/add-text
```

```json
{
  "title": "Chemical Bonding Notes",
  "type": "teacher_note",
  "text": "Ionic bonding happens when electrons transfer from one atom to another. Covalent bonding happens when atoms share electron pairs.",
  "uploadedBy": "teacher",
  "approved": true
}
```

```http
POST /api/sources/add-url
```

```json
{
  "url": "https://example.edu/cell-structure-notes",
  "title": "Cell Structure Reference",
  "type": "website"
}
```

```http
GET /api/sources
POST /api/sources/search
```

Search request:

```json
{
  "query": "What is chemical bonding?",
  "topK": 5
}
```

Teacher and admin users can manage sources in the app:

```text
http://localhost:5173/sources
http://localhost:5173/admin/sources
```

### Mock Analysis

```http
POST /api/mock/analyze
```

Request:

```json
{
  "studentAnswers": [
    { "questionId": "q1", "answer": "3/5" }
  ],
  "test": {},
  "timeTaken": "7 min 42 sec"
}
```

Response:

```json
{
  "score": 7,
  "total": 10,
  "accuracy": "70%",
  "mistakes": [
    {
      "questionId": "q3",
      "mistakeType": "Concept gap",
      "feedback": "You mixed up ionic bonding and covalent bonding.",
      "nextStep": "Revise the comparison table, then try 3 similar questions."
    }
  ],
  "overallFeedback": "Good attempt. Focus on the missed concept, then retry a short practice set."
}
```

## Troubleshooting

### Ollama Not Running

Start Ollama:

```bash
ollama serve
```

The app will still work with fallback responses if Ollama is offline.

### Model Not Found

Pull the configured model:

```bash
ollama pull gemma:2b
ollama pull gemma3:1b
```

If source embeddings are missing:

```bash
ollama pull nomic-embed-text
```

When the embedding model is unavailable, source search falls back to keyword matching so the app still works.

### CORS Issue

Make sure the frontend URL matches `CLIENT_ORIGIN` in `.env`:

```env
CLIENT_ORIGIN=http://localhost:5173
```

### Port Conflict

Change backend port:

```env
PORT=4001
```

Then update the Vite proxy in `client/vite.config.js`:

```js
proxy: {
  "/api": "http://localhost:4001"
}
```

## MVP Notes

This prototype uses sample JSON data and local AI only. It is built to be extended into SQLite, Supabase, file uploads, production authentication, AI marking, ExamVault and re-evaluation later.
