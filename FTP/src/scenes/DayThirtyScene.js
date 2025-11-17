import { Container, Sprite, Assets, Graphics } from 'pixi.js';

export class DayThirtyScene {
  constructor() {
    this.container = new Container();
    this.layeredSprites = [];
    this.ready = false;
    this.canvasWidth = 572;
    this.canvasHeight = 1247;
    this.background = null;
    this.topBanner = null;
    this.bottomBanner = null;
    this.diceButton = null;
    this.pulsingGlow = null;
    this.diceRolling = false;
    this.avatar = null;
    this.animationFrame = 0;
    this.pathPositions = [
      { x: 299, y: 1025 },
      { x: 318, y: 859 },
      { x: 210, y: 723 },
      { x: 132, y: 604 },
      { x: 165, y: 466 },
      { x: 265, y: 369 }
    ];
    this.currentPathIndex = 0;
    this.sideCharacter = null;
    this.chatBubbles = [];
  }

  async init() {
    console.log('[DayThirtyScene] Initialising Day 30 scene...');

    this.container.removeChildren();
    this.layeredSprites = [];

    const bgTexture = Assets.get('PAGE11_LK_BACKGROUND');
    if (bgTexture) {
      this.background = new Sprite(bgTexture);
      this.background.anchor.set(0.5, 0);
      this.background.x = this.canvasWidth / 2;
  this.background.y = 140;
      const scale = this.canvasWidth / this.background.width;
      this.background.scale.set(scale);
      this.container.addChild(this.background);
      this.layeredSprites.push(this.background);
    } else {
      console.error('[DayThirtyScene] PAGE11_LK_BACKGROUND not found');
    }

    const topBannerTexture = Assets.get('BANNER_NO_STREAK') || Assets.get('BANNER_NO_0');
    if (topBannerTexture) {
      this.topBanner = new Sprite(topBannerTexture);
      this.topBanner.anchor.set(0.5, 0);
      this.topBanner.x = this.canvasWidth / 2;
      this.topBanner.y = 0;
      this.topBanner.scale.set(0.75); // Fixed scale to match other scenes
      this.container.addChild(this.topBanner);
      this.layeredSprites.push(this.topBanner);
    }

    const bottomBannerTexture = Assets.get('PAGE6_BOTTOM_BANNER');
    if (bottomBannerTexture) {
      this.bottomBanner = new Sprite(bottomBannerTexture);
      this.bottomBanner.anchor.set(0.5, 1);
      this.bottomBanner.x = this.canvasWidth / 2;
      this.bottomBanner.y = this.canvasHeight - 80;
      this.bottomBanner.scale.set(1.0);
      this.container.addChild(this.bottomBanner);
      this.layeredSprites.push(this.bottomBanner);
    }


    await this.runIntroSequence();
    await this.showDiceButton();

    this.ready = true;
  }

  async runIntroSequence() {
    await this.showSideCharacter();
    await this.wait(800);

    const firstChat = await this.showChatBubble('PAGE11_LK_CHAT_1');
    await this.wait(1200);
    await this.bumpChatBubble(firstChat);
    const secondChat = await this.showChatBubble('PAGE11_LK_CHAT_2');
    this.chatBubbles = [firstChat, secondChat];
  }

  async showSideCharacter() {
    const charTexture = Assets.get('PAGE11_LK_CHAR');
    if (!charTexture) {
      console.warn('[DayThirtyScene] PAGE11_LK_CHAR texture missing');
      return;
    }

    if (this.sideCharacter) {
      return;
    }

    this.sideCharacter = new Sprite(charTexture);
    this.sideCharacter.anchor.set(0, 1);
    this.sideCharacter.x = 0;
    this.sideCharacter.y = this.canvasHeight - 145;
    this.sideCharacter.alpha = 0;
    this.sideCharacter.scale.set(1.0);
    this.container.addChild(this.sideCharacter);

    await this.fadeIn(this.sideCharacter, 450);
  }

  async showChatBubble(assetKey) {
    const texture = Assets.get(assetKey);
    if (!texture) {
      console.warn('[DayThirtyScene] Missing chat texture for', assetKey);
      return null;
    }

    const bubble = new Sprite(texture);
    bubble.anchor.set(0.5);
    bubble.x = this.canvasWidth / 2 + 40;
    bubble.y = this.canvasHeight - 680;
    bubble.alpha = 0;
    bubble.scale.set(0);
    this.container.addChild(bubble);

    // Chat bubbles now bigger
    const targetScale = assetKey.includes('lk_chat') ? 0.6 : 1.2;
    await this.popIn(bubble, targetScale);
    return bubble;
  }

