import { Container, Sprite, Assets, Graphics, Text } from 'pixi.js';
import { DiceRollScene } from './DiceRollScene';

export class DayTwoScene {
  container = new Container();
  ready = false;
  isTransitioning = false;
  private layeredSprites: Sprite[] = [];
  private topBanner: Sprite | null = null;
  private canvasWidth = 572;
  private canvasHeight = 1247;
  private scrollContainer: Container | null = null;
  private longBackground: Sprite | null = null;
  private isDragging = false;
  private lastY = 0;
  private velocity = 0;
  private minY = 0;
  private maxY = 0;
  private avatar: Sprite | null = null;
  private pathPositions = [
    { x: 315, y: 664 },   // Starting position (position 5 from previous scene)
    { x: 94, y: 2408 },   // Position 1
    { x: 278, y: 2310 },  // Position 2
    { x: 489, y: 2248 },  // Position 3
    { x: 408, y: 2114 },  // Position 4
    { x: 257, y: 2076 }   // Position 5
  ];
  private currentPosition = 0;

  constructor(lastPosition: number = 0) {
    this.currentPosition = lastPosition;
  }
  private diceButton: Sprite | null = null;
  private diceRolling = false;

  private coordText: Text | null = null;

  async init() {
      
  console.log('[DayTwoScene] Init: canvas', this.canvasWidth, this.canvasHeight);
    console.log('[DayTwoScene] Starting init');
    this.container.removeChildren();
    this.layeredSprites = [];

    // Show "DAY TWO" text on black screen first
    await this.showDayTwoText();

    // Create scrollable container for the long background
    this.scrollContainer = new Container();
    this.container.addChild(this.scrollContainer);

    // Add LONG_BACKGROUND
    const bgTexture = Assets.get('PAGE6_LONG_BACKGROUND');
    if (bgTexture) {
      this.longBackground = new Sprite(bgTexture);
      this.longBackground.anchor.set(0.5, 0);
      this.longBackground.x = this.canvasWidth / 2;
      this.longBackground.y = 0;

      // Scale to fit canvas width
      const scale = this.canvasWidth / this.longBackground.width;
      this.longBackground.scale.set(scale);

      this.scrollContainer.addChild(this.longBackground);
      this.layeredSprites.push(this.longBackground);

    // Calculate scroll limits
    const bgHeight = this.longBackground.height * scale;
    this.minY = Math.min(0, this.canvasHeight - bgHeight);
    this.maxY = 0;

      // Start at the bottom of the map
      this.scrollContainer.y = this.minY;

      console.log('[DayTwoScene] Background height:', bgHeight, 'Canvas height:', this.canvasHeight);
      console.log('[DayTwoScene] Scroll limits - min:', this.minY, 'max:', this.maxY);
      console.log('[DayTwoScene] Starting position (centered on avatar):', this.scrollContainer.y);
      console.log('[DayTwoScene] Starting position (bottom):', this.scrollContainer.y);
  // (removed misplaced closing brace)

    // Add TOP BANNER (same as previous page - BANNER_NO_25)
    // Add TOP BANNER (will be updated as avatar moves)
    const topBannerTexture = Assets.get('BANNER_NO_25');
    if (topBannerTexture) {
      this.topBanner = new Sprite(topBannerTexture);
      this.topBanner.anchor.set(0.5, 0);
      this.topBanner.x = this.canvasWidth / 2;
      this.topBanner.y = 0;
      this.topBanner.scale.set(0.75);
      this.container.addChild(this.topBanner);
      this.layeredSprites.push(this.topBanner);
    }

    // Add BOTTOM_BANNER at the bottom
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

    // Add AVATAR at the bottom of the long background (inside scrollContainer)
    const avatarTexture = Assets.get('PAGE3_AVATAR');
    if (avatarTexture && this.scrollContainer && this.longBackground) {
      this.avatar = new Sprite(avatarTexture);
      this.avatar.anchor.set(0.5, 1);
      this.avatar.scale.set(0.75);
  // Place avatar higher above the bottom center of the long background
  const bgHeight = this.longBackground.height * this.longBackground.scale.y;
  this.avatar.x = this.canvasWidth / 2 + 30; // Move avatar right by 30 pixels
  this.avatar.y = bgHeight - 650 + 50; // Move avatar down by 50 pixels
      this.scrollContainer.addChild(this.avatar);
      this.layeredSprites.push(this.avatar);
      console.log('[DayTwoScene] Avatar created and positioned at bottom:', {
        x: this.avatar.x,
        y: this.avatar.y
      });
    }

    // Add drag interaction
    this.setupDragInteraction();

    // Show roll dice button immediately
    await this.showDiceButton();

    // Ensure scroll is locked so the bottom of the long background is visible
    if (this.scrollContainer && this.longBackground) {
      this.scrollContainer.y = this.minY;
    }
    }
    this.ready = true;
    console.log('[DayTwoScene] Marked as ready');
  }

