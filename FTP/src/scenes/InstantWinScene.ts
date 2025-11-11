import { Container, Sprite, Text, Assets } from 'pixi.js';
import type { IScene } from '../sceneManager';
import { ASSETS } from '../assets';

export class InstantWinScene implements IScene {
  container = new Container();
  private done = false;
  async init() {
    const texture = await Assets.load(ASSETS.FTP_INSTANT_WIN);
    const bg = new Sprite(texture);
    bg.anchor.set(0.5);
    bg.x = window.innerWidth / 2;
    bg.y = window.innerHeight / 2;
    this.container.addChild(bg);

    const text = new Text('INSTANT WIN!', { fill: 0xff4444, fontSize: 72, fontWeight: '900' });
    text.anchor.set(0.5);
    text.x = window.innerWidth / 2;
    text.y = window.innerHeight / 2 - 200;
    this.container.addChild(text);

    let frame = 0;
    const pulse = () => {
      frame++;
      const s = 1 + Math.sin(frame * 0.2) * 0.15;
      text.scale.set(s);
      if (frame < 240) requestAnimationFrame(pulse); else { this.done = true; }
    };
    requestAnimationFrame(pulse);
  }
  update() {}
  destroy() {}
  isDone() { return this.done; }
}
