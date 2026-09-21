"use client";
import { useEffect, useMemo, useState } from "react";
import { UNIVERSE } from "@/lib/universe";

export default function Page() {
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function load(sym = symbol) {
    setLoading(true); setErr("");
    try {
      const res = await fetch(`/api/scan?symbol=${sym}`, { cache: "no-store" });
      setData(await res.json());
    } catch (e: any) { setErr(e.message || "error"); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    load(symbol);
    const id = setInterval(() => load(symbol), 60000);
    return () => clearInterval(id);
  }, [symbol]);

  const row = data?.results?.[0];
  const maxHeat = useMemo(() => {
    if (!row?.heat?.length) return 1;
    return Math.max(...row.heat.map((h: any) => h.volume), 1);
  }, [row]);

  return (
    <div className="wrap">
      <h1>Agente VWAP + Footprint + Heatmap</h1>
      <p className="lead">Paper trading en Vercel. BTC/USDT, BTC/USDC y top caps. Multi-TF 1m-4h. No ejecuta ordenes reales.</p>
      <div className="row" style={{ marginBottom: 16 }}>
        <select value={symbol} onChange={(e) => setSymbol(e.target.value)}>
          {UNIVERSE.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
        </select>
        <button onClick={() => load(symbol)} disabled={loading}>{loading ? "escaneando" : "rescan"}</button>
        <span className="badge">{data?.mode || "..."}</span>
      </div>
      {err && <p className="short">{err}</p>}
      {row && !row.error && (
        <>
          <div className="cards">
            <div className="card">
              <div className="row"><strong>{row.asset.label}</strong><span className="mono">{row.ticker.last}</span></div>
              <div className="row"><span>24h</span><span className={row.ticker.changePct >= 0 ? "long" : "short"}>{row.ticker.changePct.toFixed(2)}%</span></div>
            </div>
            <div className="card">
              <div className="row"><span>Bias</span><strong className={row.combined.bias.toLowerCase()}>{row.combined.bias}</strong></div>
              <div className="row"><span>Conviccion</span><span className="mono">{row.combined.conviction}%</span></div>
              <p style={{ fontSize: 12, color: "var(--muted)" }}>{row.combined.reason}</p>
              <p style={{ fontSize: 12 }}>{row.paper}</p>
            </div>
          </div>
          <div className="card" style={{ marginTop: 14 }}>
            <h3 style={{ marginTop: 0 }}>Multi-timeframe</h3>
            <table>
              <thead><tr><th>TF</th><th>vs VWAP</th><th>POC</th><th>Imbalance</th><th>Senal</th></tr></thead>
              <tbody>
                {row.snaps.map((s: any) => (
                  <tr key={s.tf}>
                    <td>{s.tf}</td>
                    <td className="mono">{s.distVwapPct.toFixed(3)}%</td>
                    <td className="mono">{s.poc.toPrecision(6)}</td>
                    <td className={s.imbalance >= 0 ? "long" : "short"}>{(s.imbalance * 100).toFixed(1)}%</td>
                    <td className={s.signal.toLowerCase()}>{s.signal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", marginTop: 14 }}>
            <div className="card">
              <h3 style={{ marginTop: 0 }}>Heatmap volumen (15m)</h3>
              <div className="heat">
                {row.heat.map((h: any, i: number) => {
                  const pct = h.volume / maxHeat;
                  const buyShare = h.volume ? h.buy / h.volume : 0.5;
                  return <i key={i} title={`${h.price}`} style={{ height: `${Math.max(6, pct * 100)}%`, background: `linear-gradient(180deg, rgba(61,255,160,${0.3 + buyShare * 0.7}), rgba(255,93,122,${0.3 + (1 - buyShare) * 0.7}))` }} />;
                })}
              </div>
            </div>
            <div className="card">
              <h3 style={{ marginTop: 0 }}>Footprint delta (15m)</h3>
              <table>
                <thead><tr><th>bar</th><th>close</th><th>d</th><th>imb</th></tr></thead>
                <tbody>
                  {row.footprint.slice(-8).map((f: any) => (
                    <tr key={f.t}>
                      <td className="mono">{new Date(f.t).toISOString().slice(11, 16)}</td>
                      <td className="mono">{f.close}</td>
                      <td className={f.delta >= 0 ? "long" : "short"}>{f.delta.toFixed(2)}</td>
                      <td>{(f.imbalance * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      {row?.error && <p className="short">{row.error}</p>}
    </div>
  );
}
