import { Container, Sprite, Graphics, Assets } from 'pixi.js';

export class DaySevenScene {
  constructor() {
    this.container = new Container();
    this.layeredSprites = [];
    this.ready = false;
    this.canvasWidth = 572;
    this.canvasHeight = 1247;
    this.scrollContainer = null;
    this.avatar = null;
    this.diceButton = null;
    this.pulsingGlow = null;
    this.diceRolling = false;
    this.currentPosition = 5; // Starting at position 5 (where we were before)
    this.isDragging = false;
    this.lastY = 0;
    this.velocity = 0;
    this.topBanner = null;
    this.topBannerTargetWidth = null;
    this.flameBaseScale = null;
  this.flameAnimationId = null;
    
    // Path positions for avatar movement - using Day Two positions
    this.pathPositions = [
      { x: 286, y: 2467 },  // Position 0
      { x: 130, y: 2372 },  // Position 1
      { x: 286, y: 2281 },  // Position 2
      { x: 442, y: 2186 },  // Position 3
      { x: 286, y: 2186 },  // Position 4
      { x: 262, y: 2070 },  // Position 5 (starting position)
      { x: 280, y: 1914 },  // Position 6
      { x: 476, y: 1840 },  // Position 7
      { x: 299, y: 1711 },  // Position 8
      { x: 159, y: 1654 },  // Position 9
      { x: 238, y: 1532 }   // Position 10
    ];
  }

  async init() {
    console.log('[DaySevenScene] Initializing Day Seven (Page 10)...');

    // Create scrollable container for the long background
    this.scrollContainer = new Container();
    this.container.addChild(this.scrollContainer);

    // Add LONG_BACKGROUND (same as Day Two)
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
      
      // Start at the BOTTOM of the map
      this.scrollContainer.y = this.minY;
      
      console.log('[DaySevenScene] Background height:', bgHeight, 'Canvas height:', this.canvasHeight);
      console.log('[DaySevenScene] Scroll limits - min:', this.minY, 'max:', this.maxY);
    }

    // Add TOP BANNER (BANNER_NO_0)
    const topBannerTexture = Assets.get('BANNER_NO_0');
    if (topBannerTexture) {
  this.topBanner = new Sprite(topBannerTexture);
  this.topBanner.anchor.set(0.5, 0);
  this.topBanner.x = this.canvasWidth / 2;
  this.topBanner.y = 0;
  this.topBanner.scale.set(0.75);
  console.log('[DaySevenScene] Banner created:', this.topBanner.texture, 'scale:', this.topBanner.scale.x);
  this.container.addChild(this.topBanner);
  this.layeredSprites.push(this.topBanner);

      // Remember desired display width so all future banners match this size
      this.topBannerTargetWidth = this.topBanner.width;
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

    // Add AVATAR at starting position (position 5)
    const avatarTexture = Assets.get('PAGE3_AVATAR');
    if (avatarTexture && this.scrollContainer) {
      this.avatar = new Sprite(avatarTexture);
      this.avatar.anchor.set(0.5, 1);
      this.avatar.scale.set(0.75);
      this.avatar.x = this.pathPositions[5].x;
      this.avatar.y = this.pathPositions[5].y;
      this.scrollContainer.addChild(this.avatar);
      this.layeredSprites.push(this.avatar);
      
      // Center camera on avatar at position 5
      this.centerCameraOnAvatar();
      
      console.log('[DaySevenScene] Avatar placed at position 5:', this.avatar.x, this.avatar.y);
    }

    // Setup drag scrolling
    this.setupDragInteraction();

    // Show dice button
    await this.showDiceButton();

    this.ready = true;
    console.log('[DaySevenScene] Ready - click dice to roll');
  }

