import { useState } from "react";
import { Brain, CheckCircle2, FileText, Lightbulb, Loader2, NotebookPen, Send, Sparkles, Target } from "lucide-react";
import PromiAvatar from "../components/PromiAvatar.jsx";
import { promiChat } from "../utils/api.js";
import { mistakes } from "../data/sampleData.js";

const gradeOptions = [
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
  "SAT / External Exam"
];

const subjectOptions = [
  "General Study Help",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "History",
  "Geography",
  "Economics",
  "Computer Science",
  "SAT Preparation"
];

const modeOptions = [
  ["doubt", "Doubt Solver"],
  ["mock_test_guide", "Mock Test Guide"],
  ["mistake_analyzer", "Mistake Analyzer"],
  ["revision_planner", "Revision Planner"],
  ["exam_strategy", "Exam Strategy"],
  ["motivation_coach", "Motivation Coach"],
  ["topper_strategy", "Topper Strategy"]
];

const suggestedPrompts = [
  ["Explain Newton's laws with an example", Lightbulb, { grade: "Grade 9", subject: "Physics", chapter: "Motion", mode: "doubt" }],
  ["Help me revise chemical bonding", NotebookPen, { grade: "Grade 10", subject: "Chemistry", chapter: "Chemical Bonding", mode: "revision_planner" }],
  ["Create a 3-day SAT reading plan", Target, { grade: "SAT / External Exam", subject: "SAT Preparation", chapter: "Reading", mode: "revision_planner" }],
  ["Analyze why I keep losing marks in geometry", Brain, { grade: "Grade 10", subject: "Mathematics", chapter: "Geometry", mode: "mistake_analyzer" }],
  ["Give me a short biology quiz on cells", Brain, { grade: "Grade 9", subject: "Biology", chapter: "Cell Structure", mode: "mock_test_guide" }],
  ["Explain how to write better English answers", Lightbulb, { grade: "Grade 10", subject: "English", chapter: "Writing Skills", mode: "exam_strategy" }],
  ["Help me plan revision for tomorrow's test", Target, { grade: "Grade 10", subject: "General Study Help", chapter: "General", mode: "revision_planner" }],
  ["Explain electricity in simple words", Lightbulb, { grade: "Grade 10", subject: "Physics", chapter: "Electricity", mode: "doubt" }],
  ["Help me understand photosynthesis", Lightbulb, { grade: "Grade 9", subject: "Biology", chapter: "Photosynthesis", mode: "doubt" }],
  ["Make a quick revision plan for History", Target, { grade: "Grade 10", subject: "History", chapter: "General", mode: "revision_planner" }],
  ["Give me 5 practice questions on algebra", Brain, { grade: "Grade 10", subject: "Mathematics", chapter: "Algebra", mode: "mock_test_guide" }],
  ["Help me improve time management in exams", Target, { grade: "Grade 10", subject: "General Study Help", chapter: "Exam Strategy", mode: "exam_strategy" }]
];

