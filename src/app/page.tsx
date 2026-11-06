import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Parallax from "@/components/Parallax";
import Greeting from "@/components/Greeting";
import { fruits, orbStyle } from "@/data/fruits";

const months = Array.from({ length: 12 }, (_, i) => i + 1);

function seasonText(m: number[]) {
  if (m.length === 12) return "全年";
  return `${m[0]} – ${m[m.length - 1]} 月`;
}

function seasonCell(color: { c1: string; c2: string }, on: boolean) {
  return {
    background: on ? `linear-gradient(180deg, ${color.c1}, ${color.c2})` : "rgba(28,38,32,0.06)",
  };
}

// 斷點說明：預設＝手機、sm(640)＝大手機／小平板、md(768)＝平板、lg(1024)＝電腦
export default function Home() {
  const [mango, pineapple, sugarApple, lychee, , guava] = fruits;

  return (
    <div id="top" className="grain relative overflow-x-clip">
      {/* 背景色塊：讓玻璃有東西可以透 */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[900px]">
        <Parallax speed={0.35} className="absolute right-[-30%] top-[-10%] h-[500px] w-[500px] lg:right-[-10%] lg:h-[700px] lg:w-[700px]">
          <div className="h-full w-full rounded-full bg-[radial-gradient(circle,#ffb34766,transparent_65%)]" />
        </Parallax>
        <Parallax speed={0.2} className="absolute left-[-30%] top-[30%] h-[450px] w-[450px] lg:left-[-15%] lg:h-[600px] lg:w-[600px]">
          <div className="h-full w-full rounded-full bg-[radial-gradient(circle,#9cc27a55,transparent_65%)]" />
        </Parallax>
      </div>

      <Header />

      <main className="relative">
        {/* ── Hero ── 手機、平板上下排；電腦左右排 */}
        <section className="mx-auto grid max-w-7xl gap-14 px-4 pb-16 pt-12 sm:px-8 sm:pt-16 lg:grid-cols-12 lg:gap-12 lg:pb-24 lg:pt-24">
          <div className="lg:col-span-7">
            <Greeting />
            <p className="mb-8 flex items-center gap-4 text-[11px] uppercase tracking-[0.3em] text-muted sm:mb-10">
              <span className="h-px w-10 bg-ink/40" />
              台灣水果誌 · Vol. 01
            </p>
            <h1 className="font-serif text-[clamp(2.6rem,9vw,5.5rem)] font-black leading-[1.08] tracking-tight">
              島嶼的甜，
              <br />
              <span className="whitespace-nowrap">
                從<span className="text-[#d9481f]">土地</span>長出來。
              </span>
            </h1>
            <p className="mt-8 max-w-md text-[15px] leading-loose text-muted sm:mt-10 sm:text-base">
              北回歸線穿過島嶼中央，熱帶與亞熱帶在這裡交會。
              山與海之間的每一片果園，都在用自己的節奏，等待一年中最好的那幾週。
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-6 text-sm sm:mt-10">
              <a href="#fruits" className="rounded-full bg-ink px-7 py-3 text-paper transition hover:bg-[#d9481f]">
                翻閱六種果實
              </a>
              <a href="#calendar" className="border-b border-ink/40 pb-0.5 transition hover:border-ink">
                查看產季曆
              </a>
            </div>
          </div>

          {/* 照片 + 玻璃球構圖：手機／平板限制寬度置中 */}
          <div className="relative mx-auto h-[420px] w-full max-w-[440px] sm:h-[480px] lg:col-span-5 lg:max-w-none">
            <div className="absolute right-0 top-0 h-[340px] w-[78%] overflow-hidden rounded-b-2xl rounded-t-full shadow-[0_40px_60px_-30px_rgba(28,38,32,0.5)] sm:h-[400px]">
              {/* 照片比框大，捲動時在框內慢慢移動 */}
              <Parallax speed={0.12} className="absolute inset-x-0 -top-[12%] h-[124%]">
                <div className="relative h-full w-full">
                  <Image
                    src={mango.img}
                    alt="一籃愛文芒果"
                    fill
                    sizes="(min-width: 1024px) 34vw, 360px"
                    loading="eager"
                    className="object-cover"
                  />
                </div>
              </Parallax>
              <div className="absolute inset-0 bg-gradient-to-br from-white/35 via-transparent to-transparent" />
            </div>

            <Parallax speed={-0.12} className="absolute left-0 top-[40%] h-32 w-32 sm:h-40 sm:w-40">
              <div className="relative h-full w-full overflow-hidden rounded-full border-[6px] border-paper shadow-xl">
                <Image src={guava.img} alt="切開的紅心芭樂" fill sizes="160px" className="object-cover" />
              </div>
            </Parallax>

            <Parallax speed={-0.3} className="absolute right-[-6px] top-[58%] h-14 w-14 sm:h-16 sm:w-16">
              <div className="orb h-full w-full" style={orbStyle(lychee)} />
            </Parallax>
            <Parallax speed={0.3} className="absolute left-[12%] top-[8%] h-10 w-10">
              <div className="orb h-full w-full" style={orbStyle(pineapple)} />
            </Parallax>

            <div className="glass absolute bottom-0 left-[6%] w-56 rounded-xl p-4 sm:left-[10%] sm:w-64 sm:p-5">
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted">本季選讀</p>
              <p className="mt-2 font-serif text-xl font-black sm:text-2xl">{sugarApple.name}</p>
              <p className="text-xs text-muted">{sugarApple.en}</p>
              <div className="mt-4 flex justify-between border-t border-line pt-3 text-xs">
                <span>{sugarApple.origin}</span>
                <span>{seasonText(sugarApple.months)}</span>
              </div>
            </div>

            <p
              aria-hidden
              className="absolute -right-2 top-0 hidden font-serif text-sm tracking-[0.5em] text-muted [writing-mode:vertical-rl] xl:block"
            >
              寶島四季鮮果
            </p>
          </div>
        </section>

        {/* ── 數字列 ── */}
        <section className="mx-auto max-w-7xl px-4 sm:px-8">
          <dl className="grid grid-cols-3 border-y border-line">
            {[
              ["06", "代表果實"],
              ["12", "個月不斷產"],
              ["01", "座島嶼"],
            ].map(([n, t], i) => (
              <div key={t} className={`py-6 sm:py-8 ${i > 0 ? "border-l border-line pl-4 sm:pl-8" : ""}`}>
                <dt className="font-serif text-3xl font-black sm:text-5xl">{n}</dt>
                <dd className="mt-1 text-xs text-muted sm:text-sm">{t}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ── 島嶼之果 ── */}
        <section id="fruits" className="mx-auto max-w-7xl scroll-mt-24 px-4 pt-20 sm:px-8 lg:pt-32">
          <div className="mb-10 grid gap-4 md:grid-cols-12 md:gap-6 lg:mb-14">
            <h2 className="font-serif text-4xl font-black sm:text-5xl md:col-span-5 lg:text-6xl">島嶼之果</h2>
            <p className="self-end text-sm leading-loose text-muted md:col-span-6 md:col-start-7 lg:col-span-5 lg:col-start-8">
              我們挑選了六種最能代表台灣的水果。它們來自不同的縣市、不同的季節，
              各自有一段和土地相處的故事。
            </p>
          </div>

          {/*
            手機：編號｜照片＋品名，下面接說明與產地
            平板：編號｜照片＋品名｜產地產季（靠右），說明在第二行
            電腦：一行四欄
          */}
          <ol className="border-t border-ink">
            {fruits.map((f) => (
              <li
                key={f.no}
                className="group grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3 border-b border-line py-6 transition-colors hover:bg-white/30 sm:grid-cols-[auto_1fr_auto] sm:gap-x-6 lg:grid-cols-12 lg:gap-x-8 lg:px-4 lg:py-8"
              >
                <span className="self-start pt-1 font-serif text-sm text-muted sm:self-center sm:pt-0 lg:col-span-1">{f.no}</span>

                <div className="flex items-center gap-4 sm:gap-5 lg:col-span-4">
                  <div className="relative h-16 w-20 shrink-0 sm:h-20 sm:w-28">
                    <div className="absolute inset-0 overflow-hidden rounded-lg">
                      <Image
                        src={f.img}
                        alt={f.name}
                        fill
                        sizes="112px"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>
                    <div className="orb absolute -right-2 -top-2 h-5 w-5 sm:h-6 sm:w-6" style={orbStyle(f)} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="whitespace-nowrap font-serif text-xl font-black sm:text-2xl lg:text-3xl">{f.name}</h3>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-muted sm:text-[11px] sm:tracking-[0.2em]">{f.en}</p>
                  </div>
                </div>

                <p className="col-span-2 text-sm leading-relaxed text-muted sm:col-span-2 sm:col-start-2 sm:row-start-2 lg:col-span-4 lg:col-start-auto lg:row-start-auto">
                  {f.note}
                </p>

                <div className="col-span-2 flex gap-6 text-sm sm:col-span-1 sm:col-start-3 sm:row-start-1 sm:flex-col sm:gap-1 sm:text-right lg:col-span-3 lg:col-start-auto lg:row-start-auto">
                  <span>{f.origin}</span>
                  <span className="text-muted">{seasonText(f.months)}</span>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ── 產地照片 ── 手機一欄、平板兩欄等寬、電腦 2:1 */}
        <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-8 lg:pt-32">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-12">
            <figure className="relative h-[360px] overflow-hidden rounded-2xl sm:h-[440px] lg:col-span-8 lg:h-[540px]">
              <Parallax speed={0.12} className="absolute inset-x-0 -top-[15%] h-[130%]">
                <div className="relative h-full w-full">
                  <Image
                    src="/images/pineapple-field.jpg"
                    alt="彰化八卦山下的鳳梨田"
                    fill
                    sizes="(min-width: 1024px) 66vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
              </Parallax>
              <figcaption className="glass glass-strong absolute bottom-4 left-4 right-4 rounded-xl p-4 sm:p-5 lg:right-auto lg:max-w-sm">
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted">From the field</p>
                <p className="mt-2 font-serif text-xl font-black sm:text-2xl">八卦山下的鳳梨田</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  紅土、緩坡、充足的日照。鳳梨從種下到結果，要等上一年以上。
                </p>
              </figcaption>
            </figure>

            <figure className="relative h-[360px] overflow-hidden rounded-2xl sm:h-[440px] lg:col-span-4 lg:h-[540px]">
              <Parallax speed={0.12} className="absolute inset-x-0 -top-[15%] h-[130%]">
                <div className="relative h-full w-full">
                  <Image
                    src="/images/fruit-truck.jpg"
                    alt="夜晚街邊的水果攤車"
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
              </Parallax>
              <figcaption className="glass glass-strong absolute bottom-4 left-4 right-4 rounded-xl p-4 sm:p-5">
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted">On the street</p>
                <p className="mt-2 font-serif text-xl font-black sm:text-2xl">街角的水果車</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">亮著燈的攤車，是最日常的水果店。</p>
              </figcaption>
            </figure>
          </div>
        </section>

        {/* ── 產季曆 ── */}
        <section id="calendar" className="relative mx-auto max-w-7xl scroll-mt-24 px-4 pt-20 sm:px-8 lg:pt-32">
          <Parallax speed={0.3} className="pointer-events-none absolute left-1/3 top-40 h-[400px] w-[400px] lg:h-[500px] lg:w-[500px]">
            <div aria-hidden className="h-full w-full rounded-full bg-[radial-gradient(circle,#e05a7a40,transparent_65%)]" />
          </Parallax>
          <Parallax speed={-0.2} className="pointer-events-none absolute right-0 top-72 h-[300px] w-[300px] lg:h-[400px] lg:w-[400px]">
            <div aria-hidden className="h-full w-full rounded-full bg-[radial-gradient(circle,#f6e27a66,transparent_65%)]" />
          </Parallax>

          <div className="relative mb-8 flex flex-wrap items-end justify-between gap-4 lg:mb-12">
            <h2 className="font-serif text-4xl font-black sm:text-5xl lg:text-6xl">產季曆</h2>
            <p className="text-sm text-muted">什麼時候吃，才是最好的時候。</p>
          </div>

          {/* 手機：每種水果一張卡片，12 格月份條 */}
          <div className="glass relative rounded-2xl p-4 sm:hidden">
            <ul className="divide-y divide-line">
              {fruits.map((f) => (
                <li key={f.no} className="py-4 first:pt-1 last:pb-1">
                  <div className="mb-2 flex items-baseline justify-between">
                    <span className="font-serif font-semibold">{f.name}</span>
                    <span className="text-xs text-muted">{seasonText(f.months)}</span>
                  </div>
                  <div className="grid grid-cols-12 gap-[3px]">
                    {months.map((m) => (
                      <div key={m} className="h-4 rounded-[2px]" style={seasonCell(f, f.months.includes(m))} />
                    ))}
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-2 grid grid-cols-12 gap-[3px] text-center text-[9px] text-muted">
              {months.map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          </div>

          {/* 平板、電腦：完整表格 */}
          <div className="glass relative hidden rounded-2xl p-6 sm:block lg:p-8">
            <table className="w-full border-separate border-spacing-x-1 border-spacing-y-3 text-sm">
              <thead>
                <tr className="text-[11px] text-muted">
                  <th className="w-28 text-left font-normal lg:w-40">品項</th>
                  {months.map((m) => (
                    <th key={m} className="font-normal">{m}月</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fruits.map((f) => (
                  <tr key={f.no}>
                    <td className="whitespace-nowrap font-serif font-semibold">{f.name}</td>
                    {months.map((m) => (
                      <td key={m}>
                        <div className="h-6 rounded-sm" style={seasonCell(f, f.months.includes(m))} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 風土 ── */}
        <section id="story" className="mx-auto max-w-7xl scroll-mt-24 px-4 pt-20 sm:px-8 lg:pt-32">
          <div className="grid gap-12 md:grid-cols-12 lg:gap-16">
            <blockquote className="md:col-span-7">
              <p className="mb-6 text-[11px] uppercase tracking-[0.3em] text-muted lg:mb-8">Terroir · 風土</p>
              <p className="font-serif text-2xl leading-[1.7] sm:text-3xl lg:text-4xl lg:leading-[1.6]">
                一顆水果，是陽光、雨水、山坡的角度，
                和果農日復一日的耐心，一起寫成的。
              </p>
            </blockquote>

            <div className="grid gap-8 sm:grid-cols-3 md:col-span-5 md:grid-cols-1 lg:col-span-4 lg:col-start-9 lg:gap-10">
              {[
                ["陽光", "北回歸線以南日照充足，讓芒果、鳳梨累積飽滿的糖分。"],
                ["地形", "從平原到高山，海拔差距造就多樣的微氣候，一島能種百果。"],
                ["人", "世代果農持續改良品種與栽培技術，台灣因此被稱為「水果王國」。"],
              ].map(([t, d], i) => (
                <div key={t} className="border-t border-ink pt-4">
                  <p className="flex items-baseline gap-3">
                    <span className="text-[10px] text-muted">0{i + 1}</span>
                    <span className="font-serif text-xl font-black">{t}</span>
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