  setupDragInteraction() {
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

  async showDiceButton() {
    // Create dice button using INTRO2_2 asset (same as Day Two)
    const diceTexture = Assets.get('INTRO2_2');
    if (!diceTexture) return;

    // Create pulsing red glow behind the button
    this.pulsingGlow = new Graphics();
    this.container.addChild(this.pulsingGlow);

    this.diceButton = new Sprite(diceTexture);
    this.diceButton.anchor.set(0.5);
    this.diceButton.x = this.canvasWidth / 2;
    this.diceButton.y = this.canvasHeight - 170; // Same as other pages
    this.diceButton.scale.set(0.8);
    this.diceButton.eventMode = 'static';
    this.diceButton.cursor = 'pointer';
    this.container.addChild(this.diceButton);

    console.log('[DaySevenScene] Dice button added at bottom');

    // Add click handler
    this.diceButton.on('pointerdown', async () => {
      if (this.diceRolling) return;
      this.diceRolling = true;
      
      console.log('[DaySevenScene] Dice clicked - starting roll');
      
      // Remove the button and glow
      if (this.diceButton) {
        this.container.removeChild(this.diceButton);
        this.diceButton = null;
      }
      if (this.pulsingGlow) {
        this.container.removeChild(this.pulsingGlow);
        this.pulsingGlow = null;
      }
      
      // Roll dice and move avatar
      await this.rollDiceAndMove();
    });
  }

  async rollDiceAndMove() {
    console.log('[DaySevenScene] Rolling dice...');
    
    // Animate dice roll (same as DayTwoScene)
    await this.animateDiceRoll();
    
    console.log('[DaySevenScene] Dice result: 5 - Moving avatar');
    
    // Move avatar 5 spaces
    await this.moveAvatar(5);
    
    console.log('[DaySevenScene] Avatar movement complete');
  }

  async animateDiceRoll() {
    const diceTexture = Assets.get('PAGE3_DICE');
    if (!diceTexture) {
      console.error('[DaySevenScene] PAGE3_DICE not found');
      return;
    }

    const dice = new Sprite(diceTexture);
    dice.anchor.set(0.5);
    dice.x = this.canvasWidth / 2 + 150;
    dice.y = this.canvasHeight - 260;
    dice.scale.set(0.6);
    this.container.addChild(dice);

    const rollDuration = 2000;
    const startTime = Date.now();

    return new Promise((resolve) => {
      const animate = () => {
        const elapsed = Date.now() - startTime;
        
        if (elapsed < rollDuration) {
          // Rotate the dice
          dice.rotation = (elapsed / 1000) * 3;
          
          // Bounce effect
          const bounceOffset = Math.abs(Math.sin((elapsed / 1000) * 4)) * 50;
          dice.y = (this.canvasHeight - 260) - bounceOffset;
          
          // Scale pulse
          dice.scale.set(0.6 + Math.sin((elapsed / 1000) * 3) * 0.15);
          
          requestAnimationFrame(animate);
        } else {
          // Settle the dice
          dice.rotation = 0;
          dice.scale.set(0.7);
          dice.y = this.canvasHeight - 260;
          
          // Remove after a delay
          setTimeout(() => {
            this.container.removeChild(dice);
            resolve();
          }, 500);
        }
      };
      animate();
    });
  }

  async showEndSequence() {
    console.log('[DaySevenScene] Starting end sequence');
    console.log('[DaySevenScene] topBanner exists:', !!this.topBanner);
    
    // Pause for 1 second
    await this.wait(1000);
    
    // Change banner to no_streak
    if (this.topBanner) {
      console.log('[DaySevenScene] Updating banner to streak');
      this.updateTopBannerTexture('BANNER_NO_STREAK');
    } else {
      console.error('[DaySevenScene] topBanner is null');
    }
    
    // Add flame asset to top right with fire animation
    const flameTexture = Assets.get('PAGE10_FLAME');
    console.log('[DaySevenScene] PAGE10_FLAME texture:', !!flameTexture);
    if (flameTexture) {
      this.flame = new Sprite(flameTexture);
      this.flame.anchor.set(1, 0);
  this.flame.x = 382; // Slightly inset from the right edge
  this.flame.y = 120; // Lift flame a bit higher
  this.flame.scale.set(1.8); // Smaller flame scale
      this.flameBaseScale = this.flame.scale.x;
      this.flame.alpha = 0;
      this.container.addChild(this.flame);
      
      // Fade in flame
      await this.fadeIn(this.flame, 500);
      
      // Start fire animation
      this.startFlameAnimation();
    } else {
      console.error('[DaySevenScene] PAGE10_FLAME not found in Assets');
    }
    
    // Add character
    const charTexture = Assets.get('PAGE6_CHAR');
    console.log('[DaySevenScene] PAGE6_CHAR texture:', !!charTexture);
    if (charTexture) {
      this.charSprite = new Sprite(charTexture);
      this.charSprite.anchor.set(0, 1);
      this.charSprite.x = 20;
      this.charSprite.y = this.canvasHeight - 65;
      this.charSprite.scale.set(1.4);
      this.charSprite.alpha = 0;
      this.container.addChild(this.charSprite);
      
      // Fade in character
      await this.fadeIn(this.charSprite, 500);
    } else {
      console.error('[DaySevenScene] PAGE6_CHAR not found in Assets');
    }
    
    // Show chat bubbles in sequence
    this.chatBubbles = [];
    
    // Chat 1 appears
    console.log('[DaySevenScene] Showing chat_1');
    await this.showChatBubble('PAGE10_CHAT_1', 0);
    await this.wait(600);
    
    // Bump chat 1 up and fade
    console.log('[DaySevenScene] Bumping chat_1');
    await this.bumpUpChat(0);
    
    // Chat 2 appears in the same place
    console.log('[DaySevenScene] Showing chat_2');
    await this.showChatBubble('PAGE10_CHAT_2', 1);
    
  console.log('[DaySevenScene] End sequence complete');

  await this.wait(2500);
    await this.transitionToDayThirty();
  }

  async showChatBubble(assetKey, index) {
    const texture = Assets.get(assetKey);
    if (!texture) return;
    
    const bubble = new Sprite(texture);
    bubble.anchor.set(0.5);
    bubble.x = this.canvasWidth / 2;
    bubble.y = this.canvasHeight - 580; // Match DayTwoScene position
    bubble.alpha = 0;
    bubble.scale.set(0);
    this.container.addChild(bubble);
    this.chatBubbles[index] = bubble;
    
    // Pop in animation with 1.3 scale to match DayTwoScene
    await this.popIn(bubble, 1.3);
  }

  async bumpUpChat(index) {
    const bubble = this.chatBubbles[index];
    if (!bubble) return;

    const duration = 250;
    const startTime = Date.now();
    const startY = bubble.y;
    const targetY = startY - 150;

    return new Promise(resolve => {
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(1, elapsed / duration);

        bubble.y = startY + (targetY - startY) * progress;
        // Fade to 50% opacity
        bubble.alpha = 1 - (progress * 0.5);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          bubble.alpha = 0.5;
          bubble.y = targetY;
          resolve();
        }
      };
      requestAnimationFrame(animate);
    });
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

