import { NextRequest, NextResponse } from "next/server";
import { TIMEFRAMES, UNIVERSE } from "@/lib/universe";
import { fetchKlines, fetchTicker } from "@/lib/binance";
import { analyzeTf, combineSignals } from "@/lib/strategy";
import { footprintFromKlines, volumeHeatmap } from "@/lib/indicators";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const focus = req.nextUrl.searchParams.get("symbol");
  const assets = focus ? UNIVERSE.filter((a) => a.id === focus) : [...UNIVERSE];
  const results = [];
  for (const asset of assets) {
    try {
      const ticker = await fetchTicker(asset.binance);
      const snaps = [];
      let heat: any[] = [];
      let footprint: any[] = [];
      for (const tf of TIMEFRAMES) {
        const klines = await fetchKlines(asset.binance, tf, 120);
        const snap = analyzeTf(tf, klines);
        if (snap) snaps.push(snap);
        if (tf === "15m") {
          heat = volumeHeatmap(klines.slice(-80));
          footprint = footprintFromKlines(klines.slice(-24));
        }
      }
      const combined = combineSignals(snaps);
      results.push({
        asset, ticker, snaps, combined, heat, footprint,
        paper: combined.bias === "FLAT" ? "sin orden" : `PAPER ${combined.bias} ${asset.label} conv ${combined.conviction}%`,
      });
    } catch (e: any) {
      results.push({ asset, error: e.message || String(e) });
    }
  }
  return NextResponse.json({ ok: true, mode: "PAPER", ts: Date.now(), results });
}
