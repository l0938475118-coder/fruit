"use client";

import { openWelcome, useVisitorName } from "@/lib/visitor";

function timeGreeting() {
  const h = new Date().getHours();
  if (h < 5) return "夜深了";
  if (h < 11) return "早安";
  if (h < 14) return "午安";
  if (h < 18) return "午後好";
  return "晚安";
}

/** 主視覺上方的歡迎詞；沒有名字時不顯示 */
export default function Greeting({ message = "今天想吃點什麼水果？" }: { message?: string }) {
  const name = useVisitorName();
  if (!name) return null;

  return (
    <div className="welcome-in mb-6 inline-flex max-w-full items-center gap-3 rounded-full border border-white/70 bg-white/50 py-1.5 pl-1.5 pr-4 text-sm shadow-sm backdrop-blur">
      <span
        className="orb h-7 w-7 shrink-0"
        style={{ "--c1": "#ffb347", "--c2": "#d9481f" } as React.CSSProperties}
      />
      <span className="truncate">
        {timeGreeting()}，<strong className="font-serif font-black">{name}</strong>。{message}
      </span>
      <button
        type="button"
        onClick={openWelcome}
        className="shrink-0 text-xs text-muted underline-offset-2 hover:text-ink hover:underline"
      >
        改稱呼
      </button>
    </div>
  );
}
