import { useEffect, useMemo, useRef, useState } from "react";
import {
  Brain,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  FileText,
  Loader2,
  PackageCheck,
  Search,
  ShieldCheck,
  Upload,
  X,
  XCircle
} from "lucide-react";
import {
  createAssessmentPackage,
  extractFileText,
  fetchAssessmentPackages,
  fetchSources,
  fetchStudents,
  lockScript,
  markingAssist,
  recordEvaluationAudit,
  updateAssessmentPackageGradingStatus,
  updateAssessmentPackageUploadStatus
} from "../utils/api.js";

const uploadParts = [
  ["questionPaper", "Question paper", FileText],
  ["markingScheme", "Marking scheme", FileCheck2],
  ["studentScripts", "Student answer script", Upload]
];

const emptyAssets = {
  questionPaper: { uploaded: false, fileName: "", extractedText: "", selectionSource: "" },
  markingScheme: { uploaded: false, fileName: "", extractedText: "", selectionSource: "" },
  studentScripts: { uploaded: false, fileName: "", extractedText: "", selectionSource: "", count: 0 }
};

const emptyDraft = {
  studentName: "",
  assessmentName: "",
  grade: "Grade 10",
  classSection: "",
  subject: "Mathematics",
  assignedTeacher: "",
  originalMarks: "",
  scriptType: "checked_answer_script"
};

