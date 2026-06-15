import { Bot, Sparkles } from "lucide-react";

export default function PromiAvatar({ size = "lg" }) {
  const wrapperSize = size === "sm" ? "h-12 w-12 rounded-[18px]" : "h-28 w-28 rounded-[34px]";
  const iconSize = size === "sm" ? 24 : 50;

  return (
    <div className={`promi-float relative grid ${wrapperSize} place-items-center bg-gradient-to-br from-[#7f7cff] via-[#4ca7ff] to-[#52d6a7] text-white shadow-xl shadow-blue-500/20`}>
      <Bot size={iconSize} strokeWidth={2.4} />
      <span className="absolute -right-1 -top-1 grid h-7 w-7 place-items-center rounded-full bg-[#fff4cf] text-[#151b2d] shadow">
        <Sparkles size={14} />
      </span>
      <span className="absolute -bottom-1 left-1/2 h-2 w-12 -translate-x-1/2 rounded-full bg-white/35" />
    </div>
  );
}
