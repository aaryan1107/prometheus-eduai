import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "./components/Layout.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";
import PromiBot from "./pages/PromiBot.jsx";
import StudyLibrary from "./pages/StudyLibrary.jsx";
import MockTest from "./pages/MockTest.jsx";
import MistakeNotebook from "./pages/MistakeNotebook.jsx";
import TeacherDashboard from "./pages/TeacherDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import Arena from "./pages/Arena.jsx";
import ReEvaluation from "./pages/ReEvaluation.jsx";
import Sources from "./pages/Sources.jsx";
import TeacherWorkload from "./pages/TeacherWorkload.jsx";
import AssessmentPackages from "./pages/AssessmentPackages.jsx";
import EvaluationVault from "./pages/EvaluationVault.jsx";
import ManageStudents from "./pages/ManageStudents.jsx";

export default function App() {
  const [sessionRole, setSessionRole] = useState(() => localStorage.getItem("eduai-role") || "");
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("eduai-theme");
    if (saved === "dark" || saved === "light") return saved;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("eduai-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((current) => current === "dark" ? "light" : "dark");
  const login = (role) => {
    localStorage.setItem("eduai-role", role);
    setSessionRole(role);
  };
  const logout = () => {
    localStorage.removeItem("eduai-role");
    setSessionRole("");
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to={sessionRole ? `/${sessionRole}` : "/login"} replace />} />
      <Route path="/welcome" element={<Landing theme={theme} toggleTheme={toggleTheme} />} />
      <Route path="/login" element={<Login theme={theme} toggleTheme={toggleTheme} onLogin={login} />} />

      <Route element={<ProtectedLayout allowedRole="student" currentRole={sessionRole} theme={theme} toggleTheme={toggleTheme} onLogout={logout} />}>
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/promi" element={<PromiBot />} />
        <Route path="/library" element={<StudyLibrary />} />
        <Route path="/mock" element={<MockTest />} />
        <Route path="/mistakes" element={<MistakeNotebook />} />
        <Route path="/arena" element={<Arena />} />
      </Route>

      <Route element={<ProtectedLayout allowedRole="teacher" currentRole={sessionRole} theme={theme} toggleTheme={toggleTheme} onLogout={logout} />}>
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/sources" element={<Sources />} />
        <Route path="/ai-marking" element={<Navigate to="/assessment-packages" replace />} />
        <Route path="/exam-vault" element={<Navigate to="/evaluation-vault" replace />} />
        <Route path="/re-evaluation" element={<ReEvaluation />} />
      </Route>

      <Route element={<ProtectedLayout allowedRole={["teacher", "admin"]} currentRole={sessionRole} theme={theme} toggleTheme={toggleTheme} onLogout={logout} />}>
        <Route path="/teacher-workload" element={<TeacherWorkload />} />
        <Route path="/manage-students" element={<ManageStudents />} />
        <Route path="/assessment-packages" element={<AssessmentPackages />} />
        <Route path="/evaluation-vault" element={<EvaluationVault />} />
      </Route>

      <Route element={<ProtectedLayout allowedRole="admin" currentRole={sessionRole} theme={theme} toggleTheme={toggleTheme} onLogout={logout} />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/sources" element={<Sources />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function ProtectedLayout({ allowedRole, currentRole, theme, toggleTheme, onLogout }) {
  if (!currentRole) return <Navigate to="/login" replace />;
  const allowedRoles = Array.isArray(allowedRole) ? allowedRole : [allowedRole];
  if (!allowedRoles.includes(currentRole)) return <Navigate to={`/${currentRole}`} replace />;

  return <Layout role={currentRole} theme={theme} toggleTheme={toggleTheme} onLogout={onLogout} />;
}
