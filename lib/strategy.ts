import type { Kline } from "./binance";
import { footprintFromKlines, sessionVwap, volumeHeatmap, pocPrice } from "./indicators";

export type Signal = "LONG" | "SHORT" | "FLAT";

export type TfSnapshot = {
  tf: string; last: number; vwap: number; distVwapPct: number;
  delta: number; imbalance: number; poc: number; signal: Signal; score: number;
};

export function analyzeTf(tf: string, klines: Kline[]): TfSnapshot | null {
  if (klines.length < 20) return null;
  const vwapSeries = sessionVwap(klines);
  const vwap = vwapSeries[vwapSeries.length - 1];
  const last = klines[klines.length - 1].c;
  const fp = footprintFromKlines(klines.slice(-30));
  const lastFp = fp[fp.length - 1];
  const heat = volumeHeatmap(klines.slice(-80));
  const poc = pocPrice(heat);
  const distVwapPct = ((last - vwap) / vwap) * 100;
  let score = 0;
  if (last > vwap) score += 1; else score -= 1;
  if (last > poc) score += 1; else score -= 1;
  if (lastFp.imbalance > 0.12) score += 1;
  else if (lastFp.imbalance < -0.12) score -= 1;
  const prev = klines[klines.length - 2];
  if (last > prev.c) score += 0.5; else score -= 0.5;
  let signal: Signal = "FLAT";
  if (score >= 2) signal = "LONG";
  else if (score <= -2) signal = "SHORT";
  return { tf, last, vwap, distVwapPct, delta: lastFp.delta, imbalance: lastFp.imbalance, poc, signal, score };
}

export function combineSignals(snaps: TfSnapshot[]) {
  if (!snaps.length) return { bias: "FLAT" as Signal, conviction: 0, reason: "sin datos" };
  const longs = snaps.filter((s) => s.signal === "LONG").length;
  const shorts = snaps.filter((s) => s.signal === "SHORT").length;
  const net = snaps.reduce((a, s) => a + s.score, 0);
  const conviction = Math.min(100, Math.round((Math.abs(net) / (snaps.length * 3.5)) * 100));
  let bias: Signal = "FLAT";
  if (longs >= shorts + 2 && net > 1.5) bias = "LONG";
  else if (shorts >= longs + 2 && net < -1.5) bias = "SHORT";
  return { bias, conviction, reason: `${longs} TF long / ${shorts} TF short · net ${net.toFixed(1)} · VWAP+POC+delta` };
}
