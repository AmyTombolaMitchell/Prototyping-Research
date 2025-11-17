
import * as PIXI from 'pixi.js';
import { SlotGame } from './slotGame';

const app = new PIXI.Application({ resizeTo: window, backgroundColor: 0x1a1a2a });
const gameEl = document.getElementById('game')!;
gameEl.appendChild(app.view as HTMLCanvasElement);

const slotGame = new SlotGame(app);

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

function setMessage(text: string, timeout = 3000) {
  messageEl.textContent = text;
  if (timeout > 0) setTimeout(() => { if (messageEl.textContent === text) messageEl.textContent = ''; }, timeout);
}

spinBtn.addEventListener('click', async () => {
  const stake = Math.max(1, Math.floor(Number(betInput.value) || 0));
  if (stake <= 0) { setMessage('Set a stake amount'); return; }
  if (balance < stake) { setMessage('Insufficient balance'); return; }

  spinBtn.disabled = true;
  betInput.disabled = true;

  setMessage('Spinning...');
  const { result } = await slotGame.spin(stake, balance);
  balance = result.balance;
  updateBalance();

  if (result.paylines.length > 0) {
    const win = result.paylines.reduce((sum: number, w: any) => sum + w.payout, 0);
    setMessage(`Win! You won £${win/100}`);
  } else {
    setMessage('No win');
  }

  spinBtn.disabled = false;
  betInput.disabled = false;
});


