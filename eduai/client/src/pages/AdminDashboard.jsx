import { useEffect, useState } from "react";
import { AlertTriangle, BarChart3, BookOpen, BriefcaseBusiness, FileLock2, LineChart, PackageCheck, ShieldCheck, Target, Users } from "lucide-react";
import MetricCard from "../components/MetricCard.jsx";
import { fetchAssessmentPackages, fetchEvaluationVault, fetchTeacherWorkloadSummary } from "../utils/api.js";

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({
    teachers: "-",
    progress: "0%",
    hodReviews: "-",
    auditEntries: "-"
  });

  useEffect(() => {
    let mounted = true;
    async function loadMetrics() {
      try {
        const [workloadData, packagesData, vaultData] = await Promise.all([
          fetchTeacherWorkloadSummary(),
          fetchAssessmentPackages(),
          fetchEvaluationVault()
        ]);
        if (!mounted) return;
        const readyPackages = (packagesData.packages || []).filter((item) => item.readiness?.isReady).length;
        setMetrics({
          teachers: workloadData.summary?.totalTeachers ?? "-",
          progress: `${workloadData.summary?.progress ?? 0}%`,
          hodReviews: workloadData.summary?.pendingHodReviews ?? 0,
          auditEntries: vaultData.audit?.length ?? readyPackages
        });
      } catch {
        if (mounted) {
          setMetrics({ teachers: "-", progress: "0%", hodReviews: "-", auditEntries: "-" });
        }
      }
    }
    loadMetrics();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="feature-fill grid gap-5 xl:grid-cols-[0.78fr_1.22fr]">
      <section className="space-y-5">
        <div className="rounded-[38px] bg-[#151b2d] p-6 text-white shadow-soft">
          <span className="text-sm font-black uppercase tracking-wide text-white/70">Admin / HOD Dashboard</span>
          <h1 className="mt-2 text-3xl font-black">Govern marking quality</h1>
          <p className="mt-2 text-white/75">See workload pressure, HOD review queues, evaluation readiness, and audit coverage without entering the teacher flow.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <MetricCard label="Teachers" value={metrics.teachers} hint="assigned" tone="blue" />
          <MetricCard label="Progress" value={metrics.progress} hint="scripts checked" tone="green" />
          <MetricCard label="HOD Reviews" value={metrics.hodReviews} hint="pending" tone="lavender" />
          <MetricCard label="Vault Logs" value={metrics.auditEntries} hint="recorded" tone="rose" />
        </div>
        <section className="soft-card">
          <div className="flex items-center gap-3">
            <ShieldCheck size={22} className="text-edu-green" />
            <div>
              <strong>Governance scope</strong>
              <p className="mt-1 text-sm text-edu-muted">HOD view stays focused on oversight: workload pressure, review queues, audit logs, and intervention planning.</p>
            </div>
          </div>
        </section>
      </section>

      <section className="space-y-5">
        <div className="paper-card rounded-[30px] border border-white p-5 shadow-soft">
          <div className="flex items-center gap-2">
            <LineChart size={19} className="text-edu-blue" />
            <h2 className="text-xl font-black">Subject performance</h2>
          </div>
          <div className="mt-5 grid h-64 grid-cols-5 items-end gap-3">
            {[
              ["Math", 72],
              ["Physics", 68],
              ["English", 81],
              ["Chem", 64],
              ["Bio", 76]
            ].map(([label, value]) => (
              <div key={label} className="grid gap-2 text-center">
                <div className="rounded-t-2xl bg-gradient-to-t from-[#7f7cff] via-[#4ca7ff] to-[#52d6a7]" style={{ height: `${value * 2}px` }} />
                <strong className="text-sm text-edu-muted">{label}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {[
            [BriefcaseBusiness, "Teacher Workload", "Track grading queues, checked scripts and pending HOD review.", "/teacher-workload"],
            [Users, "Manage Students", "Import roster files and keep grade-section student records ready for evaluation.", "/manage-students"],
            [PackageCheck, "Evaluation", "Confirm question papers, marking schemes, scripts, Vault lock and AI review readiness.", "/assessment-packages"],
            [FileLock2, "Evaluation Vault", "Inspect audit logs, AI evaluation records, and student group mappings.", "/evaluation-vault"],
            [Users, "Student Groups", "Vault stores grade, section, subject, and assigned-teacher mappings for audit lookup.", "/evaluation-vault"],
            [BookOpen, "Library Coverage", "Confirm question papers and marking schemes exist before evaluations start.", "/admin/sources"],
            [BarChart3, "Progress Trend", "Watch script completion and review movement across teachers.", "/teacher-workload"],
            [Target, "Recommended Action", "Clear HOD review pending items before final marks are locked."]
          ].map(([Icon, title, body, href]) => (
            <article key={title} className="soft-card study-stack-card">
              <Icon size={22} className="text-edu-blue" />
              <strong className="mt-3 block">{title}</strong>
              <p className="mt-1 text-sm text-edu-muted">{body}</p>
              {href && <a className="mt-4 inline-flex text-sm font-black text-edu-blue" href={href}>Open</a>}
            </article>
          ))}
        </div>

        <section className="soft-card bg-amber-50">
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-amber-700" />
            <strong>Keep MVP scope focused</strong>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Operational teacher tools stay in the teacher workspace. This console stays focused on governance, trends and intervention planning.
          </p>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {["Grade 10A intervention", "Mock dip alert", "Resource gap"].map((item) => (
            <article key={item} className="soft-card">
              <Target size={20} className="text-edu-blue" />
              <strong className="mt-3 block text-[#151b2d] dark:text-[#edf3ff]">{item}</strong>
              <p className="mt-2 text-sm text-edu-muted">Ready for HOD review in the next academic sync.</p>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}
