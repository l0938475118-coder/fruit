import { photoCredits } from "@/data/fruits";
import Link from "next/link";
import Parallax from "./Parallax";

export default function Footer() {
  return (
    <footer id="contact" className="relative mt-20 bg-ink text-paper lg:mt-32">
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-14 sm:px-8 lg:pt-20">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-12 md:gap-12">
          <div className="col-span-2 md:col-span-6">
            <p className="mb-6 text-[11px] uppercase tracking-[0.3em] text-paper/50">Contact</p>
            <p className="break-words font-serif text-2xl leading-snug sm:text-3xl lg:text-4xl">
              想訂一箱當季的味道？<br />
              <a href="mailto:hello@example.com" className="border-b border-paper/40 transition hover:border-[#ffb347] hover:text-[#ffb347]">
                hello@example.com
              </a>
            </p>
          </div>

          <div className="text-sm md:col-span-3">
            <p className="mb-4 text-[11px] uppercase tracking-[0.3em] text-paper/50">Index</p>
            <ul className="space-y-2 text-paper/80">
              <li><Link href="/#fruits" className="hover:text-paper">島嶼之果</Link></li>
              <li><Link href="/#calendar" className="hover:text-paper">產季曆</Link></li>
              <li><Link href="/blog" className="hover:text-paper">產地行情</Link></li>
              <li><Link href="/game" className="hover:text-paper">小遊戲</Link></li>
              <li><Link href="/#story" className="hover:text-paper">風土</Link></li>
            </ul>
          </div>

          <div className="text-sm md:col-span-3">
            <p className="mb-4 text-[11px] uppercase tracking-[0.3em] text-paper/50">Visit</p>
            <p className="leading-relaxed text-paper/80">
              台灣 · 練習用地址<br />
              (00) 0000-0000<br />
              週一至週六 09:00 – 18:00
            </p>
          </div>
        </div>

        {/* 大字橫向視差：往下捲時慢慢往左滑 */}
        <Parallax speed={0.25} axis="x" className="mt-14 lg:mt-20">
          <p
            aria-hidden
            className="select-none whitespace-nowrap font-serif text-[20vw] font-black leading-none tracking-tight text-paper/[0.07] lg:text-[12rem]"
          >
            福爾摩沙
          </p>
        </Parallax>

        <div className="mt-6 border-t border-paper/15 pt-6 text-[11px] leading-relaxed text-paper/40">
          <span className="mr-2 uppercase tracking-[0.2em]">Photo credits</span>
          {photoCredits.map((c, i) => (
            <span key={c.url}>
              {i > 0 && " · "}
              <a href={c.url} target="_blank" rel="noopener noreferrer" className="hover:text-paper/80">
                {c.what}：{c.author}（{c.license}）
              </a>
            </span>
          ))}
          <span>，皆來自 Wikimedia Commons。</span>
        </div>

        <div className="mt-6 flex flex-col justify-between gap-2 border-t border-paper/15 pt-6 text-xs text-paper/50 sm:flex-row">
          <span>© 2026 福爾摩沙果園</span>
          <span>練習用網站 · 內容僅供參考</span>
        </div>
      </div>
    </footer>
  );
}