  updateTopBannerTexture(assetKey) {
    if (!this.topBanner) {
      console.warn('[DaySevenScene] Tried to update banner before it was created');
      return;
    }

    const texture = Assets.get(assetKey);
    if (!texture) {
      console.error('[DaySevenScene] Banner texture not found for key:', assetKey);
      return;
    }

    this.topBanner.texture = texture;
    this.adjustTopBannerScale();
    console.log('[DaySevenScene] Changed banner to', assetKey);
  }

  adjustTopBannerScale() {
    if (!this.topBanner || !this.topBanner.texture) {
      return;
    }

    if (!this.topBannerTargetWidth) {
      this.topBannerTargetWidth = this.topBanner.width;
    }

    const textureWidth = this.topBanner.texture.width;
    if (!textureWidth) {
      return;
    }

    const targetScale = this.topBannerTargetWidth / textureWidth;
    this.topBanner.scale.set(targetScale);
  }

  startFlameAnimation() {
    if (!this.flame) return;

    let time = 0;
    const baseScale = this.flameBaseScale ?? this.flame.scale.x ?? 1.0;

    const animate = () => {
      if (!this.flame || this.flame.destroyed) return;

      time += 0.05; // Slower progression for a calmer flame

      // Flicker effect scales relative to the base size so large flames stay large
      const jitter = Math.sin(time * 3) * 0.04 + (Math.random() - 0.5) * 0.04;
      const scaleMultiplier = 1 + jitter;
      const scale = Math.max(baseScale * 0.9, baseScale * scaleMultiplier);
      this.flame.scale.set(scale);

      // Subtle alpha flicker
      this.flame.alpha = 0.95 + Math.random() * 0.05;

      // Continue animation
      this.flameAnimationId = requestAnimationFrame(animate);
    };

    animate();
  }

