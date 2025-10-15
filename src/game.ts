import * as PIXI from 'pixi.js';

export type Bets = Map<number, number>;

export class WheelGame {
  app: PIXI.Application;
  container: PIXI.Container;
  wheel: PIXI.Container;
  sectors: number;
  radius: number;
  sectorAngles: number[];
  sectorGraphics: PIXI.Graphics[] = [];

  constructor(app: PIXI.Application, sectors = 6) {
    this.app = app;
    this.sectors = sectors;
    this.radius = Math.min(app.view.width, app.view.height) * 0.35;
    this.container = new PIXI.Container();
    this.wheel = new PIXI.Container();
    this.container.addChild(this.wheel);
    this.sectorAngles = [];
    this.drawWheel();
    app.stage.addChild(this.container);
    this.container.x = app.view.width / 2;
    this.container.y = app.view.height / 2;
  }

  drawWheel() {
    const anglePer = (Math.PI * 2) / this.sectors;
    for (let i = 0; i < this.sectors; i++) {
      const g = new PIXI.Graphics();
      const start = i * anglePer - Math.PI / 2;
      const end = start + anglePer;
      this.sectorAngles.push((start + end) / 2);

      const color = i % 2 === 0 ? 0xffcc00 : 0x39a6ff;
      g.beginFill(color);
      g.lineStyle(4, 0x222222);
      g.moveTo(0, 0);
      g.arc(0, 0, this.radius, start, end);
      g.lineTo(0, 0);
      g.endFill();

      // label
      const midAngle = (start + end) / 2;
      const label = new PIXI.Text(String(i + 1), {
        fontFamily: 'Arial',
        fontSize: 24,
        fill: 0x222222,
        fontWeight: 'bold'
      });
      label.anchor.set(0.5);
      label.x = Math.cos(midAngle) * (this.radius * 0.6);
      label.y = Math.sin(midAngle) * (this.radius * 0.6);
      g.addChild(label);

      g.interactive = true;
      g.cursor = 'pointer';

      // store index
      ;(g as any).sectorIndex = i;

      this.sectorGraphics.push(g);
      this.wheel.addChild(g);
    }

    // center circle
    const center = new PIXI.Graphics();
    center.beginFill(0xffffff);
    center.lineStyle(4, 0x222222);
    center.drawCircle(0, 0, this.radius * 0.18);
    center.endFill();
    this.wheel.addChild(center);
  }

  onSectorClick(cb: (index: number) => void) {
    this.sectorGraphics.forEach(g => {
      g.removeAllListeners('pointerdown');
      g.on('pointerdown', () => {
        const idx = (g as any).sectorIndex as number;
        cb(idx);
      });
    });
  }

  async spinToRandom(): Promise<number> {
    const target = Math.floor(Math.random() * this.sectors);
    return this.spinTo(target);
  }

  spinTo(targetIndex: number, rounds = 4): Promise<number> {
    return new Promise(resolve => {
      const anglePer = (Math.PI * 2) / this.sectors;
      // compute target rotation so that sector center aligns with upwards (-PI/2)
      const targetAngle = -Math.PI / 2 - this.sectorAngles[targetIndex];
      const startRotation = this.wheel.rotation % (Math.PI * 2);
      // normalize startRotation to 0..2pi
      let start = startRotation;
      if (start < 0) start += Math.PI * 2;

      // we want final rotation = start + fullTurns + delta
      const fullTurns = rounds * Math.PI * 2;
      // choose minimal additional to reach targetAngle
      let desired = fullTurns + targetAngle - start;
      // ensure positive
      if (desired < 0) desired += Math.PI * 2;

      const duration = 3000; // ms
      const startTime = performance.now();

      const animate = (now: number) => {
        const t = Math.min(1, (now - startTime) / duration);
        // ease out cubic
        const ease = 1 - Math.pow(1 - t, 3);
        this.wheel.rotation = start + desired * ease;
        if (t < 1) {
          requestAnimationFrame(animate);
        } else {
          // normalize wheel.rotation between -PI..PI
          const norm = ((this.wheel.rotation + Math.PI) % (Math.PI * 2)) - Math.PI;
          this.wheel.rotation = norm;
          resolve(targetIndex);
        }
      };

      requestAnimationFrame(animate);
    });
  }

  highlightWinner(index: number) {
    // flash winner sector
    const g = this.sectorGraphics[index];
    const origAlpha = g.alpha;
    let flash = 0;
    const tick = () => {
      flash++;
      g.alpha = 0.3 + 0.7 * ((flash % 10) / 9);
      if (flash < 40) requestAnimationFrame(tick);
      else g.alpha = origAlpha;
    };
    tick();
  }
}
