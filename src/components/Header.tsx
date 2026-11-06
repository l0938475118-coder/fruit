"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// 用 "/#..." 讓在 /blog 分頁點擊時也能回到首頁對應區塊
const links = [
  { href: "/#fruits", label: "島嶼之果" },
  { href: "/#calendar", label: "產季曆" },
  { href: "/blog", label: "產地行情" },
  { href: "/game", label: "小遊戲" },
  { href: "/#story", label: "風土" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 px-4 pt-4 sm:px-8">
      <div className="glass mx-auto flex max-w-7xl items-center justify-between rounded-xl px-5 py-3">
        <Link href="/" className="flex items-baseline gap-3">
          <span className="font-serif text-xl font-black tracking-wider">福爾摩沙果園</span>
          <span className="hidden text-[11px] uppercase tracking-[0.3em] text-muted lg:inline">
            Formosa Fruit
          </span>
        </Link>

        <nav className="hidden items-center gap-5 text-sm md:flex lg:gap-7">
          {links.map((l, i) => {
            const active = l.href === pathname;
            return (
              <Link key={l.href} href={l.href} className="group flex items-baseline gap-1.5">
                <span className="hidden text-[10px] text-muted lg:inline">0{i + 1}</span>
                <span
                  className={`whitespace-nowrap border-b pb-0.5 transition group-hover:border-ink ${
                    active ? "border-ink" : "border-transparent"
                  }`}
                >
                  {l.label}
                </span>
              </Link>
            );
          })}
          <a
            href="#contact"
            className="rounded-full bg-ink px-5 py-2 text-paper transition hover:bg-[#d9481f]"
          >
            聯絡
          </a>
        </nav>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-label={open ? "關閉選單" : "開啟選單"}
          aria-expanded={open}
          className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 md:hidden"
        >
          <span className={`h-px w-5 bg-ink transition ${open ? "translate-y-[3.5px] rotate-45" : ""}`} />
          <span className={`h-px w-5 bg-ink transition ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`} />
        </button>
      </div>

      {open && (
        <nav className="glass mx-auto mt-2 max-w-7xl rounded-xl p-2 md:hidden">
          {[...links, { href: "#contact", label: "聯絡" }].map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="flex items-baseline gap-3 border-b border-line px-3 py-3 last:border-0"
            >
              <span className="text-[10px] text-muted">0{i + 1}</span>
              <span className="font-serif text-lg">{l.label}</span>
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
