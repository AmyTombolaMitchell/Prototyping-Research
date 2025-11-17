import { Container, Sprite, Assets, Graphics } from 'pixi.js';
import type { IScene } from '../sceneManager';

export class MessageScene implements IScene {
  container = new Container();
  private ready = false;
  private isTransitioning = false;
  private layeredSprites: Sprite[] = [];
  private readonly canvasWidth = 572;
  private readonly canvasHeight = 1247;
  private messages: Sprite[] = [];
  private clickableElements: (Sprite | Graphics)[] = [];
  
  async init() {
    console.log('[MessageScene] Starting init');
    
    // Add BACKGROUND from PAGE 1
    const bgTexture = Assets.get('INTRO_BG');
    if (bgTexture) {
      const bg = new Sprite(bgTexture);
      bg.anchor.set(0.5);
      bg.x = this.canvasWidth / 2;
      bg.y = this.canvasHeight / 2;
      this.container.addChild(bg);
      this.layeredSprites.push(bg);
    }
    
    // Add TOP_BANNER_AFTER from PAGE 4 - using no_25 banner
    const topBannerTexture = Assets.get('BANNER_NO_25');
    console.log('[MessageScene] BANNER_NO_25 texture:', topBannerTexture);
    if (topBannerTexture) {
      const banner = new Sprite(topBannerTexture);
      banner.anchor.set(0.5, 0);
      banner.x = this.canvasWidth / 2;
      banner.y = 0;
      this.container.addChild(banner);
      this.layeredSprites.push(banner);
      console.log('[MessageScene] Banner added at', banner.x, banner.y);
    } else {
      console.warn('[MessageScene] BANNER_NO_25 texture not found!');
    }
    
    // Add Asset 7 (lady) from PAGE 1 in same location
    const ladyTexture = Assets.get('INTRO_7');
    if (ladyTexture) {
      const lady = new Sprite(ladyTexture);
      lady.anchor.set(0, 1);
      lady.x = 50;
      lady.y = this.canvasHeight - 63;
      lady.scale.set(0.7);
      lady.alpha = 0;
      this.container.addChild(lady);
      this.layeredSprites.push(lady);
      
      // Fade in animation for lady
      await this.fadeIn(lady);
    }
    
    // Now show the message sequence
    await this.showMessageSequence();
    
    this.ready = true;
    console.log('[MessageScene] Init complete');
  }
  
