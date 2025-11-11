import { Container, Sprite, Assets } from 'pixi.js';
import type { IScene } from '../sceneManager';
import { ASSETS } from '../assets';

export class IntroTwoScene implements IScene {
  container = new Container();
  private ready = false;
  async init() {
    // PAGE 2 layered assets: BACKGROUND2, 1 (always visible), 2 and 3 pop in
    const keys = ['INTRO2_BG', 'INTRO2_1', 'INTRO2_2', 'INTRO2_3'];
    const textures: Record<string, Awaited<ReturnType<typeof Assets.load>>> = {};
    for (const k of keys) {
      try {
        textures[k] = await Assets.load(ASSETS[k as keyof typeof ASSETS]);
      } catch (e) {
        console.error('IntroTwoScene failed to load', k, e);
      }
    }

    // Add background
    const bg = new Sprite(textures['INTRO2_BG']);
    bg.anchor.set(0.5);
    bg.x = window.innerWidth / 2;
    bg.y = window.innerHeight / 2;
    this.container.addChild(bg);

    // Add 1 (always visible)
    const s1 = new Sprite(textures['INTRO2_1']);
    s1.anchor.set(0.5);
    s1.x = window.innerWidth / 2;
    s1.y = window.innerHeight / 2;
    this.container.addChild(s1);

    // Pop in 2 and 3
    const popIn = (sprite: Sprite) => {
      sprite.alpha = 0;
      sprite.scale.set(0.5);
      let frame = 0;
      const animate = () => {
        frame++;
        sprite.alpha = Math.min(1, sprite.alpha + 0.08);
        sprite.scale.set(Math.min(1, sprite.scale.x + 0.05));
        if (frame < 24) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    };

    const s2 = new Sprite(textures['INTRO2_2']);
    s2.anchor.set(0.5);
    s2.x = window.innerWidth / 2;
    s2.y = window.innerHeight / 2;
    this.container.addChild(s2);
    popIn(s2);
    await new Promise(res => setTimeout(res, 450));

    const s3 = new Sprite(textures['INTRO2_3']);
    s3.anchor.set(0.5);
    s3.x = window.innerWidth / 2;
    s3.y = window.innerHeight / 2;
    this.container.addChild(s3);
    popIn(s3);
    await new Promise(res => setTimeout(res, 450));

    // Mark ready after sequence
    this.ready = true;
  }
  update() {}
  destroy() { this.container.removeChildren(); }
  isReady() { return this.ready; }
}
