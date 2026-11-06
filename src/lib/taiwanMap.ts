import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { FeatureCollection, Geometry } from "geojson";
import type { Topology, GeometryCollection } from "topojson-specification";
import counties from "taiwan-atlas/counties-10t.json";

// 地圖只畫台灣本島與澎湖，外島（金門、連江）不畫
const EXCLUDE = ["金門縣", "連江縣"];

export const MAP_W = 520;
export const MAP_H = 760;

type Props = { COUNTYNAME: string };

const topo = counties as unknown as Topology<{ counties: GeometryCollection<Props> }>;
const all = feature(topo, topo.objects.counties) as FeatureCollection<Geometry, Props>;
const main: FeatureCollection<Geometry, Props> = {
  type: "FeatureCollection",
  features: all.features.filter((f) => !EXCLUDE.includes(f.properties.COUNTYNAME)),
};

const projection = geoMercator().fitExtent(
  [
    [16, 16],
    [MAP_W - 16, MAP_H - 16],
  ],
  main,
);
const path = geoPath(projection);

/** 每個縣市的 SVG 路徑（伺服器端計算一次） */
export const countyPaths = main.features.map((f) => ({
  name: f.properties.COUNTYNAME,
  d: path(f) ?? "",
  centroid: path.centroid(f),
}));

/** 經緯度 → 地圖上的 x, y */
export function project(lon: number, lat: number): [number, number] {
  const p = projection([lon, lat]);
  return p ? [Math.round(p[0] * 10) / 10, Math.round(p[1] * 10) / 10] : [0, 0];
}
