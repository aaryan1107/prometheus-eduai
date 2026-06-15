export const teacherWorkload = [];

export function getFlatAssignments() {
  return teacherWorkload.flatMap((teacher) =>
    teacher.assignments.map((assignment) => ({
      ...assignment,
      teacherId: teacher.teacherId,
      teacherName: teacher.teacherName,
      microsoftAccount: teacher.microsoftAccount,
      department: teacher.department,
      progress: assignment.totalScripts > 0
        ? Math.round((assignment.checkedScripts / assignment.totalScripts) * 100)
        : 0
    }))
  );
}

export function getTeacherWorkloadSummary() {
  const assignments = getFlatAssignments();
  const totalScripts = assignments.reduce((sum, item) => sum + item.totalScripts, 0);
  const checkedScripts = assignments.reduce((sum, item) => sum + item.checkedScripts, 0);

  return {
    totalTeachers: teacherWorkload.length,
    totalAssignments: assignments.length,
    activeGradingTasks: assignments.filter((item) => ["Not Started", "In Progress", "AI Reviewed"].includes(item.status)).length,
    pendingHodReviews: assignments.filter((item) => item.status === "HOD Review Pending").length,
    submittedAssessments: assignments.filter((item) => item.status === "Submitted").length,
    finalizedAssessments: assignments.filter((item) => item.status === "Finalized").length,
    totalScripts,
    checkedScripts,
    progress: totalScripts > 0 ? Math.round((checkedScripts / totalScripts) * 100) : 0
  };
}

export function updateAssignmentStatus(assignmentId, status) {
  for (const teacher of teacherWorkload) {
    const assignment = teacher.assignments.find((item) => item.assignmentId === assignmentId);
    if (assignment) {
      assignment.status = status;
      if (status === "Finalized" || status === "Submitted") {
        assignment.checkedScripts = assignment.totalScripts;
        assignment.pendingScripts = 0;
      }
      return {
        ...assignment,
        teacherId: teacher.teacherId,
        teacherName: teacher.teacherName,
        microsoftAccount: teacher.microsoftAccount,
        department: teacher.department,
        progress: assignment.totalScripts > 0
          ? Math.round((assignment.checkedScripts / assignment.totalScripts) * 100)
          : 0
      };
    }
  }

  return null;
}
