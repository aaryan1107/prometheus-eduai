import { Award, Flame, Medal, ShieldCheck, Target, Trophy } from "lucide-react";
import { arenaHighlights, topperStrategy } from "../data/sampleData.js";

export default function Arena() {
  return (
    <main className="feature-fill grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
      <section className="space-y-5">
        <div className="rounded-[38px] bg-gradient-to-br from-[#7f7cff] via-[#4ca7ff] to-[#52d6a7] p-6 text-white shadow-soft">
          <span className="text-sm font-black uppercase tracking-wide text-white/75">EduAI Arena</span>
          <h1 className="mt-2 text-4xl font-black">Healthy competition, not pressure.</h1>
          <p className="mt-3 text-white/80">Arena celebrates improvement, accuracy, consistency and comeback, not only rank.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {arenaHighlights.map((item) => (
            <article key={item.badge} className="soft-card study-stack-card">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#fff4cf] text-[#8b6100]">
                <Award size={22} />
              </span>
              <strong className="mt-4 block text-xl text-[#151b2d] dark:text-[#edf3ff]">{item.badge}</strong>
              <p className="mt-1 font-black text-edu-blue">{item.name} - {item.change}</p>
              <p className="mt-2 text-sm text-edu-muted">{item.note}</p>
            </article>
          ))}
        </div>

        <section className="grid gap-4 lg:grid-cols-3">
          {[
            [Medal, "Comeback score", "Rewards improvement after mistakes."],
            [ShieldCheck, "No toxic ranking", "Private progress signals stay personal."],
            [Target, "Weekly challenge", "Beat your own best by 5%."]
          ].map(([Icon, title, body]) => (
            <article key={title} className="soft-card">
              <Icon size={22} className="text-edu-blue" />
              <strong className="mt-3 block text-lg text-[#151b2d] dark:text-[#edf3ff]">{title}</strong>
              <p className="mt-2 text-sm text-edu-muted">{body}</p>
            </article>
          ))}
        </section>
      </section>

      <aside className="space-y-5">
        <section className="paper-card rounded-[34px] border border-white p-5 shadow-soft">
          <Trophy size={26} className="text-[#7967e8]" />
          <h2 className="mt-3 text-2xl font-black text-[#151b2d]">Topper Strategy Breakdown</h2>
          <div className="mt-5 space-y-3">
            {topperStrategy.map((item) => (
              <div key={item.step} className="rounded-[24px] bg-white p-4 dark:bg-[#0d1628]">
                <strong>{item.step}</strong>
                <p className="mt-1 text-sm text-edu-muted">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="soft-card bg-[#151b2d] text-white">
          <div className="flex items-center gap-3">
            <Flame className="text-[#fff4cf]" size={22} />
            <strong>Personal best focus</strong>
          </div>
          <p className="mt-3 text-sm text-white/75">Try beating your own previous accuracy by 5%, not someone else's score.</p>
          <div className="mt-4 rounded-2xl bg-white/10 p-4">
            <Target size={18} className="text-[#52d6a7]" />
            <p className="mt-2 text-sm text-white/75">Next target: 75% accuracy in probability mini mock.</p>
          </div>
        </section>

        <section className="soft-card">
          <strong className="text-[#151b2d] dark:text-[#edf3ff]">Season progress</strong>
          <div className="mt-4 grid gap-3">
            {["Accuracy badge: 70%", "Consistency badge: 5 days", "Comeback badge: 11 fixes"].map((item) => (
              <p key={item} className="rounded-2xl bg-[#f7f9ff] p-3 text-sm font-bold text-slate-600 dark:bg-[#0d1628] dark:text-[#aebbd0]">{item}</p>
            ))}
          </div>
        </section>
      </aside>
    </main>
  );
}
