import { Container, Sprite, Graphics, Assets, Text } from 'pixi.js';

export class MessageTwoScene {
  constructor() {
    this.container = new Container();
    this.layeredSprites = [];
    this.ready = false;
    this.canvasWidth = 572;
    this.canvasHeight = 1247;
    this.page5Assets = [];
    this.messages = []; // Track messages 1, 2, 3 for bump animations
    this.scrollContainer = null;
    this.avatar = null;
    
    // Position 5 coordinates from DayTwoScene
    this.avatarPosition = { x: 286, y: 2100 };
  }

  async init() {
    console.log('[MessageTwoScene] Initializing Page 9...');

    // Create scrollable container for the long background
    this.scrollContainer = new Container();
    this.container.addChild(this.scrollContainer);

    // Add LONG_BACKGROUND (same as Day Two)
    const bgTexture = Assets.get('PAGE6_LONG_BACKGROUND');
    if (bgTexture) {
      const bg = new Sprite(bgTexture);
      bg.anchor.set(0.5, 0);
      bg.x = this.canvasWidth / 2;
      bg.y = 0;
      
      // Scale to fit canvas width
      const scale = this.canvasWidth / bg.width;
      bg.scale.set(scale);
      
      this.scrollContainer.addChild(bg);
      this.layeredSprites.push(bg);
      
      // Calculate scroll limits
      const bgHeight = bg.height * scale;
      this.minY = Math.min(0, this.canvasHeight - bgHeight);
      this.maxY = 0;
    }

    // Add AVATAR at position 5 in the background
    const avatarTexture = Assets.get('PAGE3_AVATAR');
    if (avatarTexture && this.scrollContainer) {
      this.avatar = new Sprite(avatarTexture);
      this.avatar.anchor.set(0.5, 1);
      this.avatar.scale.set(0.75);
      this.avatar.x = this.avatarPosition.x;
      this.avatar.y = this.avatarPosition.y;
      this.scrollContainer.addChild(this.avatar);
      this.layeredSprites.push(this.avatar);
      
      // Center camera on avatar
      this.centerCameraOnAvatar();
    }

    // Add TOP BANNER (BANNER_NO_0)
    const topBannerTexture = Assets.get('BANNER_NO_0');
    if (topBannerTexture) {
      const topBanner = new Sprite(topBannerTexture);
      topBanner.anchor.set(0.5, 0);
      topBanner.x = this.canvasWidth / 2;
      topBanner.y = 0;
      topBanner.scale.set(0.75);
      this.container.addChild(topBanner);
      this.layeredSprites.push(topBanner);
    }

    // Add BOTTOM_BANNER
    const bottomBannerTexture = Assets.get('PAGE6_BOTTOM_BANNER');
    if (bottomBannerTexture) {
      const bottomBanner = new Sprite(bottomBannerTexture);
      bottomBanner.anchor.set(0.5, 1);
      bottomBanner.x = this.canvasWidth / 2;
      bottomBanner.y = this.canvasHeight;
      bottomBanner.scale.set(1.0);
      this.container.addChild(bottomBanner);
      this.layeredSprites.push(bottomBanner);
    }

    // Add character (same position as Day Two)
    const charTexture = Assets.get('PAGE6_CHAR');
    if (charTexture) {
      const charSprite = new Sprite(charTexture);
      charSprite.anchor.set(0, 1);
      charSprite.x = 0;
      charSprite.y = this.canvasHeight - 63;
      charSprite.scale.set(1.3);
      charSprite.alpha = 0;
      this.container.addChild(charSprite);
      this.layeredSprites.push(charSprite);
      // Fade in character
      await this.fadeIn(charSprite, 500);
    }

    // Show PAGE 5 assets 2, 3 in sequence with bump animations (skip asset 1)
    await this.showPage5Message('PAGE5_2', this.canvasWidth / 2, this.canvasHeight / 2, 0);
    await this.wait(600);
    // Bump asset 2 up and fade it
    await this.bumpUpAndFade(0, 150);
    
    await this.showPage5Message('PAGE5_3', this.canvasWidth / 2, this.canvasHeight / 2, 1);
    await this.wait(600);
    
    // Assets 4 and 5 appear simultaneously
    const asset5Texture = Assets.get('PAGE5_5');
    const asset4Texture = Assets.get('PAGE5_4');
    const promises = [];
    
    if (asset5Texture) {
      const asset5 = new Sprite(asset5Texture);
      asset5.anchor.set(1, 1);
      asset5.x = this.canvasWidth - 20;
      asset5.y = this.canvasHeight - 120;
      asset5.alpha = 0;
      asset5.scale.set(0);
      this.container.addChild(asset5);
      this.layeredSprites.push(asset5);
      this.page5Assets.push(asset5);
      promises.push(this.popIn(asset5, 1));
    }
    
    if (asset4Texture) {
      const asset4 = new Sprite(asset4Texture);
      asset4.anchor.set(1, 1);
      asset4.x = this.canvasWidth - 40;
      asset4.y = this.canvasHeight - 320;
      asset4.alpha = 0;
      asset4.scale.set(0);
      this.container.addChild(asset4);
      this.layeredSprites.push(asset4);
      this.page5Assets.push(asset4);
      promises.push(this.popIn(asset4, 0.6));
    }
    
    await Promise.all(promises);
    console.log('[MessageTwoScene] All PAGE 5 assets displayed');
    
    // Make assets 4 and 5 clickable to continue
    this.addClickHandlers();
    
    this.ready = true;
    console.log('[MessageTwoScene] Ready - waiting for click on asset 4 or 5');
  }

