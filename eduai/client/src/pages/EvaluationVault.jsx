import { useEffect, useMemo, useState } from "react";
import { FileLock2, History, Loader2, PackageCheck, Search, ShieldCheck, Users } from "lucide-react";
import { fetchEvaluationVault, fetchStudents } from "../utils/api.js";

const gradeOptions = ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];

export default function EvaluationVault() {
  const [vault, setVault] = useState({ audit: [], groups: [] });
  const [students, setStudents] = useState([]);
  const [meta, setMeta] = useState(null);
  const [query, setQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("Grade 10");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadVault();
  }, []);

  async function loadVault() {
    setLoading(true);
    setError("");
    try {
      const [data, roster] = await Promise.all([fetchEvaluationVault(), fetchStudents()]);
      setVault({ audit: data.audit || [], groups: data.groups || [] });
      setStudents(roster.students || []);
      setMeta(roster.meta || null);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  const studentRecords = useMemo(() => {
    const records = new Map();

    for (const student of students) {
      const key = studentKey({
        studentName: student.name,
        grade: student.grade,
        classSection: student.classSection
      });
      records.set(key, {
        studentName: student.name || "Unnamed student",
        grade: student.grade || "",
        classSection: student.classSection || "",
        subject: "",
        assignedTeacher: "",
        rollNo: student.rollNo || "",
        email: student.email || "",
        phone: student.phone || "",
        guardian: student.guardian || "",
        sourceFile: student.sourceFile || "",
        audits: []
      });
    }

    for (const group of vault.groups) {
      const key = studentKey(group);
      const existing = records.get(key) || {};
      records.set(key, {
        ...existing,
        studentName: group.studentName || "Unnamed student",
        grade: group.grade || "",
        classSection: group.classSection || "",
        subject: group.subject || "",
        assignedTeacher: group.assignedTeacher || "",
        audits: existing.audits || []
      });
    }

    for (const entry of vault.audit) {
      if (!entry.studentName) continue;
      const key = studentKey(entry);
      const record = records.get(key) || {
        studentName: entry.studentName,
        grade: entry.grade || "",
        classSection: entry.classSection || "",
        subject: "",
        assignedTeacher: entry.actor || "",
        audits: []
      };
      record.audits.push(entry);
      records.set(key, record);
    }

    return Array.from(records.values()).sort((a, b) => a.studentName.localeCompare(b.studentName));
  }, [students, vault.audit, vault.groups]);

  const availableGrades = useMemo(() => {
    return Array.from(new Set([...gradeOptions, ...studentRecords.map((record) => record.grade).filter(Boolean)]));
  }, [studentRecords]);

  const availableSections = useMemo(() => {
    return Array.from(new Set(studentRecords
      .filter((record) => !selectedGrade || record.grade === selectedGrade)
      .map((record) => record.classSection)
      .filter(Boolean)));
  }, [selectedGrade, studentRecords]);

  useEffect(() => {
    if (selectedSection && !availableSections.includes(selectedSection)) {
      setSelectedSection("");
      setSelectedStudent("");
    }
  }, [availableSections, selectedSection]);

  const visibleStudents = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    return studentRecords.filter((record) => {
      const matchesGrade = !selectedGrade || record.grade === selectedGrade;
      const matchesSection = !selectedSection || record.classSection === selectedSection;
      const matchesQuery = !cleanQuery || [
        record.studentName,
        record.grade,
        record.classSection,
        record.subject,
        record.assignedTeacher,
        record.rollNo,
        record.email,
        record.phone,
        record.guardian
      ].join(" ").toLowerCase().includes(cleanQuery);
      return matchesGrade && matchesSection && matchesQuery;
    });
  }, [query, selectedGrade, selectedSection, studentRecords]);

  const selectedRecord = useMemo(() => {
    return visibleStudents.find((record) => record.studentName === selectedStudent) || visibleStudents[0] || null;
  }, [selectedStudent, visibleStudents]);

  useEffect(() => {
    if (selectedRecord && selectedRecord.studentName !== selectedStudent) {
      setSelectedStudent(selectedRecord.studentName);
    }
  }, [selectedRecord, selectedStudent]);

  const filteredAudit = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    return vault.audit.filter((entry) => {
      const matchesGrade = !selectedGrade || entry.grade === selectedGrade;
      const matchesSection = !selectedSection || entry.classSection === selectedSection;
      const matchesStudent = !selectedStudent || entry.studentName === selectedStudent;
      const matchesQuery = !cleanQuery || [
        entry.action,
        entry.detail,
        entry.studentName,
        entry.assessmentName,
        entry.grade,
        entry.classSection,
        entry.actor
      ].join(" ").toLowerCase().includes(cleanQuery);
      return matchesGrade && matchesSection && matchesStudent && matchesQuery;
    });
  }, [query, selectedGrade, selectedSection, selectedStudent, vault.audit]);

  function selectAuditStudent(entry) {
    if (entry.grade) setSelectedGrade(entry.grade);
    if (entry.classSection) setSelectedSection(entry.classSection);
    if (entry.studentName) setSelectedStudent(entry.studentName);
  }

  return (
    <main className="vault-page feature-fill space-y-6">
      <section className="grid gap-5 xl:grid-cols-[0.78fr_1.22fr]">
        <div className="rounded-[38px] bg-[#151b2d] p-6 text-white shadow-soft">
          <span className="text-sm font-black uppercase tracking-wide text-white/70">Evaluation Vault</span>
          <h1 className="mt-2 text-3xl font-black">Browse AI evaluation records</h1>
          <p className="mt-2 max-w-3xl text-white/75">
            The Vault is the audit home. Manage Students controls the roster; Evaluation creates packages; this page tracks every recorded change.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <VaultStat icon={History} label="Audit Entries" value={vault.audit.length} />
          <VaultStat icon={Users} label="Student Records" value={studentRecords.length} />
          <VaultStat icon={PackageCheck} label="AI Reviews" value={vault.audit.filter((entry) => entry.action === "AI evaluation completed").length} />
          <VaultStat icon={ShieldCheck} label="Vault Mode" value="On" />
        </div>
      </section>

      {error && (
        <div className="rounded-[24px] bg-[#ffe7e2] px-5 py-4 text-sm font-black text-[#d75848]">
          {error}
        </div>
      )}

      <section className="soft-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="text-sm font-black uppercase tracking-wide text-edu-blue">Roster session</span>
            <h2 className="mt-1 text-2xl font-black text-[#151b2d] dark:text-[#edf3ff]">
              {meta?.academicSession || "No roster session imported"}
            </h2>
            <p className="mt-1 text-sm font-bold text-edu-muted">
              {meta?.sessionEndDate
                ? `Session ends on ${meta.sessionEndDate}. ${meta.daysRemaining ?? 0} days remaining.`
                : "Import a roster in Manage Students to unlock grade and section tracking."}
            </p>
          </div>
          {loading && <Loader2 size={20} className="animate-spin text-edu-muted" />}
        </div>
      </section>

      <section className="soft-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="text-sm font-black uppercase tracking-wide text-edu-blue">Vault browser</span>
            <h2 className="mt-1 text-2xl font-black text-[#151b2d] dark:text-[#edf3ff]">Grade to section to student</h2>
            <p className="mt-1 text-sm font-bold text-edu-muted">Pick a child and inspect only the relevant AI evaluation trail.</p>
          </div>
        </div>

        <div className="vault-filter-grid mt-5 grid gap-3 lg:grid-cols-[180px_180px_minmax(220px,1fr)]">
          <select className="field" value={selectedGrade} onChange={(event) => { setSelectedGrade(event.target.value); setSelectedStudent(""); }}>
            <option value="">All grades</option>
            {availableGrades.map((grade) => <option key={grade}>{grade}</option>)}
          </select>
          <select className="field" value={selectedSection} onChange={(event) => { setSelectedSection(event.target.value); setSelectedStudent(""); }}>
            <option value="">All sections</option>
            {availableSections.map((section) => <option key={section}>{section}</option>)}
          </select>
          <label className="field flex items-center gap-3">
            <Search size={17} className="text-edu-muted" />
            <input className="w-full border-0 bg-transparent outline-none" placeholder="Search student, teacher, package..." value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
        </div>
      </section>

      <section className="vault-main-grid grid gap-5 xl:grid-cols-[0.43fr_0.57fr]">
        <section className="soft-card">
          <div className="flex items-center gap-2">
            <FileLock2 size={19} className="text-edu-green" />
            <h2 className="text-xl font-black text-[#151b2d] dark:text-[#edf3ff]">Students</h2>
          </div>
          <div className="student-list-scroll mt-4 grid max-h-[70vh] gap-3 overflow-y-auto pr-1">
            {visibleStudents.map((record) => (
              <button
                key={studentKey(record)}
                type="button"
                onClick={() => setSelectedStudent(record.studentName)}
                className={`rounded-[22px] border p-4 text-left text-sm font-bold transition ${selectedRecord?.studentName === record.studentName ? "border-[#4ca7ff] bg-[#eef3ff] dark:bg-[#14325c]" : "border-edu-line bg-[#f7f9ff] dark:bg-[#0d1628]"}`}
              >
                <strong className="block text-[#151b2d] dark:text-[#edf3ff]">{record.studentName}</strong>
                <span className="text-edu-muted">{record.grade} - {record.classSection || "No section"} - {record.subject || "General"}</span>
                <span className="mt-2 block text-xs font-black uppercase tracking-wide text-edu-blue">{record.audits.length} audit records</span>
              </button>
            ))}
            {!loading && visibleStudents.length === 0 && (
              <p className="rounded-[22px] bg-[#fff4cf] p-4 text-sm font-bold text-[#8b6100]">
                No students found. Import a roster in Manage Students, then run an evaluation.
              </p>
            )}
          </div>
        </section>

        <section className="space-y-5">
          <section className="soft-card">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="text-sm font-black uppercase tracking-wide text-[#7967e8]">Selected child</span>
                <h2 className="mt-1 text-2xl font-black text-[#151b2d] dark:text-[#edf3ff]">{selectedRecord?.studentName || "No student selected"}</h2>
                <p className="mt-1 text-sm font-bold text-edu-muted">
                  {selectedRecord ? `${selectedRecord.grade} - ${selectedRecord.classSection || "No section"} - ${selectedRecord.subject || "General"}` : "Choose a student to see their record."}
                </p>
              </div>
              <span className="rounded-full bg-[#eef3ff] px-3 py-1 text-xs font-black text-edu-blue dark:bg-[#0d1628]">
                {selectedRecord?.audits.length || 0} records
              </span>
            </div>
            {selectedRecord && (
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <MiniField label="Teacher" value={selectedRecord.assignedTeacher || "Unassigned"} />
                <MiniField label="Grade" value={selectedRecord.grade || "No grade"} />
                <MiniField label="Section" value={selectedRecord.classSection || "No section"} />
                <MiniField label="Roll" value={selectedRecord.rollNo || "No roll"} />
                <MiniField label="Email" value={selectedRecord.email || "No email"} />
                <MiniField label="Phone" value={selectedRecord.phone || "No phone"} />
              </div>
            )}
          </section>

          <section className="soft-card">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="text-sm font-black uppercase tracking-wide text-[#7967e8]">Mandated audit trail</span>
                <h2 className="mt-1 text-2xl font-black text-[#151b2d] dark:text-[#edf3ff]">Matching evaluation changes</h2>
                <p className="mt-1 text-sm font-bold text-edu-muted">Every AI evaluation and package change should land here for review.</p>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {filteredAudit.map((entry) => (
                <button key={entry.auditId} type="button" onClick={() => selectAuditStudent(entry)} className="rounded-[24px] border border-edu-line bg-[#f7f9ff] p-4 text-left dark:bg-[#0d1628]">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <strong className="text-[#151b2d] dark:text-[#edf3ff]">{entry.action}</strong>
                      <p className="mt-1 text-sm font-bold text-edu-muted">{entry.detail || "No extra detail recorded."}</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-edu-blue dark:bg-[#111b2e]">
                      {new Date(entry.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-2 text-xs font-black uppercase tracking-wide text-edu-muted sm:grid-cols-4">
                    <span>{entry.studentName || "No student"}</span>
                    <span>{entry.assessmentName || "No package"}</span>
                    <span>{entry.grade || "No grade"} {entry.classSection || ""}</span>
                    <span>{entry.actor || "System"}</span>
                  </div>
                </button>
              ))}
              {!loading && filteredAudit.length === 0 && (
                <p className="rounded-[22px] bg-[#fff4cf] p-4 text-sm font-bold text-[#8b6100]">
                  No audit records match this grade, section, student, or search query yet.
                </p>
              )}
            </div>
          </section>
        </section>
      </section>
    </main>
  );
}

function studentKey(record) {
  return [record.grade, record.classSection, record.studentName].filter(Boolean).join("|") || record.groupId || record.auditId;
}

function MiniField({ label, value }) {
  return (
    <div className="rounded-[20px] bg-[#f7f9ff] p-4 dark:bg-[#0d1628]">
      <span className="text-xs font-black uppercase tracking-wide text-edu-muted">{label}</span>
      <strong className="mt-1 block text-[#151b2d] dark:text-[#edf3ff]">{value}</strong>
    </div>
  );
}

function VaultStat({ icon: Icon, label, value }) {
  return (
    <article className="soft-card p-4">
      <Icon size={19} className="text-edu-blue" />
      <strong className="mt-3 block text-2xl text-[#151b2d] dark:text-[#edf3ff]">{value}</strong>
      <span className="text-xs font-black uppercase tracking-wide text-edu-muted">{label}</span>
    </article>
  );
}
