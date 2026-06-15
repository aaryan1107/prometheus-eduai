import { useEffect, useMemo, useState } from "react";
import { Brain, CheckCircle2, Clock, FileText, Filter, Loader2, Target, Timer } from "lucide-react";
import { analyzeMock, fetchMockTests } from "../utils/api.js";

const allOption = "All";
const fallbackMockTests = [
  {
    id: "fallback-algebra",
    subject: "Mathematics",
    chapter: "Algebra",
    grade: "Grade 10",
    durationMinutes: 10,
    difficulty: "Core",
    testType: "Concept Check",
    questions: [
      {
        id: "fallback-alg-q1",
        question: "Solve: x + 4 = 10.",
        options: ["x = 4", "x = 5", "x = 6", "x = 14"],
        correctAnswer: "x = 6",
        concept: "Linear equations",
        solution: "Subtract 4 from both sides to get x = 6."
      }
    ]
  },
  {
    id: "fallback-physics",
    subject: "Physics",
    chapter: "Motion",
    grade: "Grade 9",
    durationMinutes: 10,
    difficulty: "Core",
    testType: "Concept Check",
    questions: [
      {
        id: "fallback-motion-q1",
        question: "What does speed measure?",
        options: ["Distance per time", "Mass per time", "Force only", "Temperature"],
        correctAnswer: "Distance per time",
        concept: "Speed",
        solution: "Speed measures how much distance is covered in a certain time."
      }
    ]
  },
  {
    id: "fallback-english",
    subject: "English",
    chapter: "Writing Skills",
    grade: "Grade 10",
    durationMinutes: 10,
    difficulty: "Core",
    testType: "Skill Drill",
    questions: [
      {
        id: "fallback-writing-q1",
        question: "What makes an answer stronger?",
        options: ["A clear point with evidence", "Only long words", "No explanation", "Repeating the question"],
        correctAnswer: "A clear point with evidence",
        concept: "Answer structure",
        solution: "Strong answers make a clear point, support it with evidence and explain the link."
      }
    ]
  }
];

