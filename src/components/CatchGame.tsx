"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { fruits } from "@/data/fruits";
import { addTicket, MAX_PLAYS_PER_DAY, openLuckyDraw, startPlay, usePlaysLeft, useTickets } from "@/lib/tickets";

// ── 遊戲規則 ──
const GAME_TIME = 20; // 秒
const GOOD_POINTS = 10;
const BAD_POINTS = -5;
const TICKET_SCORE = 100;
const COUNTDOWN = 3;

type Kind = "good" | "rotten" | "trash";
type Item = {
  x: number;
  y: number;
  r: number;
  vy: number;
  rot: number;
  vr: number;
  kind: Kind;
  img?: HTMLImageElement;
  emoji?: string;
};
type Pop = { x: number; y: number; text: string; color: string; life: number };
type Phase = "ready" | "countdown" | "playing" | "ended";

const TRASH = ["🥤", "🥫", "👟", "🧻", "🛍️"];
const rand = (a: number, b: number) => a + Math.random() * (b - a);

export default function CatchGame() {
  const root = useRef<HTMLDivElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const images = useRef<HTMLImageElement[]>([]);

  // 遊戲狀態放在 ref，避免每一幀都重新渲染 React
  const g = useRef({
    w: 600,
    h: 520,
    basketX: 300,
    targetX: 300,
    keyDir: 0,
    items: [] as Item[],
    pops: [] as Pop[],
    spawnIn: 0,
    elapsed: 0,
    countdown: 0,
    score: 0,
    caughtGood: 0,
    caughtBad: 0,
    phase: "ready" as Phase,
  });

  const [phase, setPhase] = useState<Phase>("ready");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [count, setCount] = useState(COUNTDOWN);
  const [result, setResult] = useState({ good: 0, bad: 0, ticket: false });
  const playsLeft = usePlaysLeft();
  const tickets = useTickets();

  // 預先載入水果照片
  useEffect(() => {
    images.current = fruits.map((f) => {
      const img = new Image();
      img.src = f.img;
      return img;
    });
  }, []);

  // 畫布跟著容器大小調整（支援高解析度螢幕）
  useEffect(() => {
    const el = wrap.current;
    const cv = canvas.current;
    if (!el || !cv) return;
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = w * dpr;
      cv.height = h * dpr;
      cv.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
      const s = g.current;
      const ratio = s.w ? w / s.w : 1;
      s.basketX *= ratio;
      s.targetX *= ratio;
      s.w = w;
      s.h = h;
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const endGame = useCallback(() => {
    const s = g.current;
    s.phase = "ended";
    const ticket = s.score >= TICKET_SCORE;
    if (ticket) addTicket();
    setResult({ good: s.caughtGood, bad: s.caughtBad, ticket });
    setPhase("ended");
  }, []);

  // ── 主迴圈 ──
  useEffect(() => {
    const cv = canvas.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    let raf = 0;
    let last = performance.now();
    let shownSecond = GAME_TIME;
    let shownCount = COUNTDOWN;

    const basketW = () => Math.max(84, Math.min(130, g.current.w * 0.2));
    const basketY = () => g.current.h - 54;

    const spawn = () => {
      const s = g.current;
      const progress = s.elapsed / GAME_TIME;
      const roll = Math.random();
      const kind: Kind = roll < 0.62 ? "good" : roll < 0.82 ? "rotten" : "trash";
      const r = Math.max(18, Math.min(28, s.w * 0.045));
      const scale = s.h / 520;
      s.items.push({
        x: rand(r + 4, s.w - r - 4),
        y: -r,
        r,
        vy: rand(150, 220) * (1 + progress * 0.8) * scale,
        rot: rand(0, Math.PI * 2),
        vr: rand(-2, 2),
        kind,
        img: kind === "good" ? images.current[Math.floor(Math.random() * images.current.length)] : undefined,
        emoji: kind === "trash" ? TRASH[Math.floor(Math.random() * TRASH.length)] : undefined,
      });
      // 越後面掉得越密：20 秒內大約掉 45 個
      s.spawnIn = rand(0.4, 0.62) * (1 - progress * 0.35);
    };

    const update = (dt: number) => {
      const s = g.current;

      // 籃子移動：鍵盤或滑鼠／手指
      if (s.keyDir) s.targetX += s.keyDir * s.w * 1.1 * dt;
      const half = basketW() / 2;
      s.targetX = Math.max(half, Math.min(s.w - half, s.targetX));
      s.basketX += (s.targetX - s.basketX) * Math.min(1, dt * 14);

      if (s.phase === "countdown") {
        s.countdown -= dt;
        const c = Math.ceil(s.countdown);
        if (c !== shownCount) {
          shownCount = c;
          setCount(c);
        }
        if (s.countdown <= 0) {
          s.phase = "playing";
          setPhase("playing");
        }
      }

      if (s.phase === "playing") {
        s.elapsed += dt;
        const left = Math.max(0, Math.ceil(GAME_TIME - s.elapsed));
        if (left !== shownSecond) {
          shownSecond = left;
          setTimeLeft(left);
        }
        s.spawnIn -= dt;
        if (s.spawnIn <= 0) spawn();
        if (s.elapsed >= GAME_TIME) endGame();
      }

      // 物品掉落與接住判定
      const by = basketY();
      const bw = basketW();
      s.items = s.items.filter((it) => {
        it.y += it.vy * dt;
        it.rot += it.vr * dt;
        if (s.phase === "playing" && it.y + it.r * 0.6 >= by && it.y - it.r <= by + 18 && Math.abs(it.x - s.basketX) <= bw / 2 + it.r * 0.3) {
          const pts = it.kind === "good" ? GOOD_POINTS : BAD_POINTS;
          s.score = Math.max(0, s.score + pts);
          if (pts > 0) s.caughtGood++;
          else s.caughtBad++;
          setScore(s.score);
          s.pops.push({
            x: it.x,
            y: by - 10,
            text: pts > 0 ? `+${pts}` : `${pts}`,
            color: pts > 0 ? "#2f7d3a" : "#c0392b",
            life: 0.8,
          });
          return false;
        }
        return it.y - it.r < s.h;
      });

      s.pops = s.pops.filter((p) => {
        p.life -= dt;
        p.y -= 50 * dt;
        return p.life > 0;
      });
    };

    const drawGood = (it: Item) => {
      ctx.save();
      ctx.translate(it.x, it.y);
      ctx.rotate(it.rot);
      ctx.beginPath();
      ctx.arc(0, 0, it.r, 0, Math.PI * 2);
      ctx.closePath();
      ctx.save();
      ctx.clip();
      if (it.img?.complete && it.img.naturalWidth) {
        const { naturalWidth: iw, naturalHeight: ih } = it.img;
        const s = Math.min(iw, ih);
        ctx.drawImage(it.img, (iw - s) / 2, (ih - s) / 2, s, s, -it.r, -it.r, it.r * 2, it.r * 2);
      } else {
        ctx.fillStyle = "#ffb347";
        ctx.fill();
      }
      // 亮面反光
      const gl = ctx.createRadialGradient(-it.r * 0.35, -it.r * 0.4, 0, -it.r * 0.35, -it.r * 0.4, it.r);
      gl.addColorStop(0, "rgba(255,255,255,0.7)");
      gl.addColorStop(0.35, "rgba(255,255,255,0)");
      ctx.fillStyle = gl;
      ctx.fillRect(-it.r, -it.r, it.r * 2, it.r * 2);
      ctx.restore();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#fff";
      ctx.stroke();
      ctx.restore();
    };

    const drawRotten = (it: Item) => {
      ctx.save();
      ctx.translate(it.x, it.y);
      ctx.rotate(it.rot);
      const gr = ctx.createRadialGradient(-it.r * 0.3, -it.r * 0.3, it.r * 0.1, 0, 0, it.r);
      gr.addColorStop(0, "#9b7b45");
      gr.addColorStop(1, "#3b2a14");
      ctx.beginPath();
      // 有點凹凸的外形
      for (let i = 0; i <= 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        const rr = it.r * (i % 2 ? 0.9 : 1);
        ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
      }
      ctx.closePath();
      ctx.fillStyle = gr;
      ctx.fill();
      // 霉斑
      ctx.fillStyle = "rgba(120,160,80,0.75)";
      ctx.beginPath();
      ctx.arc(it.r * 0.3, -it.r * 0.2, it.r * 0.22, 0, Math.PI * 2);
      ctx.arc(-it.r * 0.35, it.r * 0.3, it.r * 0.16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(20,12,4,0.6)";
      ctx.beginPath();
      ctx.arc(0, it.r * 0.1, it.r * 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawTrash = (it: Item) => {
      ctx.save();
      ctx.translate(it.x, it.y);
      ctx.rotate(it.rot * 0.5);
      ctx.font = `${it.r * 1.8}px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(it.emoji ?? "🥤", 0, 2);
      ctx.restore();
    };

    const drawBasket = () => {
      const s = g.current;
      const w = basketW();
      const y = basketY();
      const x = s.basketX;
      ctx.save();
      // 陰影
      ctx.fillStyle = "rgba(28,38,32,0.15)";
      ctx.beginPath();
      ctx.ellipse(x, y + 44, w * 0.45, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      // 籃身（碗形）
      const body = ctx.createLinearGradient(0, y, 0, y + 40);
      body.addColorStop(0, "#2b3a31");
      body.addColorStop(1, "#1c2620");
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.moveTo(x - w / 2, y);
      ctx.lineTo(x + w / 2, y);
      ctx.quadraticCurveTo(x + w / 2 - 4, y + 38, x + w * 0.3, y + 38);
      ctx.lineTo(x - w * 0.3, y + 38);
      ctx.quadraticCurveTo(x - w / 2 + 4, y + 38, x - w / 2, y);
      ctx.fill();
      // 編織紋路
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.lineWidth = 1;
      for (let i = 1; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(x - w / 2 + i * 4, y + i * 12);
        ctx.lineTo(x + w / 2 - i * 4, y + i * 12);
        ctx.stroke();
      }
      // 籃口亮邊
      ctx.fillStyle = "#d9481f";
      ctx.beginPath();
      ctx.roundRect(x - w / 2 - 4, y - 5, w + 8, 9, 5);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.45)";
      ctx.fillRect(x - w / 2 + 4, y - 4, w * 0.35, 2);
      ctx.restore();
    };

    const draw = () => {
      const s = g.current;
      ctx.clearRect(0, 0, s.w, s.h);
      for (const it of s.items) {
        if (it.kind === "good") drawGood(it);
        else if (it.kind === "rotten") drawRotten(it);
        else drawTrash(it);
      }
      drawBasket();
      for (const p of s.pops) {
        ctx.globalAlpha = Math.max(0, p.life / 0.8);
        ctx.font = "bold 22px 'Noto Serif TC', serif";
        ctx.textAlign = "center";
        ctx.fillStyle = p.color;
        ctx.fillText(p.text, p.x, p.y);
        ctx.globalAlpha = 1;
      }
    };

    const loop = (now: number) => {
      // 切到別的分頁時 rAF 會暫停；限制 dt 避免回來時物品瞬移
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      update(dt);
      draw();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [endGame]);

  // 鍵盤操作（只在遊戲中攔截方向鍵，避免影響頁面捲動）
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const s = g.current;
      if (s.phase !== "playing" && s.phase !== "countdown") return;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") s.keyDir = -1;
      else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") s.keyDir = 1;
      else return;
      e.preventDefault();
    };
    const up = (e: KeyboardEvent) => {
      const s = g.current;
      if (["ArrowLeft", "ArrowRight", "a", "A", "d", "D"].includes(e.key)) s.keyDir = 0;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  const pointer = (e: React.PointerEvent) => {
    const rect = canvas.current?.getBoundingClientRect();
    if (rect) g.current.targetX = e.clientX - rect.left;
  };

  const start = () => {
    if (!startPlay()) return;
    const s = g.current;
    s.items = [];
    s.pops = [];
    s.score = 0;
    s.caughtGood = 0;
    s.caughtBad = 0;
    s.elapsed = 0;
    s.spawnIn = 0;
    s.countdown = COUNTDOWN;
    s.basketX = s.targetX = s.w / 2;
    s.phase = "countdown";
    setScore(0);
    setTimeLeft(GAME_TIME);
    setCount(COUNTDOWN);
    setPhase("countdown");
    // 捲到分數列＋遊戲畫面都看得到的位置（scroll-mt 預留導覽列高度）
    root.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // 遊戲進行中隱藏右下角的「抽優惠」按鈕，避免擋到畫面
  useEffect(() => {
    const playing = phase === "playing" || phase === "countdown";
    document.body.toggleAttribute("data-playing", playing);
    return () => document.body.removeAttribute("data-playing");
  }, [phase]);

  const noPlays = playsLeft === 0;
  const progress = Math.min(100, (score / TICKET_SCORE) * 100);

  return (
    <div ref={root} className="scroll-mt-28">
      {/* 分數列 */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        <div className="glass rounded-xl px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted">分數</p>
          <p className="font-serif text-3xl font-black tabular-nums">{score}</p>
        </div>
        <div className="glass rounded-xl px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted">剩餘時間</p>
          <p className={`font-serif text-3xl font-black tabular-nums ${timeLeft <= 10 && phase === "playing" ? "text-[#d9481f]" : ""}`}>
            {timeLeft}
            <span className="ml-1 text-sm font-normal text-muted">秒</span>
          </p>
        </div>
        <div className="glass rounded-xl px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted">抽獎券</p>
          <p className="font-serif text-3xl font-black tabular-nums">{tickets ?? "–"}</p>
        </div>
      </div>

      {/* 距離抽獎券的進度條 */}
      <div className="mb-4">
        <div className="mb-1 flex justify-between text-xs text-muted">
          <span>距離抽獎券</span>
          <span>
            {Math.min(score, TICKET_SCORE)} / {TICKET_SCORE}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-ink/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#ffb347] to-[#d9481f] transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 遊戲畫面 */}
      <div
        ref={wrap}
        className="glass relative h-[460px] overflow-hidden rounded-2xl sm:h-[520px]"
        style={{ touchAction: phase === "playing" || phase === "countdown" ? "none" : "auto" }}
      >
        <canvas
          ref={canvas}
          onPointerMove={pointer}
          onPointerDown={pointer}
          className="absolute inset-0 h-full w-full cursor-none"
          aria-label="接水果遊戲畫面"
        />

        {phase === "countdown" && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span key={count} className="welcome-in font-serif text-8xl font-black text-ink/80">
              {count > 0 ? count : "開始！"}
            </span>
          </div>
        )}

        {(phase === "ready" || phase === "ended") && (
          <div className="absolute inset-0 flex items-center justify-center bg-paper/40 p-4 backdrop-blur-[2px]">
            <div className="glass glass-strong w-full max-w-sm rounded-2xl p-6 text-center">
              {phase === "ready" ? (
                <>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-muted">How to play</p>
                  <h2 className="mt-2 font-serif text-2xl font-black">移動籃子，接住好水果</h2>
                  <ul className="mt-4 space-y-1.5 text-left text-sm">
                    <li className="flex justify-between"><span>🥭 好水果</span><span className="font-semibold text-[#2f7d3a]">+{GOOD_POINTS}</span></li>
                    <li className="flex justify-between"><span>🟤 爛水果、🥤 垃圾</span><span className="font-semibold text-[#c0392b]">{BAD_POINTS}</span></li>
                    <li className="flex justify-between"><span>⏱ 遊戲時間</span><span>{GAME_TIME} 秒</span></li>
                    <li className="flex justify-between"><span>🎟 達到 {TICKET_SCORE} 分</span><span>得 1 張抽獎券</span></li>
                  </ul>
                  <p className="mt-4 text-xs text-muted">電腦：滑鼠或 ← → 鍵　手機：手指左右拖曳</p>
                </>
              ) : (
                <>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-muted">Time&apos;s up</p>
                  <p className="mt-2 font-serif text-6xl font-black tabular-nums">{score}</p>
                  <p className="mt-1 text-sm text-muted">
                    接到好水果 {result.good} 個・踩雷 {result.bad} 個
                  </p>
                  {result.ticket ? (
                    <div className="mt-4 rounded-xl border border-dashed border-[#d9481f]/50 bg-white/70 p-3">
                      <p className="font-semibold text-[#d9481f]">🎟 恭喜獲得 1 張抽獎券！</p>
                      <button
                        type="button"
                        onClick={openLuckyDraw}
                        className="mt-2 rounded-full bg-[#d9481f] px-5 py-1.5 text-sm text-white transition hover:bg-ink"
                      >
                        馬上去抽獎
                      </button>
                    </div>
                  ) : (
                    <p className="mt-4 rounded-xl bg-white/50 p-3 text-sm">
                      還差 {TICKET_SCORE - score} 分就能拿到抽獎券，再接再厲！
                    </p>
                  )}
                </>
              )}

              <button
                type="button"
                onClick={start}
                disabled={noPlays || playsLeft === null}
                className="mt-5 w-full rounded-full bg-ink py-3 text-paper transition hover:bg-[#d9481f] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {noPlays ? "今天的次數用完了" : phase === "ready" ? "開始遊戲" : "再玩一次"}
              </button>
              <p className="mt-2 text-xs text-muted">
                {noPlays ? (
                  <>明天再來玩，或先去 <Link href="/" className="underline">逛逛果園</Link></>
                ) : (
                  <>今天還可以玩 {playsLeft ?? "–"} / {MAX_PLAYS_PER_DAY} 次</>
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
