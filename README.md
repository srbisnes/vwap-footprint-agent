# VWAP Footprint Heatmap Agent

Paper-trading agent on Vercel.

Universe: BTC/USDT, BTC/USDC + ETH BNB SOL XRP DOGE ADA TRX AVAX LINK TON.
TFs: 1m 5m 15m 1h 4h.
Signals: VWAP + POC heatmap + footprint imbalance (Binance taker-buy proxy).
No live orders.

`npm i && npm run dev`
Cron: GET /api/scan every 5 minutes.