  private async showDiceButton() {
  console.log('[DayTwoScene] Showing roll dice button');
    // Use asset 2 from PAGE 2 for roll button
    const rollButtonTexture = Assets.get('INTRO2_2');
    if (!rollButtonTexture) return;

    this.diceButton = new Sprite(rollButtonTexture);
    this.diceButton.anchor.set(0.5);
    this.diceButton.x = this.canvasWidth / 2;
    this.diceButton.y = this.canvasHeight - 200;
    this.diceButton.scale.set(0.8); // Slightly smaller
    this.diceButton.eventMode = 'static';
    this.diceButton.cursor = 'pointer';
    this.container.addChild(this.diceButton);

    // Place dice even further to the right of roll button, smaller
    const diceTexture = Assets.get('PAGE3_DICE');
    let diceSprite: Sprite | null = null;
    if (diceTexture) {
      diceSprite = new Sprite(diceTexture);
      diceSprite.anchor.set(0.5);
      diceSprite.x = this.diceButton.x + 150; // Move dice further right
      diceSprite.y = this.diceButton.y;
      diceSprite.scale.set(0.45); // Smaller dice
      this.container.addChild(diceSprite);
    }

    this.diceButton.on('pointerdown', async () => {
      if (this.diceRolling) return;
      this.diceRolling = true;

      if (this.diceButton) {
        this.container.removeChild(this.diceButton);
        this.diceButton = null;
      }
      if (diceSprite) {
        this.container.removeChild(diceSprite);
        diceSprite = null;
      }

      await this.animateDiceRoll();
      await this.moveAvatarAlongPath();

      this.diceRolling = false;
    });
  }

  private async animateDiceRoll() {
    // Reuse DiceRollScene's dice roll animation
    // Create a temporary DiceRollScene instance to use its animateDiceRoll method
    const diceRollScene = new DiceRollScene();
    diceRollScene.container = this.container;
    diceRollScene.canvasWidth = this.canvasWidth;
    diceRollScene.canvasHeight = this.canvasHeight;
    diceRollScene.layeredSprites = this.layeredSprites;
    await diceRollScene.animateDiceRoll();
  }

  private async moveAvatarAlongPath() {
  console.log('[DayTwoScene] Moving avatar along path');
    if (!this.avatar) return;

    // Hide dice when avatar starts moving and after movement
    if (this.diceButton) {
      this.container.removeChild(this.diceButton);
      this.diceButton = null;
    }
    // Banner keys for each move (change after landing)
    const bannerKeys = ['BANNER_NO_26', 'BANNER_NO_27', 'BANNER_NO_28', 'BANNER_NO_29', 'BANNER_NO_30'];
    for (let i = 1; i < this.pathPositions.length; i++) {
      await this.jumpToPosition(i);
      await this.wait(200);
      // Change banner after landing
      if (this.topBanner && bannerKeys[i-1]) {
        const newBannerTexture = Assets.get(bannerKeys[i-1]);
        if (newBannerTexture) this.topBanner.texture = newBannerTexture;
      }
      // Hide dice again in case it's still present
      if (this.diceButton) {
        this.container.removeChild(this.diceButton);
        this.diceButton = null;
      }
    }

    // After avatar reaches end of path, show character and coin assets, then chat sequence and token shop icon
    if (this.avatar && this.scrollContainer) {
      // Show character asset (same as TokenShopScene)
      const charTexture = Assets.get('PAGE6_CHAR');
      if (charTexture) {
        const charSprite = new Sprite(charTexture);
        charSprite.anchor.set(0, 1);
        charSprite.x = 20;
        charSprite.y = this.canvasHeight - 65;
        charSprite.scale.set(1.4);
        this.container.addChild(charSprite);
        this.layeredSprites.push(charSprite);
      }

      // Show coin_collect at top right (hidden initially)
      const coinTexture = Assets.get('COIN_COLLECT');
      if (coinTexture) {
        const coinCollect = new Sprite(coinTexture);
        coinCollect.anchor.set(0.5);
        coinCollect.x = this.canvasWidth - 120;
        coinCollect.y = 150;
        coinCollect.scale.set(1.7);
        coinCollect.alpha = 0;
        this.container.addChild(coinCollect);
        this.layeredSprites.push(coinCollect);
      }

      // Use MessageScene's showMessageSequence logic for chat animation
      const chatKeys = ['PAGE6_CHAT_1', 'PAGE6_CHAT_2', 'PAGE6_CHAT_3'];
      const chatSprites: Sprite[] = [];
      // Helper functions for chat animation
      const showMessage = async (assetKey: string, x: number, y: number, index: number) => {
        const texture = Assets.get(assetKey);
        if (texture) {
          const message = new Sprite(texture);
          message.anchor.set(0.5);
          message.x = x;
          message.y = y;
          message.alpha = 0;
          message.scale.set(0);
          this.container.addChild(message);
          chatSprites[index] = message;
          await popIn(message, 1.5);
        }
      };
      const popIn = async (sprite: Sprite, targetScale = 1) => {
        const duration = 250;
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
      };
      const bumpUpAndFade = async (index: number, spacing = 100) => {
        const message = chatSprites[index];
        if (!message) return;
        const duration = 250;
        const startTime = Date.now();
        const startY = message.y;
        const targetY = startY - spacing;
        return new Promise<void>((resolve) => {
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(1, elapsed / duration);
            message.y = startY + (targetY - startY) * progress;
            message.alpha = 1 - (progress * 0.5);
            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              resolve();
            }
          };
          requestAnimationFrame(animate);
        });
      };
      // Show chat_1
      await showMessage(chatKeys[0], this.canvasWidth / 2, this.canvasHeight / 2, 0);
      await this.wait(600);
      await bumpUpAndFade(0, 150);
      // Show chat_2
      await showMessage(chatKeys[1], this.canvasWidth / 2, this.canvasHeight / 2, 1);
      await this.wait(600);
      await bumpUpAndFade(0, 150);
      await bumpUpAndFade(1, 150);
      // Show chat_3
      await showMessage(chatKeys[2], this.canvasWidth / 2, this.canvasHeight / 2, 2);
      await this.wait(600);