  async transitionToDayThirty() {
    // Show black screen with thank you message before transitioning
    // Immediately transition to ThankYouScene after Day 7
    const sceneManager = window.sceneManager;
    if (!sceneManager) {
      console.warn('[DaySevenScene] No scene manager available for Day 7 end transition');
      return;
    }
    const { ThankYouScene } = await import('./ThankYouScene.js');
    await sceneManager.change(new ThankYouScene(), 'none');
  }

  async moveAvatar(spaces) {
    // Banner sequence: no_1, no_2, no_3, no_4, no_5
    const bannerSequence = ['BANNER_NO_1', 'BANNER_NO_2', 'BANNER_NO_3', 'BANNER_NO_4', 'BANNER_NO_5'];
    
    for (let i = 0; i < spaces; i++) {
      this.currentPosition++;
      const targetPos = this.pathPositions[this.currentPosition];
      
      console.log('[DaySevenScene] Moving to position', this.currentPosition, ':', targetPos.x, targetPos.y);
      
      // Animate avatar to new position
      await this.animateAvatarTo(targetPos.x, targetPos.y);
      
      // Change banner
      if (i < bannerSequence.length) {
        this.updateTopBannerTexture(bannerSequence[i]);
      }
      
      await this.wait(300);
    }
    
    // After all movement, show end sequence
    await this.showEndSequence();
  }

  async animateAvatarTo(targetX, targetY) {
    if (!this.avatar) return;
    
    const duration = 400;
    const startTime = performance.now();
    const startX = this.avatar.x;
    const startY = this.avatar.y;
    
    return new Promise(resolve => {
      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        this.avatar.x = startX + (targetX - startX) * easeProgress;
        this.avatar.y = startY + (targetY - startY) * easeProgress;
        
        // Add jump arc
        const jumpHeight = 60;
        const arc = Math.sin(progress * Math.PI) * jumpHeight;
        this.avatar.y -= arc;
        
        // Smooth camera follow - gradually scroll to keep avatar in view (same as DayTwoScene)
        if (this.scrollContainer) {
          const avatarScreenY = this.avatar.y + this.scrollContainer.y;
          const targetScreenY = this.canvasHeight / 2;
          const scrollOffset = avatarScreenY - targetScreenY;
          
          // Smoothly interpolate towards target (slow following)
          let newScrollY = this.scrollContainer.y - scrollOffset * 0.03;
          newScrollY = Math.max(this.minY, Math.min(this.maxY, newScrollY));
          this.scrollContainer.y = newScrollY;
        }
        
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

  centerCameraOnAvatar() {
    if (!this.avatar || !this.scrollContainer) return;
    
    // Calculate target scroll position to center avatar on screen
    const targetY = -this.avatar.y + (this.canvasHeight / 2);
    
    // Clamp to scroll limits
    this.scrollContainer.y = Math.max(this.minY, Math.min(this.maxY, targetY));
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  update(delta) {
    // Animate pulsing glow behind dice button
    if (this.pulsingGlow && this.diceButton) {
      this.animationFrame = (this.animationFrame || 0) + 1;
      
      // Clear previous drawing
      this.pulsingGlow.clear();
      
      // Create pulsing effect with oscillating radius
      const baseRadius = 70;
      const pulse = Math.sin(this.animationFrame * 0.05) * 15;
      const radius = baseRadius + pulse;
      
      // Draw multiple circles for a soft glow effect
      const centerX = this.diceButton.x;
      const centerY = this.diceButton.y;
      
      // Outer glow (most transparent)
      this.pulsingGlow.circle(centerX, centerY, radius * 1.2);
      this.pulsingGlow.fill({ color: 0xFF0000, alpha: 0.2 });
      
      // Middle glow
      this.pulsingGlow.circle(centerX, centerY, radius * 0.8);
      this.pulsingGlow.fill({ color: 0xFF0000, alpha: 0.3 });
      
      // Inner glow (brightest)
      this.pulsingGlow.circle(centerX, centerY, radius * 0.5);
      this.pulsingGlow.fill({ color: 0xFF0000, alpha: 0.4 });
    }
  }

  isReady() {
    return this.ready;
  }

  destroy() {
    if (this.flameAnimationId) {
      cancelAnimationFrame(this.flameAnimationId);
      this.flameAnimationId = null;
    }

    this.container.destroy({ children: true });
  }
}
