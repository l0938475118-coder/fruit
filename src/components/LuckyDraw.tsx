"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { fruits } from "@/data/fruits";
import { useVisitorName } from "@/lib/visitor";
import { OPEN_LUCKY_DRAW_EVENT, spendTicket, useTickets } from "@/lib/tickets";
import Link from "next/link";

const WIN_RATE = 0.1; // 中獎機率 10%

type Phase = "idle" | "spinning" | "win" | "lose";

// 用瀏覽器的密碼學亂數，比 Math.random 更平均
function rand() {
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return a[0] / 2 ** 32;
}

function makeCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 去掉容易看錯的 0 O 1 I
  return Array.from({ length: 6 }, () => chars[Math.floor(rand() * chars.length)]).join("");
}

export default function LuckyDraw() {
  const dialog = useRef<HTMLDialogElement>(null);
  const timers = useRef<number[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [index, setIndex] = useState(0);
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);
  const visitor = useVisitorName();
  const tickets = useTickets();
  const noTickets = tickets === 0;

  const fruit = fruits[index];

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  useEffect(() => clearTimers, []);

  const open = () => {
    if (dialog.current?.open) return;
    setPhase("idle");
    setCopied(false);
    dialog.current?.showModal();
  };

  // 遊戲結束畫面可以直接叫出抽獎視窗
  useEffect(() => {
    window.addEventListener(OPEN_LUCKY_DRAW_EVENT, open);
    return () => window.removeEventListener(OPEN_LUCKY_DRAW_EVENT, open);
  });

  const close = () => {
    // 轉動中不能關，避免抽獎券扣了卻沒看到結果
    if (phase === "spinning") return;
    clearTimers();
    dialog.current?.close();
    setPhase("idle");
  };

  const draw = () => {
    // 每抽一次用掉一張抽獎券
    if (!spendTicket()) return;
    clearTimers();
    setCopied(false);
    setPhase("spinning");

    // 先決定結果，動畫只是表演
    const win = rand() < WIN_RATE;
    const target = Math.floor(rand() * fruits.length);

    const finish = () => {
      setIndex(target);
      if (win) {
        setCode(`FRUIT-${makeCode()}`);
        setPhase("win");
      } else {
        setPhase("lose");
      }
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finish();
      return;
    }

    // 拉霸動畫：一開始很快，越轉越慢，大約 2.2 秒停下
    let t = 0;
    let i = index;
    const steps = 18;
    for (let s = 0; s < steps; s++) {
      t += 40 + s * s * 1.2;
      i = (i + 1) % fruits.length;
      const show = i;
      timers.current.push(window.setTimeout(() => setIndex(show), t));
    }
    timers.current.push(window.setTimeout(finish, t + 220));
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      {/* 浮動按鈕 */}
      <button
        type="button"
        onClick={open}
        className="lucky-fab group fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-ink py-2 pl-2 pr-5 text-sm text-paper shadow-[0_16px_32px_-12px_rgba(28,38,32,0.6)] transition hover:-translate-y-0.5 hover:bg-[#d9481f] sm:bottom-8 sm:right-8"
      >
        <span
          className="orb h-8 w-8 transition-transform duration-500 group-hover:rotate-180"
          style={{ "--c1": "#ffb347", "--c2": "#d9481f" } as React.CSSProperties}
        />
        抽優惠
        {!!tickets && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#d9481f] px-1 text-[11px] font-bold text-white ring-2 ring-paper">
            {tickets}
          </span>
        )}
      </button>

      <dialog
        ref={dialog}
        onCancel={(e) => {
          // Esc：轉動中不關閉
          if (phase === "spinning") e.preventDefault();
        }}
        onClose={() => {
          clearTimers();
          setPhase("idle");
        }}
        onClick={(e) => {
          // 點背景關閉
          if (e.target === dialog.current) close();
        }}
        aria-labelledby="lucky-title"
        className="lucky-dialog m-auto w-[calc(100%-2rem)] max-w-md overflow-visible bg-transparent p-0 text-ink"
      >
        <div className="glass glass-strong relative rounded-2xl p-6 sm:p-8">
          <button
            type="button"
            onClick={close}
            disabled={phase === "spinning"}
            aria-label="關閉"
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-ink/5 hover:text-ink disabled:opacity-30"
          >
            ✕
          </button>

          <p className="text-[11px] uppercase tracking-[0.3em] text-muted">Lucky draw</p>
          <h2 id="lucky-title" className="mt-2 font-serif text-3xl font-black">
            當季鮮果，試試手氣
          </h2>
          <p className="mt-2 text-sm text-muted">每抽一次用掉 1 張抽獎券，有 10% 機會抽中任一水果的 9 折優惠券。</p>
          <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-line bg-white/60 px-3 py-1 text-sm">
            🎟 你有 <strong className="tabular-nums">{tickets ?? "–"}</strong> 張抽獎券
          </p>

          {/* 轉盤視窗 */}
          <div className="relative mx-auto mt-8 h-44 w-44">
            <div
              className={`absolute inset-0 overflow-hidden rounded-full border-[6px] border-white shadow-[0_24px_40px_-20px_rgba(28,38,32,0.5)] transition-transform duration-300 ${
                phase === "spinning" ? "scale-95" : phase === "win" ? "scale-105" : ""
              }`}
            >
              <Image key={fruit.no} src={fruit.img} alt={fruit.name} fill sizes="176px" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent" />
            </div>
            {phase === "win" && (
              <span className="absolute -right-3 -top-3 flex h-16 w-16 rotate-12 items-center justify-center rounded-full bg-[#d9481f] font-serif text-xl font-black text-white shadow-lg">
                9折
              </span>
            )}
          </div>

          <p className="mt-4 text-center font-serif text-lg font-semibold" aria-live="polite">
            {phase === "spinning" ? "轉動中……" : phase === "idle" ? "按下按鈕開始抽獎" : fruit.name}
          </p>

          {/* 結果 */}
          <div className="mt-6 min-h-[132px]" aria-live="polite">
            {phase === "win" && (
              <div className="rounded-xl border border-dashed border-[#d9481f]/50 bg-white/70 p-4 text-center">
                <p className="text-sm font-semibold text-[#d9481f]">
                  恭喜{visitor ? ` ${visitor}` : ""}中獎！{fruit.name} 9 折優惠券
                </p>
                <p className="mt-3 font-mono text-2xl font-bold tracking-widest">{code}</p>
                <button
                  type="button"
                  onClick={copy}
                  className="mt-3 rounded-full border border-ink/20 px-4 py-1.5 text-sm transition hover:bg-ink hover:text-paper"
                >
                  {copied ? "已複製 ✓" : "複製優惠碼"}
                </button>
              </div>
            )}
            {phase === "lose" && (
              <div className="rounded-xl bg-white/50 p-4 text-center">
                <p className="font-semibold">差一點點！</p>
                <p className="mt-1 text-sm text-muted">
                  {tickets ? "這次沒有抽中，再試一次吧。" : "這次沒有抽中，去玩遊戲多賺幾張抽獎券吧。"}
                </p>
              </div>
            )}
            {noTickets && phase === "idle" && (
              <div className="rounded-xl bg-white/50 p-4 text-center">
                <p className="font-semibold">你還沒有抽獎券</p>
                <p className="mt-1 text-sm text-muted">玩「接水果」小遊戲，一局拿到 100 分就送 1 張。</p>
              </div>
            )}
          </div>

          {noTickets && phase !== "spinning" ? (
            <Link
              href="/game"
              onClick={close}
              className="mt-2 block w-full rounded-full bg-[#d9481f] py-3 text-center text-white transition hover:bg-ink"
            >
              去玩接水果，賺抽獎券 →
            </Link>
          ) : (
            <button
              type="button"
              onClick={draw}
              disabled={phase === "spinning"}
              className="mt-2 w-full rounded-full bg-ink py-3 text-paper transition hover:bg-[#d9481f] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {phase === "idle" ? "用 1 張券抽獎" : phase === "spinning" ? "抽獎中…" : "再抽一次"}
            </button>
          )}
        </div>
      </dialog>
    </>
  );
}