export default function PromiBot() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi, I am Promi. Choose a subject or keep it general, then ask me a doubt, mistake, mock, or revision question."
    }
  ]);
  const [message, setMessage] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("Grade 10");
  const [selectedSubject, setSelectedSubject] = useState("General Study Help");
  const [selectedChapter, setSelectedChapter] = useState("General");
  const [selectedMode, setSelectedMode] = useState("doubt");
  const [promiMode, setPromiMode] = useState("normal");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text = message, overrides = {}) => {
    const clean = text.trim();
    if (!clean || loading) return;

    const nextContext = {
      grade: overrides.grade || selectedGrade,
      subject: overrides.subject || selectedSubject,
      chapter: overrides.chapter || selectedChapter || "General",
      mode: overrides.mode || selectedMode
    };

    setMessages((current) => [...current, { role: "user", content: clean }]);
    setMessage("");
    setSelectedGrade(nextContext.grade);
    setSelectedSubject(nextContext.subject);
    setSelectedChapter(nextContext.chapter);
    setSelectedMode(nextContext.mode);
    setLoading(true);

    try {
      const data = await promiChat({
        message: clean,
        context: {
          role: "student",
          grade: nextContext.grade,
          subject: nextContext.subject,
          chapter: nextContext.chapter || "General",
          recentMistakes: mistakes.slice(0, 2),
          mode: nextContext.mode,
          promiMode
        }
      });
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: data.reply,
          actions: data.suggestedActions || [],
          citations: data.citations || [],
          grounding: data.grounding,
          source: data.source,
          modelMode: data.modelMode,
          model: data.model
        }
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: `Promi is offline right now, but here is a basic next step for ${nextContext.subject}: review the relevant notes, identify one unclear point, and try one similar question.`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="feature-fill grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
      <section className="space-y-5">
        <div className="overflow-hidden rounded-[38px] bg-gradient-to-br from-[#7f7cff] via-[#4ca7ff] to-[#52d6a7] p-6 text-white shadow-soft">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-sm font-black uppercase tracking-wide text-white/75">Promi Bot</span>
              <h1 className="mt-2 text-3xl font-black leading-tight">Your multi-subject study robot is online</h1>
              <p className="mt-3 text-white/80">
                Pick any subject, set the topic, and Promi will adapt the answer instead of assuming Probability.
              </p>
            </div>
            <PromiAvatar />
          </div>
        </div>

        <section className="paper-card rounded-[30px] border border-white p-5 shadow-soft">
          <span className="text-sm font-black uppercase tracking-wide text-[#7967e8]">Study context</span>
          <div className="mt-3 grid gap-3">
            <select className="field" value={selectedGrade} onChange={(event) => setSelectedGrade(event.target.value)}>
              {gradeOptions.map((grade) => <option key={grade}>{grade}</option>)}
            </select>
            <select className="field" value={selectedSubject} onChange={(event) => setSelectedSubject(event.target.value)}>
              {subjectOptions.map((subject) => <option key={subject}>{subject}</option>)}
            </select>
            <input
              className="field"
              value={selectedChapter}
              onChange={(event) => setSelectedChapter(event.target.value)}
              placeholder="Chapter / Topic"
            />
          </div>

          <span className="mt-5 block text-sm font-black uppercase tracking-wide text-[#7967e8]">Mode</span>
          <div className="mt-3 flex flex-wrap gap-2">
            {modeOptions.map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedMode(key)}
                className={`rounded-full px-4 py-2 text-sm font-black ${selectedMode === key ? "bg-[#151b2d] text-white" : "bg-white text-slate-600"}`}
              >
                {label}
              </button>
            ))}
          </div>

          <span className="mt-5 block text-sm font-black uppercase tracking-wide text-[#7967e8]">Model</span>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {[
              ["normal", "Normal", "gemma:2b"],
              ["fast", "Fast", "gemma3:1b"]
            ].map(([key, label, model]) => (
              <button
                key={key}
                type="button"
                onClick={() => setPromiMode(key)}
                className={`rounded-2xl px-4 py-3 text-sm font-black ${promiMode === key ? "bg-[#151b2d] text-white" : "bg-white text-slate-600 dark:bg-[#0d1628] dark:text-[#aebbd0]"}`}
              >
                {label}
                <span className="mt-1 block text-xs opacity-70">{model}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="soft-card">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-[#7967e8]" />
            <h2 className="text-xl font-black text-[#151b2d]">Quick starts</h2>
          </div>
          <div className="mt-4 grid gap-3">
            {suggestedPrompts.map(([prompt, Icon, promptContext]) => (
              <button
                key={prompt}
                type="button"
                onClick={() => sendMessage(prompt, promptContext)}
                className="flex items-center gap-3 rounded-[24px] border border-white bg-[#f7f9ff] p-4 text-left font-black text-[#151b2d] transition hover:-translate-y-0.5 hover:bg-[#e7f0ff]"
              >
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-edu-blue shadow-sm">
                  <Icon size={18} />
                </span>
                <span>{prompt}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="soft-card">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={20} className="text-edu-green" />
            <strong>Promi memory for this session</strong>
          </div>
          <div className="mt-4 grid gap-3">
            {[selectedGrade, `Subject: ${selectedSubject}`, `Focus: ${selectedChapter || "General"}`, "Tone: hints before answers"].map((item) => (
              <span key={item} className="rounded-2xl bg-[#eef3ff] px-4 py-3 text-sm font-black text-slate-600 dark:bg-[#0d1628] dark:text-[#aebbd0]">{item}</span>
            ))}
          </div>
        </section>
      </section>

      <section className="soft-card flex min-h-[660px] flex-col bg-[#fbfcff]">
        <div className="flex items-center justify-between gap-4 border-b border-edu-line pb-4">
          <div className="flex items-center gap-3">
            <PromiAvatar size="sm" />
            <div>
              <h2 className="text-xl font-black text-[#151b2d]">Chat with Promi</h2>
              <p className="text-sm font-semibold text-edu-muted">Local Ollama with trusted source citations when available.</p>
            </div>
          </div>
          <span className="hidden rounded-full bg-[#dff8ec] px-3 py-1 text-sm font-black text-edu-green sm:inline-flex">encouraging</span>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto py-5">
          {messages.map((item, index) => (
            <div key={`${item.role}-${index}`} className={`soft-pop flex ${item.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[84%] rounded-[28px] px-5 py-4 ${item.role === "user" ? "bg-[#151b2d] text-white" : "paper-card border border-white text-[#151b2d] shadow-sm"}`}>
                <p className={item.role === "user" ? "text-white" : "text-slate-700"}>{item.content}</p>
                {item.role === "assistant" && item.grounding && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-wide text-edu-muted">
                    <FileText size={14} />
                    {item.grounding.usedSources ? `${item.grounding.sourceCount} verified source${item.grounding.sourceCount === 1 ? "" : "s"} used` : "No verified source used"}
                    {item.modelMode && <span className="normal-case tracking-normal">via {item.modelMode}</span>}
                  </div>
                )}
                {item.citations?.length > 0 && (
                  <div className="mt-3 grid gap-2">
                    {item.citations.slice(0, 3).map((citation) => (
                      <article key={`${citation.id}-${citation.chunkId}`} className="rounded-2xl border border-edu-line bg-[#f7f9ff] p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <strong className="text-sm text-[#151b2d]">[{citation.id}] {citation.title}</strong>
                          <span className="rounded-full bg-white px-2 py-1 text-[11px] font-black uppercase text-edu-blue">{citation.type}</span>
                        </div>
                        <p className="mt-2 text-xs leading-5 text-slate-600">{citation.snippet}</p>
                        {citation.url && (
                          <a className="mt-2 block break-all text-xs font-black text-edu-blue" href={citation.url} target="_blank" rel="noreferrer">
                            {citation.url}
                          </a>
                        )}
                      </article>
                    ))}
                  </div>
                )}
                {item.actions?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.actions.slice(0, 3).map((action) => (
                      <span key={action} className="rounded-full bg-white px-3 py-1 text-xs font-black text-edu-blue">{action}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-sm font-bold text-edu-muted">
              <Loader2 size={16} className="animate-spin" />
              Promi is thinking
            </div>
          )}
        </div>

        <form
          className="mt-4 flex gap-3 rounded-[28px] border border-edu-line bg-white p-2 shadow-sm"
          onSubmit={(event) => {
            event.preventDefault();
            sendMessage();
          }}
        >
          <input
            className="min-h-12 flex-1 rounded-2xl border-0 px-4 outline-none"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Ask Promi a doubt or paste your mistake..."
          />
          <button className="primary-btn px-4" type="submit" disabled={loading}>
            <Send size={18} />
          </button>
        </form>
      </section>
    </main>
  );
}
