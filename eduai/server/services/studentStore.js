import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STORE_PATH = path.resolve(__dirname, "../data/studentStore.json");
const emptyMeta = {
  academicSession: "",
  sessionEndDate: "",
  sourceFile: "",
  importedAt: "",
  lastImportCount: 0
};

export async function getStudentRoster() {
  const store = await readStore();
  return {
    students: store.students,
    meta: withSessionStatus(store.meta)
  };
}

export async function listStudents() {
  const store = await readStore();
  return store.students;
}

export async function importStudents(students = [], options = {}) {
  const store = await readStore();
  const importedAt = new Date().toISOString();
  const sourceFile = clean(options.sourceFile);
  const academicSession = clean(options.academicSession);
  const sessionEndDate = normalizeDate(options.sessionEndDate);
  const normalized = students.map((student) => normalizeStudent(student, sourceFile, importedAt)).filter((student) => student.name);
  const byKey = new Map(store.students.map((student) => [studentKey(student), student]));

  for (const student of normalized) {
    const key = studentKey(student);
    const existing = byKey.get(key);
    byKey.set(key, existing ? { ...existing, ...student, studentId: existing.studentId, updatedAt: importedAt } : student);
  }

  store.students = Array.from(byKey.values()).sort(sortStudents);
  store.meta = {
    academicSession,
    sessionEndDate,
    sourceFile,
    importedAt,
    lastImportCount: normalized.length
  };
  await writeStore(store);

  return {
    imported: normalized.length,
    total: store.students.length,
    students: store.students,
    meta: withSessionStatus(store.meta)
  };
}

export async function clearStudents() {
  const store = { students: [], meta: emptyMeta };
  await writeStore(store);
  return store;
}

function normalizeStudent(student = {}, sourceFile, importedAt) {
  const name = clean(student.name || student.studentName || student["student name"]);
  const grade = normalizeGrade(student.grade || student.class || student["grade/class"]);
  const classSection = normalizeSection(student.classSection || student.section || student.class_section || student["class section"]);
  const rollNo = clean(student.rollNo || student.roll || student.rollNumber || student["roll no"] || student["roll number"]);
  const email = clean(student.email || student.emailId || student["email id"]).toLowerCase();
  const phone = clean(student.phone || student.mobile || student.contact || student["phone number"]);
  const guardian = clean(student.guardian || student.parent || student["parent name"] || student["guardian name"]);

  return {
    studentId: `stu-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    grade,
    classSection,
    rollNo,
    email,
    phone,
    guardian,
    sourceFile: clean(sourceFile),
    createdAt: importedAt,
    updatedAt: importedAt
  };
}

function studentKey(student) {
  return [
    student.grade || "grade",
    student.classSection || "section",
    student.rollNo || student.email || student.name
  ].join("|").toLowerCase();
}

function sortStudents(a, b) {
  return [a.grade.localeCompare(b.grade), a.classSection.localeCompare(b.classSection), a.name.localeCompare(b.name)].find(Boolean) || 0;
}

function normalizeGrade(value = "") {
  const cleanValue = clean(value);
  if (!cleanValue) return "";
  if (/^grade\s+/i.test(cleanValue)) return cleanValue.replace(/\s+/g, " ");
  const match = cleanValue.match(/\b(\d{1,2})\b/);
  return match ? `Grade ${match[1]}` : cleanValue;
}

function normalizeSection(value = "") {
  const cleanValue = clean(value).replace(/^section\s+/i, "");
  if (!cleanValue) return "";
  const compactSection = cleanValue.match(/^\d{1,2}([A-Z])$/i);
  if (compactSection) return compactSection[1].toUpperCase();
  const gradeMatch = cleanValue.match(/grade\s*(\d{1,2})\s*[- ]?\s*([A-Z])$/i);
  if (gradeMatch) return gradeMatch[2].toUpperCase();
  const sectionMatch = cleanValue.match(/\b([A-Z])\b/i);
  return sectionMatch && cleanValue.length <= 3 ? sectionMatch[1].toUpperCase() : cleanValue;
}

function clean(value = "") {
  return String(value || "").trim().replace(/\s+/g, " ");
}

async function readStore() {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return {
      students: Array.isArray(parsed.students) ? parsed.students : [],
      meta: { ...emptyMeta, ...(parsed.meta || {}) }
    };
  } catch {
    return { students: [], meta: emptyMeta };
  }
}

async function writeStore(store) {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2));
}

function withSessionStatus(meta = {}) {
  const nextMeta = { ...emptyMeta, ...meta };
  const today = new Date().toISOString().slice(0, 10);
  return {
    ...nextMeta,
    isExpired: Boolean(nextMeta.sessionEndDate && nextMeta.sessionEndDate < today),
    daysRemaining: nextMeta.sessionEndDate ? daysBetween(today, nextMeta.sessionEndDate) : null
  };
}

function daysBetween(start, end) {
  const startDate = new Date(`${start}T00:00:00.000Z`);
  const endDate = new Date(`${end}T00:00:00.000Z`);
  return Math.ceil((endDate - startDate) / 86400000);
}

function normalizeDate(value = "") {
  const cleanValue = clean(value);
  if (!cleanValue) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleanValue)) return cleanValue;
  const slash = cleanValue.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (slash) {
    const [, day, month, year] = slash;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  return cleanValue;
}
