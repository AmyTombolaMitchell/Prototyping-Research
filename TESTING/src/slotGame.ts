import * as PIXI from 'pixi.js';
import { spinReels } from './engine';

export class SlotGame {
  app: PIXI.Application;
  container: PIXI.Container;
  reelContainers: PIXI.Container[] = [];
  symbolSize = { w: 100, h: 120 };
  spacing = 18;

  background?: PIXI.Sprite;
  symbolsTexture?: PIXI.Texture;

  constructor(app: PIXI.Application) {
    this.app = app;
    this.container = new PIXI.Container();
    app.stage.addChild(this.container);
    this.container.x = app.view.width / 2;
    this.container.y = app.view.height / 2;

    // Load background image using PixiJS v7+ Assets API
    PIXI.Assets.load('TESTING/src/dayofdead.png').then((texture: PIXI.Texture) => {
      this.background = new PIXI.Sprite(texture);
      this.background.anchor.set(0.5);
      this.background.width = app.view.width;
      this.background.height = app.view.height;
      this.background.x = 0;
      this.background.y = 0;
      this.container.addChildAt(this.background, 0);
      this.symbolsTexture = texture;
      this.drawLayout();
    });
  }

  drawSymbolGraphic(symbol: string): PIXI.Container {
    const c = new PIXI.Container();
    const g = new PIXI.Graphics();
    // Color by symbol type
    let color = 0xffffff;
    if (symbol === 'wild') color = 0xffd700;
    else if (symbol.startsWith('skeleton')) color = 0x222222;
    else if (symbol === 'flower') color = 0xff4fa2;
    else if (symbol === 'instrument') color = 0x3ad1ff;
    else color = 0x9e4fff;
    g.beginFill(color);
    g.lineStyle(3, 0x222222);
    g.drawRoundedRect(-this.symbolSize.w/2, -this.symbolSize.h/2, this.symbolSize.w, this.symbolSize.h, 16);
    g.endFill();
    c.addChild(g);

    // Symbol text
    let label = symbol;
    if (symbol === 'wild') label = 'WILD';
    else if (symbol.startsWith('skeleton')) label = '💀';
    else if (symbol === 'flower') label = '🌸';
    else if (symbol === 'instrument') label = '🎸';
    const t = new PIXI.Text(label, { fontSize: 38, fill: 0xffffff, fontWeight: 'bold', align: 'center' });
    t.anchor.set(0.5);
    c.addChild(t);
    return c;
  }

  drawLayout() {
    // Draw 5 reels, each with 3 symbol slots
    const totalW = this.symbolSize.w * 5 + this.spacing * 4;
    const startX = -totalW / 2 + this.symbolSize.w / 2;
    for (let i=0;i<5;i++) {
      const reelCont = new PIXI.Container();
      reelCont.x = startX + i * (this.symbolSize.w + this.spacing);
      reelCont.y = 0;
      this.container.addChild(reelCont);
      this.reelContainers.push(reelCont);
      // Draw empty slots
      for (let j=0;j<3;j++) {
        const slot = this.drawSymbolGraphic('');
        slot.alpha = 0.2;
        slot.y = (j-1)*this.symbolSize.h;
        reelCont.addChild(slot);
      }
    }
    // Top bar: game title
    const title = new PIXI.Text('DANCING DEAD', { fontSize: 44, fill: 0xffd700, fontWeight: 'bold', align: 'center', stroke: 0x222222, strokeThickness: 6 });
    title.anchor.set(0.5);
    title.y = -this.symbolSize.h * 2.2;
    this.container.addChild(title);
    // Bottom bar: placeholder for controls
    const bottomBar = new PIXI.Graphics();
    bottomBar.beginFill(0xffffff, 0.85);
    bottomBar.drawRoundedRect(-totalW/2, this.symbolSize.h*2.1, totalW, 54, 16);
    bottomBar.endFill();
    this.container.addChild(bottomBar);
    const barLabel = new PIXI.Text('Select stake and buy | Buy 50p | Balance £32.45', { fontSize: 18, fill: 0x222222 });
    barLabel.anchor.set(0.5,0.5);
    barLabel.x = 0;
    barLabel.y = this.symbolSize.h*2.1+27;
    this.container.addChild(barLabel);
  }

  async spin(stake: number, balance: number): Promise<{ result: any }> {
    // Animate reels spinning, then show result
    for (let f=0; f<12; f++) {
      for (let i=0;i<5;i++) {
        const reelCont = this.reelContainers[i];
        reelCont.removeChildren();
        for (let j=0;j<3;j++) {
          // Random symbol for animation
          const syms = ['skeleton1','skeleton2','skeleton3','flower','instrument','A','K','J','wild'];
          const sym = syms[Math.floor(Math.random()*syms.length)];
          const slot = this.drawSymbolGraphic(sym);
          slot.y = (j-1)*this.symbolSize.h;
          reelCont.addChild(slot);
        }
      }
      await new Promise(r => setTimeout(r, 50));
    }
    // Final result
    const result = spinReels(stake, balance);
    for (let i=0;i<5;i++) {
      const reelCont = this.reelContainers[i];
      reelCont.removeChildren();
      for (let j=0;j<3;j++) {
        const sym = result.reels[i][j];
        const slot = this.drawSymbolGraphic(sym);
        slot.y = (j-1)*this.symbolSize.h;
        reelCont.addChild(slot);
      }
    }
    return { result };
  }
}
