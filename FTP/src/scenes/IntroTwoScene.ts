import { Container, Sprite, Assets } from 'pixi.js';
import type { IScene } from '../sceneManager';
import { ASSETS } from '../assets';

export class IntroTwoScene implements IScene {
  container = new Container();
  private ready = false;
  async init() {
    // Show background only, auto-advance shortly after for streamlined flow.
    try {
      const texture = await Assets.load(ASSETS.FTP_INTRO_TWO);
      const bg = new Sprite(texture);
      bg.anchor.set(0.5);
      bg.x = window.innerWidth / 2;
      bg.y = window.innerHeight / 2;
      this.container.addChild(bg);
    } catch (e) {
      console.error('IntroTwoScene failed to load background', e);
    }
    // Auto mark ready after brief delay to let background render.
    setTimeout(() => { this.ready = true; }, 600);
  }
  update() {}
  destroy() { this.container.removeChildren(); }
  isReady() { return this.ready; }
}
