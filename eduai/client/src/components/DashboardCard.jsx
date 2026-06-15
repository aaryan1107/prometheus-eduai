import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function DashboardCard({ icon: Icon, title, body, action, to, onClick, tone = "blue" }) {
  const toneClass = {
    blue: "bg-[#e7f0ff] text-edu-blue",
    green: "bg-[#dff8ec] text-edu-green",
    lavender: "bg-[#eeeaff] text-[#7967e8]",
    rose: "bg-[#ffe7e2] text-[#d75848]",
    gold: "bg-[#fff4cf] text-[#9a6a00]"
  }[tone];

  const content = (
    <>
      <span className={`grid h-12 w-12 place-items-center rounded-2xl ${toneClass}`}>
        <Icon size={22} />
      </span>
      <span className="min-w-0 flex-1">
        <strong className="block text-base text-[#151b2d] dark:text-[#edf3ff]">{title}</strong>
        <small className="mt-1 block text-sm leading-5 text-edu-muted">{body}</small>
        {action && <em className="mt-3 block text-sm font-extrabold not-italic text-edu-blue">{action}</em>}
      </span>
      <ChevronRight size={18} className="text-slate-400" />
    </>
  );

  if (to) {
    return (
      <Link to={to} className="soft-card study-stack-card flex items-center gap-4 no-underline transition hover:-translate-y-0.5 hover:border-blue-200 dark:border-[#263754] dark:bg-[#111b2e] dark:hover:border-[#4667ff]">
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className="soft-card study-stack-card flex w-full items-center gap-4 text-left transition hover:-translate-y-0.5 hover:border-blue-200 dark:border-[#263754] dark:bg-[#111b2e] dark:hover:border-[#4667ff]">
      {content}
    </button>
  );
}
