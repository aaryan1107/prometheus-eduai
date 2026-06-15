const jsonHeaders = {
  "Content-Type": "application/json"
};

export async function promiChat(payload) {
  const response = await fetch("/api/promi/chat", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Promi could not reply right now.");
  }

  return response.json();
}

export async function analyzeMock(payload) {
  const response = await fetch("/api/mock/analyze", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Mock analysis failed.");
  }

  return response.json();
}

export async function fetchMockTests() {
  const response = await fetch("/api/mock/tests");
  if (!response.ok) throw new Error("Could not load mock tests.");
  return response.json();
}

export async function markingAssist(payload) {
  const response = await fetch("/api/proposal/marking-assist", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(typeof payload === "string" ? { scriptId: payload } : payload)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || error.error || "AI marking assist failed.");
  }
  return response.json();
}

export async function lockScript(payload) {
  const response = await fetch("/api/proposal/lock-script", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || error.error || "ExamVault lock failed.");
  }
  return response.json();
}

export async function fetchProposalData(kind) {
  const response = await fetch(`/api/proposal/${kind}`);
  if (!response.ok) throw new Error(`Could not load ${kind}.`);
  return response.json();
}

export async function addTextSource(payload) {
  const response = await fetch("/api/sources/add-text", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  });

  if (!response.ok) throw new Error("Could not save source text.");
  return response.json();
}

export async function updateSourceComment(sourceId, comment) {
  const response = await fetch(`/api/sources/${sourceId}/comment`, {
    method: "PATCH",
    headers: jsonHeaders,
    body: JSON.stringify({ comment })
  });

  if (!response.ok) throw new Error("Could not save source comment.");
  return response.json();
}

export async function deleteSource(sourceId) {
  const response = await fetch(`/api/sources/${sourceId}`, {
    method: "DELETE"
  });

  if (!response.ok) throw new Error("Could not delete source.");
  return response.json();
}

export async function addUrlSource(payload) {
  const response = await fetch("/api/sources/add-url", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  });

  if (!response.ok) throw new Error("Could not save website source.");
  return response.json();
}

export async function fetchSources() {
  const response = await fetch("/api/sources");
  if (!response.ok) throw new Error("Could not load source library.");
  return response.json();
}

export async function searchSources(payload) {
  const response = await fetch("/api/sources/search", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  });

  if (!response.ok) throw new Error("Source search failed.");
  return response.json();
}

export async function extractFileText(file) {
  const body = new FormData();
  body.append("file", file);

  const response = await fetch("/api/files/extract", {
    method: "POST",
    body
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || error.error || "File extraction failed.");
  }

  return response.json();
}

export async function fetchTeacherWorkload() {
  const response = await fetch("/api/teacher-workload");
  if (!response.ok) throw new Error("Could not load teacher workload.");
  return response.json();
}

export async function fetchTeacherWorkloadSummary() {
  const response = await fetch("/api/teacher-workload/summary");
  if (!response.ok) throw new Error("Could not load workload summary.");
  return response.json();
}

export async function updateTeacherWorkloadStatus(assignmentId, status) {
  const response = await fetch(`/api/teacher-workload/${assignmentId}/status`, {
    method: "PATCH",
    headers: jsonHeaders,
    body: JSON.stringify({ status })
  });

  if (!response.ok) throw new Error("Could not update grading status.");
  return response.json();
}

export async function fetchAssessmentPackages() {
  const response = await fetch("/api/assessment-packages");
  if (!response.ok) throw new Error("Could not load assessment packages.");
  return response.json();
}

export async function fetchEvaluationVault() {
  const response = await fetch("/api/assessment-packages/vault/audit");
  if (!response.ok) throw new Error("Could not load evaluation vault.");
  return response.json();
}

export async function createAssessmentPackage(payload) {
  const response = await fetch("/api/assessment-packages", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  });

  if (!response.ok) throw new Error("Could not create assessment package.");
  return response.json();
}

export async function updateAssessmentPackageUploadStatus(packageId, payload) {
  const response = await fetch(`/api/assessment-packages/${packageId}/upload-status`, {
    method: "PATCH",
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  });

  if (!response.ok) throw new Error("Could not update package upload status.");
  return response.json();
}

export async function updateAssessmentPackageGradingStatus(packageId, gradingStatus) {
  const response = await fetch(`/api/assessment-packages/${packageId}/grading-status`, {
    method: "PATCH",
    headers: jsonHeaders,
    body: JSON.stringify({ gradingStatus })
  });

  if (!response.ok) throw new Error("Could not update assessment grading status.");
  return response.json();
}

export async function recordEvaluationAudit(payload) {
  const response = await fetch("/api/assessment-packages/vault/audit", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  });

  if (!response.ok) throw new Error("Could not record evaluation audit.");
  return response.json();
}

export async function createStudentGroup(payload) {
  const response = await fetch("/api/assessment-packages/groups", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  });

  if (!response.ok) throw new Error("Could not create student group.");
  return response.json();
}

export async function fetchStudents() {
  const response = await fetch("/api/students");
  if (!response.ok) throw new Error("Could not load students.");
  return response.json();
}

export async function importStudents(payload) {
  const response = await fetch("/api/students/import", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  });

  if (!response.ok) throw new Error("Could not import students.");
  return response.json();
}

export async function clearStudents() {
  const response = await fetch("/api/students", {
    method: "DELETE"
  });

  if (!response.ok) throw new Error("Could not clear students.");
  return response.json();
}
