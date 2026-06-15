import { BookOpen, Clock3, FileText, Search, Star, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { chapters, resources, subjects } from "../data/sampleData.js";

export default function StudyLibrary() {
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("All");

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchesSubject = subject === "All" || resource.subject === subject;
      const matchesQuery = `${resource.title} ${resource.chapter} ${resource.type}`.toLowerCase().includes(query.toLowerCase());
      return matchesSubject && matchesQuery;
    });
  }, [query, subject]);

  return (
    <main className="feature-fill grid gap-5 xl:grid-cols-[0.72fr_1.28fr]">
      <section className="space-y-5">
        <div className="rounded-[38px] bg-gradient-to-br from-[#7f7cff] via-[#4ca7ff] to-[#52d6a7] p-6 text-white shadow-soft">
          <span className="text-sm font-black uppercase tracking-wide text-white/75">Study Library</span>
          <h1 className="mt-2 text-3xl font-black">Teacher-approved learning material</h1>
          <p className="mt-2 text-white/80">Find notes, previous questions, sample answers and practice resources by subject and chapter.</p>
        </div>

        <div className="paper-card rounded-[30px] border border-white p-5 shadow-soft">
          <label className="flex items-center gap-3">
            <Search size={18} className="text-edu-blue" />
            <input className="field" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search resources" />
          </label>
          <div className="mt-4 flex flex-wrap gap-2">
            {["All", ...subjects.map((item) => item.name)].map((item) => (
              <button key={item} onClick={() => setSubject(item)} className={subject === item ? "primary-btn min-h-10" : "secondary-btn min-h-10"}>
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3">
          {subjects.map((item) => (
            <article key={item.id} className={`study-stack-card rounded-[30px] border border-white p-5 shadow-sm ${item.color}`}>
              <BookOpen size={22} className="text-[#151b2d]" />
              <strong className="mt-3 block text-lg text-[#151b2d]">{item.name}</strong>
              <p className="text-sm text-edu-muted">Grade {item.grade}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div className="soft-card">
          <h2 className="text-xl font-black">Chapters</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {chapters.map((chapter) => (
              <div key={chapter.id} className="rounded-[24px] bg-[#f7f9ff] p-4">
                <strong>{chapter.name}</strong>
                <p className="text-sm text-edu-muted">Ready for notes, mock tests and Promi help</p>
              </div>
            ))}
          </div>
        </div>

        <div className="soft-card">
          <h2 className="text-xl font-black">Resources</h2>
          <div className="mt-4 grid gap-3 2xl:grid-cols-2">
            {filteredResources.map((resource) => (
              <article key={resource.id} className="flex items-center gap-4 rounded-[26px] border border-white bg-[#fbfcff] p-4 shadow-sm">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e7f0ff] text-edu-blue">
                  <FileText size={21} />
                </span>
                <div className="min-w-0 flex-1">
                  <strong>{resource.title}</strong>
                  <p className="text-sm text-edu-muted">{resource.subject} - {resource.chapter} - {resource.type}</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-edu-green">{resource.uploadedBy}</span>
              </article>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <article className="soft-card">
            <Clock3 size={22} className="text-edu-blue" />
            <strong className="mt-3 block text-lg text-[#151b2d] dark:text-[#edf3ff]">Recently opened</strong>
            <p className="mt-2 text-sm text-edu-muted">Maths notes, science diagrams, reading inference and writing guides.</p>
          </article>
          <article className="soft-card">
            <Star size={22} className="text-[#8b6100]" />
            <strong className="mt-3 block text-lg text-[#151b2d] dark:text-[#edf3ff]">Recommended next</strong>
            <p className="mt-2 text-sm text-edu-muted">Open teacher sample answers before retrying the 10-minute mock.</p>
          </article>
          <article className="soft-card">
            <TrendingUp size={22} className="text-edu-green" />
            <strong className="mt-3 block text-lg text-[#151b2d] dark:text-[#edf3ff]">Study signal</strong>
            <p className="mt-2 text-sm text-edu-muted">Resources with solved examples improved mock accuracy by 9% this week.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
