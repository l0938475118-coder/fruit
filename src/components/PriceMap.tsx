"use client";

import { useState } from "react";
import Image from "next/image";
import type { FruitPrices } from "@/lib/prices";

export type MapFruit = {
  id: string;
  name: string;
  label: string;
  img: string;
  c1: string;
  c2: string;
  regions: string[];
  prices: FruitPrices;
  hubs: { name: string; x: number; y: number; price: number; volume: number; side: "left" | "right"; dy: number }[];
};

type Props = {
  counties: { name: string; d: string; centroid: [number, number] }[];
  fruits: MapFruit[];
  width: number;
  height: number;
};

const fmtDate = (s: string) => s.replaceAll(".", "/");

export default function PriceMap({ counties, fruits, width, height }: Props) {
  const [activeId, setActiveId] = useState(fruits[0].id);
  const f = fruits.find((x) => x.id === activeId) ?? fruits[0];
  const p = f.prices;
  const maxVol = Math.max(1, ...f.hubs.map((h) => h.volume));
  const maxPrice = Math.max(1, ...p.markets.map((m) => m.price));

  return (
    <div>
      {/* 水果切換 */}
      <div className="-mx-4 mb-8 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div role="tablist" aria-label="選擇水果" className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
          {fruits.map((x) => {
            const on = x.id === activeId;
            return (
              <button
                key={x.id}
                role="tab"
                aria-selected={on}
                onClick={() => setActiveId(x.id)}
                className={`flex items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-4 text-sm transition ${
                  on ? "border-ink bg-ink text-paper" : "border-line bg-white/40 hover:bg-white/70"
                }`}
              >
                <span className="relative h-7 w-7 overflow-hidden rounded-full">
                  <Image src={x.img} alt="" fill sizes="28px" className="object-cover" />
                </span>
                {x.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
        {/* 地圖 */}
        <div className="glass relative rounded-2xl p-4 sm:p-6 lg:col-span-7">
          <svg viewBox={`0 0 ${width} ${height}`} className="mx-auto block h-auto w-full max-w-[520px]" role="img" aria-label={`${f.name}產區與批發價地圖`}>
            {counties.map((c) => {
              const rank = f.regions.indexOf(c.name);
              const fill = rank === 0 ? f.c2 : rank > 0 ? f.c1 : "rgba(28,38,32,0.07)";
              return (
                <path
                  key={c.name}
                  d={c.d}
                  fill={fill}
                  fillOpacity={rank === 0 ? 0.9 : rank > 0 ? 0.75 : 1}
                  stroke="#f2ede3"
                  strokeWidth={1.2}
                  className="transition-[fill,fill-opacity] duration-500"
                >
                  <title>{rank >= 0 ? `${c.name}：${f.name}主要產區` : c.name}</title>
                </path>
              );
            })}

            {/* 產區縣市名稱 */}
            {counties
              .filter((c) => f.regions.includes(c.name))
              .map((c) => (
                <text
                  key={c.name}
                  x={c.centroid[0]}
                  y={c.centroid[1]}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="pointer-events-none fill-ink font-serif text-[16px] font-semibold"
                  style={{ paintOrder: "stroke", stroke: "rgba(255,255,255,0.7)", strokeWidth: 3 }}
                >
                  {c.name.slice(0, 2)}
                </text>
              ))}

            {/* 批發市場價格 */}
            {f.hubs.map((h) => {
              const r = 4 + Math.sqrt(h.volume / maxVol) * 9;
              const label = `${h.name} ${Math.round(h.price)}`;
              // 字級設大一點：手機上地圖會縮小約 0.65 倍
              const w = label.length * 14 + 18;
              const lx = h.side === "right" ? h.x + r + 6 : h.x - r - 6 - w;
              const ly = h.y + h.dy * 1.2;
              return (
                <g key={h.name}>
                  <circle cx={h.x} cy={h.y} r={r} fill="#1c2620" fillOpacity={0.85} stroke="#fff" strokeWidth={1.5} />
                  <rect x={lx} y={ly - 15} width={w} height={30} rx={15} fill="white" fillOpacity={0.92} stroke="rgba(28,38,32,0.15)" />
                  <text x={lx + w / 2} y={ly + 1} textAnchor="middle" dominantBaseline="middle" className="fill-ink text-[16px]">
                    {h.name} <tspan className="font-semibold">{Math.round(h.price)}</tspan>
                  </text>
                </g>
              );
            })}
          </svg>

          {/* 圖例 */}
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-4 text-xs text-muted">
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm" style={{ background: f.c2 }} /> 最大產區
            </span>
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm" style={{ background: f.c1 }} /> 主要產區
            </span>
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-ink" /> 批發市場（點越大，交易量越多）
            </span>
          </div>
        </div>

        {/* 價格資訊 */}
        <div className="lg:col-span-5">
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted">Wholesale price</p>
          <h3 className="mt-2 font-serif text-3xl font-black sm:text-4xl">{p.avg !== null ? f.label : f.name}</h3>

          {p.avg !== null ? (
            <>
              <p className="mt-6 flex items-baseline gap-2">
                <span className="text-sm text-muted">全台平均</span>
                <span className="font-serif text-6xl font-black tabular-nums">{Math.round(p.avg)}</span>
                <span className="text-sm text-muted">元／公斤</span>
              </p>
              <p className="mt-2 text-xs text-muted">
                {fmtDate(p.from)} – {fmtDate(p.to)}・成交 {p.volume.toLocaleString()} 公斤
              </p>
              {p.offSeason && (
                <p className="mt-4 rounded-lg border border-line bg-white/50 px-4 py-3 text-sm leading-relaxed">
                  目前不是產季，近 7 天沒有交易。以下為最近一次產季高峰那一週的行情。
                </p>
              )}
            </>
          ) : (
            <p className="mt-6 rounded-lg border border-line bg-white/50 px-4 py-3 text-sm">暫時無法取得行情資料，請稍後再試。</p>
          )}

          <div className="mt-8">
            <p className="mb-3 text-sm font-semibold">主要產區</p>
            <div className="flex flex-wrap gap-2">
              {f.regions.map((r, i) => (
                <span key={r} className="rounded-full border border-line bg-white/50 px-3 py-1 text-sm">
                  {r}
                  {i === 0 && <span className="ml-1 text-xs text-muted">・最大</span>}
                </span>
              ))}
            </div>
          </div>

          {p.markets.length > 0 && (
            <div className="mt-8">
              <p className="mb-3 text-sm font-semibold">各批發市場平均價（元／公斤）</p>
              <ul className="space-y-2">
                {p.markets.map((m) => (
                  <li key={m.market} className="grid grid-cols-[4.5rem_1fr_3rem] items-center gap-3 text-sm">
                    <span className="text-muted">{m.market}</span>
                    <span className="h-2 rounded-full bg-ink/5">
                      <span
                        className="block h-full rounded-full transition-[width] duration-500"
                        style={{ width: `${(m.price / maxPrice) * 100}%`, background: `linear-gradient(90deg, ${f.c1}, ${f.c2})` }}
                      />
                    </span>
                    <span className="text-right tabular-nums">{Math.round(m.price)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
