import { Container, Sprite, Graphics, Assets } from 'pixi.js';

export class TokenShopScene {
  constructor() {
    this.container = new Container();
    this.scrollContainer = new Container();
    this.layeredSprites = [];
    this.ready = false;
    this.canvasWidth = 572;
    this.canvasHeight = 1247;
    this.longBackground = null;
    this.minY = 0;
    this.maxY = 0;
    this.topBanner = null;
    this.charSprite = null;
    this.shop1 = null;
    this.shop2 = null;
    this.shop1Glow = null;
    this.animationFrame = 0;
    this.coinCollect = null;
  }

  async init() {
    console.log('[TokenShopScene] Initializing...');

    // Add scrollContainer to main container first
    this.container.addChild(this.scrollContainer);

    // Add LONG_BACKGROUND_SHOP
    const bgTexture = Assets.get('PAGE7_LONG_BACKGROUND_SHOP');
    if (bgTexture) {
      this.longBackground = new Sprite(bgTexture);
      this.longBackground.anchor.set(0.5, 0);
      this.longBackground.x = this.canvasWidth / 2;
      this.longBackground.y = 0;
      this.scrollContainer.addChild(this.longBackground);
      this.layeredSprites.push(this.longBackground);

      // Calculate scroll limits
      const bgHeight = this.longBackground.height;
      this.minY = Math.min(0, this.canvasHeight - bgHeight);
      this.maxY = 0;
      
      // Start at the TOP of the map
      this.scrollContainer.y = this.maxY;
      
      console.log('[TokenShopScene] Background height:', bgHeight, 'Canvas height:', this.canvasHeight);
      console.log('[TokenShopScene] Scroll limits - min:', this.minY, 'max:', this.maxY);
    }

    // Add TOP BANNER (BANNER_NO_30)
    const topBannerTexture = Assets.get('BANNER_NO_30');
    if (topBannerTexture) {
      this.topBanner = new Sprite(topBannerTexture);
      this.topBanner.anchor.set(0.5, 0);
      this.topBanner.x = this.canvasWidth / 2;
      this.topBanner.y = 0;
      this.topBanner.scale.set(0.75);
      this.container.addChild(this.topBanner);
      this.layeredSprites.push(this.topBanner);
    }

    // Add BOTTOM_BANNER (same as PAGE 6)
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

    // Add character (already on screen, same position as DayTwoScene)
    const charTexture = Assets.get('PAGE6_CHAR');
    if (charTexture) {
      this.charSprite = new Sprite(charTexture);
      this.charSprite.anchor.set(0, 1);
      this.charSprite.x = 0;
      this.charSprite.y = this.canvasHeight - 63;
      this.charSprite.scale.set(1.3);
      this.container.addChild(this.charSprite);
      this.layeredSprites.push(this.charSprite);
    }

    // Add coin_collect at top right (hidden initially)
    const coinTexture = Assets.get('COIN_COLLECT');
    if (coinTexture) {
      this.coinCollect = new Sprite(coinTexture);
      this.coinCollect.anchor.set(0.5);
      this.coinCollect.x = this.canvasWidth - 120; // More to the left
      this.coinCollect.y = 150;
      this.coinCollect.scale.set(1.7); // Bigger (was 1.5)
      this.coinCollect.alpha = 0; // Start hidden
      this.container.addChild(this.coinCollect);
      this.layeredSprites.push(this.coinCollect);
    }

    // Show shop items
    await this.showShopItems();

    this.ready = true;
    console.log('[TokenShopScene] Marked as ready');
  }

