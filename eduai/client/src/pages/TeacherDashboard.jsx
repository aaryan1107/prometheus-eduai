import { useEffect, useMemo, useState } from "react";
import { BookOpen, BriefcaseBusiness, CalendarCheck, ClipboardList, Database, FileLock2, PackageCheck, Upload, Users } from "lucide-react";
import DashboardCard from "../components/DashboardCard.jsx";
import MetricCard from "../components/MetricCard.jsx";
import { fetchAssessmentPackages, fetchEvaluationVault, fetchSources, fetchTeacherWorkloadSummary } from "../utils/api.js";

export default function TeacherDashboard() {
  const [dashboard, setDashboard] = useState({
    sourceCount: "-",
    scriptsToReview: "-",
    readyPackages: "-",
    auditEntries: "-"
  });

  useEffect(() => {
    let mounted = true;
    async function loadDashboard() {
      try {
        const [sourcesData, packagesData, workloadData, vaultData] = await Promise.all([
          fetchSources(),
          fetchAssessmentPackages(),
          fetchTeacherWorkloadSummary(),
          fetchEvaluationVault()
        ]);
        if (!mounted) return;
        const packages = packagesData.packages || [];
        setDashboard({
          sourceCount: sourcesData.sources?.length ?? 0,
          scriptsToReview: workloadData.summary?.pendingScripts ?? workloadData.summary?.activeGradingTasks ?? 0,
          readyPackages: packages.filter((item) => item.readiness?.isReady).length,
          auditEntries: vaultData.audit?.length ?? 0
        });
      } catch {
        if (mounted) {
          setDashboard({
            sourceCount: "-",
            scriptsToReview: "-",
            readyPackages: "-",
            auditEntries: "-"
          });
        }
      }
    }
    loadDashboard();
    return () => {
      mounted = false;
    };
  }, []);

  const focusItems = useMemo(() => ([
    ["Package readiness", "Evaluation", "Attach question paper, marking scheme, and student answer script before Promi reviews."],
    ["Vault discipline", "Audit", "Lock checked answer scripts before AI analysis so every decision has a trace."],
    ["Workload movement", "Teacher", "Use Workload to see which scripts are pending, AI reviewed, HOD pending, or finalized."]
  ]), []);

  return (
    <main className="teacher-grid">
      <section className="teacher-main-col">
        <div className="rounded-[38px] bg-[#151b2d] p-6 text-white shadow-soft">
          <span className="text-sm font-black uppercase tracking-wide text-white/70">Teacher Dashboard</span>
          <h1 className="mt-2 text-3xl font-black">Run the teacher workflow</h1>
          <p className="mt-2 text-white/75">Library feeds Evaluation, Evaluation records into Vault, and Workload tracks who still needs to finish marking.</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <DashboardCard tone="blue" icon={Database} title="Library" body="Upload, drag-drop, search, comment, view, and manage study material." action="Open library" to="/sources" />
          <DashboardCard tone="gold" icon={Users} title="Students" body="Import class rosters so Evaluation and Vault can track students by grade and section." action="Manage students" to="/manage-students" />
          <DashboardCard tone="lavender" icon={PackageCheck} title="Evaluation" body="Create the package, attach files, lock scripts, and start Promi AI evaluation." action="Open evaluation" to="/assessment-packages" />
          <DashboardCard tone="green" icon={BriefcaseBusiness} title="Workload" body="Track assigned assessments, pending scripts, AI-reviewed work, and HOD review status." action="Open workload" to="/teacher-workload" />
          <DashboardCard tone="rose" icon={FileLock2} title="Evaluation Vault" body="Review audit logs, AI evaluation records, and student group mappings." action="Open vault" to="/evaluation-vault" />
        </div>

        <section className="grid gap-4 xl:grid-cols-3">
          {focusItems.map(([title, group, body]) => (
            <article key={title} className="soft-card min-h-[150px]">
              <span className="text-sm font-black uppercase tracking-wide text-edu-blue">{group}</span>
              <strong className="mt-2 block text-xl text-[#151b2d] dark:text-[#edf3ff]">{title}</strong>
              <p className="mt-2 text-sm text-edu-muted">{body}</p>
            </article>
          ))}
        </section>
      </section>

      <aside className="teacher-side-col">
        <div className="grid grid-cols-2 gap-4">
          <MetricCard label="Library" value={dashboard.sourceCount} hint="uploaded" tone="blue" />
          <MetricCard label="Scripts" value={dashboard.scriptsToReview} hint="pending" tone="green" />
          <MetricCard label="Evaluation" value={dashboard.readyPackages} hint="ready" tone="lavender" />
          <MetricCard label="Vault" value={dashboard.auditEntries} hint="audit logs" tone="rose" />
        </div>

        <section className="paper-card rounded-[30px] border border-white p-5 shadow-soft">
          <div className="flex items-center gap-2">
            <BookOpen size={19} className="text-edu-blue" />
            <h2 className="text-xl font-black">Quick resource route</h2>
          </div>
          <div className="mt-4 grid gap-3">
            <input className="field" placeholder="Student or class" />
            <select className="field" defaultValue="Mathematics">
              <option>Mathematics</option>
              <option>Physics</option>
              <option>English</option>
            </select>
            <select className="field" defaultValue="Notes">
              <option>Notes</option>
              <option>Question Bank</option>
              <option>Formula Sheet</option>
              <option>Guide</option>
            </select>
            <a className="primary-btn" href="/sources"><Upload size={17} /> Open full library</a>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
          <article className="soft-card">
            <div className="flex items-center gap-3">
              <CalendarCheck size={20} className="text-edu-green" />
              <strong>Today's teaching queue</strong>
            </div>
            <div className="mt-4 space-y-3">
              {["Upload or select package files", "Run Promi AI evaluation", "Check Vault audit trail"].map((item) => (
                <div key={item} className="rounded-2xl bg-[#eef3ff] px-4 py-3 text-sm font-bold text-slate-600 dark:bg-[#0d1628] dark:text-[#aebbd0]">
                  {item}
                </div>
              ))}
            </div>
          </article>
          <article className="soft-card">
            <div className="flex items-center gap-3">
              <ClipboardList size={20} className="text-[#7967e8]" />
              <strong>Marking queue</strong>
            </div>
            <div className="mt-4 grid gap-3">
              <a href="/assessment-packages" className="rounded-2xl bg-[#f7f9ff] px-4 py-3 text-left text-sm font-black text-[#151b2d] dark:bg-[#0d1628] dark:text-[#edf3ff]">Create evaluation package</a>
              <a href="/teacher-workload" className="rounded-2xl bg-[#f7f9ff] px-4 py-3 text-left text-sm font-black text-[#151b2d] dark:bg-[#0d1628] dark:text-[#edf3ff]">Review workload status</a>
              <a href="/evaluation-vault" className="rounded-2xl bg-[#f7f9ff] px-4 py-3 text-left text-sm font-black text-[#151b2d] dark:bg-[#0d1628] dark:text-[#edf3ff]">Open evaluation vault</a>
            </div>
          </article>
        </section>
      </aside>
    </main>
  );
}
