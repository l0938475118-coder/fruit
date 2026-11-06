import { cacheLife } from "next/cache";
import { marketHubs, marketInfo } from "@/data/market";

const API = "https://data.moa.gov.tw/Service/OpenData/FromM/FarmTransData.aspx";

type Row = {
  交易日期: string;
  作物名稱: string;
  市場名稱: string;
  平均價: number;
  交易量: number;
};

export type MarketPrice = { market: string; price: number; volume: number };
export type HubPrice = { name: string; lon: number; lat: number; price: number; volume: number };
export type FruitPrices = {
  id: string;
  /** 全台量加權平均（元/公斤），沒有交易時為 null */
  avg: number | null;
  volume: number;
  from: string;
  to: string;
  /** true＝近期沒有交易，顯示的是產季高峰的行情 */
  offSeason: boolean;
  markets: MarketPrice[];
  hubs: HubPrice[];
};

// 西元日期 → 民國日期字串，例如 115.11.06
function roc(d: Date) {
  const y = d.getFullYear() - 1911;
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

async function fetchRows(crop: string, from: string, to: string): Promise<Row[]> {
  const url = `${API}?$top=3000&$skip=0&StartDate=${from}&EndDate=${to}&Crop=${encodeURIComponent(crop)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`MOA API ${res.status}`);
  const rows: Row[] = await res.json();
  // API 是模糊比對，只留名稱完全相同的
  return rows.filter((r) => r.作物名稱 === crop && r.交易量 > 0);
}

function weighted(rows: Row[]) {
  const volume = rows.reduce((s, r) => s + r.交易量, 0);
  const price = volume ? rows.reduce((s, r) => s + r.平均價 * r.交易量, 0) / volume : 0;
  return { price: Math.round(price * 10) / 10, volume: Math.round(volume) };
}

async function getFruitPrices(id: string, today: Date): Promise<FruitPrices> {
  const info = marketInfo[id];

  // 先看近 7 天
  const start = new Date(today);
  start.setDate(start.getDate() - 7);
  let from = roc(start);
  let to = roc(today);
  let rows = await fetchRows(info.crop, from, to);
  let offSeason = false;

  // 沒有交易 → 改看最近一次產季高峰那一週
  if (rows.length === 0) {
    offSeason = true;
    const y = today.getFullYear() - 1911;
    const [fs, fe] = info.fallback;
    // 如果高峰日期還沒到，就用去年的
    const peak = new Date(today.getFullYear(), Number(fs.slice(0, 2)) - 1, Number(fs.slice(3)));
    const year = peak > today ? y - 1 : y;
    from = `${year}.${fs}`;
    to = `${year}.${fe}`;
    rows = await fetchRows(info.crop, from, to);
  }

  const byMarket = new Map<string, Row[]>();
  for (const r of rows) byMarket.set(r.市場名稱, [...(byMarket.get(r.市場名稱) ?? []), r]);

  const markets = [...byMarket.entries()]
    .map(([market, rs]) => ({ market, ...weighted(rs) }))
    .sort((a, b) => b.price - a.price);

  const hubs = marketHubs
    .map((h) => {
      const rs = rows.filter((r) => h.markets.includes(r.市場名稱));
      return rs.length ? { name: h.name, lon: h.lon, lat: h.lat, ...weighted(rs) } : null;
    })
    .filter((h): h is HubPrice => h !== null);

  const total = weighted(rows);

  return {
    id,
    avg: rows.length ? total.price : null,
    volume: total.volume,
    from,
    to,
    offSeason,
    markets,
    hubs,
  };
}

/** 取得六種水果的批發行情，每小時更新一次 */
export async function getAllPrices() {
  "use cache";
  cacheLife("hours");

  const today = new Date();
  const ids = Object.keys(marketInfo);
  const results = await Promise.allSettled(ids.map((id) => getFruitPrices(id, today)));

  return {
    updatedAt: today.toISOString(),
    fruits: results.map((r, i) =>
      r.status === "fulfilled"
        ? r.value
        : ({ id: ids[i], avg: null, volume: 0, from: "", to: "", offSeason: false, markets: [], hubs: [] } as FruitPrices),
    ),
  };
}
