import { Brain, CalendarClock, NotebookPen, RotateCcw, Target } from "lucide-react";
import MetricCard from "../components/MetricCard.jsx";
import { mistakes } from "../data/sampleData.js";

export default function MistakeNotebook() {
  return (
    <main className="feature-fill grid gap-5 xl:grid-cols-[0.72fr_1.28fr]">
      <section className="space-y-5">
        <div className="paper-card rounded-[38px] border border-white p-6 shadow-soft">
          <span className="text-sm font-black uppercase tracking-wide text-[#7967e8]">Mistake Notebook</span>
          <h1 className="mt-2 text-3xl font-black text-[#151b2d]">Learn from your own attempts</h1>
          <p className="mt-2 text-edu-muted">Promi saves wrong answers as useful practice signals, not judgments.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <MetricCard label="Mistakes saved" value="18" hint="this term" tone="rose" />
          <MetricCard label="Fixed on retry" value="11" hint="61% recovered" tone="green" />
          <MetricCard label="Top type" value="Concept" hint="probability" tone="blue" />
          <MetricCard label="Next retest" value="3d" hint="recommended" tone="lavender" />
        </div>

        <section className="soft-card">
          <CalendarClock size={22} className="text-edu-blue" />
          <strong className="mt-3 block text-xl text-[#151b2d] dark:text-[#edf3ff]">Retry schedule</strong>
          <div className="mt-4 space-y-3">
            {["Today: Complement probability", "Tomorrow: Algebra sign errors", "Friday: Mixed mini mock"].map((item) => (
              <p key={item} className="rounded-2xl bg-[#f7f9ff] p-3 text-sm font-bold text-slate-600 dark:bg-[#0d1628] dark:text-[#aebbd0]">{item}</p>
            ))}
          </div>
        </section>
      </section>

      <section className="space-y-4">
        {mistakes.map((mistake) => (
          <article key={mistake.id} className="soft-card">
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#ffe7e2] text-[#d75848]">
                <NotebookPen size={21} />
              </span>
              <div className="min-w-0 flex-1">
                <span className="text-sm font-black uppercase tracking-wide text-edu-muted">{mistake.mistakeType}</span>
                <h2 className="mt-1 text-xl font-black">{mistake.subject}: {mistake.chapter}</h2>
                <p className="mt-2 text-slate-600">{mistake.feedback}</p>
                <div className="mt-4 rounded-[24px] bg-[#e7f0ff] p-4">
                  <div className="flex items-center gap-2">
                    <Brain size={17} className="text-edu-blue" />
                    <strong>Suggested practice</strong>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{mistake.nextStep}</p>
                </div>
              </div>
            </div>
          </article>
        ))}
        <div className="grid gap-4 lg:grid-cols-2">
          <article className="soft-card">
            <RotateCcw size={22} className="text-edu-green" />
            <strong className="mt-3 block text-xl text-[#151b2d] dark:text-[#edf3ff]">Recovery loop</strong>
            <p className="mt-2 text-sm text-edu-muted">Wrong answer, concept tag, Promi hint, retry, then mark as fixed.</p>
          </article>
          <article className="soft-card">
            <Target size={22} className="text-[#7967e8]" />
            <strong className="mt-3 block text-xl text-[#151b2d] dark:text-[#edf3ff]">Next goal</strong>
            <p className="mt-2 text-sm text-edu-muted">Fix 3 probability mistakes before the next arena challenge.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
