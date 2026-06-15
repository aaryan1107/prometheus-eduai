import { useEffect, useMemo, useRef, useState } from "react";
import { FileSpreadsheet, Loader2, Search, ShieldCheck, Trash2, Upload, Users } from "lucide-react";
import { clearStudents, extractFileText, fetchStudents, importStudents } from "../utils/api.js";

const gradeOptions = ["All", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];

export default function ManageStudents() {
  const fileRef = useRef(null);
  const [students, setStudents] = useState([]);
  const [meta, setMeta] = useState({});
  const [preview, setPreview] = useState([]);
  const [sourceFile, setSourceFile] = useState("");
  const [sessionDraft, setSessionDraft] = useState({ academicSession: "", sessionEndDate: "" });
  const [filters, setFilters] = useState({ grade: "All", section: "All", query: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    setLoading(true);
    setError("");
    try {
      const data = await fetchStudents();
      setStudents(data.students || []);
      setMeta(data.meta || {});
      setSessionDraft({
        academicSession: data.meta?.academicSession || "",
        sessionEndDate: data.meta?.sessionEndDate || ""
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleFiles(fileList) {
    const file = fileList?.[0];
    if (!file) return;
    setSaving(true);
    setNotice("");
    setError("");
    setSourceFile(file.name);
    try {
      const parsedFile = await parseRosterFile(file);
      const rows = parsedFile.rows || [];
      const parsed = rows.map(normalizeRosterRow).filter((student) => student.name);
      setPreview(parsed);
      if (parsedFile.sessionEndDate && !sessionDraft.sessionEndDate) {
        setSessionDraft((current) => ({ ...current, sessionEndDate: parsedFile.sessionEndDate }));
      }
      setNotice(`${parsed.length} student rows detected from ${file.name}. Review and import.`);
    } catch (parseError) {
      setError(parseError.message || "Could not parse that roster file.");
    } finally {
      setSaving(false);
    }
  }

  async function savePreview() {
    if (!preview.length) {
      setError("Upload a roster file before importing students.");
      return;
    }
    if (!sessionDraft.sessionEndDate) {
      setError("Add the roster session end date before importing. If the PDF mentions it, the app will try to detect it; otherwise enter it here.");
      return;
    }
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const data = await importStudents({ students: preview, sourceFile, ...sessionDraft });
      setStudents(data.students || []);
      setMeta(data.meta || {});
      setPreview([]);
      setNotice(`${data.imported} students imported. Total roster: ${data.total}.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function clearRoster() {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const data = await clearStudents();
      setStudents(data.students || []);
      setMeta(data.meta || {});
      setPreview([]);
      setSessionDraft({ academicSession: "", sessionEndDate: "" });
      setNotice("Student roster cleared. You can import fresh test data now.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  const sections = useMemo(() => {
    return ["All", ...new Set(students
      .filter((student) => filters.grade === "All" || student.grade === filters.grade)
      .map((student) => student.classSection)
      .filter(Boolean))];
  }, [filters.grade, students]);

  const filteredStudents = useMemo(() => {
    const query = filters.query.trim().toLowerCase();
    return students.filter((student) => {
      const matchesGrade = filters.grade === "All" || student.grade === filters.grade;
      const matchesSection = filters.section === "All" || student.classSection === filters.section;
      const matchesQuery = !query || [
        student.name,
        student.email,
        student.phone,
        student.rollNo,
        student.guardian
      ].join(" ").toLowerCase().includes(query);
      return matchesGrade && matchesSection && matchesQuery;
    });
  }, [filters, students]);

  const stats = useMemo(() => ({
    students: students.length,
    grades: new Set(students.map((student) => student.grade).filter(Boolean)).size,
    sections: new Set(students.map((student) => student.classSection).filter(Boolean)).size
  }), [students]);

  return (
    <main className="feature-fill grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
      <section className="space-y-5">
        <div className="rounded-[38px] bg-[#151b2d] p-6 text-white shadow-soft">
          <span className="text-sm font-black uppercase tracking-wide text-white/70">Manage Students</span>
          <h1 className="mt-2 text-3xl font-black">Import class rosters</h1>
          <p className="mt-2 text-white/75">
            Upload Excel, CSV, PDF, image, or text rosters so Evaluation and Vault can suggest students by grade and section.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <RosterStat label="Students" value={stats.students} />
          <RosterStat label="Grades" value={stats.grades} />
          <RosterStat label="Sections" value={stats.sections} />
        </div>

        {(error || notice) && (
          <div className={`rounded-[24px] px-5 py-4 text-sm font-black ${error ? "bg-[#ffe7e2] text-[#d75848]" : "bg-[#dff8ec] text-edu-green"}`}>
            {error || notice}
          </div>
        )}

        <section className={`soft-card ${meta?.isExpired ? "bg-[#fff4cf]" : ""}`}>
          <div className="flex items-center gap-2">
            <ShieldCheck size={19} className="text-edu-blue" />
            <h2 className="text-xl font-black text-[#151b2d] dark:text-[#edf3ff]">Roster session</h2>
          </div>
          <p className="mt-2 text-sm font-bold text-edu-muted">
            Every roster must have a session end date so the school can reset students cleanly when classes change.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input className="field" placeholder="Academic session, e.g. 2026-27" value={sessionDraft.academicSession} onChange={(event) => setSessionDraft((current) => ({ ...current, academicSession: event.target.value }))} />
            <input className="field" type="date" value={sessionDraft.sessionEndDate} onChange={(event) => setSessionDraft((current) => ({ ...current, sessionEndDate: event.target.value }))} />
          </div>
          {meta?.sessionEndDate && (
            <p className={`mt-3 rounded-2xl px-4 py-3 text-sm font-black ${meta.isExpired ? "bg-[#ffe7e2] text-[#d75848]" : "bg-[#dff8ec] text-edu-green"}`}>
              {meta.isExpired ? "Roster session ended. Clear roster before importing the next session." : `Session ends on ${meta.sessionEndDate}. ${meta.daysRemaining ?? 0} days remaining.`}
            </p>
          )}
        </section>

        <section className="soft-card">
          <div className="flex items-center gap-2">
            <Upload size={19} className="text-edu-blue" />
            <h2 className="text-xl font-black text-[#151b2d] dark:text-[#edf3ff]">Upload roster</h2>
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              handleFiles(event.dataTransfer.files);
            }}
            className={`mt-4 grid min-h-40 w-full place-items-center rounded-[26px] border-2 border-dashed p-5 text-center transition ${dragging ? "border-[#4ca7ff] bg-[#e7f0ff]" : "border-edu-line bg-[#f7f9ff] dark:bg-[#0d1628]"}`}
          >
            <span className="grid gap-2">
              {saving ? <Loader2 className="mx-auto animate-spin text-edu-blue" size={28} /> : <FileSpreadsheet className="mx-auto text-edu-blue" size={28} />}
              <strong className="text-[#151b2d] dark:text-[#edf3ff]">{saving ? "Reading roster..." : "Drop roster file here"}</strong>
              <small className="font-bold text-edu-muted">Recommended columns: name, grade, section, roll, email, phone, guardian</small>
            </span>
          </button>
          <input ref={fileRef} className="hidden" type="file" accept=".xlsx,.xls,.csv,.tsv,.pdf,image/*,.txt,.md" onChange={(event) => handleFiles(event.target.files)} />

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button className="primary-btn" type="button" onClick={savePreview} disabled={saving || !preview.length}>
              <ShieldCheck size={17} />
              Import preview
            </button>
            <button className="secondary-btn text-[#d75848]" type="button" onClick={clearRoster} disabled={saving}>
              <Trash2 size={17} />
              Clear roster
            </button>
          </div>
        </section>

        {preview.length > 0 && (
          <section className="soft-card">
            <div className="flex items-center gap-2">
              <ShieldCheck size={19} className="text-edu-green" />
              <h2 className="text-xl font-black text-[#151b2d] dark:text-[#edf3ff]">Import preview</h2>
            </div>
            <div className="mt-4 grid max-h-80 gap-2 overflow-y-auto">
              {preview.slice(0, 30).map((student, index) => (
                <RosterRow key={`${student.name}-${index}`} student={student} />
              ))}
            </div>
          </section>
        )}
      </section>

      <section className="space-y-5">
        <section className="soft-card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <span className="text-sm font-black uppercase tracking-wide text-[#7967e8]">Roster</span>
              <h2 className="mt-1 text-2xl font-black text-[#151b2d] dark:text-[#edf3ff]">Students by grade and section</h2>
              <p className="mt-1 text-sm font-bold text-edu-muted">This roster powers Evaluation student suggestions and Evaluation Vault tracking.</p>
            </div>
            {loading && <Loader2 size={20} className="animate-spin text-edu-muted" />}
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-[160px_160px_minmax(220px,1fr)]">
            <select className="field" value={filters.grade} onChange={(event) => setFilters((current) => ({ ...current, grade: event.target.value, section: "All" }))}>
              {gradeOptions.map((grade) => <option key={grade}>{grade}</option>)}
            </select>
            <select className="field" value={filters.section} onChange={(event) => setFilters((current) => ({ ...current, section: event.target.value }))}>
              {sections.map((section) => <option key={section}>{section}</option>)}
            </select>
            <label className="field flex items-center gap-3">
              <Search size={17} className="text-edu-muted" />
              <input className="w-full border-0 bg-transparent outline-none" placeholder="Search name, email, roll, phone..." value={filters.query} onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))} />
            </label>
          </div>

          <div className="mt-5 grid gap-3">
            {filteredStudents.map((student) => (
              <RosterRow key={student.studentId} student={student} />
            ))}
            {!loading && filteredStudents.length === 0 && (
              <p className="rounded-[22px] bg-[#fff4cf] p-4 text-sm font-bold text-[#8b6100]">
                No students yet. Import a roster to start testing Evaluation and Vault with real class data.
              </p>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

async function parseRosterFile(file) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (["xlsx", "xls"].includes(extension)) {
    const XLSX = await import("xlsx");
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    return { rows, sessionEndDate: detectSessionEndDate(JSON.stringify(rows)) };
  }

  if (["pdf", "png", "jpg", "jpeg", "webp"].includes(extension) || file.type.startsWith("image/") || file.type === "application/pdf") {
    const extracted = await extractFileText(file);
    const text = extracted.text || "";
    return { rows: parseTextRoster(text), sessionEndDate: detectSessionEndDate(text) };
  }

  const text = await file.text();
  const rows = extension === "csv" || extension === "tsv" || text.includes(",")
    ? parseDelimited(text, extension === "tsv" ? "\t" : ",")
    : parseTextRoster(text);
  return { rows, sessionEndDate: detectSessionEndDate(text) };
}

function parseDelimited(text, delimiter) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (!lines.length) return [];
  const headers = splitDelimitedLine(lines[0], delimiter).map(normalizeHeader);
  return lines.slice(1).map((line) => {
    const cells = splitDelimitedLine(line, delimiter);
    return Object.fromEntries(headers.map((header, index) => [header, cells[index] || ""]));
  });
}

function parseTextRoster(text) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter((line) => line.length > 2);
  const delimitedLine = lines.find((line) => line.includes(",") || line.includes("\t"));
  if (delimitedLine && /name|student/i.test(delimitedLine)) {
    return parseDelimited(lines.slice(lines.indexOf(delimitedLine)).join("\n"), delimitedLine.includes("\t") ? "\t" : ",");
  }
  return lines.map((line) => {
    const cells = line.split(/\s{2,}|,|\t/).map((cell) => cell.trim()).filter(Boolean);
    return {
      roll: /^\d+$/.test(cells[0]) ? cells[0] : "",
      name: /^\d+$/.test(cells[0]) ? cells[1] : cells[0],
      grade: cells.find((cell) => /grade\s*\d+|\b\d{1,2}\b/i.test(cell)) || "",
      section: cells.find((cell) => /section\s+[a-z]|\b\d{1,2}[a-z]\b/i.test(cell)) || "",
      email: cells.find((cell) => cell.includes("@")) || "",
      phone: cells.find((cell) => /\d{7,}/.test(cell.replace(/\D/g, ""))) || ""
    };
  });
}

function splitDelimitedLine(line, delimiter) {
  const values = [];
  let current = "";
  let quoted = false;
  for (const char of line) {
    if (char === "\"") {
      quoted = !quoted;
    } else if (char === delimiter && !quoted) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  return values;
}

function normalizeRosterRow(row) {
  const entries = Object.fromEntries(Object.entries(row).map(([key, value]) => [normalizeHeader(key), String(value || "").trim()]));
  return {
    name: entries.name || entries.student || entries.studentname || entries.fullname || "",
    grade: normalizeGrade(entries.grade || entries.class || entries.gradeclass || ""),
    classSection: normalizeSection(entries.section || entries.classsection || entries.division || entries.gradeclass || ""),
    rollNo: entries.roll || entries.rollno || entries.rollnumber || entries.admissionno || "",
    email: entries.email || entries.emailid || "",
    phone: entries.phone || entries.mobile || entries.contact || "",
    guardian: entries.guardian || entries.parent || entries.parentname || ""
  };
}

function detectSessionEndDate(text = "") {
  const value = String(text || "");
  const labelled = value.match(/(?:session|academic year|term|roster)\s*(?:end|ends|ending|valid till|valid until|expires?)\D{0,24}(\d{1,2}[/-]\d{1,2}[/-]\d{4}|\d{4}-\d{2}-\d{2})/i);
  const rawDate = labelled?.[1];
  if (!rawDate) return "";
  return normalizeDate(rawDate);
}

function normalizeHeader(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function normalizeGrade(value) {
  const cleanValue = String(value || "").trim();
  if (!cleanValue) return "";
  if (/^grade\s+/i.test(cleanValue)) return cleanValue.replace(/\s+/g, " ");
  const match = cleanValue.match(/\b(\d{1,2})\b/);
  return match ? `Grade ${match[1]}` : cleanValue;
}

function normalizeDate(value) {
  const cleanValue = String(value || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleanValue)) return cleanValue;
  const slash = cleanValue.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (!slash) return "";
  const [, day, month, year] = slash;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function normalizeSection(value) {
  const cleanValue = String(value || "").trim().replace(/^section\s+/i, "");
  if (!cleanValue) return "";
  const gradeSection = cleanValue.match(/(?:grade\s*)?(\d{1,2})\s*[- ]?\s*([A-Z])$/i);
  if (gradeSection) return gradeSection[2].toUpperCase();
  return cleanValue.toUpperCase();
}

function RosterRow({ student }) {
  return (
    <article className="rounded-[22px] border border-edu-line bg-[#f7f9ff] p-4 dark:bg-[#0d1628]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <strong className="text-[#151b2d] dark:text-[#edf3ff]">{student.name}</strong>
          <p className="mt-1 text-sm font-bold text-edu-muted">
            {student.grade || "No grade"} - {student.classSection || "No section"} {student.rollNo ? `- Roll ${student.rollNo}` : ""}
          </p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-edu-blue dark:bg-[#111b2e]">
          {student.sourceFile || "Roster"}
        </span>
      </div>
      <div className="mt-3 grid gap-2 text-xs font-black uppercase tracking-wide text-edu-muted sm:grid-cols-3">
        <span>{student.email || "No email"}</span>
        <span>{student.phone || "No phone"}</span>
        <span>{student.guardian || "No guardian"}</span>
      </div>
    </article>
  );
}

function RosterStat({ label, value }) {
  return (
    <article className="soft-card p-4 text-center">
      <Users size={18} className="mx-auto text-edu-blue" />
      <strong className="mt-2 block text-2xl text-[#151b2d] dark:text-[#edf3ff]">{value}</strong>
      <span className="text-xs font-black uppercase tracking-wide text-edu-muted">{label}</span>
    </article>
  );
}
