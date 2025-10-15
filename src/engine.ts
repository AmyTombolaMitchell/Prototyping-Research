export enum Suit {
  Clubs = 'C',
  Diamonds = 'D',
  Hearts = 'H',
  Spades = 'S'
}

export type Card = { rank: number; suit: Suit } | { joker: true };

export enum HandRank {
  None = 0,
  Pair = 1,
  TwoPair = 2,
  ThreeKind = 3,
  Straight = 4,
  Flush = 5,
  FullHouse = 6,
  FourKind = 7,
  StraightFlush = 8,
  RoyalFlush = 9
}

// create a standard 52-card deck (no jokers by default)
export function createDeck(includeJokers = false): Card[] {
  const ranks = [2,3,4,5,6,7,8,9,10,11,12,13,14];
  const suits = [Suit.Clubs, Suit.Diamonds, Suit.Hearts, Suit.Spades];
  const deck: Card[] = [];
  for (const s of suits) for (const r of ranks) deck.push({ rank: r, suit: s });
  if (includeJokers) {
    deck.push({ joker: true });
    deck.push({ joker: true });
  }
  return deck;
}

export function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function isJoker(c: Card) { return (c as any).joker === true; }

// evaluate a 5-card hand. Returns hand rank and base payout (multiplies later by bet)
export function evaluateHand(cards: Card[]): { rank: HandRank; basePayout: number } {
  // treat jokers as wildcards that can be any rank/suit to maximize hand
  const jokers = cards.filter(isJoker).length;
  const normals = cards.filter(c => !isJoker(c)) as { rank: number; suit: Suit }[];

  // helper: counts by rank
  const counts = new Map<number, number>();
  for (const c of normals) counts.set(c.rank, (counts.get(c.rank) || 0) + 1);

  // simple detection using jokers greedily
  const byCount = Array.from(counts.values()).sort((a,b)=>b-a);
  const uniqueRanks = counts.size;

  // detect flush (all suits same among normals; jokers can adapt)
  const suits = new Set(normals.map(n=>n.suit));
  const flushPossible = (suits.size <= 1) || (jokers > 0);

  // detect straight: check ranks with jokers filling gaps
  const ranks = normals.map(n=>n.rank).sort((a,b)=>a-b);
  function straightPossible(): boolean {
    if (normals.length === 0) return jokers >= 5;
    // check for A-low straight possibility
    const uniq = Array.from(new Set(ranks));
    // try sliding window of length 5 across possible ranks 2..14
    for (let start=2; start<=10; start++) {
      let missing = 0;
      for (let r=start; r<start+5; r++) if (!uniq.includes(r)) missing++;
      if (missing <= jokers) return true;
    }
    // special case A-low (A,2,3,4,5)
    const aceLowSet = [14,2,3,4,5];
    let missingAL = 0; for (const r of aceLowSet) if (!uniq.includes(r)) missingAL++;
    if (missingAL <= jokers) return true;
    return false;
  }

  const straight = straightPossible();
  const flush = flushPossible;

  // determine rank using simple priority
  // counts + jokers allow upgrades
  const maxCount = byCount[0] || 0;
  const second = byCount[1] || 0;

  // Royal flush: straight flush with top Ace-high
  if (straight && flush && normals.some(n=>n.rank===14)) return { rank: HandRank.RoyalFlush, basePayout: 100 };
  if (straight && flush) return { rank: HandRank.StraightFlush, basePayout: 50 };
  if (maxCount + jokers >= 4) return { rank: HandRank.FourKind, basePayout: 25 };
  if ((maxCount + jokers >= 3) && (second + jokers >=2 || second >=2)) return { rank: HandRank.FullHouse, basePayout: 12 };
  if (flush) return { rank: HandRank.Flush, basePayout: 8 };
  if (straight) return { rank: HandRank.Straight, basePayout: 6 };
  if (maxCount + jokers >= 3) return { rank: HandRank.ThreeKind, basePayout: 4 };
  if (maxCount + jokers >= 2 && second + jokers >=2) return { rank: HandRank.TwoPair, basePayout: 3 };
  if (maxCount + jokers >= 2) return { rank: HandRank.Pair, basePayout: 1 };
  return { rank: HandRank.None, basePayout: 0 };
}

// Spin a 5-reel set and return 5 cards; include jokerSymbols chance
export function spinReels(bet: number): { cards: Card[]; jokers: number; hand: { rank: HandRank; basePayout: number } } {
  // We'll simulate each reel as a random card from a fresh deck with small chance of Joker
  const deck = createDeck(false);
  shuffle(deck);
  const cards: Card[] = [];
  let jokers = 0;
  for (let i=0;i<5;i++) {
    if (Math.random() < 0.06) { // 6% chance Joker on any reel
      cards.push({ joker: true } as any);
      jokers++;
    } else {
      const c = deck.pop()!;
      cards.push(c);
    }
  }
  const hand = evaluateHand(cards);
  return { cards, jokers, hand };
}
