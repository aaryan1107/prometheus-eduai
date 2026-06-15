import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, BookOpenCheck, GraduationCap, LockKeyhole, Mail, ShieldCheck, Sparkles, Upload } from "lucide-react";
import PromiAvatar from "../components/PromiAvatar.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";

const roles = [
  {
    id: "student",
    label: "Student",
    icon: BookOpenCheck,
    title: "Practice, revise, ask Promi",
    route: "/student",
    email: "student@prometheus.edu"
  },
  {
    id: "teacher",
    label: "Teacher",
    icon: Upload,
    title: "Create, mark, review scripts",
    route: "/teacher",
    email: "teacher@prometheus.edu"
  },
  {
    id: "admin",
    label: "HOD",
    icon: BarChart3,
    title: "See improvement and integrity",
    route: "/admin",
    email: "hod@prometheus.edu"
  }
];

export default function Login({ theme, toggleTheme, onLogin }) {
  const navigate = useNavigate();
  const [role, setRole] = useState("student");
  const [mode, setMode] = useState("signin");
  const activeRole = roles.find((item) => item.id === role) || roles[0];
  const ActiveIcon = activeRole.icon;

  const submit = (event) => {
    event.preventDefault();
    onLogin(role);
    navigate(activeRole.route, { replace: true });
  };

  return (
    <main className="login-shell">
      <section className="login-brand-panel">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-3 rounded-[22px] bg-white/90 px-4 py-3 font-black text-[#151b2d] shadow-soft dark:bg-[#17233a] dark:text-[#edf3ff]">
            <GraduationCap size={24} />
            EduAI
          </span>
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>

        <div className="mt-auto">
          <PromiAvatar size="lg" />
          <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#dff8ec] px-4 py-2 text-sm font-black text-edu-green dark:bg-[#11382f]">
            <Sparkles size={16} />
            Promi is waiting
          </span>
          <h1 className="mt-4 max-w-xl text-4xl font-black leading-tight text-[#151b2d] dark:text-[#edf3ff] sm:text-5xl">
            Sign in to the workspace built for your role.
          </h1>
          <p className="mt-4 max-w-lg text-base font-semibold text-slate-600 dark:text-[#aebbd0]">
            Students get practice and Promi. Teachers get marking and script tools. HODs get governance and academic intelligence.
          </p>
        </div>
      </section>

      <section className="login-card">
        <div>
          <span className="text-sm font-black uppercase tracking-wide text-edu-muted">Prometheus EduAI</span>
          <h2 className="mt-2 text-3xl font-black text-[#151b2d] dark:text-[#edf3ff]">
            {mode === "signin" ? "Welcome back" : "Create access"}
          </h2>
        </div>

        <div className="segmented-control">
          <button className={mode === "signin" ? "active" : ""} onClick={() => setMode("signin")} type="button">Sign in</button>
          <button className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")} type="button">Sign up</button>
        </div>

        <div className="role-grid">
          {roles.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === role;
            return (
              <button key={item.id} type="button" onClick={() => setRole(item.id)} className={`role-choice ${isActive ? "active" : ""}`}>
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <form onSubmit={submit} className="space-y-4">
          <label className="login-field">
            <span>Email</span>
            <div>
              <Mail size={18} />
              <input defaultValue={activeRole.email} type="email" />
            </div>
          </label>

          <label className="login-field">
            <span>Password</span>
            <div>
              <LockKeyhole size={18} />
              <input defaultValue="promi123" type="password" />
            </div>
          </label>

          <button className="primary-btn w-full" type="submit">
            <ActiveIcon size={18} />
            Enter {activeRole.label} workspace
          </button>
        </form>

        <div className="rounded-[24px] bg-[#eef3ff] p-4 dark:bg-[#0d1628]">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-1 text-edu-green" size={20} />
            <div>
              <strong className="text-[#151b2d] dark:text-[#edf3ff]">{activeRole.title}</strong>
              <p className="mt-1 text-sm font-semibold text-edu-muted">This prototype uses role-preview login so each interface can stay exclusive and focused.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
