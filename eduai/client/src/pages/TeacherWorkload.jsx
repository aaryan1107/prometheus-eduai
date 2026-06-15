import { useEffect, useMemo, useState } from "react";
import { BriefcaseBusiness, CheckCircle2, Loader2, PackageCheck, Search, ShieldCheck, Users } from "lucide-react";
import { fetchTeacherWorkload, fetchTeacherWorkloadSummary, updateTeacherWorkloadStatus } from "../utils/api.js";
import MetricCard from "../components/MetricCard.jsx";

const statuses = ["All", "Not Started", "In Progress", "Submitted", "AI Reviewed", "HOD Review Pending", "Finalized"];

const statusStyles = {
  "Not Started": "bg-[#eef3ff] text-slate-600",
  "In Progress": "bg-[#fff4cf] text-[#8b6100]",
  Submitted: "bg-[#dff8ec] text-edu-green",
  "AI Reviewed": "bg-[#eeeaff] text-[#7967e8]",
  "HOD Review Pending": "bg-[#ffe7e2] text-[#d75848]",
  Finalized: "bg-[#dff8ec] text-edu-green"
};

export default function TeacherWorkload() {
  const [assignments, setAssignments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    query: "",
    grade: "All",
    subject: "All",
    status: "All"
  });

  useEffect(() => {
    loadWorkload();
  }, []);

  async function loadWorkload() {
    setLoading(true);
    setError("");
    try {
      const [workloadData, summaryData] = await Promise.all([
        fetchTeacherWorkload(),
        fetchTeacherWorkloadSummary()
      ]);
      setAssignments(workloadData.assignments || []);
      setSummary(summaryData.summary || null);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function changeStatus(assignmentId, status) {
    setSavingId(assignmentId);
    setError("");
    try {
      const data = await updateTeacherWorkloadStatus(assignmentId, status);
      setAssignments((current) => current.map((item) => item.assignmentId === assignmentId ? data.assignment : item));
      setSummary(data.summary);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingId("");
    }
  }

  const grades = useMemo(() => ["All", ...new Set(assignments.map((item) => item.grade))], [assignments]);
  const subjects = useMemo(() => ["All", ...new Set(assignments.map((item) => item.subject))], [assignments]);

  const filteredAssignments = useMemo(() => {
    const query = filters.query.trim().toLowerCase();
    return assignments.filter((item) => {
      const matchesQuery = !query || [item.assessmentName, item.teacherName, item.subject, item.classSection]
        .join(" ")
        .toLowerCase()
        .includes(query);
      const matchesGrade = filters.grade === "All" || item.grade === filters.grade;
      const matchesSubject = filters.subject === "All" || item.subject === filters.subject;
      const matchesStatus = filters.status === "All" || item.status === filters.status;
      return matchesQuery && matchesGrade && matchesSubject && matchesStatus;
    });
  }, [assignments, filters]);

  return (
    <main className="feature-fill space-y-6">
      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[34px] bg-[#151b2d] p-6 text-white shadow-soft">
          <span className="text-sm font-black uppercase tracking-wide text-white/70">Teacher Workload</span>
          <h1 className="mt-2 text-3xl font-black">Who has what to mark?</h1>
          <p className="mt-2 max-w-3xl text-white/75">
            Track assigned assessments, pending scripts, AI-reviewed work, HOD review, and finalized marking across grades and subjects.
          </p>
        </div>

        <article className="soft-card">
          <div className="flex items-center gap-3">
            <ShieldCheck size={22} className="text-edu-green" />
            <div>
              <strong>Status board, not evaluation</strong>
              <p className="mt-1 text-sm text-edu-muted">
                Workload tells teachers and HODs what is pending. Actual file upload, Vault lock, and Promi AI analysis happen in Evaluation.
              </p>
            </div>
          </div>
        </article>
      </section>

      {error && <div className="rounded-[24px] bg-[#ffe7e2] px-5 py-4 text-sm font-black text-[#d75848]">{error}</div>}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Teachers" value={summary?.totalTeachers ?? "-"} hint="assigned" tone="blue" />
        <MetricCard label="Active tasks" value={summary?.activeGradingTasks ?? "-"} hint="needs action" tone="gold" />
        <MetricCard label="HOD reviews" value={summary?.pendingHodReviews ?? "-"} hint="pending" tone="rose" />
        <MetricCard label="Overall progress" value={`${summary?.progress ?? 0}%`} hint={`${summary?.checkedScripts ?? 0}/${summary?.totalScripts ?? 0} scripts`} tone="green" />
      </section>

      <section className="soft-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-sm font-black uppercase tracking-wide text-edu-blue">Filters</span>
            <h2 className="mt-1 text-2xl font-black text-[#151b2d]">Find grading work</h2>
          </div>
          {loading && <Loader2 size={20} className="animate-spin text-edu-muted" />}
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(220px,1fr)_180px_180px_220px]">
          <label className="field flex items-center gap-3">
            <Search size={17} className="text-edu-muted" />
            <input
              className="w-full border-0 bg-transparent outline-none"
              value={filters.query}
              onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))}
              placeholder="Teacher, class, subject..."
            />
          </label>
          <select className="field" value={filters.grade} onChange={(event) => setFilters((current) => ({ ...current, grade: event.target.value }))}>
            {grades.map((grade) => <option key={grade}>{grade}</option>)}
          </select>
          <select className="field" value={filters.subject} onChange={(event) => setFilters((current) => ({ ...current, subject: event.target.value }))}>
            {subjects.map((subject) => <option key={subject}>{subject}</option>)}
          </select>
          <select className="field" value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
            {statuses.map((status) => <option key={status}>{status}</option>)}
          </select>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {filteredAssignments.map((assignment) => (
          <article key={assignment.assignmentId} className="soft-card">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="text-sm font-black uppercase tracking-wide text-[#7967e8]">{assignment.grade} - {assignment.subject}</span>
                <h3 className="mt-1 text-xl font-black text-[#151b2d]">{assignment.assessmentName}</h3>
                <p className="mt-1 text-sm font-bold text-edu-muted">
                  {assignment.teacherName} - {assignment.microsoftAccount}
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-black ${statusStyles[assignment.status] || statusStyles["Not Started"]}`}>
                {assignment.status}
              </span>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <MiniStat icon={BriefcaseBusiness} label="Scripts" value={assignment.totalScripts} />
              <MiniStat icon={CheckCircle2} label="Checked" value={assignment.checkedScripts} />
              <MiniStat icon={Users} label="Pending" value={assignment.pendingScripts} />
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between gap-3 text-sm font-black text-edu-muted">
                <span>{assignment.checkedScripts}/{assignment.totalScripts} checked</span>
                <span>{assignment.progress}%</span>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#eef3ff]">
                <div className="h-full rounded-full bg-gradient-to-r from-[#7f7cff] via-[#4ca7ff] to-[#52d6a7]" style={{ width: `${assignment.progress}%` }} />
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
              <select
                className="field"
                value={assignment.status}
                onChange={(event) => changeStatus(assignment.assignmentId, event.target.value)}
                disabled={savingId === assignment.assignmentId}
              >
                {statuses.filter((status) => status !== "All").map((status) => <option key={status}>{status}</option>)}
              </select>
              <a className="secondary-btn" href={`/assessment-packages?package=${assignment.packageId}`}>
                <PackageCheck size={17} />
                Evaluation
              </a>
            </div>
          </article>
        ))}
        {!loading && filteredAssignments.length === 0 && (
          <article className="soft-card">
            <strong>No workload matched those filters.</strong>
            <p className="mt-2 text-sm text-edu-muted">Clear a filter or search a different grade, subject, teacher, or status.</p>
          </article>
        )}
      </section>
    </main>
  );
}

function MiniStat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-[22px] bg-[#f7f9ff] p-4 dark:bg-[#0d1628]">
      <Icon size={18} className="text-edu-blue" />
      <strong className="mt-2 block text-2xl text-[#151b2d] dark:text-[#edf3ff]">{value}</strong>
      <span className="text-xs font-black uppercase tracking-wide text-edu-muted">{label}</span>
    </div>
  );
}
