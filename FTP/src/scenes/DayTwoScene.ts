import { Container, Sprite, Assets, Graphics, Text } from 'pixi.js';

export class DayTwoScene {
  container = new Container();
  ready = false;
  isTransitioning = false;
  private layeredSprites: Sprite[] = [];
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
    { x: 240, y: 600 },   // Starting position (higher and more left)
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
      // Add coordinate debug overlay (top left)
      this.coordText = new Text('', {
        fontFamily: 'Arial',
        fontSize: 18,
        fontWeight: 'bold',
        fill: 0xFFDD00,
        align: 'left',
        stroke: 0x000000
      });
      this.coordText.x = 10;
      this.coordText.y = 10;
      this.coordText.anchor.set(0, 0);
      this.container.addChild(this.coordText);
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

      // Center scroll on avatar starting position
      const avatarStartY = 664;
      const targetScreenY = this.canvasHeight / 2;
      let scrollOffset = avatarStartY - targetScreenY;
      let newScrollY = -scrollOffset;
      newScrollY = Math.max(this.minY, Math.min(this.maxY, newScrollY));
      this.scrollContainer.y = newScrollY;

      console.log('[DayTwoScene] Background height:', bgHeight, 'Canvas height:', this.canvasHeight);
      console.log('[DayTwoScene] Scroll limits - min:', this.minY, 'max:', this.maxY);
      console.log('[DayTwoScene] Starting position (centered on avatar):', this.scrollContainer.y);
    }

    // Add TOP BANNER (same as previous page - BANNER_NO_25)
    const topBannerTexture = Assets.get('BANNER_NO_25');
    if (topBannerTexture) {
  const topBanner = new Sprite(topBannerTexture);
  topBanner.anchor.set(0.5, 0);
  topBanner.x = this.canvasWidth / 2;
  topBanner.y = 0;
  topBanner.scale.set(0.75);
  console.log('[DayTwoScene] Banner created:', topBanner.texture, 'scale:', topBanner.scale.x);
  this.container.addChild(topBanner);
  this.layeredSprites.push(topBanner);
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

    // Add AVATAR at fixed starting position (inside scrollContainer so it scrolls with background)
    const avatarTexture = Assets.get('PAGE3_AVATAR');
    if (avatarTexture && this.scrollContainer) {
      this.avatar = new Sprite(avatarTexture);
      this.avatar.anchor.set(0.5, 1);
      this.avatar.scale.set(0.75);
      // Always start at { x: 240, y: 600 }
      this.avatar.x = 240;
      this.avatar.y = 600;
      this.scrollContainer.addChild(this.avatar);
      this.layeredSprites.push(this.avatar);
      console.log('[DayTwoScene] Avatar created and positioned:', {
        currentPosition: this.currentPosition,
        x: this.avatar.x,
        y: this.avatar.y,
        pathPositions: this.pathPositions
      });
    }

    // Add drag interaction
    this.setupDragInteraction();

    // Show roll dice button immediately
    await this.showDiceButton();

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

    // Place dice further to the right of roll button, smaller
    const diceTexture = Assets.get('PAGE3_DICE');
    let diceSprite: Sprite | null = null;
    if (diceTexture) {
      diceSprite = new Sprite(diceTexture);
      diceSprite.anchor.set(0.5);
      diceSprite.x = this.diceButton.x + 110; // Further right
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
  console.log('[DayTwoScene] Animating dice roll');
    const diceTexture = Assets.get('PAGE3_DICE');
    if (!diceTexture) return;

    // Animate dice roll to the right of the button, smaller
    const dice = new Sprite(diceTexture);
    dice.anchor.set(0.5);
    // Use same position as static dice
    if (this.diceButton) {
      dice.x = this.diceButton.x + 110;
      dice.y = this.diceButton.y;
    } else {
      dice.x = this.canvasWidth / 2 + 110;
      dice.y = this.canvasHeight - 200;
    }
    dice.scale.set(0.5);
    this.container.addChild(dice);

    const spinDuration = 1500;
    const startTime = Date.now();

    await new Promise<void>((resolve) => {
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / spinDuration;

        dice.rotation = progress * Math.PI * 8;
        dice.scale.set(1.5 + Math.sin(progress * Math.PI * 4) * 0.3);

        if (elapsed < spinDuration) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      animate();
    });

    await new Promise<void>((resolve) => {
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

  private async moveAvatarAlongPath() {
  console.log('[DayTwoScene] Moving avatar along path');
    if (!this.avatar) return;

    for (let i = 1; i < this.pathPositions.length; i++) {
      console.log(`[DayTwoScene] Moving avatar to position ${i}:`, this.pathPositions[i]);
      await this.jumpToPosition(i);
      console.log(`[DayTwoScene] Avatar now at: x=${this.avatar?.x}, y=${this.avatar?.y}`);
      await this.wait(200);
    }

    // After avatar reaches end of path, show char asset and chat sequence, then token shop icon
    if (this.avatar && this.scrollContainer) {
      // Show char asset at avatar position
      const charTexture = Assets.get('PAGE3_CHAR');
      if (charTexture) {
        const charSprite = new Sprite(charTexture);
        charSprite.anchor.set(0.5, 1);
        charSprite.scale.set(0.75);
        charSprite.x = this.avatar.x;
        charSprite.y = this.avatar.y;
        this.scrollContainer.addChild(charSprite);
        // Animate chat sequence
        const chatKeys = ['PAGE6_CHAT_1', 'PAGE6_CHAT_2', 'PAGE6_CHAT_3'];
        const chatSprites: Sprite[] = [];
        for (let i = 0; i < chatKeys.length; i++) {
          const chatTexture = Assets.get(chatKeys[i]);
          if (chatTexture) {
            const chatSprite = new Sprite(chatTexture);
            chatSprite.anchor.set(0, 1);
            chatSprite.x = charSprite.x + 60;
            chatSprite.y = charSprite.y - 40 - i * 40;
            chatSprite.alpha = 0;
            this.scrollContainer.addChild(chatSprite);
            chatSprites.push(chatSprite);
          }
        }
        // Animate chat bubbles appearing and moving up
        for (let i = 0; i < chatSprites.length; i++) {
          await this.fadeIn(chatSprites[i], 400);
          // Move previous chats up and fade
          for (let j = 0; j < i; j++) {
            chatSprites[j].y -= 40;
            chatSprites[j].alpha = 0.5;
          }
          await this.wait(400);
        }
      }
      // After chat, show token shop icon with pulse at top right
      const tokenShopTexture = Assets.get('PAGE3_TOKEN_SHOP_ICON');
      if (tokenShopTexture) {
        const icon = new Sprite(tokenShopTexture);
        icon.anchor.set(1, 0);
        icon.x = this.canvasWidth - 20;
        icon.y = 20;
        icon.scale.set(0.7);
        this.container.addChild(icon);
        // Pulse animation (white circle behind icon)
        const pulse = new Graphics();
        pulse.circle(0, 0, 38);
        pulse.fill(0xFFFFFF, 0.3);
        pulse.x = icon.x;
        pulse.y = icon.y + 20;
        this.container.addChild(pulse);
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
      }
      // Wait before transitioning to token shop
      await this.wait(1200);
      await this.transitionToTokenShop();
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

        // Center scroll on avatar, always smoothly follow
        if (this.scrollContainer) {
          const avatarScreenY = this.avatar.y + this.scrollContainer.y;
          const targetScreenY = this.canvasHeight / 2;
          const scrollOffset = avatarScreenY - targetScreenY;

          // Use a higher smoothing factor for less jumpiness
          let newScrollY = this.scrollContainer.y - scrollOffset * 0.2;
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