export default function AssessmentPackages() {
  const [packages, setPackages] = useState([]);
  const [activePackageId, setActivePackageId] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [evaluatingId, setEvaluatingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [evaluation, setEvaluation] = useState(null);
  const [librarySources, setLibrarySources] = useState([]);
  const [students, setStudents] = useState([]);
  const [picker, setPicker] = useState(null);
  const [draftAssets, setDraftAssets] = useState(emptyAssets);
  const [draft, setDraft] = useState(emptyDraft);

  useEffect(() => {
    loadPackages();
  }, []);

  async function loadPackages() {
    setLoading(true);
    setError("");
    try {
      const [data, library, roster] = await Promise.all([
        fetchAssessmentPackages(),
        fetchSources(),
        fetchStudents()
      ]);
      const nextPackages = data.packages || [];
      setPackages(nextPackages);
      setLibrarySources(library.sources || []);
      setStudents(roster.students || []);
      setActivePackageId((current) => current || nextPackages[0]?.packageId || "");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function createEvaluationPackage(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setEvaluation(null);

    try {
      const data = await createAssessmentPackage(draft);
      let createdPackage = data.package;

      for (const [part] of uploadParts) {
        const asset = draftAssets[part];
        if (asset.uploaded) {
          const updated = await updateAssessmentPackageUploadStatus(createdPackage.packageId, {
            part,
            uploaded: true,
            fileName: asset.fileName,
            extractedText: asset.extractedText,
            selectionSource: asset.selectionSource || "upload",
            count: part === "studentScripts" ? 1 : undefined
          });
          createdPackage = updated.package;
        }
      }

      setPackages((current) => [createdPackage, ...current.filter((item) => item.packageId !== createdPackage.packageId)]);
      setActivePackageId(createdPackage.packageId);
      setDraft(emptyDraft);
      setDraftAssets(emptyAssets);
      setNotice("Evaluation package created. Start AI evaluation when the three evidence files are attached.");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function uploadDraftAsset(part, file) {
    if (!file) return;
    setSavingId(`draft:${part}`);
    setError("");
    setNotice("");
    try {
      const data = await extractFileText(file);
      setDraftAssets((current) => ({
        ...current,
        [part]: {
          uploaded: true,
          fileName: data.fileName || file.name,
          extractedText: data.text || "",
          selectionSource: "upload",
          count: part === "studentScripts" ? 1 : 0
        }
      }));
      if (part === "studentScripts") {
        setDraft((current) => ({ ...current, assessmentName: current.assessmentName || file.name.replace(/\.[^.]+$/, "") }));
      }
      setNotice(`${file.name} attached to the draft package.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingId("");
    }
  }

  function selectDraftAsset(part) {
    setPicker({ scope: "draft", part, context: draft });
  }

  async function updatePackagePart(packageId, part, asset) {
    setSavingId(`${packageId}:${part}`);
    setError("");
    setNotice("");
    try {
      const data = await updateAssessmentPackageUploadStatus(packageId, {
        part,
        uploaded: true,
        fileName: asset.fileName,
        extractedText: asset.extractedText || "",
        selectionSource: asset.selectionSource || "upload",
        count: part === "studentScripts" ? 1 : undefined
      });
      setPackages((current) => current.map((item) => item.packageId === packageId ? data.package : item));
      setNotice(`${asset.fileName} linked to ${data.package.assessmentName}.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingId("");
    }
  }

  async function uploadPackageAsset(packageId, part, file) {
    if (!file) return;
    setSavingId(`${packageId}:${part}`);
    setError("");
    setNotice("");
    try {
      const data = await extractFileText(file);
      await updatePackagePart(packageId, part, {
        fileName: data.fileName || file.name,
        extractedText: data.text || "",
        selectionSource: "upload"
      });
    } catch (requestError) {
      setError(requestError.message);
      setSavingId("");
    }
  }

  function selectPackageAsset(assessmentPackage, part) {
    setPicker({ scope: "package", part, packageId: assessmentPackage.packageId, context: assessmentPackage });
  }

  async function selectLibrarySource(source) {
    if (!picker) return;
    const asset = {
      fileName: source.fileName || source.title,
      extractedText: source.contentText || `${source.title} selected from Library.`,
      selectionSource: "library",
      sourceId: source.sourceId
    };

    if (picker.scope === "draft") {
      setDraftAssets((current) => ({
        ...current,
        [picker.part]: {
          uploaded: true,
          fileName: asset.fileName,
          extractedText: asset.extractedText,
          selectionSource: "library",
          count: picker.part === "studentScripts" ? 1 : 0
        }
      }));
      setPicker(null);
      setNotice(`${asset.fileName} selected from Library.`);
      return;
    }

    await updatePackagePart(picker.packageId, picker.part, asset);
    setPicker(null);
  }

  async function startEvaluation(assessmentPackage) {
    if (!assessmentPackage.readiness?.isReady) {
      setError("Add or select the question paper, marking scheme, and student answer script before AI evaluation.");
      return;
    }
    const scriptText = assessmentPackage.studentScripts?.extractedText || "";
    if (!scriptText.trim()) {
      setError("The selected student script needs extracted text or an existing Vault record before AI evaluation.");
      return;
    }

    setEvaluatingId(assessmentPackage.packageId);
    setError("");
    setNotice("");
    setEvaluation(null);
    try {
      const lock = await lockScript({
        student: assessmentPackage.studentName || "Uploaded Student",
        subject: assessmentPackage.subject || "General",
        exam: assessmentPackage.assessmentName,
        extractedText: scriptText,
        fileName: assessmentPackage.studentScripts?.fileName || "",
        extractionMethod: assessmentPackage.studentScripts?.selectionSource || "package",
        scriptType: "checked_answer_script"
      });
      const ai = await markingAssist({
        uploadedScript: {
          student: assessmentPackage.studentName || "Uploaded Student",
          subject: assessmentPackage.subject,
          exam: assessmentPackage.assessmentName,
          originalMarks: assessmentPackage.originalMarks || "Package review",
          scriptType: "checked_answer_script",
          text: [
            `Question paper: ${assessmentPackage.questionPaper?.fileName || "not named"}`,
            assessmentPackage.questionPaper?.extractedText || "",
            `Marking scheme: ${assessmentPackage.markingScheme?.fileName || "not named"}`,
            assessmentPackage.markingScheme?.extractedText || "",
            `Student answer script: ${assessmentPackage.studentScripts?.fileName || "not named"}`,
            scriptText
          ].join("\n\n")
        }
      });
      await updateAssessmentPackageGradingStatus(assessmentPackage.packageId, "AI Reviewed");
      await recordEvaluationAudit({
        packageId: assessmentPackage.packageId,
        assessmentName: assessmentPackage.assessmentName,
        studentName: assessmentPackage.studentName,
        grade: assessmentPackage.grade,
        classSection: assessmentPackage.classSection,
        action: "AI evaluation completed",
        detail: `${lock.record.id} locked. Promi generated ${(ai.analysis?.questionBreakdown || []).length} question-level checks and an evidence report.`,
        actor: assessmentPackage.assignedTeacher
      });
      setPackages((current) => current.map((item) => item.packageId === assessmentPackage.packageId ? { ...item, gradingStatus: "AI Reviewed" } : item));
      setEvaluation({ packageId: assessmentPackage.packageId, assessmentPackage, lock: lock.record, ai });
      setNotice(`${assessmentPackage.assessmentName} locked in Vault and evaluated by Promi.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setEvaluatingId("");
    }
  }

  const activePackage = packages.find((item) => item.packageId === activePackageId) || packages[0] || null;
  const stats = useMemo(() => {
    const ready = packages.filter((item) => item.readiness?.isReady).length;
    const reviewed = packages.filter((item) => item.gradingStatus === "AI Reviewed").length;
    return { total: packages.length, ready, reviewed };
  }, [packages]);
  const rosterStudents = useMemo(() => {
    return students.filter((student) => {
      const gradeOk = !draft.grade || student.grade === draft.grade;
      const sectionOk = !draft.classSection || student.classSection === draft.classSection;
      return gradeOk && sectionOk;
    });
  }, [draft.classSection, draft.grade, students]);
  const rosterSections = useMemo(() => {
    return Array.from(new Set(students
      .filter((student) => !draft.grade || student.grade === draft.grade)
      .map((student) => student.classSection)
      .filter(Boolean)));
  }, [draft.grade, students]);

  return (
    <main className="evaluation-mobile-safe feature-fill grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
      <section className="space-y-5">
        <div className="rounded-[38px] bg-[#151b2d] p-6 text-white shadow-soft">
          <span className="text-sm font-black uppercase tracking-wide text-white/70">Evaluation</span>
          <h1 className="mt-2 text-3xl font-black">Create package, then start Promi evaluation</h1>
          <p className="mt-2 text-white/75">
            Question paper and marking scheme are assessment assets. The student answer script is the individual evidence Promi reviews and Vault records.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard label="Packages" value={stats.total} />
          <StatCard label="Ready" value={stats.ready} />
          <StatCard label="Reviewed" value={stats.reviewed} />
        </div>

        <section className="soft-card">
          <div className="flex items-center gap-2">
            <PackageCheck size={19} className="text-edu-blue" />
            <h2 className="text-xl font-black text-[#151b2d] dark:text-[#edf3ff]">New evaluation package</h2>
          </div>
          <p className="mt-2 text-sm font-bold text-edu-muted">
            Create one package for one student. Select shared paper/rubric from Library or upload them here, then attach that student's answer script.
          </p>
          <form className="mt-4 grid gap-3" onSubmit={createEvaluationPackage}>
            <input className="field" list="evaluation-students" placeholder="Student name" value={draft.studentName} onChange={(event) => setDraft((current) => ({ ...current, studentName: event.target.value }))} />
            <datalist id="evaluation-students">
              {rosterStudents.map((student) => <option key={student.studentId} value={student.name} />)}
            </datalist>
            <input className="field" required placeholder="Assessment name" value={draft.assessmentName} onChange={(event) => setDraft((current) => ({ ...current, assessmentName: event.target.value }))} />
            <div className="grid gap-3 sm:grid-cols-2">
              <select className="field" value={draft.grade} onChange={(event) => setDraft((current) => ({ ...current, grade: event.target.value }))}>
                {["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"].map((grade) => <option key={grade}>{grade}</option>)}
              </select>
              <input className="field" list="evaluation-sections" placeholder="Section, e.g. A" value={draft.classSection} onChange={(event) => setDraft((current) => ({ ...current, classSection: event.target.value.toUpperCase() }))} />
              <datalist id="evaluation-sections">
                {rosterSections.map((section) => <option key={section} value={section} />)}
              </datalist>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <select className="field" value={draft.subject} onChange={(event) => setDraft((current) => ({ ...current, subject: event.target.value }))}>
                {["Mathematics", "Physics", "Chemistry", "Biology", "English", "Science", "History", "Computer Science"].map((subject) => <option key={subject}>{subject}</option>)}
              </select>
              <input className="field" placeholder="Assigned teacher" value={draft.assignedTeacher} onChange={(event) => setDraft((current) => ({ ...current, assignedTeacher: event.target.value }))} />
            </div>
            <input className="field" placeholder="Original marks / teacher marks if checked" value={draft.originalMarks} onChange={(event) => setDraft((current) => ({ ...current, originalMarks: event.target.value }))} />

            <div className="grid gap-3">
              {uploadParts.map(([part, label, Icon]) => (
                <AssetTile
                  key={part}
                  part={part}
                  label={label}
                  icon={Icon}
                  value={draftAssets[part]}
                  saving={savingId === `draft:${part}`}
                  onSelect={() => selectDraftAsset(part)}
                  onUpload={(file) => uploadDraftAsset(part, file)}
                />
              ))}
            </div>

            <button className="primary-btn" type="submit">
              <PackageCheck size={17} />
              Create evaluation package
            </button>
          </form>
        </section>
      </section>

      <section className="space-y-5">
        {(error || notice) && (
          <div className={`rounded-[24px] px-5 py-4 text-sm font-black ${error ? "bg-[#ffe7e2] text-[#d75848]" : "bg-[#dff8ec] text-edu-green"}`}>
            {error || notice}
          </div>
        )}

        <EvaluationWorkspace
          packages={packages}
          activePackage={activePackage}
          activePackageId={activePackageId}
          loading={loading}
          savingId={savingId}
          evaluating={evaluatingId === activePackage?.packageId}
          evaluation={evaluation?.packageId === activePackage?.packageId ? evaluation : null}
          onSelectPackage={(packageId) => {
            setActivePackageId(packageId);
            setEvaluation((current) => current?.packageId === packageId ? current : null);
          }}
          onSelectAsset={selectPackageAsset}
          onUploadAsset={uploadPackageAsset}
          onEvaluate={startEvaluation}
        />
      </section>

      {picker && (
        <LibraryPicker
          part={picker.part}
          context={picker.context}
          sources={librarySources}
          onSelect={selectLibrarySource}
          onClose={() => setPicker(null)}
        />
      )}
    </main>
  );
}

function EvaluationWorkspace({
  packages,
  activePackage,
  activePackageId,
  loading,
  savingId,
  evaluating,
  evaluation,
  onSelectPackage,
  onSelectAsset,
  onUploadAsset,
  onEvaluate
}) {
  if (loading) {
    return (
      <section className="soft-card grid min-h-[460px] place-items-center text-center">
        <Loader2 size={28} className="animate-spin text-edu-blue" />
      </section>
    );
  }

  if (!activePackage) {
    return (
      <section className="soft-card grid min-h-[460px] place-items-center text-center">
        <div className="max-w-md">
          <PackageCheck size={32} className="mx-auto text-edu-blue" />
          <h2 className="mt-3 text-2xl font-black text-[#151b2d] dark:text-[#edf3ff]">Create a package first</h2>
          <p className="mt-2 text-sm font-bold text-edu-muted">
            Once the package exists, this space becomes the Promi evaluation workspace and report.
          </p>
        </div>
      </section>
    );
  }

  const ready = activePackage.readiness?.isReady;

  return (
    <section className="space-y-5">
      <section className="soft-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="text-sm font-black uppercase tracking-wide text-edu-blue">Current package</span>
            <h2 className="mt-1 text-2xl font-black text-[#151b2d] dark:text-[#edf3ff]">{activePackage.assessmentName}</h2>
            <p className="mt-1 text-sm font-bold text-edu-muted">
              {activePackage.grade} {activePackage.classSection || ""} - {activePackage.subject} - {activePackage.studentName || "No student selected"}
            </p>
          </div>
          {packages.length > 1 && (
            <select className="package-select field max-w-xs" value={activePackageId} onChange={(event) => onSelectPackage(event.target.value)}>
              {packages.map((item) => (
                <option key={item.packageId} value={item.packageId}>{item.assessmentName} - {item.studentName || "No student"}</option>
              ))}
            </select>
          )}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <MiniField label="Assigned teacher" value={activePackage.assignedTeacher || "Unassigned"} />
          <MiniField label="Original marks" value={activePackage.originalMarks || "Not entered"} />
          <MiniField label="AI status" value={activePackage.gradingStatus || "Not started"} />
        </div>

        <div className="asset-grid mt-5 grid gap-3 lg:grid-cols-3">
          {uploadParts.map(([part, label, Icon]) => (
            <AssetTile
              key={part}
              part={part}
              label={label}
              icon={Icon}
              value={activePackage[part]}
              saving={savingId === `${activePackage.packageId}:${part}`}
              onSelect={() => onSelectAsset(activePackage, part)}
              onUpload={(file) => onUploadAsset(activePackage.packageId, part, file)}
            />
          ))}
        </div>

        {!ready && (
          <p className="mt-4 rounded-[20px] bg-[#fff4cf] px-4 py-3 text-sm font-bold text-[#8b6100]">
            Missing: {activePackage.readiness?.missingItems?.join(", ") || "required evidence"}
          </p>
        )}

        <div className="mt-5 grid gap-3 rounded-[24px] border border-edu-line bg-[#f7f9ff] p-4 dark:bg-[#0d1628] lg:grid-cols-[1fr_auto]">
          <div>
            <div className="flex items-center gap-2">
              <Brain size={18} className="text-[#7967e8]" />
              <strong className="text-[#151b2d] dark:text-[#edf3ff]">Promi will evaluate the locked answer script</strong>
            </div>
            <p className="mt-2 text-sm font-bold text-edu-muted">
              Promi checks visible method evidence, final-answer accuracy, teacher annotations, markscheme references, and marks the student may recover.
            </p>
          </div>
          <button className={`primary-btn h-fit ${ready ? "" : "opacity-55"}`} type="button" disabled={!ready || evaluating} onClick={() => onEvaluate(activePackage)}>
            {evaluating ? <Loader2 size={17} className="animate-spin" /> : <Brain size={17} />}
            Start AI evaluation
          </button>
        </div>
      </section>

      {evaluation ? (
        <EvaluationResult result={evaluation} />
      ) : (
        <section className="soft-card min-h-[360px]">
          <div className="flex items-center gap-2">
            <ClipboardCheck size={20} className="text-edu-green" />
            <h2 className="text-2xl font-black text-[#151b2d] dark:text-[#edf3ff]">Promi report will appear here</h2>
          </div>
          <div className="report-grid mt-5 grid gap-3 lg:grid-cols-2">
            {["Question-by-question checking", "Marks lost and marks recovered", "Teacher annotation review", "Vault audit saved separately"].map((item) => (
              <div key={item} className="rounded-[22px] bg-[#f7f9ff] p-4 text-sm font-black text-slate-600 dark:bg-[#0d1628] dark:text-[#aebbd0]">
                {item}
              </div>
            ))}
          </div>
        </section>
      )}
    </section>
  );
}

function AssetTile({ part, label, icon: Icon, value, saving, onSelect, onUpload }) {
  const fileRef = useRef(null);
  const uploaded = Boolean(value?.uploaded);

  return (
    <div className="rounded-[24px] border border-edu-line bg-white p-4 dark:bg-[#111b2e]">
      <input
        ref={fileRef}
        className="hidden"
        type="file"
        accept={part === "studentScripts" ? ".pdf,.zip,image/*,.txt,.md" : ".pdf,image/*,.doc,.docx,.txt,.md"}
        onChange={(event) => onUpload(event.target.files?.[0])}
      />
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#eef3ff] text-edu-blue dark:bg-[#0d1628]">
          {saving ? <Loader2 size={19} className="animate-spin" /> : <Icon size={19} />}
        </span>
        {uploaded ? <CheckCircle2 size={19} className="text-edu-green" /> : <XCircle size={19} className="text-[#d75848]" />}
      </div>
      <strong className="mt-4 block text-[#151b2d] dark:text-[#edf3ff]">{label}</strong>
      <p className="mt-2 line-clamp-2 min-h-10 text-sm font-bold text-edu-muted">
        {uploaded ? value.fileName : "Select from Library or upload"}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button type="button" className="secondary-btn min-h-10 px-3 text-sm" onClick={onSelect}>
          Select
        </button>
        <button type="button" className="secondary-btn min-h-10 px-3 text-sm" onClick={() => fileRef.current?.click()}>
          Upload
        </button>
      </div>
    </div>
  );
}

function EvaluationResult({ result }) {
  const analysis = result.ai?.analysis || {};
  const scriptPreview = result.lock?.extractedTextPreview || result.assessmentPackage?.studentScripts?.extractedText || "";
  const confidence = typeof result.ai?.confidence === "number" ? Math.round(result.ai.confidence * 100) : null;

  return (
    <section className="paper-card rounded-[30px] border border-white p-5 shadow-soft dark:border-[#263754] dark:bg-[#111b2e]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="text-sm font-black uppercase tracking-wide text-edu-green">Promi AI evaluation report</span>
          <h2 className="mt-1 text-2xl font-black text-[#151b2d] dark:text-[#edf3ff]">{result.assessmentPackage?.studentName || "Student"} review</h2>
          <p className="mt-1 text-sm font-bold text-edu-muted">
            {result.lock?.id} locked before analysis. {confidence ? `${confidence}% confidence signal.` : "Teacher final decision required."}
          </p>
        </div>
        <span className="rounded-full bg-[#dff8ec] px-3 py-1 text-xs font-black text-edu-green">Vault logged</span>
      </div>

      <div className="report-grid mt-5 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="rounded-[24px] bg-[#f7f9ff] p-4 dark:bg-[#0d1628]">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-edu-blue" />
            <strong className="text-[#151b2d] dark:text-[#edf3ff]">Answer-script evidence Promi reviewed</strong>
          </div>
          <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap rounded-[20px] bg-white p-4 text-sm font-semibold leading-7 text-slate-600 dark:bg-[#111b2e] dark:text-[#aebbd0]">
            {scriptPreview || "No extracted preview returned. Inspect the original uploaded file before final marks."}
          </pre>
        </article>

        <article className="rounded-[24px] bg-[#f7f9ff] p-4 dark:bg-[#0d1628]">
          <div className="flex items-center gap-2">
            <ClipboardCheck size={18} className="text-[#7967e8]" />
            <strong className="text-[#151b2d] dark:text-[#edf3ff]">Question-level Promi notes</strong>
          </div>
          <div className="mt-3 grid gap-3">
            {(analysis.questionBreakdown || []).map((item, index) => (
              <div key={`${item.question || "Q"}-${index}`} className="rounded-[20px] bg-white p-4 dark:bg-[#111b2e]">
                <span className="text-xs font-black uppercase tracking-wide text-edu-blue">{item.question || `Q${index + 1}`}</span>
                <p className="mt-2 text-sm font-bold text-slate-600 dark:text-[#aebbd0]">{item.evidence}</p>
                <p className="mt-2 rounded-2xl bg-[#eef3ff] p-3 text-sm font-black text-[#27446d] dark:bg-[#14325c] dark:text-[#edf3ff]">{item.recommendation}</p>
              </div>
            ))}
            {(analysis.questionBreakdown || []).length === 0 && (
              <p className="rounded-[20px] bg-[#fff4cf] p-4 text-sm font-bold text-[#8b6100]">Promi did not return question-level notes for this script.</p>
            )}
          </div>
        </article>
      </div>

      <div className="report-grid mt-4 grid gap-4 lg:grid-cols-2">
        <ResultList title="Rubric findings" items={analysis.rubricFindings || []} />
        <ResultList title="Marking risks" items={analysis.markingRisks || []} />
        <ResultList title="Next teacher actions" items={analysis.nextTeacherActions || []} />
        <ResultList title="Library markscheme references" items={(analysis.markschemeReferences || []).map((item) => `${item.title}: ${item.snippet || "Reference matched."}`)} />
      </div>

      {analysis.suggestedFeedback && (
        <p className="mt-4 rounded-[22px] bg-[#dff8ec] p-4 text-sm font-black text-edu-green">{analysis.suggestedFeedback}</p>
      )}
    </section>
  );
}

function LibraryPicker({ part, context, sources, onSelect, onClose }) {
  const [query, setQuery] = useState("");
  const category = partCategory(part);
  const options = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    return sources
      .filter((source) => matchesPart(source, part))
      .filter((source) => matchesContext(source, context, part))
      .filter((source) => !cleanQuery || [
        source.title,
        source.type,
        source.grade,
        source.subject,
        source.chapter,
        source.fileName
      ].join(" ").toLowerCase().includes(cleanQuery));
  }, [context, part, query, sources]);

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/55 p-4">
      <article className="max-h-[86vh] w-full max-w-4xl overflow-hidden rounded-[30px] border border-white bg-white shadow-soft dark:border-[#263754] dark:bg-[#111b2e]">
        <header className="flex items-start justify-between gap-4 border-b border-edu-line p-5">
          <div>
            <span className="text-sm font-black uppercase tracking-wide text-edu-blue">{category.scope}</span>
            <h2 className="mt-1 text-2xl font-black text-[#151b2d] dark:text-[#edf3ff]">{partLabel(part)}</h2>
            <p className="mt-1 text-sm font-bold text-edu-muted">{category.help}</p>
            <p className="mt-1 text-xs font-black uppercase tracking-wide text-edu-muted">
              Context: {context?.grade || "Any grade"} - {context?.subject || "Any subject"} - {context?.classSection || "Any section"}
            </p>
          </div>
          <button className="grid h-11 w-11 place-items-center rounded-2xl bg-[#eef3ff] text-[#151b2d] dark:bg-[#0d1628] dark:text-[#edf3ff]" type="button" onClick={onClose} aria-label="Close library picker">
            <X size={20} />
          </button>
        </header>

        <div className="p-5">
          <label className="field flex items-center gap-3">
            <Search size={17} className="text-edu-muted" />
            <input className="w-full border-0 bg-transparent outline-none" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search Library uploads..." />
          </label>
          <div className="mt-5 grid max-h-[54vh] gap-3 overflow-y-auto">
            {options.map((source) => (
              <button key={source.sourceId} type="button" onClick={() => onSelect(source)} className="rounded-[22px] border border-edu-line bg-[#f7f9ff] p-4 text-left transition hover:border-[#4ca7ff] hover:bg-[#e7f0ff] dark:bg-[#0d1628]">
                <strong className="text-[#151b2d] dark:text-[#edf3ff]">{source.title}</strong>
                <p className="mt-1 text-sm font-bold text-edu-muted">{source.grade || "Any grade"} - {source.subject || "General"} - {source.chapter || "General"}</p>
                <p className="mt-1 text-xs font-black uppercase tracking-wide text-edu-muted">{source.type} - {source.fileName || source.url || `${source.chunkCount || 0} chunks`}</p>
              </button>
            ))}
            {options.length === 0 && (
              <p className="rounded-[22px] bg-[#fff4cf] p-4 text-sm font-bold text-[#8b6100]">
                No matching {partLabel(part).toLowerCase()} found for this grade/subject context. Upload it in Library with the correct category, or use Upload on this package.
              </p>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}

function matchesPart(source, part) {
  if (part === "markingScheme") return source.type === "markscheme";
  if (part === "studentScripts") return source.type === "student_answer_script";
  if (part === "questionPaper") {
    if (source.type === "question_paper") return true;
    if (!["school_pdf", "question_bank"].includes(source.type)) return false;
    return /question\s*paper|exam\s*paper|test\s*paper|paper\b/i.test([source.title, source.fileName, source.comment].join(" "));
  }
  return false;
}

function matchesContext(source, context, part) {
  if (!context) return true;
  const gradeOk = !source.grade || !context.grade || source.grade === context.grade;
  const subjectOk = !source.subject || !context.subject || source.subject === context.subject;
  const studentOk = part !== "studentScripts" || !source.studentName || !context.studentName || source.studentName === context.studentName;
  return gradeOk && subjectOk && studentOk;
}

function partLabel(part) {
  return {
    questionPaper: "Question paper",
    markingScheme: "Marking scheme",
    studentScripts: "Student answer script"
  }[part] || "Library material";
}

function partCategory(part) {
  return {
    questionPaper: {
      scope: "Assessment-level Library category",
      help: "Only question papers for this grade/subject should appear here. Notes and retry material are intentionally hidden."
    },
    markingScheme: {
      scope: "Assessment-level Library category",
      help: "Only marking schemes should appear here. This is the rubric Promi uses to check the student script."
    },
    studentScripts: {
      scope: "Student-level Library category",
      help: "Only uploaded student answer scripts should appear here. This is the individual evidence Promi evaluates."
    }
  }[part] || { scope: "Library category", help: "Select the correct Library material." };
}

function ResultList({ title, items }) {
  return (
    <article className="rounded-[24px] bg-[#f7f9ff] p-4 dark:bg-[#0d1628]">
      <strong className="text-[#151b2d] dark:text-[#edf3ff]">{title}</strong>
      <div className="mt-3 grid gap-2">
        {items.map((item, index) => (
          <p key={`${title}-${index}`} className="rounded-2xl bg-white p-3 text-sm font-bold text-slate-600 dark:bg-[#111b2e] dark:text-[#aebbd0]">{item}</p>
        ))}
        {items.length === 0 && (
          <p className="rounded-2xl bg-white p-3 text-sm font-bold text-edu-muted dark:bg-[#111b2e]">No items returned yet.</p>
        )}
      </div>
    </article>
  );
}

function MiniField({ label, value }) {
  return (
    <div className="rounded-[20px] bg-[#f7f9ff] p-4 dark:bg-[#0d1628]">
      <span className="text-xs font-black uppercase tracking-wide text-edu-muted">{label}</span>
      <strong className="mt-1 block text-[#151b2d] dark:text-[#edf3ff]">{value}</strong>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <article className="soft-card p-4 text-center">
      <strong className="block text-2xl text-[#151b2d] dark:text-[#edf3ff]">{value}</strong>
      <span className="text-xs font-black uppercase tracking-wide text-edu-muted">{label}</span>
    </article>
  );
}