  async showPage5Message(assetKey, x, y, index) {
    const texture = Assets.get(assetKey);
    if (!texture) return;
    
    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5);
    sprite.x = x;
    sprite.y = y;
    sprite.alpha = 0;
    sprite.scale.set(0);
    this.container.addChild(sprite);
    this.layeredSprites.push(sprite);
    this.messages[index] = sprite;
    
    // Pop in animation with smaller scale (0.6 instead of 0.7)
    await this.popIn(sprite, 0.6);
  }

  async bumpUpAndFade(index, spacing = 150) {
    const message = this.messages[index];
    if (!message) return;

    const duration = 250;
    const startTime = Date.now();
    const startY = message.y;
    const targetY = startY - spacing;

    return new Promise(resolve => {
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(1, elapsed / duration);

        message.y = startY + (targetY - startY) * progress;
        // Keep message visible but slightly transparent (0.5 alpha instead of 0.3)
        message.alpha = 1 - (progress * 0.5); // Goes from 1.0 to 0.5

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          message.alpha = 0.5; // Keep at 50% opacity
          message.y = targetY;
          resolve();
        }
      };
      requestAnimationFrame(animate);
    });
  }

  centerCameraOnAvatar() {
    if (!this.avatar || !this.scrollContainer) return;
    
    // Calculate target scroll position to center avatar on screen
    const targetY = -this.avatar.y + (this.canvasHeight / 2);
    
    // Clamp to scroll limits
    this.scrollContainer.y = Math.max(this.minY, Math.min(this.maxY, targetY));
    
    console.log('[MessageTwoScene] Camera centered on avatar at position:', this.avatar.y, 'Scroll Y:', this.scrollContainer.y);
  }

  async showPage5Asset(assetKey, x, y) {
    const texture = Assets.get(assetKey);
    if (!texture) return;
    
    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5);
    sprite.x = x;
    sprite.y = y;
    sprite.alpha = 0;
    sprite.scale.set(0);
    this.container.addChild(sprite);
    this.layeredSprites.push(sprite);
    this.page5Assets.push(sprite);
    
    // Pop in animation (0.7 scale like MessageScene)
    await this.popIn(sprite, 0.7);
  }

  async popIn(sprite, targetScale = 1) {
    const duration = 250;
    const startTime = Date.now();
    
    return new Promise(resolve => {
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

  async fadeIn(sprite, duration) {
    return new Promise(resolve => {
      const startTime = performance.now();
      
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

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  addClickHandlers() {
    console.log('[MessageTwoScene] Adding click handlers to assets 4 and 5');
    
    // Make only assets 4 and 5 clickable (last two in the array)
    const clickableAssets = this.page5Assets.slice(-2);
    
    for (const asset of clickableAssets) {
      asset.eventMode = 'static';
      asset.cursor = 'pointer';
      asset.on('pointerdown', () => this.handleContinue());
    }
  }

  async handleContinue() {
    console.log('[MessageTwoScene] Player clicked to continue - navigating to Day Seven transition');
    const sceneManager = window.sceneManager;
    if (sceneManager) {
      const { DaySevenTransition } = await import('./DaySevenTransition.js');
      await sceneManager.change(new DaySevenTransition(), 'none');
    }
  }

  isReady() {
    return this.ready;
  }

  update(delta) {
    // No animation updates needed
  }

  destroy() {
    this.container.destroy({ children: true });
  }
}
