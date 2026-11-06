import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PriceMap, { type MapFruit } from "@/components/PriceMap";
import Greeting from "@/components/Greeting";
import { fruits } from "@/data/fruits";
import { marketHubs, marketInfo } from "@/data/market";
import { getAllPrices } from "@/lib/prices";
import { countyPaths, MAP_H, MAP_W, project } from "@/lib/taiwanMap";

export const metadata: Metadata = {
  title: "產地行情｜福爾摩沙果園",
  description: "台灣六種代表水果的主要產區地圖，與農業部批發市場的實際交易價格。",
};

export default async function BlogPage() {
  const { updatedAt, fruits: prices } = await getAllPrices();

  const mapFruits: MapFruit[] = fruits.map((f) => {
    const p = prices.find((x) => x.id === f.no)!;
    return {
      id: f.no,
      name: f.name,
      label: marketInfo[f.no].label,
      img: f.img,
      c1: f.c1,
      c2: f.c2,
      regions: marketInfo[f.no].regions,
      prices: p,
      hubs: p.hubs.map((h) => {
        const [x, y] = project(h.lon, h.lat);
        const cfg = marketHubs.find((m) => m.name === h.name)!;
        return { name: h.name, x, y, price: h.price, volume: h.volume, side: cfg.side, dy: cfg.dy };
      }),
    };
  });

  const updated = new Date(updatedAt).toLocaleString("zh-TW", {
    timeZone: "Asia/Taipei",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <div className="grain relative overflow-x-clip">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[700px]">
        <div className="absolute right-[-20%] top-[-10%] h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,#9cc27a55,transparent_65%)]" />
      </div>

      <Header />

      <main className="relative mx-auto max-w-7xl px-4 sm:px-8">
        <section className="grid gap-8 pb-12 pt-12 sm:pt-16 lg:grid-cols-12 lg:pb-16 lg:pt-24">
          <div className="lg:col-span-7">
            <Greeting message="來看看今天的行情吧。" />
            <p className="mb-8 flex items-center gap-4 text-[11px] uppercase tracking-[0.3em] text-muted">
              <span className="h-px w-10 bg-ink/40" />
              Journal · 產地行情
            </p>
            <h1 className="font-serif text-[clamp(2.4rem,7vw,4.5rem)] font-black leading-[1.1] tracking-tight">
              從產地，
              <br />
              <span className="whitespace-nowrap">到批發市場。</span>
            </h1>
          </div>
          <p className="self-end text-[15px] leading-loose text-muted lg:col-span-5">
            每一種水果都有自己的故鄉。選一種水果，看看它主要長在哪些縣市，
            以及這幾天在全台各地批發市場實際成交的價格。
          </p>
        </section>

        <PriceMap counties={countyPaths} fruits={mapFruits} width={MAP_W} height={MAP_H} />

        <section className="mt-16 grid gap-6 border-t border-ink pt-8 text-sm leading-relaxed text-muted md:grid-cols-3">
          <div>
            <p className="mb-2 font-semibold text-ink">價格怎麼算</p>
            <p>
              取近 7 天各批發市場的「平均價」，再依交易量加權平均。單位為新台幣元／公斤，
              是批發價，不是零售價；在市場或超市買到的價格通常會更高。
            </p>
          </div>
          <div>
            <p className="mb-2 font-semibold text-ink">資料來源</p>
            <p>
              價格：
              <a
                href="https://data.moa.gov.tw/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-ink"
              >
                農業部 農產品交易行情
              </a>
              ，每小時更新一次（最後更新 {updated}）。
              <br />
              地圖：內政部國土測繪中心縣市界（taiwan-atlas）。
            </p>
          </div>
          <div>
            <p className="mb-2 font-semibold text-ink">產區說明</p>
            <p>產區為各水果的主要栽培縣市，依產量概略排序，僅供參考。</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