  async showShopItems() {
    await this.wait(500); // Small delay after character

    // Show shop_1 and shop_2 at the same time
    const shop1Texture = Assets.get('PAGE7_SHOP_1');
    const shop2Texture = Assets.get('PAGE7_SHOP_2');
    
    if (shop1Texture) {
      this.shop1 = new Sprite(shop1Texture);
      this.shop1.anchor.set(0.5);
      this.shop1.x = this.canvasWidth / 2; // Centered
      this.shop1.y = this.canvasHeight / 2 - 150; // Above shop_2
      this.shop1.scale.set(1.0);
      this.shop1.alpha = 0; // Start invisible
      this.shop1.eventMode = 'static';
      this.shop1.cursor = 'pointer';
      
      // Add click handler for shop_1 BEFORE adding to container
      this.shop1.on('pointerdown', async () => {
        console.log('[TokenShopScene] Shop 1 clicked! Starting coin pulse animation');
        
        // Disable further clicks
        this.shop1.eventMode = 'none';
        
        // Show and pulse the coin
        if (this.coinCollect) {
          this.coinCollect.alpha = 1; // Make visible
          await this.pulseCoin();
        }
        
        // Change banner to no_0
        await this.changeBannerToNo0();
        
        // Pause on this screen for 1.5 seconds
        await this.wait(1500);
        
        // Fade out everything except banners
        await this.fadeOutExceptBanners();
        
        // Navigate to SuperSpinsScene
        console.log('[TokenShopScene] Navigating to SuperSpinsScene');
        const sceneManager = window.sceneManager;
        if (sceneManager) {
          const superSpinsScene = sceneManager.scenes.get('SuperSpinsScene');
          if (superSpinsScene) {
            await sceneManager.change(superSpinsScene, 'none');
          }
        }
      });
      
      // Create pulsing glow for shop_1 first (behind shop_1)
      this.shop1Glow = new Graphics();
      this.container.addChild(this.shop1Glow);
      
      // Add shop_1 after glow so it's on top and clickable
      this.container.addChild(this.shop1);
      this.layeredSprites.push(this.shop1);
    }

    if (shop2Texture) {
      this.shop2 = new Sprite(shop2Texture);
      this.shop2.anchor.set(0.5);
      this.shop2.x = this.canvasWidth / 2; // Centered
      this.shop2.y = this.canvasHeight / 2 + 50; // Below shop_1
      this.shop2.scale.set(1.0);
      this.shop2.alpha = 0; // Start invisible
      this.container.addChild(this.shop2);
      this.layeredSprites.push(this.shop2);
    }
    
    // Fade in both at the same time
    if (this.shop1 && this.shop2) {
      await Promise.all([
        this.fadeIn(this.shop1, 800),
        this.fadeIn(this.shop2, 800)
      ]);
    } else if (this.shop1) {
      await this.fadeIn(this.shop1, 800);
    } else if (this.shop2) {
      await this.fadeIn(this.shop2, 800);
    }
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
          resolve();
        }
      };
      animate();
    });
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  pulseCoin() {
    return new Promise((resolve) => {
      if (!this.coinCollect) {
        console.log('[TokenShopScene] pulseCoin called but coin not found!');
        resolve();
        return;
      }

      console.log('[TokenShopScene] Pulsing coin at position:', this.coinCollect.x, this.coinCollect.y);
      
      const originalScale = 1.7;
      const pulseScale = 2.2;
      const pulseDuration = 300;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(1, elapsed / pulseDuration);
        
        let scale;
        if (progress < 0.5) {
          const growProgress = progress * 2;
          scale = originalScale + (pulseScale - originalScale) * growProgress;
        } else {
          const shrinkProgress = (progress - 0.5) * 2;
          scale = pulseScale - (pulseScale - originalScale) * shrinkProgress;
        }
        
        this.coinCollect.scale.set(scale);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          this.coinCollect.scale.set(originalScale);
          console.log('[TokenShopScene] Pulse complete');
          resolve();
        }
      };
      
      requestAnimationFrame(animate);
    });
  }

  async changeBannerToNo0() {
    console.log('[TokenShopScene] Changing banner to no_0');
    if (!this.topBanner) return;
    
    const newBannerTexture = Assets.get('BANNER_NO_0');
    if (newBannerTexture) {
      this.topBanner.texture = newBannerTexture;
      console.log('[TokenShopScene] Banner changed to no_0');
    }
  }

  async fadeOutExceptBanners() {
    const duration = 800;
    const startTime = performance.now();
    
    // Get references to banners to exclude
    const bannersToKeep = [this.topBanner];
    
    return new Promise(resolve => {
      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Fade out all sprites except banners
        for (const sprite of this.layeredSprites) {
          if (!bannersToKeep.includes(sprite)) {
            sprite.alpha = 1 - progress;
          }
        }
        
        // Fade out shop items
        if (this.shop1) this.shop1.alpha = 1 - progress;
        if (this.shop2) this.shop2.alpha = 1 - progress;
        if (this.charSprite) this.charSprite.alpha = 1 - progress;
        if (this.coinCollect) this.coinCollect.alpha = 1 - progress;
        
        // Fade out glow
        if (this.shop1Glow) {
          this.shop1Glow.alpha = 1 - progress;
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      animate();
    });
  }

  update(delta) {
    // Animate square pulsing glow behind shop_1 with rounded corners
    if (this.shop1Glow && this.shop1) {
      this.animationFrame++;
      // Clear previous drawing
      this.shop1Glow.clear();
      // Create pulsing effect with oscillating size
      const basePadding = 20;
      const pulse = Math.sin(this.animationFrame * 0.03) * 10; // Pulsing effect
      const padding = basePadding + pulse;
      const borderRadius = 20; // Rounded corners
      
      // Get shop_1 bounds
      const centerX = this.shop1.x;
      const centerY = this.shop1.y;
      const width = this.shop1.width;
      const height = this.shop1.height;
      
      // Draw rounded square glows around shop_1
      // Outer glow (most transparent)
      const outerPadding = padding * 1.5;
      this.shop1Glow.roundRect(
        centerX - width/2 - outerPadding,
        centerY - height/2 - outerPadding,
        width + outerPadding * 2,
        height + outerPadding * 2,
        borderRadius
      );
      this.shop1Glow.fill({ color: 0xFFFFFF, alpha: 0.15 });
      
      // Middle glow
      this.shop1Glow.roundRect(
        centerX - width/2 - padding,
        centerY - height/2 - padding,
        width + padding * 2,
        height + padding * 2,
        borderRadius
      );
      this.shop1Glow.fill({ color: 0xFFFFFF, alpha: 0.25 });
      
      // Inner glow (brightest)
      const innerPadding = padding * 0.5;
      this.shop1Glow.roundRect(
        centerX - width/2 - innerPadding,
        centerY - height/2 - innerPadding,
        width + innerPadding * 2,
        height + innerPadding * 2,
        borderRadius
      );
      this.shop1Glow.fill({ color: 0xFFFFFF, alpha: 0.35 });
    }
  }

  isReady() {
    return this.ready;
  }

  destroy() {
    if (this.shop1Glow) {
      this.shop1Glow.destroy();
    }
    this.container.removeChildren();
    this.layeredSprites = [];
    this.scrollContainer = null;
    this.longBackground = null;
  }
}