  private async fadeIn(sprite: Sprite): Promise<void> {
    return new Promise<void>((resolve) => {
      let frame = 0;
      const animate = () => {
        frame++;
        sprite.alpha = Math.min(1, sprite.alpha + 0.02);
        if (sprite.alpha < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      requestAnimationFrame(animate);
    });
  }
  
  private async showMessageSequence() {
    // Asset 1 - appears in the middle
    await this.showMessage('PAGE5_1', this.canvasWidth / 2, this.canvasHeight / 2, 0);
    await this.wait(600); // Reduced from 1000ms to 600ms
    
    // Bump asset 1 up and fade it
    await this.bumpUpAndFade(0, 150); // More spacing
    
    // Asset 2 - appears in the middle
    await this.showMessage('PAGE5_2', this.canvasWidth / 2, this.canvasHeight / 2, 1);
    await this.wait(600); // Reduced from 1000ms to 600ms
    
    // Bump asset 1 and 2 up and fade
    await this.bumpUpAndFade(0, 150);
    await this.bumpUpAndFade(1, 150);
    
    // Asset 3 - appears in the middle
    await this.showMessage('PAGE5_3', this.canvasWidth / 2, this.canvasHeight / 2, 2);
    await this.wait(600); // Reduced from 1000ms to 600ms
    
    // Assets 4 and 5 appear simultaneously
    const asset5Texture = Assets.get('PAGE5_5');
    const asset4Texture = Assets.get('PAGE5_4');
    
    const promises = [];
    
    if (asset5Texture) {
      const asset5 = new Sprite(asset5Texture);
      asset5.anchor.set(1, 1); // Anchor to bottom right
      asset5.x = this.canvasWidth - 20;
      asset5.y = this.canvasHeight - 120;
      asset5.alpha = 0;
      this.container.addChild(asset5);
      this.layeredSprites.push(asset5);
      promises.push(this.popIn(asset5, 1)); // Normal size
    }
    
    if (asset4Texture) {
      const asset4 = new Sprite(asset4Texture);
      asset4.anchor.set(1, 1); // Anchor to bottom right
      asset4.x = this.canvasWidth - 40; // Moved slightly right
      asset4.y = this.canvasHeight - 320; // Moved higher up for more gap
      asset4.alpha = 0;
      this.container.addChild(asset4);
      this.layeredSprites.push(asset4);
      promises.push(this.popIn(asset4, 0.6)); // Smaller scale
    }
    
    // Wait for both to complete together
    await Promise.all(promises);
    
    // Add clickable areas
    this.addClickableAreas();
  }
  
  private async transitionToThankYou() {
    if (this.isTransitioning) return; // Prevent double-transition
    this.isTransitioning = true;
    
    // Disable all clickable elements immediately
    this.clickableElements.forEach(el => {
      el.eventMode = 'none';
      el.cursor = 'default';
    });
    
    console.log('[MessageScene] Transitioning to Thank You page...');
    const sceneManager = (window as any).sceneManager;
    if (sceneManager) {
      const { ThankYouScene } = await import('./ThankYouScene');
      await sceneManager.change(new ThankYouScene(), 'none');
    }
  }
  
  private addClickableAreas() {
    // Create clickable area at bottom (0-100px height, full width)
    const bottomArea = new Graphics();
    bottomArea.rect(0, this.canvasHeight - 100, this.canvasWidth, 100);
    bottomArea.fill({ color: 0x000000, alpha: 0.01 }); // Nearly invisible
    bottomArea.eventMode = 'static';
    bottomArea.cursor = 'pointer';
    bottomArea.on('pointerdown', () => this.transitionToThankYou());
    this.container.addChild(bottomArea);
    this.clickableElements.push(bottomArea);
    
    // Create clickable area at top (0-250px from top, full width)
    const topArea = new Graphics();
    topArea.rect(0, 0, this.canvasWidth, 250);
    topArea.fill({ color: 0x000000, alpha: 0.01 }); // Nearly invisible
    topArea.eventMode = 'static';
    topArea.cursor = 'pointer';
    topArea.on('pointerdown', () => this.transitionToThankYou());
    this.container.addChild(topArea);
    this.clickableElements.push(topArea);
    
    // Make asset 4 and 5 clickable by finding them in layeredSprites
    const asset4Texture = Assets.get('PAGE5_4');
    const asset5Texture = Assets.get('PAGE5_5');
    
    for (const sprite of this.layeredSprites) {
      if (asset4Texture && sprite.texture === asset4Texture) {
        sprite.eventMode = 'static';
        sprite.cursor = 'pointer';
        sprite.on('pointerdown', () => this.transitionToThankYou());
      }
      if (asset5Texture && sprite.texture === asset5Texture) {
        sprite.eventMode = 'static';
        sprite.cursor = 'pointer';
        sprite.on('pointerdown', () => this.transitionToThankYou());
      }
    }
  }
  
  private async showMessage(assetKey: string, x: number, y: number, index: number): Promise<void> {
    const texture = Assets.get(assetKey);
    if (texture) {
      const message = new Sprite(texture);
      message.anchor.set(0.5);
      message.x = x;
      message.y = y;
      message.alpha = 0;
      message.scale.set(0);
      this.container.addChild(message);
      this.messages[index] = message;
      
      await this.popIn(message, 0.7); // Smaller scale for messages
    }
  }
  
  private async popIn(sprite: Sprite, targetScale: number = 1): Promise<void> {
    const duration = 250; // milliseconds (reduced from 333ms to 250ms)
    const startTime = Date.now();
    
    return new Promise<void>((resolve) => {
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(1, elapsed / duration);
        
        sprite.alpha = Math.min(1, progress * 2);
        sprite.scale.set(Math.min(targetScale, progress * 1.5 * targetScale));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          sprite.alpha = 1;
          sprite.scale.set(targetScale);
          resolve();
        }
      };
      requestAnimationFrame(animate);
    });
  }
  
  private async bumpUpAndFade(index: number, spacing: number = 100): Promise<void> {
    const message = this.messages[index];
    if (!message) return;
    
    const duration = 250; // milliseconds (reduced from 333ms to 250ms)
    const startTime = Date.now();
    const startY = message.y;
    const targetY = startY - spacing; // Bump up by spacing amount
    
    return new Promise<void>((resolve) => {
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(1, elapsed / duration);
        
        message.y = startY + (targetY - startY) * progress;
        message.alpha = 1 - (progress * 0.5); // Fade to 50% opacity
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      requestAnimationFrame(animate);
    });
  }
  
  private async wait(ms: number): Promise<void> {
    return new Promise<void>((resolve) => {
      setTimeout(resolve, ms);
    });
  }
  
  isReady() {
    return this.ready;
  }
  
  update() {}
  
  destroy() {
    this.layeredSprites.forEach(sprite => {
      sprite.removeAllListeners();
    });
    this.clickableElements.forEach(el => {
      el.removeAllListeners();
    });
    for (const s of this.layeredSprites) s.destroy();
    this.container.removeChildren();
    this.container.removeAllListeners();
  }
}
