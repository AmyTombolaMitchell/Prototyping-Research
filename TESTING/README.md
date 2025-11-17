Pixi Balatro Lite
==================

A small simplified Balatro-like betting wheel built with PixiJS and TypeScript.

Features
- Click sectors to place bets (uses the number in "Bet amount")
- Spin the wheel and pay out if your selected sector hits
- Simple UI with balance and messages

Getting started
1. Install dependencies

```powershell
npm install
```

2. Start the dev server

```powershell
npm run dev
```

Open the printed local URL (usually http://localhost:5173) in your browser.

Notes
- This is a toy/demo gambling game. Do not use with real money.
- The payout formula is a simple multiplier (number of sectors * bet on winning sector).

License
MIT
