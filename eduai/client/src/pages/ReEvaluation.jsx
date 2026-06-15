import { CheckCircle2, FileQuestion, History, Loader2, MessageSquareText, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { extractFileText, fetchStudents, markingAssist } from "../utils/api.js";

export default function ReEvaluation() {
  const fileInputRef = useRef(null);
  const [requests, setRequests] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [form, setForm] = useState({
    exam: "",
    question: "",
    reason: "",
    evidenceText: "",
    fileName: ""
  });
  const [dragging, setDragging] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const selectedStudent = students.find((student) => student.studentId === selectedStudentId) || students[0];

  useEffect(() => {
    fetchStudents()
      .then((data) => {
        const nextStudents = data.students || [];
        setStudents(nextStudents);
        setSelectedStudentId(nextStudents[0]?.studentId || "");
      })
      .catch(() => {});
  }, []);

  async function handleFiles(fileList) {
    const file = Array.from(fileList || [])[0];
    if (!file) return;
    setExtracting(true);
    setError("");
    try {
      const data = await extractFileText(file);
      setForm((current) => ({
        ...current,
        fileName: data.fileName || file.name,
        evidenceText: data.text || current.evidenceText
      }));
      if (data.warning) setError(data.warning);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setExtracting(false);
    }
  }

  async function submitRequest() {
    if (!selectedStudent || !form.exam.trim() || !form.question.trim() || !form.reason.trim()) {
      setError("Select a student, enter the exam, question number, and reason before submitting.");
      return;
    }
    setSubmitting(true);
    setError("");
    setNotice("");

    try {
      const ai = await markingAssist({
        uploadedScript: {
          student: selectedStudent.name,
          subject: "Re-evaluation",
          exam: form.exam,
          originalMarks: "Pending",
          text: [
            `Re-evaluation question: ${form.question}`,
            `Reason: ${form.reason}`,
            form.evidenceText
          ].filter(Boolean).join("\n")
        }
      });

      const request = {
        id: `REQ-${Math.floor(100 + Math.random() * 900)}`,
        student: selectedStudent.name,
        exam: form.exam,
        question: form.question,
        reason: form.reason,
        originalMarks: "Pending",
        aiSuggestion: ai.analysis?.confidence >= 0.8 ? "Review likely justified" : "Needs teacher review",
        teacherDecision: "Pending teacher decision",
        status: "Request accepted",
        evidenceFile: form.fileName,
        aiFindings: ai.analysis?.rubricFindings || []
      };

      setRequests((current) => [request, ...current]);
      setNotice(`${request.id} accepted for ${request.student}. AI comparison logged for teacher review.`);
      setForm({ exam: "", question: "", reason: "", evidenceText: "", fileName: "" });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="feature-fill grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
      <section className="space-y-5">
        <div className="rounded-[38px] bg-gradient-to-br from-[#7f7cff] via-[#4ca7ff] to-[#52d6a7] p-6 text-white shadow-soft">
          <span className="text-sm font-black uppercase tracking-wide text-white/75">Re-evaluation Portal</span>
          <h1 className="mt-2 text-3xl font-black">Transparent rechecking</h1>
          <p className="mt-2 text-white/80">Select the student script, upload evidence, submit the request, and preserve the full audit trail.</p>
        </div>

        {notice && <div className="rounded-[24px] bg-[#dff8ec] p-4 font-black text-edu-green">{notice}</div>}
        {error && <div className="rounded-[24px] bg-[#ffe7e2] p-4 font-black text-[#d75848]">{error}</div>}

        <section className="paper-card rounded-[30px] border border-white p-5 shadow-soft">
          <History size={24} className="text-[#7967e8]" />
          <strong className="mt-3 block text-xl text-[#151b2d]">Audit trail includes</strong>
          <p className="mt-2 text-sm text-edu-muted">Original marks, uploaded evidence, AI suggestion, teacher decision, revised marks, reason, date and reviewer.</p>
        </section>

        <section className="soft-card">
          <FileQuestion size={22} className="text-edu-blue" />
          <strong className="mt-3 block text-xl text-[#151b2d] dark:text-[#edf3ff]">New request intake</strong>
          <div className="mt-4 grid gap-3">
            <select className="field" value={selectedStudentId} onChange={(event) => setSelectedStudentId(event.target.value)}>
              {students.map((student) => <option key={student.studentId} value={student.studentId}>{student.name} - {student.grade} {student.classSection}</option>)}
            </select>
            <input className="field" value={form.exam} onChange={(event) => setForm((current) => ({ ...current, exam: event.target.value }))} placeholder="Exam / assessment name" />
            <input className="field" value={form.question} onChange={(event) => setForm((current) => ({ ...current, question: event.target.value }))} placeholder="Question number" />
            <textarea className="field min-h-28 py-3" value={form.reason} onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))} placeholder="Reason for recheck" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                handleFiles(event.dataTransfer.files);
              }}
              className={`grid min-h-28 place-items-center rounded-[24px] border-2 border-dashed p-4 text-center transition ${dragging ? "border-[#4ca7ff] bg-[#e7f0ff]" : "border-edu-line bg-[#f7f9ff]"}`}
            >
              <span className="grid gap-2">
                <Upload className="mx-auto text-edu-blue" size={24} />
                <strong className="text-[#151b2d]">{extracting ? "Reading evidence..." : "Upload evidence photo/PDF"}</strong>
                <small className="font-bold text-edu-muted">{form.fileName || "OCR and PDF text extraction supported"}</small>
              </span>
            </button>
            <input ref={fileInputRef} className="hidden" type="file" accept=".pdf,image/*,.txt,.md,.csv,.json,text/*" onChange={(event) => handleFiles(event.target.files)} />
            <textarea className="field min-h-24 py-3" value={form.evidenceText} onChange={(event) => setForm((current) => ({ ...current, evidenceText: event.target.value }))} placeholder="Extracted evidence text or notes..." />
            <button className="primary-btn w-full" onClick={submitRequest} disabled={submitting || extracting}>
              {submitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
              Submit and check request
            </button>
          </div>
        </section>
      </section>

      <section className="space-y-4">
        {students.length === 0 && (
          <article className="soft-card">
            <strong className="text-[#151b2d] dark:text-[#edf3ff]">Import students first</strong>
            <p className="mt-2 text-sm font-bold text-edu-muted">Recheck uses the Manage Students roster so requests can be tied to the correct child.</p>
            <a className="secondary-btn mt-4" href="/manage-students">Manage students</a>
          </article>
        )}
        {requests.map((request) => (
          <article key={request.id} className="soft-card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span className="text-sm font-black uppercase tracking-wide text-edu-muted">{request.id} - {request.status}</span>
                <h2 className="mt-1 text-xl font-black text-[#151b2d] dark:text-[#edf3ff]">{request.student}</h2>
                <p className="mt-1 text-sm text-edu-muted">{request.exam} - {request.question}</p>
              </div>
              <span className="rounded-full bg-[#fff4cf] px-3 py-1 text-sm font-black text-[#8b6100] dark:bg-[#3a2d12] dark:text-[#ffdc7a]">{request.teacherDecision}</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Trail label="Original" value={request.originalMarks} />
              <Trail label="AI suggested" value={request.aiSuggestion} />
              <Trail label="Decision" value={request.teacherDecision} />
            </div>
            {request.evidenceFile && <p className="mt-4 rounded-2xl bg-[#eef3ff] p-3 text-sm font-black text-edu-blue dark:bg-[#0d1628]">{request.evidenceFile}</p>}
            <div className="mt-4 flex items-start gap-3 rounded-[24px] bg-[#f7f9ff] p-4 dark:bg-[#0d1628]">
              <MessageSquareText size={18} className="mt-0.5 text-edu-blue" />
              <p className="text-sm font-bold text-slate-600 dark:text-[#aebbd0]">{request.reason}</p>
            </div>
            {request.aiFindings?.length > 0 && (
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {request.aiFindings.slice(0, 4).map((finding) => <span key={finding} className="rounded-2xl bg-[#dff8ec] p-3 text-xs font-black text-edu-green">{finding}</span>)}
              </div>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}

function Trail({ label, value }) {
  return (
    <div className="rounded-[22px] bg-[#f7f9ff] p-4 dark:bg-[#0d1628]">
      <span className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-edu-muted">
        <CheckCircle2 size={14} /> {label}
      </span>
      <strong className="mt-2 block text-[#151b2d] dark:text-[#edf3ff]">{value}</strong>
    </div>
  );
}
