const BASE = "https://api.binance.com";

export type Kline = {
  t: number; o: number; h: number; l: number; c: number; v: number; qv: number; tb: number; tq: number;
};

export async function fetchKlines(symbol: string, interval: string, limit = 200): Promise<Kline[]> {
  const url = `${BASE}/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
  const res = await fetch(url, { next: { revalidate: 20 } });
  if (!res.ok) throw new Error(`klines ${symbol} ${interval} ${res.status}`);
  const raw = await res.json();
  return raw.map((k: any[]) => ({
    t: k[0], o: +k[1], h: +k[2], l: +k[3], c: +k[4], v: +k[5], qv: +k[7], tb: +k[9], tq: +k[10],
  }));
}

export async function fetchTicker(symbol: string) {
  const res = await fetch(`${BASE}/api/v3/ticker/24hr?symbol=${symbol}`, { next: { revalidate: 15 } });
  if (!res.ok) throw new Error(`ticker ${symbol} ${res.status}`);
  const t = await res.json();
  return { last: +t.lastPrice, changePct: +t.priceChangePercent, volume: +t.volume, quoteVolume: +t.quoteVolume, high: +t.highPrice, low: +t.lowPrice };
}
