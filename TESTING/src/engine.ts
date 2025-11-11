
// Day of the Dead Slot Engine

type SymbolType = 'skeleton1' | 'skeleton2' | 'skeleton3' | 'flower' | 'instrument' | 'A' | 'K' | 'J' | 'wild';

const SYMBOLS: SymbolType[] = [
  'skeleton1', 'skeleton2', 'skeleton3', 'flower', 'instrument', 'A', 'K', 'J', 'wild'
];

interface SpinResult {
  reels: SymbolType[][]; // 5 reels, each with 3 visible symbols
  paylines: PaylineWin[];
  balance: number;
}

interface PaylineWin {
  line: number[]; // positions in each reel
  symbol: SymbolType;
  count: number;
  payout: number;
  isWild: boolean;
}

export function spinReels(stake: number, balance: number): SpinResult {
  // 5 reels, 3 rows each
  const reels: SymbolType[][] = [];
  for (let r=0; r<5; r++) {
    const reel: SymbolType[] = [];
    for (let s=0; s<3; s++) {
      // Weighted random: wilds less frequent
      const pool: SymbolType[] = Math.random() < 0.08 ? ['wild'] : SYMBOLS.filter(sym => sym !== 'wild');
      reel.push(pool[Math.floor(Math.random()*pool.length)] as SymbolType);
    }
    reels.push(reel);
  }

  // Define paylines (horizontal, diagonal)
  const paylines = [
    [0,0,0,0,0], // top row
    [1,1,1,1,1], // middle row
    [2,2,2,2,2], // bottom row
    [0,1,2,1,0], // V
    [2,1,0,1,2], // ^
  ];

  // Evaluate wins
  const wins: PaylineWin[] = [];
  for (const line of paylines) {
    let symbol = reels[0][line[0]];
    let count = 1;
    let isWild = symbol === 'wild';
    for (let r=1; r<5; r++) {
      const sym = reels[r][line[r]];
      if (sym === symbol || sym === 'wild' || symbol === 'wild') {
        count++;
        if (sym === 'wild') isWild = true;
        if (symbol === 'wild' && sym !== 'wild') symbol = sym; // wild adopts first non-wild
      } else {
        break;
      }
    }
    if (count >= 3) {
      // Payouts: wilds pay more, skeletons/flowers/instruments mid, letters low
      let payout = stake * count;
      if (symbol === 'wild') payout *= 10;
      else if (symbol.startsWith('skeleton')) payout *= 5;
      else if (symbol === 'flower' || symbol === 'instrument') payout *= 3;
      else payout *= 2;
      wins.push({ line, symbol, count, payout, isWild });
    }
  }

  // Update balance
  let totalWin = wins.reduce((sum, w) => sum + w.payout, 0);
  let newBalance = balance - stake + totalWin;

  return { reels, paylines: wins, balance: newBalance };
}
