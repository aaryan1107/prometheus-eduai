import { useEffect, useMemo, useRef, useState } from "react";
import { Database, FileText, Globe2, Loader2, MessageSquareText, Search, ShieldCheck, Trash2, Upload, X } from "lucide-react";
import { addTextSource, addUrlSource, deleteSource, extractFileText, fetchSources, searchSources, updateSourceComment } from "../utils/api.js";

const sourceTypes = [
  ["teacher_note", "Teacher note"],
  ["school_pdf", "School PDF"],
  ["question_paper", "Question paper"],
  ["question_bank", "Question bank"],
  ["markscheme", "AI marking scheme / markscheme"],
  ["student_answer_script", "Student answer script"],
  ["general_reference", "General reference"]
];

const subjects = ["Mathematics", "Physics", "Chemistry", "Biology", "English", "History", "Geography", "Economics", "Computer Science", "SAT Preparation"];
const sourceTypeLabels = Object.fromEntries([...sourceTypes, ["website", "Website"]]);

export default function Sources() {
  const fileInputRef = useRef(null);
  const questionPaperInputRef = useRef(null);
  const [fileLinks, setFileLinks] = useState({});
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searching, setSearching] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    type: "teacher_note",
    text: "",
    grade: "",
    subject: "",
    chapter: "",
    fileName: "",
    questionPaperFileName: "",
    questionPaperText: ""
  });
  const [urlForm, setUrlForm] = useState({ title: "", url: "" });
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedSource, setSelectedSource] = useState(null);
  const [commentDrafts, setCommentDrafts] = useState({});
  const [busySourceId, setBusySourceId] = useState("");

  const sourceStats = useMemo(() => {
    const chunkCount = sources.reduce((sum, item) => sum + (item.chunkCount || 0), 0);
    const studentCount = new Set(sources.map((item) => item.studentName).filter(Boolean)).size;
    return { sourceCount: sources.length, chunkCount, studentCount };
  }, [sources]);

  useEffect(() => {
    loadSources();
  }, []);

  async function loadSources() {
    setLoading(true);
    try {
      const data = await fetchSources();
      setSources(data.sources || []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveTextSource(event) {
    event.preventDefault();
    if (!form.text.trim()) {
      setError("Add pasted text or drop a readable file before saving.");
      return;
    }
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const data = await addTextSource({
        ...form,
        chapter: form.chapter || "General",
        uploadedBy: "teacher",
        approved: true
      });
      const pendingFileLink = fileLinks.pending;
      const pendingQuestionPaperLink = fileLinks.pendingQuestionPaper;
      if (pendingFileLink || pendingQuestionPaperLink) {
        setFileLinks((current) => {
          const next = { ...current };
          if (pendingFileLink) next[data.source.sourceId] = pendingFileLink;
          delete next.pending;
          if (pendingQuestionPaperLink) {
            next[`${data.source.sourceId}:questionPaper`] = pendingQuestionPaperLink;
            delete next.pendingQuestionPaper;
          }
          return next;
        });
      }
      setNotice(`Saved "${data.source.title}" with ${data.source.chunkCount} searchable chunks.`);
      setForm((current) => ({ ...current, title: "", text: "", fileName: "", questionPaperFileName: "", questionPaperText: "" }));
      await loadSources();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function saveUrlSource(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const data = await addUrlSource({
        ...urlForm,
        type: "website",
        grade: form.grade,
        subject: form.subject,
        chapter: form.chapter || "General",
        uploadedBy: "teacher",
        approved: true
      });
      setNotice(`Indexed "${data.source.title}" as a student resource.`);
      setUrlForm({ title: "", url: "" });
      await loadSources();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function runSearch(event) {
    event.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setError("");

    try {
      const data = await searchSources({ query, topK: 6 });
      setResults(data.results || []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSearching(false);
    }
  }

  async function handleFiles(fileList) {
    const file = Array.from(fileList || [])[0];
    if (!file) return;
    setExtracting(true);
    setError("");
    setNotice("");
    try {
      const data = await extractFileText(file);
      const objectUrl = URL.createObjectURL(file);
      setFileLinks((current) => ({ ...current, pending: { url: objectUrl, name: file.name } }));
      setForm((current) => ({
        ...current,
        title: current.title || file.name.replace(/\.[^.]+$/, ""),
        fileName: file.name,
        text: data.text || ""
      }));
      setNotice(`${data.extractionMethod?.toUpperCase() || "FILE"} extracted from ${file.name}. Review the text, then save it.`);
      if (data.warning) setError(data.warning);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setExtracting(false);
    }
  }

  async function handleQuestionPaperFiles(fileList) {
    const file = Array.from(fileList || [])[0];
    if (!file) return;
    setExtracting(true);
    setError("");
    setNotice("");
    try {
      const data = await extractFileText(file);
      const objectUrl = URL.createObjectURL(file);
      setFileLinks((current) => ({ ...current, pendingQuestionPaper: { url: objectUrl, name: file.name } }));
      setForm((current) => ({
        ...current,
        questionPaperFileName: file.name,
        questionPaperText: data.text || ""
      }));
      setNotice(`Question paper attached: ${file.name}. You can save now or upload it later.`);
      if (data.warning) setError(data.warning);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setExtracting(false);
    }
  }

  async function saveComment(sourceId) {
    setBusySourceId(sourceId);
    setError("");
    setNotice("");
    try {
      const data = await updateSourceComment(sourceId, commentDrafts[sourceId] || "");
      setSources((current) => current.map((source) => source.sourceId === sourceId ? data.source : source));
      setSelectedSource((current) => current?.sourceId === sourceId ? data.source : current);
      setNotice("Comment saved in Manage Library + Keep Track.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusySourceId("");
    }
  }

  async function removeSource(sourceId) {
    setBusySourceId(sourceId);
    setError("");
    setNotice("");
    try {
      await deleteSource(sourceId);
      setSources((current) => current.filter((source) => source.sourceId !== sourceId));
      setResults((current) => current.filter((result) => result.sourceId !== sourceId));
      setSelectedSource((current) => current?.sourceId === sourceId ? null : current);
      setNotice("Deleted from Audit Log and searchable library.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusySourceId("");
    }
  }

  const managedSources = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return sources;
    return sources.filter((source) => [
      source.title,
      source.grade,
      source.subject,
      source.chapter,
      source.type,
      source.comment,
      source.fileName,
      source.questionPaperFileName
    ].join(" ").toLowerCase().includes(cleanQuery));
  }, [query, sources]);

  const resultSourceIds = useMemo(() => new Set(results.map((result) => result.sourceId)), [results]);
  const isMarkscheme = form.type === "markscheme";

  return (
    <main className="feature-fill grid gap-6 xl:grid-cols-[0.76fr_1.24fr]">
      <section className="space-y-5">
        <div className="rounded-[34px] bg-[#151b2d] p-6 text-white shadow-soft">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-sm font-black uppercase tracking-wide text-white/70">Library</span>
              <h1 className="mt-2 text-3xl font-black">Upload and manage study material</h1>
              <p className="mt-2 text-white/75">
                Add notes, question banks, answer feedback, PDFs, images, and AI marking schemes. Promi and marking tools can use approved material later when relevant.
              </p>
            </div>
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/12 text-white">
              <Database size={24} />
            </span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Resources" value={sourceStats.sourceCount} icon={Database} />
          <StatCard label="Chunks" value={sourceStats.chunkCount} icon={FileText} />
          <StatCard label="Students" value={sourceStats.studentCount} icon={ShieldCheck} />
        </div>

        <section className="paper-card rounded-[30px] border border-white p-5 shadow-soft">
          <div className="flex items-center gap-2">
            <Upload size={19} className="text-edu-blue" />
            <h2 className="text-xl font-black text-[#151b2d]">Add Material</h2>
          </div>
          <form className="mt-4 grid gap-3" onSubmit={saveTextSource}>
            <div className="grid gap-3 sm:grid-cols-2">
              <select className="field" value={form.grade} onChange={(event) => setForm((current) => ({ ...current, grade: event.target.value }))}>
                <option value="">Select Grade</option>
                {["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12", "SAT / External Exam"].map((grade) => <option key={grade}>{grade}</option>)}
              </select>
              <select className="field" value={form.subject} onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}>
                <option value="">Select Subject</option>
                {subjects.map((subject) => <option key={subject}>{subject}</option>)}
              </select>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input className="field" value={form.chapter} onChange={(event) => setForm((current) => ({ ...current, chapter: event.target.value }))} placeholder="Chapter / topic" />
              <select className="field" value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}>
                {sourceTypes.map(([type, label]) => <option key={type} value={type}>{label}</option>)}
              </select>
            </div>
            <input className="field" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Resource title" required />

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
              className={`grid min-h-32 place-items-center rounded-[26px] border-2 border-dashed p-5 text-center transition ${dragging ? "border-[#4ca7ff] bg-[#e7f0ff]" : "border-edu-line bg-[#f7f9ff]"}`}
            >
              <span className="grid gap-2">
                <Upload className="mx-auto text-edu-blue" size={26} />
                <strong className="text-[#151b2d]">{extracting ? "Extracting file..." : "Drop PDF, image, or document text here"}</strong>
                <small className="font-bold text-edu-muted">PDF text extraction and image OCR are supported</small>
              </span>
            </button>
            <input ref={fileInputRef} className="hidden" type="file" accept=".pdf,image/*,.txt,.md,.csv,.json,text/*" onChange={(event) => handleFiles(event.target.files)} />

            {isMarkscheme && (
              <section className="rounded-[24px] border border-edu-line bg-[#f7f9ff] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <strong className="text-[#151b2d]">Attach question paper</strong>
                    <p className="mt-1 text-sm font-bold text-edu-muted">
                      Optional now, but useful so AI marking can compare the marking scheme against the actual paper later.
                    </p>
                  </div>
                  {form.questionPaperFileName && (
                    <span className="rounded-full bg-[#dff8ec] px-3 py-1 text-xs font-black text-edu-green">
                      attached
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => questionPaperInputRef.current?.click()}
                  className="mt-4 grid min-h-24 w-full place-items-center rounded-[22px] border-2 border-dashed border-edu-line bg-white p-4 text-center transition hover:border-[#4ca7ff] hover:bg-[#e7f0ff]"
                >
                  <span className="grid gap-1">
                    <Upload className="mx-auto text-edu-blue" size={22} />
                    <strong className="text-[#151b2d]">{form.questionPaperFileName || "Upload question paper"}</strong>
                    <small className="font-bold text-edu-muted">PDF/image/text accepted. You can also upload later.</small>
                  </span>
                </button>
                <input ref={questionPaperInputRef} className="hidden" type="file" accept=".pdf,image/*,.txt,.md,.csv,.json,text/*" onChange={(event) => handleQuestionPaperFiles(event.target.files)} />
              </section>
            )}

            <textarea className="field min-h-44 py-3 leading-6" value={form.text} onChange={(event) => setForm((current) => ({ ...current, text: event.target.value }))} placeholder="Paste notes, student feedback, question bank text, answer guidance, or uploaded file text..." />
            <button className="primary-btn" disabled={saving} type="submit">
              {saving ? <Loader2 size={17} className="animate-spin" /> : <ShieldCheck size={17} />}
              Save to library
            </button>
          </form>
        </section>

        <section className="soft-card">
          <div className="flex items-center gap-2">
            <Globe2 size={19} className="text-edu-green" />
            <h2 className="text-xl font-black text-[#151b2d]">Add website resource</h2>
          </div>
          <form className="mt-4 grid gap-3" onSubmit={saveUrlSource}>
            <input className="field" value={urlForm.url} onChange={(event) => setUrlForm((current) => ({ ...current, url: event.target.value }))} placeholder="https://example.edu/chapter-notes" required />
            <input className="field" value={urlForm.title} onChange={(event) => setUrlForm((current) => ({ ...current, title: event.target.value }))} placeholder="Optional title override" />
            <button className="secondary-btn" disabled={saving} type="submit">
              {saving ? <Loader2 size={17} className="animate-spin" /> : <Globe2 size={17} />}
              Fetch and save website
            </button>
          </form>
        </section>
      </section>

      <section className="space-y-5">
        {(notice || error) && (
          <div className={`rounded-[24px] px-5 py-4 text-sm font-black ${error ? "bg-[#ffe7e2] text-[#d75848]" : "bg-[#dff8ec] text-edu-green"}`}>
            {error || notice}
          </div>
        )}

        <section className="soft-card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <span className="text-sm font-black uppercase tracking-wide text-[#7967e8]">Search Resources</span>
              <h2 className="mt-1 text-2xl font-black text-[#151b2d]">Audit Log</h2>
              <p className="mt-1 text-sm font-bold text-edu-muted">Manage Library + Keep Track</p>
            </div>
            {loading && <Loader2 size={18} className="animate-spin text-edu-muted" />}
          </div>
          <form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={runSearch}>
            <input className="field" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by subject, chapter, or concept..." />
            <button className="primary-btn shrink-0" disabled={searching} type="submit">
              {searching ? <Loader2 size={17} className="animate-spin" /> : <Search size={17} />}
              Search
            </button>
          </form>

          <div className="mt-4 flex flex-wrap justify-end gap-3">
            <span className="rounded-full bg-[#eef3ff] px-3 py-1 text-xs font-black text-edu-blue">
              {managedSources.length} visible
            </span>
          </div>

          <div className="mt-5 grid gap-3">
            {managedSources.map((source) => (
              <SourceCard
                key={source.sourceId}
                source={source}
                fileLink={fileLinks[source.sourceId]}
                questionPaperLink={fileLinks[`${source.sourceId}:questionPaper`]}
                matched={resultSourceIds.has(source.sourceId)}
                commentValue={commentDrafts[source.sourceId] ?? source.comment ?? ""}
                busy={busySourceId === source.sourceId}
                onCommentChange={(value) => setCommentDrafts((current) => ({ ...current, [source.sourceId]: value }))}
                onSaveComment={() => saveComment(source.sourceId)}
                onDelete={() => removeSource(source.sourceId)}
                onView={() => setSelectedSource(source)}
              />
            ))}
            {!loading && managedSources.length === 0 && <p className="rounded-[22px] bg-[#eef3ff] px-4 py-4 text-sm font-bold text-slate-600">No resources matched. Add material or search a different subject, chapter, or concept.</p>}
          </div>
        </section>
      </section>

      {selectedSource && (
        <SourceViewer
          source={selectedSource}
          fileLink={fileLinks[selectedSource.sourceId]}
          questionPaperLink={fileLinks[`${selectedSource.sourceId}:questionPaper`]}
          onClose={() => setSelectedSource(null)}
        />
      )}
    </main>
  );
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <article className="soft-card p-4">
      <Icon size={18} className="text-edu-blue" />
      <strong className="mt-3 block text-2xl text-[#151b2d]">{value}</strong>
      <span className="text-sm font-black uppercase tracking-wide text-edu-muted">{label}</span>
    </article>
  );
}

function SourceCard({ source, fileLink, questionPaperLink, matched, commentValue, busy, onCommentChange, onSaveComment, onDelete, onView }) {
  return (
    <article className="rounded-[24px] border border-edu-line bg-[#f7f9ff] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <strong className="text-lg text-[#151b2d]">{source.title}</strong>
          <p className="mt-1 text-sm font-bold text-edu-muted">
            {source.grade || "Any grade"} - {source.subject || "General"} - {source.chapter || "General"}
          </p>
          <p className="mt-1 text-xs font-black uppercase tracking-wide text-edu-muted">
            {sourceTypeLabels[source.type] || source.type} - {source.fileName || source.url || "Library item"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {matched && <span className="rounded-full bg-[#eeeaff] px-3 py-1 text-xs font-black text-[#7967e8]">matched search</span>}
          <span className="rounded-full bg-[#dff8ec] px-3 py-1 text-xs font-black text-edu-green">
            {source.approved ? "approved" : "draft"}
          </span>
        </div>
      </div>
      <div className="mt-4 grid gap-3">
        <textarea
          className="field min-h-20 py-3 text-sm"
          value={commentValue}
          onChange={(event) => onCommentChange(event.target.value)}
          placeholder="Add comments for this material..."
        />
        <div className="flex flex-wrap gap-2">
          <button className="secondary-btn px-4" type="button" onClick={onView}>
            <FileText size={16} />
            View
          </button>
          {fileLink && (
            <a className="secondary-btn px-4" href={fileLink.url} target="_blank" rel="noreferrer">
              <Upload size={16} />
              Open PDF
            </a>
          )}
          {(questionPaperLink || source.questionPaperFileName) && (
            <a className={`secondary-btn px-4 ${questionPaperLink ? "" : "pointer-events-none opacity-60"}`} href={questionPaperLink?.url || "#"} target="_blank" rel="noreferrer">
              <FileText size={16} />
              Question paper
            </a>
          )}
          {source.url && (
            <a className="secondary-btn px-4" href={source.url} target="_blank" rel="noreferrer">
              <Globe2 size={16} />
              Open link
            </a>
          )}
          <button className="secondary-btn px-4" type="button" onClick={onSaveComment} disabled={busy}>
            {busy ? <Loader2 size={16} className="animate-spin" /> : <MessageSquareText size={16} />}
            Save comment
          </button>
          <button className="secondary-btn px-4 text-[#d75848]" type="button" onClick={onDelete} disabled={busy}>
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

function SourceViewer({ source, fileLink, questionPaperLink, onClose }) {
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/55 p-4">
      <article className="max-h-[86vh] w-full max-w-4xl overflow-hidden rounded-[30px] border border-white bg-white shadow-soft dark:border-[#263754] dark:bg-[#111b2e]">
        <header className="flex items-start justify-between gap-4 border-b border-edu-line p-5">
          <div>
            <span className="text-sm font-black uppercase tracking-wide text-edu-blue">{sourceTypeLabels[source.type] || source.type}</span>
            <h2 className="mt-1 text-2xl font-black text-[#151b2d] dark:text-[#edf3ff]">{source.title}</h2>
            <p className="mt-1 text-sm font-bold text-edu-muted">
              {source.grade || "Any grade"} - {source.subject || "General"} - {source.chapter || "General"}
            </p>
          </div>
          <button className="grid h-11 w-11 place-items-center rounded-2xl bg-[#eef3ff] text-[#151b2d] dark:bg-[#0d1628] dark:text-[#edf3ff]" type="button" onClick={onClose} aria-label="Close viewer">
            <X size={20} />
          </button>
        </header>
        <div className="grid max-h-[66vh] gap-4 overflow-y-auto p-5">
          {(fileLink || questionPaperLink || source.url) && (
            <div className="flex flex-wrap gap-2">
              {fileLink && <a className="primary-btn" href={fileLink.url} target="_blank" rel="noreferrer">Open PDF</a>}
              {questionPaperLink && <a className="secondary-btn" href={questionPaperLink.url} target="_blank" rel="noreferrer">Open question paper</a>}
              {source.url && <a className="secondary-btn" href={source.url} target="_blank" rel="noreferrer">Open link</a>}
            </div>
          )}
          {source.questionPaperFileName && (
            <section className="rounded-[22px] bg-[#eef3ff] p-4">
              <strong className="text-[#151b2d] dark:text-[#edf3ff]">Linked question paper</strong>
              <p className="mt-2 text-sm font-bold text-edu-muted">{source.questionPaperFileName}</p>
              {source.questionPaperText && <pre className="mt-3 max-h-44 overflow-y-auto whitespace-pre-wrap break-words text-sm leading-6 text-slate-600 dark:text-[#aebbd0]">{source.questionPaperText}</pre>}
            </section>
          )}
          {source.comment && (
            <section className="rounded-[22px] bg-[#eef3ff] p-4">
              <strong className="text-[#151b2d] dark:text-[#edf3ff]">Teacher comment</strong>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-[#aebbd0]">{source.comment}</p>
            </section>
          )}
          <section className="rounded-[22px] bg-[#f7f9ff] p-4 dark:bg-[#0d1628]">
            <strong className="text-[#151b2d] dark:text-[#edf3ff]">Extracted content preview</strong>
            <pre className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600 dark:text-[#aebbd0]">{source.contentText || "No stored preview is available for this older item."}</pre>
          </section>
        </div>
      </article>
    </div>
  );
}
