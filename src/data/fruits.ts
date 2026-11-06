import type { CSSProperties } from "react";

// 水果資料：顏色 c1 為亮部、c2 為暗部；months 為產季月份
export const fruits = [
  {
    no: "01",
    name: "愛文芒果",
    en: "Irwin Mango",
    origin: "台南玉井",
    months: [5, 6, 7, 8],
    note: "外皮紅潤，果肉細緻無纖維。玉井的夏天，整條街都是芒果的香氣。",
    c1: "#ffb347",
    c2: "#d9481f",
    img: "/images/mango-irwin.jpg",
  },
  {
    no: "02",
    name: "金鑽鳳梨",
    en: "Golden Diamond Pineapple",
    origin: "屏東內埔",
    months: [3, 4, 5, 6, 7],
    note: "酸甜平衡、果心可食。台語念作「旺來」，是年節桌上的好兆頭。",
    c1: "#f6e27a",
    c2: "#c98f12",
    img: "/images/pineapple.jpg",
  },
  {
    no: "03",
    name: "台東釋迦",
    en: "Sugar Apple",
    origin: "台東卑南",
    months: [8, 9, 10, 11, 12, 1, 2, 3],
    note: "形似佛陀螺髮而得名。熟透時一剝就開，果肉綿密如奶霜。",
    c1: "#c8e3a0",
    c2: "#4f7d3a",
    img: "/images/sugar-apple.jpg",
  },
  {
    no: "04",
    name: "玉荷包荔枝",
    en: "Yu Her Pau Lychee",
    origin: "高雄大樹",
    months: [5, 6],
    note: "籽小肉厚，清甜爆汁。產季只有短短一個多月，錯過就得等明年。",
    c1: "#ff8a8a",
    c2: "#a8172b",
    img: "/images/lychee.jpg",
  },
  {
    no: "05",
    name: "黑珍珠蓮霧",
    en: "Black Pearl Wax Apple",
    origin: "屏東林邊",
    months: [12, 1, 2, 3, 4],
    note: "深紅發亮、清脆多水。冬天最好吃，是南台灣冬季的招牌。",
    c1: "#e05a7a",
    c2: "#5e0f2a",
    img: "/images/wax-apple.jpg",
  },
  {
    no: "06",
    name: "珍珠芭樂",
    en: "Pearl Guava",
    origin: "高雄燕巢",
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    note: "脆口微甜，四季不斷。最日常的水果，也是最可靠的那一個。",
    c1: "#e4f2b8",
    c2: "#6c9a3b",
    img: "/images/guava.jpg",
  },
];

// 圖片來源（Wikimedia Commons），CC 授權需標註作者與授權
export const photoCredits = [
  { what: "愛文芒果", author: "Asit K. Ghosh", license: "CC BY-SA 3.0", url: "https://commons.wikimedia.org/wiki/File:Mango_Irwin_Asit_fs8.jpg" },
  { what: "鳳梨", author: "Syced", license: "CC0", url: "https://commons.wikimedia.org/wiki/File:Taiwan_pineapples_at_upscale_supermarket_in_Tokyo.jpg" },
  { what: "釋迦", author: "Vengolis", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:Annona_squamosa_20180920_133254.jpg" },
  { what: "荔枝", author: "Ivar Leidus", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:Lychee_fruits_and_seed.jpg" },
  { what: "蓮霧", author: "Salil Kumar Mukherjee", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:Wax_apple_(Syzygium_samarangense).jpg" },
  { what: "芭樂", author: "PattayaPatrol", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:DFC_3945_A_pile_of_glossy_green_guavas_with_one_sliced_open_to_reveal_its_bright_pink_seed-speckled_interior.jpg" },
  { what: "鳳梨田", author: "lienyuan lee", license: "CC BY 3.0", url: "https://commons.wikimedia.org/wiki/File:%E5%85%AB%E5%8D%A6%E5%B1%B1%E9%BA%93%E9%B3%B3%E6%A2%A8%E7%94%B0_Pineapple_Plantation_on_Bagua_Mountain_-_panoramio.jpg" },
  { what: "水果攤車", author: "Sgroey", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:Fruit_truck_kenting.jpg" },
];

export type Fruit = (typeof fruits)[number];

export function orbStyle(f: Fruit): CSSProperties {
  return { "--c1": f.c1, "--c2": f.c2 } as CSSProperties;
}