  async bumpChatBubble(bubble) {
    if (!bubble) {
      return;
    }

    const duration = 250;
    const startTime = performance.now();
    const startY = bubble.y;
    const targetY = startY - 140;

    return new Promise(resolve => {
      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(1, elapsed / duration);

        bubble.y = startY + (targetY - startY) * progress;
        bubble.alpha = 1 - progress * 0.5;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          bubble.y = targetY;
          bubble.alpha = 0.5;
          resolve();
        }
      };
      requestAnimationFrame(animate);
    });
  }

  async popIn(sprite, targetScale = 1) {
    const duration = 220;
    const startTime = performance.now();

    return new Promise(resolve => {
      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(1, elapsed / duration);

        const eased = 1 - Math.pow(1 - progress, 3);
        sprite.alpha = Math.min(1, eased * 1.2);
        sprite.scale.set(targetScale * Math.min(1, eased * 1.4));

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

  async fadeIn(sprite, duration = 400) {
    const startTime = performance.now();

    return new Promise(resolve => {
      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(1, elapsed / duration);
        sprite.alpha = progress;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          sprite.alpha = 1;
          resolve();
        }
      };
      requestAnimationFrame(animate);
    });
  }
  
  async fadeOut(sprite, duration = 400) {
    const startTime = performance.now();

    return new Promise(resolve => {
      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(1, elapsed / duration);
        sprite.alpha = 1 - progress;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          sprite.alpha = 0;
          resolve();
        }
      };
      requestAnimationFrame(animate);
    });
  }

  enablePointerCoordinateTracking() {
    // Coordinate tracking removed
  }

  async showDiceButton() {
    const diceTexture = Assets.get('INTRO2_2');
    if (!diceTexture) {
      console.error('[DayThirtyScene] INTRO2_2 texture missing');
      return;
    }

    this.pulsingGlow = new Graphics();
    this.container.addChild(this.pulsingGlow);

    this.diceButton = new Sprite(diceTexture);
    this.diceButton.anchor.set(0.5);
    this.diceButton.x = this.canvasWidth / 2;
  this.diceButton.y = this.canvasHeight - 240;
    this.diceButton.scale.set(0.8);
    this.diceButton.eventMode = 'static';
    this.diceButton.cursor = 'pointer';
    this.container.addChild(this.diceButton);

    this.diceButton.on('pointerdown', async () => {
      if (this.diceRolling) {
        return;
      }
      this.diceRolling = true;

      if (this.diceButton) {
        this.container.removeChild(this.diceButton);
        this.diceButton.destroy();
        this.diceButton = null;
      }
      if (this.pulsingGlow) {
        this.container.removeChild(this.pulsingGlow);
        this.pulsingGlow.destroy();
        this.pulsingGlow = null;
      }

      // Hide character and chat bubbles
      if (this.sideCharacter) {
        await this.fadeOut(this.sideCharacter, 300);
        this.container.removeChild(this.sideCharacter);
        this.sideCharacter.destroy();
        this.sideCharacter = null;
      }
      
      for (const bubble of this.chatBubbles) {
        if (bubble) {
          await this.fadeOut(bubble, 300);
          this.container.removeChild(bubble);
          bubble.destroy();
        }
      }
      this.chatBubbles = [];

      await this.animateDiceRoll();
      await this.showAvatar();
      await this.moveAvatarAlongPath();
    });
  }

  async animateDiceRoll() {
    const diceTexture = Assets.get('PAGE3_DICE');
    if (!diceTexture) {
      console.error('[DayThirtyScene] PAGE3_DICE missing');
      return;
    }

    const dice = new Sprite(diceTexture);
    dice.anchor.set(0.5);
    dice.x = this.canvasWidth - 150;
    dice.y = this.canvasHeight - 250;
    dice.scale.set(0.7);
    this.container.addChild(dice);

    const spinDuration = 1500;
    const startTime = Date.now();
    
    await new Promise((resolve) => {
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / spinDuration;
        
        dice.rotation = progress * Math.PI * 8;
        dice.scale.set(0.7 + Math.sin(progress * Math.PI * 4) * 0.13);
        
        if (elapsed < spinDuration) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      animate();
    });

    await new Promise((resolve) => {
      const fadeStart = Date.now();
      const fadeDuration = 300;
      const animate = () => {
        const elapsed = Date.now() - fadeStart;
        const progress = Math.min(1, elapsed / fadeDuration);
        dice.alpha = 1 - progress;
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          this.container.removeChild(dice);
          resolve();
        }
      };
      animate();
    });
  }

  async showAvatar() {
    if (this.avatar) {
      return;
    }

    const avatarTexture = Assets.get('PAGE3_AVATAR');
    if (!avatarTexture) {
      console.error('[DayThirtyScene] PAGE3_AVATAR missing');
      return;
    }

    this.avatar = new Sprite(avatarTexture);
    this.avatar.anchor.set(0.5, 1);
    this.avatar.scale.set(0.75);
    const startPos = this.pathPositions[0];
    this.avatar.x = startPos.x;
    this.avatar.y = startPos.y;
    this.currentPathIndex = 0;
    this.container.addChild(this.avatar);

    console.log('[DayThirtyScene] Avatar placed at start of Day 30 path');
  }

  async moveAvatarAlongPath() {
    if (!this.avatar) {
      return;
    }

    for (let i = 1; i < this.pathPositions.length; i++) {
      const target = this.pathPositions[i];
      await this.animateAvatarTo(target.x, target.y);
      this.currentPathIndex = i;
      await this.wait(300);
    }
    
    // After avatar finishes moving, show character and PAGE 5 assets
    await this.showEndSequence();
  }

  async animateAvatarTo(targetX, targetY) {
    if (!this.avatar) {
      return;
    }

    const duration = 400;
    const startTime = performance.now();
    const startX = this.avatar.x;
    const startY = this.avatar.y;

    return new Promise(resolve => {
      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const easeProgress = 1 - Math.pow(1 - progress, 3);

        this.avatar.x = startX + (targetX - startX) * easeProgress;
        this.avatar.y = startY + (targetY - startY) * easeProgress;

        const jumpHeight = 40;
        const arc = Math.sin(progress * Math.PI) * jumpHeight;
        this.avatar.y -= arc;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          this.avatar.x = targetX;
          this.avatar.y = targetY;
          resolve();
        }
      };
      animate();
    });
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  async showEndSequence() {
    console.log('[DayThirtyScene] Starting end sequence with character and PAGE 5 assets');
    
    // Show character bottom left in same position as intro
    const charTexture = Assets.get('PAGE11_LK_CHAR');
    if (charTexture) {
      this.sideCharacter = new Sprite(charTexture);
      this.sideCharacter.anchor.set(0, 1);
      this.sideCharacter.x = 0;
      this.sideCharacter.y = this.canvasHeight - 145;
      this.sideCharacter.alpha = 0;
      this.sideCharacter.scale.set(1.0);
      this.container.addChild(this.sideCharacter);
      await this.fadeIn(this.sideCharacter, 450);
    }
    
    await this.wait(300);
    
    // Show PAGE 5 assets in sequence (smaller and moved up)
    const asset1 = await this.showPage5Asset('PAGE5_1', this.canvasWidth / 2, this.canvasHeight / 2 - 50, 0.6);
    await this.wait(600);
    await this.bumpPage5Asset(asset1, 150);
    
    const asset2 = await this.showPage5Asset('PAGE5_2', this.canvasWidth / 2, this.canvasHeight / 2 - 50, 0.6);
    await this.wait(600);
    await this.bumpPage5Asset(asset1, 150);
    await this.bumpPage5Asset(asset2, 150);
    
    const asset3 = await this.showPage5Asset('PAGE5_3', this.canvasWidth / 2, this.canvasHeight / 2 - 50, 0.6);
    await this.wait(600);
    
    // Show assets 4 and 5 together (smaller and higher)
    const promises = [];
    
    const asset5Texture = Assets.get('PAGE5_5');
    if (asset5Texture) {
      const asset5 = new Sprite(asset5Texture);
      asset5.anchor.set(1, 1);
      asset5.x = this.canvasWidth - 20;
      asset5.y = this.canvasHeight - 180;
      asset5.alpha = 0;
      asset5.scale.set(0);
      asset5.eventMode = 'static';
      asset5.cursor = 'pointer';
      asset5.on('pointerdown', () => this.handleContinueDayTwo());
      this.container.addChild(asset5);
      promises.push(this.popIn(asset5, 0.8));
    }
    
    const asset4Texture = Assets.get('PAGE5_4');
    if (asset4Texture) {
      const asset4 = new Sprite(asset4Texture);
      asset4.anchor.set(1, 1);
      asset4.x = this.canvasWidth - 40;
      asset4.y = this.canvasHeight - 360;
      asset4.alpha = 0;
      asset4.scale.set(0);
      asset4.eventMode = 'static';
      asset4.cursor = 'pointer';
      asset4.on('pointerdown', () => this.handleContinueDayTwo());
      this.container.addChild(asset4);
      promises.push(this.popIn(asset4, 0.5));
    }
    
    await Promise.all(promises);
    
    // Make banners clickable
    this.enableBannerClicks();
    
    console.log('[DayThirtyScene] End sequence complete - waiting for click');
  }
  
  enableBannerClicks() {
    if (this.topBanner) {
      this.topBanner.eventMode = 'static';
      this.topBanner.cursor = 'pointer';
      this.topBanner.on('pointerdown', () => this.handleContinue());
    }
    
    if (this.bottomBanner) {
      this.bottomBanner.eventMode = 'static';
      this.bottomBanner.cursor = 'pointer';
      this.bottomBanner.on('pointerdown', () => this.handleContinue());
    }
  }
  
  async showPage5Asset(assetKey, x, y, targetScale) {
    const texture = Assets.get(assetKey);
    if (!texture) return null;
    
    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5);
    sprite.x = x;
    sprite.y = y;
    sprite.alpha = 0;
    sprite.scale.set(0);
    this.container.addChild(sprite);
    
    await this.popIn(sprite, targetScale);
    return sprite;
  }
  
  async bumpPage5Asset(sprite, spacing) {
    if (!sprite) return;
    
    const duration = 250;
    const startTime = performance.now();
    const startY = sprite.y;
    const targetY = startY - spacing;
    
    return new Promise(resolve => {
      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(1, elapsed / duration);
        
        sprite.y = startY + (targetY - startY) * progress;
        sprite.alpha = 1 - progress * 0.5;
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          sprite.y = targetY;
          sprite.alpha = 0.5;
          resolve();
        }
      };
      requestAnimationFrame(animate);
    });
  }
  
  async handleContinue() {
    console.log('[DayThirtyScene] Player clicked to continue - transitioning to Thank You');
    const sceneManager = window.sceneManager;
    if (sceneManager) {
      const { ThankYouScene } = await import('./ThankYouScene.js');
      await sceneManager.change(new ThankYouScene(), 'none');
    }

  }

  async handleContinueDayTwo() {
    console.log('[DayThirtyScene] Player clicked to continue - transitioning to Day Two');
    const sceneManager = window.sceneManager;
    if (sceneManager) {
      const { DayTwoScene } = await import('./DayTwoScene.js');
      await sceneManager.change(new DayTwoScene(), 'none');
    }
  }

  update(delta) {
    if (this.pulsingGlow && this.diceButton) {
      this.animationFrame += 1;
      this.pulsingGlow.clear();

      const baseRadius = 70;
      const pulse = Math.sin(this.animationFrame * 0.05) * 15;
      const radius = baseRadius + pulse;

      const centerX = this.diceButton.x;
      const centerY = this.diceButton.y;

      this.pulsingGlow.circle(centerX, centerY, radius * 1.2);
      this.pulsingGlow.fill({ color: 0xFF0000, alpha: 0.2 });

      this.pulsingGlow.circle(centerX, centerY, radius * 0.8);
      this.pulsingGlow.fill({ color: 0xFF0000, alpha: 0.3 });

      this.pulsingGlow.circle(centerX, centerY, radius * 0.5);
      this.pulsingGlow.fill({ color: 0xFF0000, alpha: 0.4 });
    }
  }

  isReady() {
    return this.ready;
  }

  destroy() {
    this.container.destroy({ children: true });
    this.diceButton = null;
    this.pulsingGlow = null;
    this.avatar = null;
    this.sideCharacter = null;
    this.chatBubbles = [];
  }
}
