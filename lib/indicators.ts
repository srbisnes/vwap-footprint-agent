import type { Kline } from "./binance";

export function sessionVwap(klines: Kline[]) {
  let pv = 0;
  let v = 0;
  const series: number[] = [];
  for (const k of klines) {
    const typical = (k.h + k.l + k.c) / 3;
    pv += typical * k.v;
    v += k.v;
    series.push(v ? pv / v : typical);
  }
  return series;
}

export type FootprintBar = {
  t: number; high: number; low: number; close: number;
  buyVol: number; sellVol: number; delta: number; imbalance: number;
};

export function footprintFromKlines(klines: Kline[]): FootprintBar[] {
  return klines.map((k) => {
    const buyVol = k.tb;
    const sellVol = Math.max(k.v - k.tb, 0);
    const delta = buyVol - sellVol;
    const imbalance = k.v ? delta / k.v : 0;
    return { t: k.t, high: k.h, low: k.l, close: k.c, buyVol, sellVol, delta, imbalance };
  });
}

export type HeatCell = { price: number; volume: number; buy: number; sell: number };

export function volumeHeatmap(klines: Kline[], buckets = 24): HeatCell[] {
  if (!klines.length) return [];
  const lo = Math.min(...klines.map((k) => k.l));
  const hi = Math.max(...klines.map((k) => k.h));
  const span = hi - lo || 1;
  const cells: HeatCell[] = Array.from({ length: buckets }, (_, i) => ({
    price: lo + ((i + 0.5) * span) / buckets, volume: 0, buy: 0, sell: 0,
  }));
  for (const k of klines) {
    const mid = (k.h + k.l) / 2;
    const idx = Math.min(buckets - 1, Math.max(0, Math.floor(((mid - lo) / span) * buckets)));
    cells[idx].volume += k.v;
    cells[idx].buy += k.tb;
    cells[idx].sell += Math.max(k.v - k.tb, 0);
  }
  return cells;
}

export function pocPrice(cells: HeatCell[]) {
  if (!cells.length) return 0;
  return cells.reduce((a, b) => (b.volume > a.volume ? b : a)).price;
}
