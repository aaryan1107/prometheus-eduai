import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { BarChart3, Bell, Bot, BriefcaseBusiness, Database, FileLock2, Flame, GraduationCap, History, Home, Library, LogOut, Menu, NotebookPen, PackageCheck, Timer, Trophy, Upload, Users, X } from "lucide-react";
import { useState } from "react";
import MiniPromiChat from "./MiniPromiChat.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

const studentLinks = [
  ["/student", Home, "Dashboard"],
  ["/library", Library, "Library"],
  ["/mock", Timer, "Mock"],
  ["/promi", Bot, "Promi"],
  ["/mistakes", NotebookPen, "Mistakes"],
  ["/arena", Trophy, "Arena"]
];

const staffLinks = [
  ["/teacher", Upload, "Dashboard"],
  ["/sources", Database, "Library"],
  ["/manage-students", Users, "Students"],
  ["/teacher-workload", BriefcaseBusiness, "Workload"],
  ["/assessment-packages", PackageCheck, "Evaluation"],
  ["/evaluation-vault", FileLock2, "Eval Vault"],
  ["/re-evaluation", History, "Recheck"]
];

const adminLinks = [
  ["/admin", BarChart3, "HOD"],
  ["/admin/sources", Database, "Library"],
  ["/manage-students", Users, "Students"],
  ["/teacher-workload", BriefcaseBusiness, "Workload"],
  ["/assessment-packages", PackageCheck, "Evaluation"],
  ["/evaluation-vault", FileLock2, "Eval Vault"]
];

const roleCopy = {
  student: ["Student Workspace", "Practice smarter"],
  teacher: ["Teacher Studio", "Mark with evidence"],
  admin: ["HOD Console", "Govern improvement"]
};

const linksByRole = {
  student: studentLinks,
  teacher: staffLinks,
  admin: adminLinks
};

export default function Layout({ theme, toggleTheme, role = "student", onLogout }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const links = linksByRole[role] || studentLinks;
  const [workspaceTitle, workspaceSubtext] = roleCopy[role] || roleCopy.student;

  return (
    <div className="app-shell">
      <div className="workspace-shell">
        <aside className={`sidebar-panel ${menuOpen ? "open" : ""}`}>
          <button onClick={() => navigate(`/${role}`)} className="sidebar-brand text-left">
            <span className="grid h-12 w-12 place-items-center rounded-[18px] bg-[#151b2d] text-white shadow-lg shadow-slate-900/10 dark:bg-white dark:text-[#08111f]">
              <GraduationCap size={25} />
            </span>
            <span>
              <strong>EduAI</strong>
              <small>{workspaceTitle}</small>
            </span>
          </button>

          <nav className="sidebar-nav" aria-label={`${role} workspace navigation`}>
            {links.map(([href, Icon, label]) => (
              <NavLink
                key={href}
                to={href}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
              >
                <Icon size={19} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="sidebar-footer">
            {role === "student" && (
              <span className="inline-flex items-center gap-2 rounded-2xl bg-[#fff4cf] px-3 py-2 text-sm font-black text-[#8b6100] dark:bg-[#3a2d12] dark:text-[#ffdc7a]">
                <Flame size={16} />
                5-day streak
              </span>
            )}
            <div className="flex items-center gap-2">
              <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
              <button className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-slate-600 shadow-sm dark:bg-[#17233a] dark:text-[#cfe0ff]" aria-label="Notifications">
                <Bell size={18} />
              </button>
              <button onClick={onLogout} className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-slate-600 shadow-sm dark:bg-[#17233a] dark:text-[#cfe0ff]" aria-label="Log out">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </aside>

        {menuOpen && <button className="sidebar-backdrop" aria-label="Close menu" onClick={() => setMenuOpen(false)} />}

        <main className="workspace-main">
          <header className="mobile-topbar">
            <button onClick={() => setMenuOpen(true)} className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-[#151b2d] shadow-sm dark:bg-[#17233a] dark:text-[#edf3ff]" aria-label="Open menu">
              <Menu size={20} />
            </button>
            <div>
              <strong>{workspaceTitle}</strong>
              <small>{workspaceSubtext}</small>
            </div>
            <button onClick={() => setMenuOpen(false)} className={`grid h-11 w-11 place-items-center rounded-2xl bg-white text-[#151b2d] shadow-sm dark:bg-[#17233a] dark:text-[#edf3ff] ${menuOpen ? "" : "opacity-0 pointer-events-none"}`} aria-label="Close menu">
              <X size={20} />
            </button>
          </header>

          <Outlet />
          <MiniPromiChat role={role} />
        </main>
      </div>
    </div>
  );
}
