import { Container, Sprite, Text, Assets, Graphics } from 'pixi.js';
import type { IScene } from '../sceneManager';
import { ASSETS } from '../assets';

export class DiceRollScene implements IScene {
  container = new Container();
  private state: 'rolling' | 'waiting' | 'done' = 'rolling';
  private player!: Graphics;
  private elapsed = 0;

  async init() {
    const bg1 = await Assets.load(ASSETS.FTP_DICE_ROLL_1);
    const bg = new Sprite(bg1);
    bg.anchor.set(0.5);
    bg.x = window.innerWidth / 2;
    bg.y = window.innerHeight / 2;
    this.container.addChild(bg);

    this.player = new Graphics();
    this.player.beginFill(0xffd700).drawCircle(0,0,20).endFill();
    this.player.x = window.innerWidth / 2 - 300; // space 1
    this.player.y = window.innerHeight / 2 + 150;
    this.container.addChild(this.player);

    // simulate dice roll animation by oscillating scale
  }

  update(delta: number) {
    if (this.state === 'rolling') {
      this.elapsed += delta;
      const scale = 1 + Math.sin(this.elapsed * 0.5) * 0.3;
      this.player.scale.set(scale);
      if (this.elapsed > 120) { // after ~2 seconds (60fps assumption)
        this.state = 'waiting';
        this.player.scale.set(1);
        // animate move to space 5
        const targetX = window.innerWidth / 2 - 300 + 4 * 150; // simple spacing
        const startX = this.player.x;
        const duration = 90; // frames
        let f = 0;
        const move = () => {
          f++;
            const t = Math.min(1, f / duration);
            this.player.x = startX + (targetX - startX) * t;
            if (t < 1) requestAnimationFrame(move); else this.state = 'done';
        };
        requestAnimationFrame(move);
      }
    }
  }

  destroy() {}
  isDone() { return this.state === 'done'; }
}
