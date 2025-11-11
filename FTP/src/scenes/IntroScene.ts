import { Container, Sprite, Assets } from 'pixi.js';
import type { IScene } from '../sceneManager';
import { ASSETS } from '../assets';

export class IntroScene implements IScene {
  container = new Container();
  private ready = false;
  private layeredSprites: Sprite[] = [];

  async init() {
    // Order previously specified: BACKGROUND, 8, 9, 7, 1,2,3,4,5
    const sequence: string[] = [
      'INTRO_BG', 'INTRO_8', 'INTRO_9', 'INTRO_7', 'INTRO_1', 'INTRO_2', 'INTRO_3', 'INTRO_4', 'INTRO_5'
    ];
    // Preload textures first
    const textures: Record<string, Awaited<ReturnType<typeof Assets.load>>> = {};
    for (const key of sequence) {
      try {
        textures[key] = await Assets.load(ASSETS[key as keyof typeof ASSETS]);
      } catch (e) {
        console.error('IntroScene failed to load texture', key, e);
      }
    }

    // Helper to animate pop
    const popIn = (sprite: Sprite) => {
      sprite.alpha = 0;
      sprite.scale.set(0.5);
      let frame = 0;
      const animate = () => {
        frame++;
        sprite.alpha = Math.min(1, sprite.alpha + 0.08);
        const targetScale = 1;
        const currentScale = sprite.scale.x;
        const nextScale = Math.min(targetScale, currentScale + 0.05);
        sprite.scale.set(nextScale);
        if (frame < 24) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    };

    // Sequentially add and pop each sprite
    for (let i = 0; i < sequence.length; i++) {
      const key = sequence[i];
      const sprite = new Sprite(textures[key]);
      sprite.anchor.set(0.5);
      sprite.x = window.innerWidth / 2;
      sprite.y = window.innerHeight / 2;
      this.container.addChild(sprite);
      this.layeredSprites.push(sprite);
      popIn(sprite);
      // Delay before next one (background appears instantly then others spaced)
      if (i < sequence.length - 1) {
        await new Promise(res => setTimeout(res, i === 0 ? 200 : 450));
      }
    }
    // Mark ready to advance once sequence completes
    this.ready = true;
  }

  update() {}
  destroy() {
    for (const s of this.layeredSprites) s.destroy();
    this.container.removeChildren();
  }
  public isReady() { return this.ready; }
}
