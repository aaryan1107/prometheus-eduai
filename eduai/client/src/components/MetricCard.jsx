export default function MetricCard({ label, value, hint, tone = "blue" }) {
  const toneClass = {
    blue: "bg-[#e7f0ff]",
    green: "bg-[#dff8ec]",
    lavender: "bg-[#eeeaff]",
    rose: "bg-[#ffe7e2]",
    gold: "bg-[#fff4cf]"
  }[tone];

  return (
    <article className={`metric-card ${toneClass}`}>
      <p className="text-sm font-black uppercase tracking-wide text-slate-500">{label}</p>
      <strong className="mt-3 block text-3xl leading-none text-[#151b2d]">{value}</strong>
      <span className="mt-2 block text-sm font-bold text-slate-500">{hint}</span>
    </article>
  );
}
