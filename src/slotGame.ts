import * as PIXI from 'pixi.js';
import { spinReels, Card, HandRank } from './engine';

type SpinResult = { cards: Card[]; jokers: number; hand: { rank: HandRank; basePayout: number } };

export class SlotGame {
  app: PIXI.Application;
  container: PIXI.Container;
  cardContainers: PIXI.Container[] = [];
  cardSize = { w: 120, h: 170 };
  spacing = 20;

  constructor(app: PIXI.Application) {
    this.app = app;
    this.container = new PIXI.Container();
    app.stage.addChild(this.container);
    this.container.x = app.view.width / 2;
    this.container.y = app.view.height / 2;

    this.drawTable();
  }

  drawCardGraphic(card: Card): PIXI.Container {
    const c = new PIXI.Container();
    const g = new PIXI.Graphics();
    g.beginFill(0xffffff);
    g.lineStyle(2, 0x222222);
    g.drawRoundedRect(-this.cardSize.w/2, -this.cardSize.h/2, this.cardSize.w, this.cardSize.h, 8);
    g.endFill();
    c.addChild(g);

    if ((card as any).joker) {
      const t = new PIXI.Text('JOKER', { fontSize: 22, fill: 0xff0000, fontWeight: 'bold' });
      t.anchor.set(0.5);
      c.addChild(t);
    } else {
      const cc = card as any;
      const rankText = cc.rank === 14 ? 'A' : (cc.rank === 11 ? 'J' : (cc.rank===12?'Q':(cc.rank===13?'K':String(cc.rank))));
      const t = new PIXI.Text(`${rankText}\n${cc.suit}`, { fontSize: 28, fill: 0x111111, align: 'center' });
      t.anchor.set(0.5);
      c.addChild(t);
    }

    return c;
  }

  drawTable() {
    // create 5 placeholders
    const totalW = this.cardSize.w * 5 + this.spacing * 4;
    const startX = -totalW / 2 + this.cardSize.w / 2;
    for (let i=0;i<5;i++) {
      const cont = new PIXI.Container();
      cont.x = startX + i * (this.cardSize.w + this.spacing);
      cont.y = 0;
      this.container.addChild(cont);
      // placeholder card back
      const back = new PIXI.Graphics();
      back.beginFill(0x0b5cff);
      back.lineStyle(2, 0x222222);
      back.drawRoundedRect(-this.cardSize.w/2, -this.cardSize.h/2, this.cardSize.w, this.cardSize.h, 8);
      back.endFill();
      cont.addChild(back);
      this.cardContainers.push(cont);
    }
  }

  async spin(bet: number): Promise<{ handRank: HandRank; basePayout: number; jokers: number }> {
    // animate quick spin visuals then reveal final symbols
    const placeholders: PIXI.Container[] = [];
    for (let f=0; f<10; f++) {
      for (let i=0;i<5;i++) {
        const randCard = { rank: Math.floor(Math.random()*13)+2, suit: (['C','D','H','S'] as any)[Math.floor(Math.random()*4)] } as any;
        const c = this.drawCardGraphic(randCard);
        c.alpha = 0;
        this.cardContainers[i].addChild(c);
        placeholders.push(c);
        // fade in/out
        c.alpha = 1;
        if (placeholders.length > 20) {
          const rem = placeholders.shift(); if (rem) { rem.parent.removeChild(rem); }
        }
      }
      await new Promise(r => setTimeout(r, 60));
    }

    // actual spin result
    const result: SpinResult = spinReels(bet);
    // clear current children and display final
    for (let i=0;i<5;i++) {
      const cont = this.cardContainers[i];
      cont.removeChildren();
      const card = result.cards[i];
      const cg = this.drawCardGraphic(card);
      cont.addChild(cg);
      // tiny reveal animation
      cg.scale.set(0.2);
      const start = performance.now();
      const dur = 220;
      const animate = (now:number)=>{
        const t = Math.min(1,(now-start)/dur);
        const ease = 1 - Math.pow(1-t,3);
        cg.scale.set(0.2 + 0.8*ease);
        if (t<1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }

    return { handRank: result.hand.rank, basePayout: result.hand.basePayout * bet, jokers: result.jokers };
  }
}
