export const TIMEFRAMES = ["1m", "5m", "15m", "1h", "4h"] as const;
export type Timeframe = (typeof TIMEFRAMES)[number];

export const UNIVERSE = [
  { id: "BTCUSDT", label: "BTC/USDT", binance: "BTCUSDT", coingecko: "bitcoin" },
  { id: "BTCUSDC", label: "BTC/USDC", binance: "BTCUSDC", coingecko: "bitcoin" },
  { id: "ETHUSDT", label: "ETH/USDT", binance: "ETHUSDT", coingecko: "ethereum" },
  { id: "BNBUSDT", label: "BNB/USDT", binance: "BNBUSDT", coingecko: "binancecoin" },
  { id: "SOLUSDT", label: "SOL/USDT", binance: "SOLUSDT", coingecko: "solana" },
  { id: "XRPUSDT", label: "XRP/USDT", binance: "XRPUSDT", coingecko: "ripple" },
  { id: "DOGEUSDT", label: "DOGE/USDT", binance: "DOGEUSDT", coingecko: "dogecoin" },
  { id: "ADAUSDT", label: "ADA/USDT", binance: "ADAUSDT", coingecko: "cardano" },
  { id: "TRXUSDT", label: "TRX/USDT", binance: "TRXUSDT", coingecko: "tron" },
  { id: "AVAXUSDT", label: "AVAX/USDT", binance: "AVAXUSDT", coingecko: "avalanche-2" },
  { id: "LINKUSDT", label: "LINK/USDT", binance: "LINKUSDT", coingecko: "chainlink" },
  { id: "TONUSDT", label: "TON/USDT", binance: "TONUSDT", coingecko: "the-open-network" },
] as const;
