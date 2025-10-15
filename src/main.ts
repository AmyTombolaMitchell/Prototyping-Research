import * as PIXI from 'pixi.js';
import { WheelGame, Bets } from './game';

const app = new PIXI.Application({ resizeTo: window, backgroundColor: 0x0b1220 });
const gameEl = document.getElementById('game')!;
gameEl.appendChild(app.view as HTMLCanvasElement);

const wheelGame = new WheelGame(app, 6);

// DOM elements
const balanceEl = document.getElementById('balance-value') as HTMLElement;
const betInput = document.getElementById('bet-amount') as HTMLInputElement;
const spinBtn = document.getElementById('spin') as HTMLButtonElement;
const clearBetsBtn = document.getElementById('clear-bets') as HTMLButtonElement;
const messageEl = document.getElementById('message') as HTMLElement;

let balance = 1000;
let bets: Bets = new Map();

function setMessage(text: string, timeout = 3000) {
  messageEl.textContent = text;
  if (timeout > 0) setTimeout(() => { if (messageEl.textContent === text) messageEl.textContent = ''; }, timeout);
}

function updateBalance() {
  balanceEl.textContent = String(balance);
}

updateBalance();

// clicking sectors to place/remove bet
wheelGame.onSectorClick(idx => {
  const betAmount = Math.max(1, Math.floor(Number(betInput.value) || 0));
  const current = bets.get(idx) || 0;
  // toggle adding one bet of betAmount (if enough balance)
  if (balance >= betAmount) {
    bets.set(idx, current + betAmount);
    balance -= betAmount;
    updateBalance();
    setMessage(`Placed ${betAmount} on ${idx + 1}`);
    // show a small chip on sector (PIXI Text)
    const label = new PIXI.Text(String(bets.get(idx)), { fontSize: 18, fill: 0xffffff });
    label.anchor.set(0.5);
    // remove previous label if any
    const g = wheelGame['sectorGraphics'][idx] as PIXI.Container;
    // remove existing chip
    const prev = g.getChildByName('chip')
    if (prev) g.removeChild(prev);
    label.name = 'chip';
    // position near edge
    const ang = wheelGame['sectorAngles'][idx];
    label.x = Math.cos(ang) * (wheelGame['radius'] * 0.85);
    label.y = Math.sin(ang) * (wheelGame['radius'] * 0.85);
    g.addChild(label);
  } else {
    setMessage('Insufficient balance for that bet');
  }
});

clearBetsBtn.addEventListener('click', () => {
  // refund bets
  for (const [k, v] of bets.entries()) {
    balance += v;
    const g = wheelGame['sectorGraphics'][k] as PIXI.Container;
    const prev = g.getChildByName('chip');
    if (prev) g.removeChild(prev);
  }
  bets.clear();
  updateBalance();
  setMessage('Bets cleared');
});

spinBtn.addEventListener('click', async () => {
  if (bets.size === 0) { setMessage('Place at least one bet'); return; }
  // disable
  spinBtn.disabled = true;
  clearBetsBtn.disabled = true;
  betInput.disabled = true;

  // spin
  setMessage('Spinning...');
  const winner = await wheelGame.spinToRandom();

  // determine payout
  const betOnWinner = bets.get(winner) || 0;
  if (betOnWinner > 0) {
    // payout: sectors count * bet (fair simple payout)
    const payout = betOnWinner * wheelGame['sectors'];
    balance += payout;
    setMessage(`Winner: ${winner + 1}! You won ${payout}`);
  } else {
    setMessage(`Winner: ${winner + 1}. You lost your bets.`);
  }

  wheelGame.highlightWinner(winner);

  // clear chips and bets
  for (const [k] of bets.entries()) {
    const g = wheelGame['sectorGraphics'][k] as PIXI.Container;
    const prev = g.getChildByName('chip');
    if (prev) g.removeChild(prev);
  }
  bets.clear();

  updateBalance();
  spinBtn.disabled = false;
  clearBetsBtn.disabled = false;
  betInput.disabled = false;
});

// resize handling already covered by PIXI resizeTo: window

