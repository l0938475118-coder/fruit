"use client";

import { useEffect, useRef, useState } from "react";
import { NAME_MAX, OPEN_WELCOME_EVENT, saveVisitorName, useVisitorName } from "@/lib/visitor";

/** 第一次進站時詢問稱呼（之後記在 localStorage）；可透過 openWelcome() 重新打開來改名 */
export default function WelcomeGate() {
  const name = useVisitorName();
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");

  const show = () => {
    const d = dialog.current;
    if (!d || d.open) return;
    // 若抽獎視窗開著，不要疊上去
    if (document.querySelector("dialog[open]")) return;
    d.showModal();
    input.current?.focus();
  };

  // 還沒問過（name === null）才自動跳出
  useEffect(() => {
    if (name === null) show();
  }, [name]);

  // 讓其他元件可以叫出來改名
  useEffect(() => {
    const onOpen = () => {
      setValue(name ?? "");
      show();
    };
    window.addEventListener(OPEN_WELCOME_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_WELCOME_EVENT, onOpen);
  }, [name]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    saveVisitorName(value);
    dialog.current?.close();
  };

  const skip = () => {
    // 略過也要記下來，避免每次進站都跳；已經有名字的人按略過則保留原名
    if (name === null) saveVisitorName("");
    dialog.current?.close();
  };

  return (
    <dialog
      ref={dialog}
      onCancel={(e) => {
        e.preventDefault(); // Esc 等同略過
        skip();
      }}
      aria-labelledby="welcome-title"
      className="lucky-dialog m-auto w-[calc(100%-2rem)] max-w-md overflow-visible bg-transparent p-0 text-ink"
    >
      <form onSubmit={submit} className="glass glass-strong relative rounded-2xl p-6 sm:p-8">
        <div
          className="orb mb-6 h-12 w-12"
          style={{ "--c1": "#ffb347", "--c2": "#d9481f" } as React.CSSProperties}
        />
        <p className="text-[11px] uppercase tracking-[0.3em] text-muted">Welcome</p>
        <h2 id="welcome-title" className="mt-2 font-serif text-3xl font-black">
          歡迎來到果園
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">我們該怎麼稱呼你呢？</p>

        <label htmlFor="visitor-name" className="sr-only">
          你的稱呼
        </label>
        <input
          ref={input}
          id="visitor-name"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={NAME_MAX}
          placeholder="例如：小美"
          autoComplete="nickname"
          className="mt-6 w-full rounded-xl border border-ink/15 bg-white/80 px-4 py-3 text-lg outline-none transition placeholder:text-muted/60 focus:border-ink/40 focus:ring-4 focus:ring-[#ffb347]/30"
        />

        <div className="mt-6 flex items-center gap-3">
          <button
            type="submit"
            disabled={!value.trim()}
            className="flex-1 rounded-full bg-ink py-3 text-paper transition hover:bg-[#d9481f] disabled:cursor-not-allowed disabled:opacity-40"
          >
            進入果園
          </button>
          <button type="button" onClick={skip} className="rounded-full px-5 py-3 text-sm text-muted transition hover:bg-ink/5 hover:text-ink">
            略過
          </button>
        </div>
      </form>
    </dialog>
  );
}