export default function MockTest() {
  const [tests, setTests] = useState(fallbackMockTests);
  const [selectedTestId, setSelectedTestId] = useState(fallbackMockTests[0]?.id || "");
  const [filters, setFilters] = useState({
    grade: allOption,
    subject: allOption,
    chapter: allOption,
    testType: allOption
  });
  const [answers, setAnswers] = useState({});
  const [started, setStarted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchMockTests()
      .then((data) => {
        if (cancelled || !Array.isArray(data.tests) || data.tests.length === 0) return;
        setTests(data.tests);
        setSelectedTestId(data.tests[0].id);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedTest = tests.find((test) => test.id === selectedTestId) || tests[0];
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const options = useMemo(() => ({
    grade: uniqueOptions(tests.map((test) => test.grade)),
    subject: uniqueOptions(tests.map((test) => test.subject)),
    chapter: uniqueOptions(tests.map((test) => test.chapter)),
    testType: uniqueOptions(tests.map((test) => test.testType || "Concept Check"))
  }), [tests]);
  const filteredTests = useMemo(() => tests.filter((test) => (
    (filters.grade === allOption || test.grade === filters.grade)
    && (filters.subject === allOption || test.subject === filters.subject)
    && (filters.chapter === allOption || test.chapter === filters.chapter)
    && (filters.testType === allOption || (test.testType || "Concept Check") === filters.testType)
  )), [filters, tests]);

  const chooseTest = (test) => {
    setSelectedTestId(test.id);
    setAnswers({});
    setResult(null);
    setStarted(false);
  };

  const submit = async () => {
    setLoading(true);
    try {
      const data = await analyzeMock({
        studentAnswers: Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer })),
        test: selectedTest,
        timeTaken: `${selectedTest.durationMinutes || 10} min attempt`
      });
      setResult(data);
    } catch {
      setResult({
        score: 0,
        total: selectedTest.questions.length,
        accuracy: "0%",
        mistakes: [],
        overallFeedback: `Promi is offline right now, but you can still review your ${selectedTest.subject} - ${selectedTest.chapter} answers and retry the weak concept.`
      });
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return <MockResult result={result} test={selectedTest} answers={answers} onRetry={() => { setResult(null); setStarted(true); }} />;
  }

  return (
    <main className="feature-fill grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
      <section className="space-y-5">
        <div className="rounded-[38px] bg-[#151b2d] p-6 text-white shadow-soft">
          <span className="text-sm font-black uppercase tracking-wide text-white/70">EduAI Mock Lab</span>
          <h1 className="mt-2 text-3xl font-black">{selectedTest?.subject || "Mock Tests"}: {selectedTest?.chapter || "Choose a test"}</h1>
          <p className="mt-2 text-white/75">Pick any subject mock, answer the questions, and get Promi analysis.</p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-[24px] bg-white/10 p-4">
              <Timer size={22} className="text-[#fff4cf]" />
              <strong className="mt-3 block">{selectedTest?.durationMinutes || 0} min</strong>
              <p className="text-sm text-white/65">Duration</p>
            </div>
            <div className="rounded-[24px] bg-white/10 p-4">
              <CheckCircle2 size={22} className="text-[#52d6a7]" />
              <strong className="mt-3 block">{answeredCount}/{selectedTest?.questions?.length || 0}</strong>
              <p className="text-sm text-white/65">Answered</p>
            </div>
          </div>

          {!started ? (
            <button className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-white font-black text-[#151b2d]" onClick={() => setStarted(true)} disabled={!selectedTest}>
              <Timer size={18} /> Start selected test
            </button>
          ) : (
            <button className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-white font-black text-[#151b2d]" onClick={submit} disabled={loading || !selectedTest}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Brain size={18} />}
              Submit and analyze
            </button>
          )}
        </div>

        <section className="paper-card rounded-[30px] border border-white p-5 shadow-soft">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-[#7967e8]" />
            <span className="text-sm font-black uppercase tracking-wide text-[#7967e8]">Filters</span>
          </div>
          <div className="mt-4 grid gap-3">
            <FilterSelect label="Grade" value={filters.grade} options={options.grade} onChange={(value) => setFilters((current) => ({ ...current, grade: value }))} />
            <FilterSelect label="Subject" value={filters.subject} options={options.subject} onChange={(value) => setFilters((current) => ({ ...current, subject: value }))} />
            <FilterSelect label="Chapter" value={filters.chapter} options={options.chapter} onChange={(value) => setFilters((current) => ({ ...current, chapter: value }))} />
            <FilterSelect label="Test type" value={filters.testType} options={options.testType} onChange={(value) => setFilters((current) => ({ ...current, testType: value }))} />
          </div>
        </section>

        {started && selectedTest && (
          <section className="paper-card rounded-[30px] border border-white p-5 shadow-soft">
            <span className="text-sm font-black uppercase tracking-wide text-[#7967e8]">Question map</span>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {selectedTest.questions.map((question, index) => {
                const isAnswered = Boolean(answers[question.id]);
                return (
                  <span key={question.id} className={`grid h-12 place-items-center rounded-2xl text-sm font-black ${isAnswered ? "bg-[#dff8ec] text-edu-green" : started && index === answeredCount ? "bg-[#151b2d] text-white" : "bg-white text-slate-400"}`}>
                    {index + 1}
                  </span>
                );
              })}
            </div>
          </section>
        )}

        <section className="soft-card">
          <FileText size={22} className="text-edu-blue" />
          <strong className="mt-3 block text-xl text-[#151b2d] dark:text-[#edf3ff]">Test rules</strong>
          <div className="mt-4 grid gap-3">
            {["Select the subject test you want.", "Answer all questions before submitting.", "Promi explains mistakes after the attempt."].map((item) => (
              <p key={item} className="rounded-2xl bg-[#f7f9ff] p-3 text-sm font-bold text-slate-600 dark:bg-[#0d1628] dark:text-[#aebbd0]">{item}</p>
            ))}
          </div>
        </section>
      </section>

      <section className="space-y-4">
        {started && selectedTest ? (
          selectedTest.questions.map((question, index) => (
            <article key={question.id} className="soft-card soft-pop">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-sm font-black uppercase tracking-wide text-edu-muted">Question {index + 1}</span>
                  <h2 className="mt-2 text-xl font-black text-[#151b2d]">{question.question}</h2>
                </div>
                <span className="flex items-center gap-1 rounded-full bg-[#fff4cf] px-3 py-1 text-sm font-black text-[#8b6100]">
                  <Clock size={14} />
                  {selectedTest.durationMinutes}m
                </span>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {question.options.map((option) => (
                  <button
                    key={option}
                    onClick={() => setAnswers((current) => ({ ...current, [question.id]: option }))}
                    className={`rounded-[24px] border p-4 text-left font-black transition ${
                      answers[question.id] === option
                        ? "border-[#4ca7ff] bg-[#e7f0ff] text-edu-blue shadow-sm"
                        : "border-edu-line bg-white text-slate-700 hover:border-blue-200"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </article>
          ))
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredTests.map((test) => (
              <button
                key={test.id}
                type="button"
                onClick={() => chooseTest(test)}
                className={`soft-card text-left transition hover:-translate-y-0.5 ${selectedTestId === test.id ? "ring-4 ring-blue-100" : ""}`}
              >
                <span className="text-sm font-black uppercase tracking-wide text-edu-blue">{test.subject}</span>
                <h2 className="mt-2 text-2xl font-black text-[#151b2d]">{test.chapter}</h2>
                <p className="mt-2 text-sm font-bold text-edu-muted">{test.grade} - {test.testType || "Concept Check"}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#eef3ff] px-3 py-1 text-xs font-black text-slate-600">{test.durationMinutes} min</span>
                  <span className="rounded-full bg-[#dff8ec] px-3 py-1 text-xs font-black text-edu-green">{test.questions.length} questions</span>
                  <span className="rounded-full bg-[#fff4cf] px-3 py-1 text-xs font-black text-[#8b6100]">{test.difficulty || "Core"}</span>
                </div>
              </button>
            ))}
            {filteredTests.length === 0 && (
              <div className="paper-card flex min-h-[360px] items-center justify-center rounded-[38px] border border-white p-8 text-center shadow-soft md:col-span-2">
                <div>
                  <span className="mx-auto grid h-20 w-20 place-items-center rounded-[28px] bg-[#e7f0ff] text-edu-blue">
                    <Timer size={42} />
                  </span>
                  <h2 className="mt-5 text-3xl font-black text-[#151b2d]">No tests match these filters</h2>
                  <p className="mx-auto mt-2 max-w-md text-edu-muted">Reset a filter to see more subject mocks.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

function FilterSelect({ label, value, options, onChange }) {
  return (
    <label>
      <span className="mb-1 block text-xs font-black uppercase tracking-wide text-edu-muted">{label}</span>
      <select className="field" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}

function MockResult({ result, test, answers, onRetry }) {
  return (
    <main className="feature-fill grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
      <section className="space-y-5">
        <div className="rounded-[38px] bg-gradient-to-br from-[#7f7cff] via-[#4ca7ff] to-[#52d6a7] p-6 text-white shadow-soft">
          <span className="text-sm font-black uppercase tracking-wide text-white/75">Mock Test Result</span>
          <h1 className="mt-2 text-5xl font-black">{result.score}/{result.total}</h1>
          <p className="mt-2 text-white/80">Accuracy: {result.accuracy}. Time taken: {result.timeTaken || `${test.durationMinutes} min attempt`}.</p>
        </div>

        <section className="paper-card rounded-[30px] border border-white p-5 shadow-soft">
          <Brain size={22} className="text-[#7967e8]" />
          <strong className="mt-3 block text-xl text-[#151b2d]">Promi feedback</strong>
          <p className="mt-2 text-slate-600">{result.overallFeedback}</p>
          <p className="mt-3 rounded-2xl bg-[#fff4cf] p-3 text-sm font-bold text-slate-700">
            Markscheme lens: method marks, partial marks and error carried forward are considered when written working is available.
          </p>
          <button className="secondary-btn mt-5 w-full" onClick={onRetry}>Retry test</button>
        </section>
      </section>

      <section className="space-y-4">
        {test.questions.map((question) => {
          const answer = answers[question.id] || "Not answered";
          const isCorrect = answer === question.correctAnswer;
          const mistake = result.mistakes?.find((item) => item.questionId === question.id);

          return (
            <article key={question.id} className="soft-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-[#151b2d]">{question.question}</h2>
                  <p className="mt-1 text-sm font-semibold text-edu-muted">Your answer: {answer}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-sm font-black ${isCorrect ? "bg-[#dff8ec] text-edu-green" : "bg-[#ffe7e2] text-[#d75848]"}`}>
                  {isCorrect ? "Correct" : "Review"}
                </span>
              </div>
              {!isCorrect && (
                <div className="mt-4 rounded-[24px] bg-[#f7f9ff] p-4">
                  <div className="flex items-center gap-2">
                    <Target size={17} className="text-edu-blue" />
                    <strong>{mistake?.mistakeType || "Needs review"}</strong>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{mistake?.feedback || question.solution}</p>
                  <p className="mt-2 text-sm font-black text-edu-blue">{mistake?.nextStep || "Review the concept and try one similar question."}</p>
                </div>
              )}
            </article>
          );
        })}
      </section>
    </main>
  );
}

function uniqueOptions(values) {
  return [allOption, ...Array.from(new Set(values.filter(Boolean)))];
}
