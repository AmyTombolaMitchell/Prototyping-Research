import { Container, Graphics, Text } from 'pixi.js';

export class DayThirtyTransition {
  constructor() {
    this.container = new Container();
    this.ready = false;
    this.canvasWidth = 572;
    this.canvasHeight = 1247;
  }

  async init() {
    console.log('[DayThirtyTransition] Showing DAY 30 transition...');

    const background = new Graphics();
    background.rect(0, 0, this.canvasWidth, this.canvasHeight);
    background.fill({ color: 0x000000 });
    this.container.addChild(background);

    const fastForwardText = new Text({
      text: '>>>',
      style: {
        fontFamily: 'Arial',
        fontSize: 64,
        fill: 0xFFFFFF,
        fontWeight: 'bold'
      }
    });
    fastForwardText.anchor.set(0.5);
    fastForwardText.x = this.canvasWidth / 2;
    fastForwardText.y = this.canvasHeight / 2 - 90;
    fastForwardText.alpha = 0;
    this.container.addChild(fastForwardText);

    const dayThirtyText = new Text({
      text: 'DAY 30',
      style: {
        fontFamily: 'Arial',
        fontSize: 52,
        fill: 0xFFFFFF,
        fontWeight: 'bold',
        letterSpacing: 2
      }
    });
    dayThirtyText.anchor.set(0.5);
    dayThirtyText.x = this.canvasWidth / 2;
    dayThirtyText.y = this.canvasHeight / 2;
    dayThirtyText.alpha = 0;
    this.container.addChild(dayThirtyText);

    await Promise.all([
      this.fadeIn(fastForwardText, 500),
      this.fadeIn(dayThirtyText, 500)
    ]);

    await this.wait(1500);

    await Promise.all([
      this.fadeOut(fastForwardText, 500),
      this.fadeOut(dayThirtyText, 500)
    ]);

    await this.navigateToDayThirty();

    this.ready = true;
  }

  async fadeIn(sprite, duration) {
    const startTime = performance.now();

    return new Promise(resolve => {
      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        sprite.alpha = progress;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          sprite.alpha = 1;
          resolve();
        }
      };
      animate();
    });
  }

  async fadeOut(sprite, duration) {
    const startTime = performance.now();

    return new Promise(resolve => {
      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        sprite.alpha = 1 - progress;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          sprite.alpha = 0;
          resolve();
        }
      };
      animate();
    });
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async navigateToDayThirty() {
    console.log('[DayThirtyTransition] Navigating to DayThirtyScene...');
    const sceneManager = window.sceneManager;
    if (sceneManager) {
      const { DayThirtyScene } = await import('./DayThirtyScene.js');
      await sceneManager.change(new DayThirtyScene(), 'none');
    }
  }

  isReady() {
    return this.ready;
  }

  update(delta) {
    // No updates required while transition is showing
  }

  destroy() {
    this.container.destroy({ children: true });
  }
}