      // Hide dice asset when chat_3 appears
      const diceTexture = Assets.get('PAGE3_DICE');
      if (diceTexture) {
        for (const sprite of this.layeredSprites) {
          if (sprite.texture === diceTexture) {
            this.container.removeChild(sprite);
          }
        }
      }

      // After chat_3, show token shop icon with pulse at top right, clickable and always visible
      const tokenShopTexture = Assets.get('PAGE6_TOKEN_SHOP');
      if (tokenShopTexture) {
        const icon = new Sprite(tokenShopTexture);
        icon.anchor.set(1, 0);
  // Center pulse and icon together
  const pulseX = this.canvasWidth - 60;
  const pulseY = 120 + 65 / 2; // Center pulse vertically
  const iconX = pulseX + 60; // Move token_shop even more right
  const iconY = 120;
  // Pulse animation (white circle behind icon)
  const pulse = new Graphics();
  pulse.zIndex = 999;
  pulse.circle(0, 0, 65);
  pulse.fill(0xFFFFFF, 0.3);
  pulse.x = pulseX;
  pulse.y = pulseY;
  this.container.addChild(pulse);
  icon.x = iconX;
  icon.y = iconY;
  icon.scale.set(1.3);
  icon.zIndex = 1000;
  icon.eventMode = 'static';
  icon.cursor = 'pointer';
  this.container.addChild(icon);
        let pulseScale = 1;
        let pulseGrowing = true;
        function animatePulse() {
          if (pulseGrowing) {
            pulseScale += 0.02;
            if (pulseScale > 1.3) pulseGrowing = false;
          } else {
            pulseScale -= 0.02;
            if (pulseScale < 1) pulseGrowing = true;
          }
          pulse.scale.set(pulseScale);
          requestAnimationFrame(animatePulse);
        }
        animatePulse();
        // Make icon clickable to navigate to token shop scene
        icon.on('pointerdown', async () => {
          const sceneManager = (window as any).sceneManager;
          if (sceneManager) {
            const { TokenShopScene } = await import('./TokenShopScene.js');
            await sceneManager.change(new TokenShopScene(), 'none');
          }
        });
      }
    // Hide dice after avatar finishes moving and when character appears
    if (this.diceButton) {
      this.container.removeChild(this.diceButton);
      this.diceButton = null;
    }
    }
  }

  private async transitionToTokenShop() {
    const sceneManager = (window as any).sceneManager;
    if (!sceneManager) {
      console.warn('[DayTwoScene] No scene manager available');
      return;
    }

    const { TokenShopTransition } = await import('./TokenShopTransition.js');
    await sceneManager.change(new TokenShopTransition(), 'none');
  }

  private async jumpToPosition(positionIndex: number) {
    if (!this.avatar || positionIndex >= this.pathPositions.length) return;

    const target = this.pathPositions[positionIndex];
    const startX = this.avatar.x;
    const startY = this.avatar.y;
    const duration = 500;
    const startTime = Date.now();

    return new Promise<void>((resolve) => {
      const animate = () => {
        if (!this.avatar) return;

        const elapsed = Date.now() - startTime;
        const progress = Math.min(1, elapsed / duration);
        // Smooth ease for both axes
        const easeProgress = 1 - Math.pow(1 - progress, 3);

        this.avatar.x = startX + (target.x - startX) * easeProgress;
        this.avatar.y = startY + (target.y - startY) * easeProgress;

        const jumpHeight = 60;

        const arc = Math.sin(progress * Math.PI) * jumpHeight;

        this.avatar.y -= arc;

        if (this.scrollContainer) {
          const avatarScreenY = this.avatar.y + this.scrollContainer.y;
          const targetScreenY = this.canvasHeight / 2;
          const scrollOffset = avatarScreenY - targetScreenY;

          // Use a higher smoothing factor for less jumpiness
          let newScrollY = this.scrollContainer.y - scrollOffset * 0.1;
          newScrollY = Math.max(this.minY, Math.min(this.maxY, newScrollY));
          this.scrollContainer.y = newScrollY;
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          if (this.avatar) {
            this.avatar.x = target.x;
            this.avatar.y = target.y;
          }
          this.currentPosition = positionIndex;
          resolve();
        }
      };
      requestAnimationFrame(animate);
    });
  }

  private async showDayTwoText() {
    // Create black overlay
    const blackScreen = new Graphics();
    blackScreen.rect(0, 0, this.canvasWidth, this.canvasHeight);
    blackScreen.fill(0x000000);
    this.container.addChild(blackScreen);

    // Create "DAY TWO" text
    const dayTwoText = new Text({
      text: 'DAY TWO',
      style: {
        fontFamily: 'Arial',
        fontSize: 72,
        fontWeight: 'bold',
        fill: 0xFFFFFF,
        align: 'center'
      }
    });
    dayTwoText.anchor.set(0.5);
    dayTwoText.x = this.canvasWidth / 2;
    dayTwoText.y = this.canvasHeight / 2;
    dayTwoText.alpha = 0;
    this.container.addChild(dayTwoText);

    // Fade in text
    await this.fadeIn(dayTwoText, 1000);

    // Wait 2 seconds
    await this.wait(2000);

    // Fade out text
    await this.fadeOut(dayTwoText, 1000);

    // Remove black screen and text
    this.container.removeChild(blackScreen);
    this.container.removeChild(dayTwoText);
  }

  private setupDragInteraction() {
    if (!this.scrollContainer) return;

    this.container.eventMode = 'static';
    this.container.cursor = 'grab';

    this.container.on('pointerdown', (event) => {
      this.isDragging = true;
      this.lastY = event.global.y;
      this.velocity = 0;
      this.container.cursor = 'grabbing';
    });

    this.container.on('pointermove', (event) => {
      if (!this.isDragging || !this.scrollContainer) return;

      const currentY = event.global.y;
      const deltaY = currentY - this.lastY;
      this.velocity = deltaY;

      // Update scroll position
      let newY = this.scrollContainer.y + deltaY;
      newY = Math.max(this.minY, Math.min(this.maxY, newY));
      this.scrollContainer.y = newY;

      this.lastY = currentY;
    });

    this.container.on('pointerup', () => {
      this.isDragging = false;
      this.container.cursor = 'grab';
    });

    this.container.on('pointerupoutside', () => {
      this.isDragging = false;
      this.container.cursor = 'grab';
    });

    // Add momentum scrolling
    const updateMomentum = () => {
      if (!this.isDragging && this.scrollContainer && Math.abs(this.velocity) > 0.1) {
        this.velocity *= 0.95; // Friction

        let newY = this.scrollContainer.y + this.velocity;
        newY = Math.max(this.minY, Math.min(this.maxY, newY));
        this.scrollContainer.y = newY;

        if (Math.abs(this.velocity) < 0.1) {
          this.velocity = 0;
        }
      }
      requestAnimationFrame(updateMomentum);
    };
    updateMomentum();
  }

  private async fadeIn(sprite: Sprite | Text, duration: number = 500) {
    const startTime = Date.now();
    return new Promise<void>((resolve) => {
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(1, elapsed / duration);
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

  private async fadeOut(sprite: Sprite | Text, duration: number = 500) {
    const startTime = Date.now();
    return new Promise<void>((resolve) => {
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(1, elapsed / duration);
        sprite.alpha = 1 - progress;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      animate();
    });
  }

  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  update(delta: number) {
    // Update coordinate overlay if avatar exists
    if (this.avatar && this.coordText) {
      // Avatar position relative to scrollContainer
      const screenX = this.avatar.x;
      const screenY = this.avatar.y + (this.scrollContainer ? this.scrollContainer.y : 0);
      this.coordText.text = `Avatar: x=${Math.round(screenX)}, y=${Math.round(screenY)}`;
    }
  }

  destroy() {
    this.container.removeChildren();
    this.layeredSprites = [];
    this.scrollContainer = null;
    this.longBackground = null;
  }
}