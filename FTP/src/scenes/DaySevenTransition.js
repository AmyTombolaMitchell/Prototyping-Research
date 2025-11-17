import { Container, Graphics, Text } from 'pixi.js';

export class DaySevenTransition {
  constructor() {
    this.container = new Container();
    this.ready = false;
    this.canvasWidth = 572;
    this.canvasHeight = 1247;
  }

  async init() {
    console.log('[DaySevenTransition] Showing DAY SEVEN transition...');

    // Black background
    const background = new Graphics();
    background.rect(0, 0, this.canvasWidth, this.canvasHeight);
    background.fill({ color: 0x000000 });
    this.container.addChild(background);

    // Fast forward symbol >>
    const ffText = new Text({
      text: '>>',
      style: {
        fontFamily: 'Arial',
        fontSize: 60,
        fill: 0xFFFFFF,
        fontWeight: 'bold'
      }
    });
    ffText.anchor.set(0.5);
    ffText.x = this.canvasWidth / 2;
    ffText.y = this.canvasHeight / 2 - 80;
    ffText.alpha = 0;
    this.container.addChild(ffText);

    // "DAY SEVEN" text
    const daySevenText = new Text({
      text: 'DAY SEVEN',
      style: {
        fontFamily: 'Arial',
        fontSize: 48,
        fill: 0xFFFFFF,
        fontWeight: 'bold',
        letterSpacing: 2
      }
    });
    daySevenText.anchor.set(0.5);
    daySevenText.x = this.canvasWidth / 2;
    daySevenText.y = this.canvasHeight / 2;
    daySevenText.alpha = 0;
    this.container.addChild(daySevenText);

    // Fade in both at the same time
    await Promise.all([
      this.fadeIn(ffText, 500),
      this.fadeIn(daySevenText, 500)
    ]);
    await this.wait(1500);
    
    // Fade out both
    await Promise.all([
      this.fadeOut(ffText, 500),
      this.fadeOut(daySevenText, 500)
    ]);
    
    // Navigate to DaySevenScene
    await this.navigateToDaySeven();

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

  async navigateToDaySeven() {
    console.log('[DaySevenTransition] Navigating to DaySevenScene...');
    const sceneManager = window.sceneManager;
    if (sceneManager) {
      const { DaySevenScene } = await import('./DaySevenScene.js');
      await sceneManager.change(new DaySevenScene(), 'none');
    }
  }

  isReady() {
    return this.ready;
  }

  update(delta) {
    // No updates needed
  }

  destroy() {
    this.container.destroy({ children: true });
  }
}
