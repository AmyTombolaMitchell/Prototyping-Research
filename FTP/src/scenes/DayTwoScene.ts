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
      console.log('[DayTwoScene] Starting position (bottom):', this.scrollContainer.y);
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

    // Add AVATAR at last position from previous round (inside scrollContainer so it scrolls with background)
    const avatarTexture = Assets.get('PAGE3_AVATAR');
    if (avatarTexture && this.scrollContainer) {
      this.avatar = new Sprite(avatarTexture);
      this.avatar.anchor.set(0.5, 1);
      this.avatar.scale.set(0.75);
      const pos = this.pathPositions[this.currentPosition];
      this.avatar.x = pos.x;
      this.avatar.y = pos.y;
      this.scrollContainer.addChild(this.avatar);
      this.layeredSprites.push(this.avatar);
      console.log('[DayTwoScene] Avatar added at position', this.currentPosition, ':', this.avatar.x, this.avatar.y);
    }

    // Add drag interaction
    this.setupDragInteraction();

    // Wait a few seconds, then show the dice button
    await this.wait(3000);
    
    // Show roll dice button
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

    // Place dice to the right of roll button, smaller
    const diceTexture = Assets.get('PAGE3_DICE');
    let diceSprite: Sprite | null = null;
    if (diceTexture) {
      diceSprite = new Sprite(diceTexture);
      diceSprite.anchor.set(0.5);
      diceSprite.x = this.diceButton.x + 80; // To the right
      diceSprite.y = this.diceButton.y;
      diceSprite.scale.set(0.6); // Smaller dice
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

    const dice = new Sprite(diceTexture);
    dice.anchor.set(0.5);
    dice.x = this.canvasWidth / 2;
    dice.y = this.canvasHeight / 2;
    dice.scale.set(1.5);
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
      await this.jumpToPosition(i);
      await this.wait(200);
    }
    
    // After avatar reaches end of path, transition to Token Shop scene
    console.log('[DayTwoScene] Avatar reached end of path - transitioning to Token Shop');
    await this.wait(1000);
    await this.transitionToTokenShop();
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
    const duration = 400;
    const startTime = Date.now();

    return new Promise<void>((resolve) => {
      const animate = () => {
        if (!this.avatar) return;
        
        const elapsed = Date.now() - startTime;
        const progress = Math.min(1, elapsed / duration);
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
    // No update logic needed for this scene
  }

  destroy() {
    this.container.removeChildren();
    this.layeredSprites = [];
    this.scrollContainer = null;
    this.longBackground = null;
  }
}
