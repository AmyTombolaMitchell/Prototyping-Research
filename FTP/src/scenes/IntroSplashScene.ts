import { Container, Sprite, Assets } from 'pixi.js';
import type { IScene } from '../sceneManager';

export class IntroSplashScene implements IScene {
  container = new Container();
  private ready = false;
  private readonly canvasWidth = 572;
  private readonly canvasHeight = 1247;

  async init() {
    console.log('[IntroSplashScene] init() called');
    // Show BACKGROUND_intro centered
    const splashTexture = Assets.get('BACKGROUND_intro');
    if (splashTexture) {
      const splash = new Sprite(splashTexture);
      splash.anchor.set(0.5);
      splash.x = this.canvasWidth / 2;
      splash.y = this.canvasHeight / 2;
      this.container.addChild(splash);
      // Wait 2 seconds
      await new Promise(res => setTimeout(res, 2000));
      this.container.removeChild(splash);
      splash.destroy();
    }
    // Transition to the main intro scene
    const sceneManager = (window as any).sceneManager;
    if (sceneManager) {
      const { IntroScene } = await import('./IntroScene');
      await sceneManager.change(new IntroScene(), 'none');
    }
    this.ready = true;
  }

  update() {}
  destroy() {
    this.container.removeChildren();
    this.container.removeAllListeners();
  }
  isReady() { return this.ready; }
}
