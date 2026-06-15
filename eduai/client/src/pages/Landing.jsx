import { Link } from "react-router-dom";
import { BarChart3, BookOpen, CheckCircle2, ClipboardList, Flame, ShieldCheck, Sparkles, Timer, Upload, UserRound } from "lucide-react";
import PromiAvatar from "../components/PromiAvatar.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";

const week = [
  ["Mon", "12", "done"],
  ["Tue", "13", "done"],
  ["Wed", "14", "active"],
  ["Thu", "15", "soon"],
  ["Fri", "16", "soon"]
];

export default function Landing({ theme, toggleTheme }) {
  return (
    <main className="app-shell">
      <div className="page-wrap justify-center">
        <div className="absolute right-4 top-4 z-20 sm:right-6 lg:right-8">
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} label />
        </div>
        <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-edu-blue shadow-sm">
              <Sparkles size={16} />
              Promi Bot learning companion
            </div>

            <div className="space-y-4">
              <h1 className="max-w-3xl text-5xl font-black leading-[1.02] tracking-normal text-[#151b2d] sm:text-6xl">
                EduAI
              </h1>
              <p className="max-w-2xl text-2xl font-black text-[#151b2d]">
                Practice smarter. Analyze faster. Improve daily.
              </p>
              <p className="max-w-2xl text-base leading-7 text-slate-600">
                A school-focused learning app where students revise, take mini mocks, ask Promi for help,
                and turn mistakes into a clear improvement plan.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Link className="primary-btn" to="/student"><UserRound size={18} /> Student Login</Link>
              <Link className="secondary-btn" to="/teacher"><Upload size={18} /> Teacher Login</Link>
              <Link className="secondary-btn" to="/admin"><ShieldCheck size={18} /> Admin Login</Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["Mock ready", "10 min", Timer, "bg-[#e7f0ff]"],
                ["Mistakes fixed", "11", CheckCircle2, "bg-[#dff8ec]"],
                ["Study streak", "5 days", Flame, "bg-[#fff4cf]"]
              ].map(([label, value, Icon, tone]) => (
                <div key={label} className={`rounded-[26px] border border-white p-4 shadow-sm ${tone}`}>
                  <Icon size={20} className="text-[#151b2d]" />
                  <strong className="mt-3 block text-lg text-[#151b2d]">{value}</strong>
                  <span className="text-sm font-bold text-slate-500">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-[0.9fr_1.1fr] md:items-center">
            <div className="rounded-[38px] border-[10px] border-white bg-[#f7f9ff] p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-black text-slate-500">Good morning</span>
                  <h2 className="text-2xl font-black text-[#151b2d]">Aarav</h2>
                </div>
                <span className="rounded-2xl bg-[#fff4cf] px-3 py-2 text-sm font-black text-[#8b6100]">5 streak</span>
              </div>

              <div className="mt-5 flex justify-between gap-2">
                {week.map(([day, date, state]) => (
                  <div key={date} className={`grid flex-1 place-items-center rounded-2xl px-2 py-3 text-center ${state === "active" ? "bg-[#151b2d] text-white" : state === "done" ? "bg-[#dff8ec] text-[#151b2d]" : "bg-white text-slate-400"}`}>
                    <span className="text-xs font-black">{day}</span>
                    <strong>{date}</strong>
                  </div>
                ))}
              </div>

              <section className="mt-5 rounded-[30px] bg-gradient-to-br from-[#7f7cff] via-[#4ca7ff] to-[#52d6a7] p-5 text-white">
                <div className="flex items-center gap-4">
                  <PromiAvatar size="sm" />
                  <div>
                    <strong className="block text-lg">Ready to focus?</strong>
                    <p className="text-sm text-white/80">Multi-subject mini mocks are waiting.</p>
                  </div>
                </div>
                <Link to="/mock" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white py-3 font-black text-[#151b2d]">
                  <Timer size={17} />
                  Start mock session
                </Link>
              </section>
            </div>

            <div className="space-y-4">
              <section className="paper-card rounded-[34px] border border-white p-5 shadow-soft">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-black uppercase tracking-wide text-[#7967e8]">Learning Overview</span>
                    <h2 className="mt-2 text-3xl font-black text-[#151b2d]">70%</h2>
                  </div>
                  <BarChart3 size={28} className="text-[#7967e8]" />
                </div>
                <div className="mt-5 grid h-28 grid-cols-7 items-end gap-2">
                  {[42, 58, 46, 64, 88, 52, 70].map((height, index) => (
                    <span key={index} className="mini-bar" style={{ height: `${height}%` }} />
                  ))}
                </div>
              </section>

              {[
                ["Study Library", "Teacher notes and papers", BookOpen, "bg-[#e7f0ff]"],
                ["Mistake Notebook", "Fix what cost marks", ClipboardList, "bg-[#ffe7e2]"]
              ].map(([title, body, Icon, tone]) => (
                <div key={title} className={`rounded-[30px] border border-white p-5 shadow-sm ${tone}`}>
                  <Icon size={22} className="text-[#151b2d]" />
                  <strong className="mt-3 block text-lg text-[#151b2d]">{title}</strong>
                  <p className="text-sm font-semibold text-slate-500">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
