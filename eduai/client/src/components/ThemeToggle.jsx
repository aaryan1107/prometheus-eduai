import { Moon, Sun } from "lucide-react";

export default function ThemeToggle({ theme, toggleTheme, label = false }) {
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
      {label && <span>{isDark ? "Light" : "Dark"}</span>}
    </button>
  );
}
