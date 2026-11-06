// 各水果在「農業部農產品交易行情」中的作物名稱，以及主要產區
// regions 依產量由大到小排列（第一個為最大產區），縣市名稱需與 taiwan-atlas 一致
export const marketInfo: Record<
  string,
  { crop: string; label: string; regions: string[]; fallback: [string, string] }
> = {
  "01": {
    crop: "芒果-愛文",
    label: "愛文芒果",
    regions: ["台南市", "屏東縣", "高雄市"],
    // 非產季時改看產季高峰的行情（民國年.月.日）
    fallback: ["07.01", "07.07"],
  },
  "02": {
    crop: "鳳梨-金鑽鳳梨",
    label: "金鑽鳳梨",
    regions: ["屏東縣", "嘉義縣", "台南市", "高雄市"],
    fallback: ["05.01", "05.07"],
  },
  "03": {
    crop: "釋迦",
    label: "釋迦",
    regions: ["台東縣"],
    fallback: ["12.01", "12.07"],
  },
  "04": {
    crop: "荔枝-玉荷包",
    label: "玉荷包荔枝",
    regions: ["高雄市", "南投縣", "台中市", "彰化縣", "台南市"],
    fallback: ["06.01", "06.07"],
  },
  "05": {
    crop: "蓮霧-紅蓮霧",
    label: "紅蓮霧（含黑珍珠）",
    regions: ["屏東縣", "高雄市", "台南市"],
    fallback: ["02.01", "02.07"],
  },
  "06": {
    crop: "番石榴-珍珠芭",
    label: "珍珠芭樂",
    regions: ["高雄市", "彰化縣", "台南市", "屏東縣"],
    fallback: ["10.01", "10.07"],
  },
};

// 批發市場合併成地圖上的區域點（避免同城市的點疊在一起）
// side：價格標籤放在點的左邊或右邊；dy：標籤上下微調（避免互相重疊）
export const marketHubs: {
  name: string;
  markets: string[];
  lon: number;
  lat: number;
  side: "left" | "right";
  dy: number;
}[] = [
  { name: "大台北", markets: ["台北一", "台北二", "三重區", "板橋區"], lon: 121.52, lat: 25.05, side: "left", dy: -16 },
  { name: "桃園", markets: ["桃農"], lon: 121.3, lat: 24.99, side: "left", dy: 14 },
  { name: "宜蘭", markets: ["宜蘭市"], lon: 121.75, lat: 24.75, side: "left", dy: 8 },
  { name: "大台中", markets: ["台中市", "豐原區", "東勢鎮"], lon: 120.68, lat: 24.17, side: "left", dy: 0 },
  { name: "嘉義", markets: ["嘉義市"], lon: 120.45, lat: 23.48, side: "left", dy: 0 },
  { name: "大高雄", markets: ["高雄市", "鳳山區"], lon: 120.33, lat: 22.63, side: "left", dy: 0 },
  { name: "台東", markets: ["台東市"], lon: 121.14, lat: 22.76, side: "right", dy: 0 },
];
