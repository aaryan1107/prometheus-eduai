import { Link } from "react-router-dom";
import { Award, BookOpen, Bot, Brain, CheckCircle2, Flame, LineChart, NotebookPen, Timer, Trophy } from "lucide-react";
import DashboardCard from "../components/DashboardCard.jsx";
import MetricCard from "../components/MetricCard.jsx";
import PromiAvatar from "../components/PromiAvatar.jsx";
import { leaderboardPreview } from "../data/sampleData.js";

const focusCards = [
  ["Mathematics", "Algebra", "70% ready", "bg-[#e7f0ff]", "w-[70%]"],
  ["Physics", "Electricity", "64% ready", "bg-[#dff8ec]", "w-[64%]"],
  ["English", "Reading Skills", "84% ready", "bg-[#eeeaff]", "w-[84%]"]
];

export default function StudentDashboard() {
  return (
    <main className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
      <section className="space-y-6">
        <div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
          <section className="overflow-hidden rounded-[38px] bg-gradient-to-br from-[#7f7cff] via-[#4ca7ff] to-[#52d6a7] p-6 text-white shadow-soft">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-sm font-black uppercase tracking-wide text-white/75">Student Dashboard</span>
                <h1 className="mt-2 text-4xl font-black leading-tight">Hi Aarav, ready to learn today?</h1>
                <p className="mt-3 max-w-xl text-white/80">
                  Promi can help across maths, science, English, SAT prep and revision strategy.
                </p>
              </div>
              <PromiAvatar />
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link to="/mock" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white font-black text-[#151b2d]">
                <Timer size={18} /> Take 10-min mock
              </Link>
              <Link to="/promi" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white/20 font-black text-white backdrop-blur">
                <Bot size={18} /> Ask Promi
              </Link>
            </div>
          </section>

          <section className="paper-card rounded-[38px] border border-white p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-black uppercase tracking-wide text-[#7967e8]">Weekly overview</span>
                <h2 className="mt-2 text-3xl font-black text-[#151b2d]">5-day streak</h2>
              </div>
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#fff4cf] text-[#8b6100]">
                <Flame size={22} />
              </span>
            </div>
            <div className="mt-5 grid h-28 grid-cols-7 items-end gap-2">
              {[46, 62, 55, 70, 90, 58, 74].map((height, index) => (
                <div key={index} className="grid gap-2">
                  <span className="mini-bar" style={{ height: `${height}%` }} />
                  <small className="text-center text-xs font-black text-slate-400">{["M", "T", "W", "T", "F", "S", "S"][index]}</small>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <DashboardCard tone="blue" icon={BookOpen} title="Continue Learning" body="Teacher notes across subjects" action="Resume chapter" to="/library" />
          <DashboardCard tone="green" icon={Timer} title="Take Mock Test" body="10-minute focused practice" action="Start test" to="/mock" />
          <DashboardCard tone="lavender" icon={Bot} title="Ask Promi" body="Explain, revise, or analyze" action="Open chat" to="/promi" />
          <DashboardCard tone="green" icon={CheckCircle2} title="Source-backed Help" body="Promi cites trusted teacher notes when available" action="Ask with evidence" to="/promi" />
          <DashboardCard tone="rose" icon={NotebookPen} title="My Mistakes" body="3 saved mistakes need revision" action="Review notebook" to="/mistakes" />
          <DashboardCard tone="gold" icon={LineChart} title="Progress" body="Accuracy improved by 9%" action="See trend" to="/mistakes" />
          <DashboardCard tone="blue" icon={Trophy} title="EduAI Arena" body="Improve your personal best" action="View Arena" to="/arena" />
        </div>

        <section className="soft-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-sm font-black uppercase tracking-wide text-edu-green">Focus path</span>
              <h2 className="mt-1 text-2xl font-black text-[#151b2d]">Today's learning stack</h2>
            </div>
            <span className="rounded-full bg-[#dff8ec] px-4 py-2 text-sm font-black text-edu-green">3 subjects</span>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {focusCards.map(([subject, chapter, readiness, tone, width]) => (
              <article key={subject} className={`rounded-[30px] border border-white p-5 ${tone}`}>
                <BookOpen size={22} className="text-[#151b2d]" />
                <strong className="mt-4 block text-xl text-[#151b2d]">{subject}</strong>
                <p className="mt-1 text-sm font-bold text-slate-500">{chapter}</p>
                <div className="mt-5 h-2 rounded-full bg-white">
                  <div className={`h-2 rounded-full bg-[#151b2d] ${width}`} />
                </div>
                <span className="mt-3 block text-sm font-black text-slate-600">{readiness}</span>
              </article>
            ))}
          </div>
        </section>
      </section>

      <aside className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <MetricCard label="Latest score" value="7/10" hint="Algebra" tone="blue" />
          <MetricCard label="Accuracy" value="70%" hint="+9% this week" tone="green" />
          <MetricCard label="Fixed" value="11" hint="mistakes" tone="lavender" />
          <MetricCard label="Next focus" value="Q3" hint="Complement" tone="rose" />
        </div>

        <section className="soft-card bg-[#151b2d] text-white">
          <div className="flex items-center gap-2">
            <Award size={19} className="text-[#fff4cf]" />
            <h2 className="text-xl font-black">Healthy Arena</h2>
          </div>
          <div className="mt-4 space-y-3">
            {leaderboardPreview.map((item) => (
              <div key={item.label} className="rounded-[24px] bg-white/10 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <strong>{item.label}</strong>
                    <p className="text-sm text-white/70">{item.name} is building better habits.</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-sm font-black text-[#151b2d]">{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="paper-card rounded-[30px] border border-white p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <Brain size={20} className="text-[#7967e8]" />
            <strong>Promi says</strong>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            This looks like a concept mix-up, not a failure. Pick the subject, revise one weak idea, then try two similar questions.
          </p>
          <Link to="/promi" className="secondary-btn mt-4 w-full"><CheckCircle2 size={17} /> Open plan</Link>
        </section>
      </aside>
    </main>
  );
}
