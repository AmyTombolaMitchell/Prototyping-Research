import * as PIXI from 'pixi.js';
import { SlotEngine, HandRank } from './engine';
import { SlotGame } from './slotGame';

const app = new PIXI.Application({ resizeTo: window, backgroundColor: 0x0b1220 });
const gameEl = document.getElementById('game')!;
gameEl.appendChild(app.view as HTMLCanvasElement);

// DOM elements (reuse existing controls in index.html)
const balanceEl = document.getElementById('balance-value') as HTMLElement;
const betInput = document.getElementById('bet-amount') as HTMLInputElement;
const spinBtn = document.getElementById('spin') as HTMLButtonElement;
const messageEl = document.getElementById('message') as HTMLElement;

let balance = Number(localStorage.getItem('slot_balance') || '1000');
function updateBalance() {
  balanceEl.textContent = String(balance);
  localStorage.setItem('slot_balance', String(balance));
}
updateBalance();

const slotGame = new SlotGame(app);

function setMessage(text: string, timeout = 3000) {
  messageEl.textContent = text;
  if (timeout > 0) setTimeout(() => { if (messageEl.textContent === text) messageEl.textContent = ''; }, timeout);
}

spinBtn.addEventListener('click', async () => {
  const bet = Math.max(1, Math.floor(Number(betInput.value) || 0));
  if (bet <= 0) { setMessage('Set a bet amount'); return; }
  if (balance < bet) { setMessage('Insufficient balance'); return; }

  // disable controls while spinning
  spinBtn.disabled = true;
  betInput.disabled = true;

  balance -= bet;
  updateBalance();

  setMessage('Spinning...');
  const result = await slotGame.spin(bet);

  // result contains: symbols, handRank, basePayout, jokers
  const { handRank, basePayout, jokers } = result;
  let multiplier = Math.pow(2, jokers); // each Joker doubles payout
  const payout = basePayout * multiplier;
  if (payout > 0) {
    balance += payout;
    setMessage(`You hit ${HandRank[handRank]}! Won ${payout} (x${multiplier})`);
  } else {
    setMessage(`No win. (${jokers} Joker${jokers===1?'':'s'})`);
  }

  updateBalance();
  spinBtn.disabled = false;
  betInput.disabled = false;
});


