import { Container, Sprite, Assets, Graphics, Text } from 'pixi.js';

export class DayTwoScene {
  constructor() {
    Object.defineProperty(this, "container", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: new Container()
    });
    Object.defineProperty(this, "ready", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: false
    });
    Object.defineProperty(this, "isTransitioning", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: false
    });
    Object.defineProperty(this, "startAtPosition5", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: false
    });
    Object.defineProperty(this, "layeredSprites", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: []
    });
    Object.defineProperty(this, "canvasWidth", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 572
    });
    Object.defineProperty(this, "canvasHeight", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 1247
    });
    Object.defineProperty(this, "scrollContainer", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: null
    });
    Object.defineProperty(this, "longBackground", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: null
    });
    Object.defineProperty(this, "isDragging", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: false
    });
    Object.defineProperty(this, "lastY", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 0
    });
    Object.defineProperty(this, "velocity", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 0
    });
    Object.defineProperty(this, "minY", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 0
    });
    Object.defineProperty(this, "maxY", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 0
    });
    Object.defineProperty(this, "avatar", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: null
    });
    Object.defineProperty(this, "coordinateText", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: null
    });
    Object.defineProperty(this, "pathPositions", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: [
        { x: 321, y: 2467 },  // Starting position
        { x: 93, y: 2401 },   // Position 1
        { x: 278, y: 2308 },  // Position 2
        { x: 485, y: 2228 },  // Position 3
        { x: 408, y: 2112 },  // Position 4
        { x: 256, y: 2070 }   // Position 5
      ]
    });
    Object.defineProperty(this, "currentPosition", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 0
    });
    Object.defineProperty(this, "diceButton", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: null
    });
    Object.defineProperty(this, "diceRolling", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: false
    });
    Object.defineProperty(this, "pulsingGlow", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: null
    });
    Object.defineProperty(this, "animationFrame", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 0
    });
    Object.defineProperty(this, "topBanner", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: null
    });
    Object.defineProperty(this, "coinCollect", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: null
    });
    Object.defineProperty(this, "chatMessages", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: []
    });
    Object.defineProperty(this, "tokenShop", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: null
    });
    Object.defineProperty(this, "tokenShopGlow", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: null
    });
    Object.defineProperty(this, "wiggleFrame", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 0
    });
  }

  async init() {
    console.log('[DayTwoScene] Starting init, startAtPosition5:', this.startAtPosition5);
    this.container.removeChildren();
    this.layeredSprites = [];

    // Skip "DAY TWO" text if coming back from SuperSpinsScene
    if (!this.startAtPosition5) {
      await this.showDayTwoText();
    }

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
      
      // Start at the BOTTOM of the map (where avatar starts at y=2467)
      this.scrollContainer.y = this.minY;
      
      console.log('[DayTwoScene] Background height:', bgHeight, 'Canvas height:', this.canvasHeight);
      console.log('[DayTwoScene] Scroll limits - min:', this.minY, 'max:', this.maxY);
      console.log('[DayTwoScene] Starting position (bottom):', this.scrollContainer.y);
    }

    // Add TOP BANNER - use NO_0 if coming from SuperSpinsScene, otherwise NO_25
    const bannerKey = this.startAtPosition5 ? 'BANNER_NO_0' : 'BANNER_NO_25';
    const topBannerTexture = Assets.get(bannerKey);
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
      bottomBanner.scale.set(1.0); // Make it bigger
      this.container.addChild(bottomBanner);
      this.layeredSprites.push(bottomBanner);
    }

    // Set starting position based on flag
    const startingPosition = this.startAtPosition5 ? 5 : 0;
    const startingCoords = this.pathPositions[startingPosition];

    // Add AVATAR at specified position
    const avatarTexture = Assets.get('PAGE3_AVATAR');
    if (avatarTexture && this.scrollContainer) {
      this.avatar = new Sprite(avatarTexture);
      this.avatar.anchor.set(0.5, 1);
      this.avatar.scale.set(0.75);
      this.avatar.x = startingCoords.x;
      this.avatar.y = startingCoords.y;
      this.avatar.alpha = 1; // Ensure visible
      this.scrollContainer.addChild(this.avatar);
      this.layeredSprites.push(this.avatar);
      this.currentPosition = startingPosition;
      console.log('[DayTwoScene] Avatar added at position:', this.avatar.x, this.avatar.y, 'Position index:', this.currentPosition);
      console.log('[DayTwoScene] Avatar alpha:', this.avatar.alpha, 'visible:', this.avatar.visible);
      console.log('[DayTwoScene] ScrollContainer y:', this.scrollContainer.y);
      
      // Center camera on avatar if starting at position 5
      if (this.startAtPosition5) {
        this.centerCameraOnAvatar();
      }
    }

    // Add coordinate display text
    this.coordinateText = new Text({
      text: 'X: 0, Y: 0',
      style: {
        fontFamily: 'Arial',
        fontSize: 16,
        fill: 0xFFFFFF,
        stroke: { color: 0x000000, width: 3 }
      }
    });
    this.coordinateText.x = 10;
    this.coordinateText.y = 10;
    this.container.addChild(this.coordinateText);

    // Add drag interaction
    this.setupDragInteraction();

    // Show roll dice button and avatar immediately
    await this.showDiceButton();
    
    // Make avatar visible immediately (it was already added above)
    if (this.avatar) {
      console.log('[DayTwoScene] Avatar visible at start');
    }

    // Add coin collect sprite LAST (STATIC - on top of everything including banner, doesn't scroll)
    const coinTexture = Assets.get('COIN_COLLECT');
    if (coinTexture) {
      this.coinCollect = new Sprite(coinTexture);
      this.coinCollect.anchor.set(0.5);
      this.coinCollect.x = 456;
      this.coinCollect.y = 150; // Static position on screen - VISIBLE (canvas height is 1247)
      this.coinCollect.scale.set(1.5); // Bigger
      this.container.addChild(this.coinCollect); // Add to main container, not scrollContainer
      this.layeredSprites.push(this.coinCollect);
      console.log('[DayTwoScene] Coin added at static position (on top):', this.coinCollect.x, this.coinCollect.y);
    }

    this.ready = true;
    console.log('[DayTwoScene] Marked as ready');
  }

  async showDiceButton() {
    // Create dice button using INTRO2_2 asset (same as PAGE 2)
    const diceTexture = Assets.get('INTRO2_2');
    if (!diceTexture) return;

    // Create pulsing red glow behind the button (exactly like PAGE 2)
    this.pulsingGlow = new Graphics();
    this.container.addChild(this.pulsingGlow);

    this.diceButton = new Sprite(diceTexture);
    this.diceButton.anchor.set(0.5);
    this.diceButton.x = this.canvasWidth / 2;
    this.diceButton.y = this.canvasHeight - 170; // Same position as PAGE 2
    this.diceButton.scale.set(0.8); // Same scale as PAGE 2
    this.diceButton.eventMode = 'static';
    this.diceButton.cursor = 'pointer';
    this.container.addChild(this.diceButton);

    console.log('[DayTwoScene] Dice button added');

    // Add click handler
    this.diceButton.on('pointerdown', async () => {
      if (this.diceRolling) return;
      this.diceRolling = true;
      
      console.log('[DayTwoScene] Dice clicked - starting roll');
      
      // Remove the button and glow
      if (this.diceButton) {
        this.container.removeChild(this.diceButton);
        this.diceButton = null;
      }
      if (this.pulsingGlow) {
        this.container.removeChild(this.pulsingGlow);
        this.pulsingGlow = null;
      }
      
      // Animate dice roll
      await this.animateDiceRoll();
      
      // Move avatar along path
      await this.moveAvatarAlongPath();

      // Show chat sequence
      await this.showChatSequence();
      
      this.diceRolling = false;
    });
  }

  async animateDiceRoll() {
    // Exactly match DiceRollScene animation
    const diceTexture = Assets.get('PAGE3_DICE');
    if (!diceTexture) {
      console.error('[DayTwoScene] PAGE3_DICE not found');
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

  async moveAvatarAlongPath() {
    if (!this.avatar) return;

    // Move through positions 1-5
    for (let i = 1; i < this.pathPositions.length; i++) {
      await this.jumpToPosition(i);
      await this.wait(200);
    }
  }

  async jumpToPosition(positionIndex) {
    if (!this.avatar || positionIndex >= this.pathPositions.length) return;

    const target = this.pathPositions[positionIndex];
    const startX = this.avatar.x;
    const startY = this.avatar.y;
    const duration = 400;
    const startTime = Date.now();

    return new Promise((resolve) => {
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(1, elapsed / duration);
        const easeProgress = 1 - Math.pow(1 - progress, 3);

        // Move avatar
        this.avatar.x = startX + (target.x - startX) * easeProgress;
        this.avatar.y = startY + (target.y - startY) * easeProgress;

        // Add jump arc
        const jumpHeight = 60;
        const arc = Math.sin(progress * Math.PI) * jumpHeight;
        this.avatar.y -= arc;
        
        // Smooth camera follow - gradually scroll to keep avatar in view
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
          this.avatar.x = target.x;
          this.avatar.y = target.y;
          this.currentPosition = positionIndex;
          
          // Update banner based on position (positions 1-5 map to banners no_26 through no_30)
          this.updateBanner(positionIndex);
          
          // Pulse coin animation when landing
          this.pulseCoin();
          
          resolve();
        }
      };
      requestAnimationFrame(animate);
    });
  }
  
  updateBanner(positionIndex) {
    if (!this.topBanner) return;
    
    // Map positions 1-6 to banners no_26 through no_30
    const bannerMap = {
      1: 'BANNER_NO_26',
      2: 'BANNER_NO_27', 
      3: 'BANNER_NO_28',
      4: 'BANNER_NO_29',
      5: 'BANNER_NO_30',
      6: 'BANNER_NO_30' // Position 6 also uses no_30
    };
    
    const bannerKey = bannerMap[positionIndex];
    if (bannerKey) {
      const bannerTexture = Assets.get(bannerKey);
      if (bannerTexture) {
        this.topBanner.texture = bannerTexture;
        console.log('[DayTwoScene] Banner updated to', bannerKey, 'for position', positionIndex);
      }
    }
  }

  pulseCoin() {
    if (!this.coinCollect) {
      console.log('[DayTwoScene] pulseCoin called but coin not found!');
      return;
    }

    console.log('[DayTwoScene] Pulsing coin at position:', this.coinCollect.x, this.coinCollect.y);
    
    const originalScale = 1.5; // Match the coin's actual scale
    const pulseScale = 2.0; // Pulse to 2.0 (bigger)
    const pulseDuration = 300; // milliseconds
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / pulseDuration);
      
      // Pulse up then back down
      let scale;
      if (progress < 0.5) {
        // Growing phase (0 to 0.5)
        const growProgress = progress * 2;
        scale = originalScale + (pulseScale - originalScale) * growProgress;
      } else {
        // Shrinking phase (0.5 to 1.0)
        const shrinkProgress = (progress - 0.5) * 2;
        scale = pulseScale - (pulseScale - originalScale) * shrinkProgress;
      }
      
      this.coinCollect.scale.set(scale);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.coinCollect.scale.set(originalScale);
        console.log('[DayTwoScene] Pulse complete');
      }
    };
    
    requestAnimationFrame(animate);
  }

  async showDayTwoText() {
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
      // Update coordinate display (accounting for scroll offset)
      if (this.coordinateText && this.scrollContainer) {
        const localPos = this.scrollContainer.toLocal(event.global);
        this.coordinateText.text = `X: ${Math.round(localPos.x)}, Y: ${Math.round(localPos.y)}`;
      }

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

  async fadeIn(sprite, duration = 500) {
    const startTime = Date.now();
    return new Promise((resolve) => {
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

  async fadeOut(sprite, duration = 500) {
    const startTime = Date.now();
    return new Promise((resolve) => {
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

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async showChatSequence() {
    // Show character at bottom left with slow fade in
    const charTexture = Assets.get('PAGE6_CHAR');
    if (charTexture) {
      const char = new Sprite(charTexture);
      char.anchor.set(0, 1); // Bottom left anchor
      char.x = 20; // 20px from left edge
      char.y = this.canvasHeight - 65; // Moved up a few pixels (was -50)
      char.scale.set(1.4); // Slightly bigger (was 1.2)
      char.alpha = 0; // Start invisible
      this.container.addChild(char);
      this.layeredSprites.push(char);
      
      // Fade in slowly
      await this.fadeIn(char, 1000); // 1 second fade
    }

    await this.wait(800); // Slower timing (was 500)

    // Show chat_1 (bigger, higher up)
    const chat1Texture = Assets.get('PAGE6_CHAT_1');
    if (chat1Texture) {
      const chat1 = new Sprite(chat1Texture);
      chat1.anchor.set(0.5);
      chat1.x = this.canvasWidth / 2;
      chat1.y = this.canvasHeight - 580; // Moved up more (was 500)
      chat1.scale.set(1.3); // Bigger
      this.container.addChild(chat1);
      this.layeredSprites.push(chat1);
      this.chatMessages.push(chat1);
    }

    await this.wait(2000); // Slower (was 1500)

    // Show chat_2, bump chat_1 up and fade (bigger, higher up)
    const chat2Texture = Assets.get('PAGE6_CHAT_2');
    if (chat2Texture) {
      const chat2 = new Sprite(chat2Texture);
      chat2.anchor.set(0.5);
      chat2.x = this.canvasWidth / 2;
      chat2.y = this.canvasHeight - 580; // Moved up more (was 500)
      chat2.scale.set(1.3); // Bigger
      this.container.addChild(chat2);
      this.layeredSprites.push(chat2);
      this.chatMessages.push(chat2);

      // Bump chat_1 up
      if (this.chatMessages[0]) {
        await this.bumpChatUp(this.chatMessages[0]);
      }
    }

    await this.wait(2000); // Slower (was 1500)

    // Show chat_3, bump chat_1 and chat_2 up and fade (bigger, higher up)
    const chat3Texture = Assets.get('PAGE6_CHAT_3');
    if (chat3Texture) {
      const chat3 = new Sprite(chat3Texture);
      chat3.anchor.set(0.5);
      chat3.x = this.canvasWidth / 2;
      chat3.y = this.canvasHeight - 580; // Moved up more (was 500)
      chat3.scale.set(1.3); // Bigger
      this.container.addChild(chat3);
      this.layeredSprites.push(chat3);
      this.chatMessages.push(chat3);

      // Bump all previous chats up
      if (this.chatMessages[0]) {
        this.bumpChatUp(this.chatMessages[0]);
      }
      if (this.chatMessages[1]) {
        await this.bumpChatUp(this.chatMessages[1]);
      }
    }

    await this.wait(1000);

    // Show token shop at top right with white pulsing glow (in front of everything)
    const tokenTexture = Assets.get('PAGE6_TOKEN_SHOP');
    if (tokenTexture) {
      // Create white pulsing glow behind token shop
      this.tokenShopGlow = new Graphics();
      this.container.addChild(this.tokenShopGlow);
      
      this.tokenShop = new Sprite(tokenTexture);
      this.tokenShop.anchor.set(0.5);
      this.tokenShop.x = this.canvasWidth - 65; // Moved right a few pixels (was -80)
      this.tokenShop.y = 150; // Top area
      this.tokenShop.scale.set(1.2); // Smaller (was 1.4)
      this.tokenShop.eventMode = 'static';
      this.tokenShop.cursor = 'pointer';
      this.container.addChild(this.tokenShop); // Add to main container (in front)
      this.layeredSprites.push(this.tokenShop);
      // White pulse animation runs in update() method
      
      // Add click handler to navigate to TokenShopScene
      this.tokenShop.on('pointerdown', async () => {
        console.log('[DayTwoScene] Token shop clicked, navigating to TokenShopScene');
        const sceneManager = window.sceneManager;
        if (sceneManager) {
          const tokenShopScene = sceneManager.scenes.get('TokenShopScene');
          if (tokenShopScene) {
            // sceneManager.change() will call init() automatically, don't call it twice
            await sceneManager.change(tokenShopScene, 'none'); // No transition
          }
        }
      });
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

  async bumpChatUp(chatSprite) {
    return new Promise(resolve => {
      const startY = chatSprite.y;
      const endY = startY - 150;
      const startAlpha = chatSprite.alpha;
      const endAlpha = 0.6;
      const duration = 300;
      const startTime = performance.now();

      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        
        chatSprite.y = startY + (endY - startY) * eased;
        chatSprite.alpha = startAlpha + (endAlpha - startAlpha) * eased;

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
    // Animate the pulsing red glow around dice button (exactly like PAGE 2)
    if (this.pulsingGlow && this.diceButton) {
      this.animationFrame++;
      // Clear previous drawing
      this.pulsingGlow.clear();
      // Create pulsing effect with oscillating radius (50% slower, smaller expansion)
      const baseRadius = 80;
      const pulse = Math.sin(this.animationFrame * 0.025) * 10; // Slower, smaller expansion
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

    // Animate white pulsing glow behind token shop
    if (this.tokenShopGlow && this.tokenShop) {
      this.wiggleFrame++;
      // Clear previous drawing
      this.tokenShopGlow.clear();
      // Create pulsing effect with oscillating radius
      const baseRadius = 60;
      const pulse = Math.sin(this.wiggleFrame * 0.03) * 15; // Pulsing effect
      const radius = baseRadius + pulse;
      // Draw multiple circles for a soft glow effect
      const centerX = this.tokenShop.x;
      const centerY = this.tokenShop.y;
      // Outer glow (most transparent)
      this.tokenShopGlow.circle(centerX, centerY, radius * 1.2);
      this.tokenShopGlow.fill({ color: 0xFFFFFF, alpha: 0.2 });
      // Middle glow
      this.tokenShopGlow.circle(centerX, centerY, radius * 0.8);
      this.tokenShopGlow.fill({ color: 0xFFFFFF, alpha: 0.3 });
      // Inner glow (brightest)
      this.tokenShopGlow.circle(centerX, centerY, radius * 0.5);
      this.tokenShopGlow.fill({ color: 0xFFFFFF, alpha: 0.4 });
    }
  }

  async showCharacterAndPage5Assets() {
    console.log('[DayTwoScene] Showing character and PAGE 5 assets');
    
    // Track all displayed assets for click handling
    this.page5Assets = [];
    
    // Hide the scrollContainer (map background) since we're showing a different page
    if (this.scrollContainer) {
      this.scrollContainer.visible = false;
    }
    
    // Add a background for this page (use the SUPER_SPINS_BG or a solid background)
    const pageBgTexture = Assets.get('PAGE8_SUPER_SPINS_BG');
    if (pageBgTexture) {
      const pageBg = new Sprite(pageBgTexture);
      pageBg.anchor.set(0.5, 0.5);
      pageBg.x = this.canvasWidth / 2;
      pageBg.y = this.canvasHeight / 2;
      pageBg.alpha = 0;
      // Add to container BEFORE other elements so it's behind everything
      this.container.addChildAt(pageBg, 0);
      this.layeredSprites.push(pageBg);
      
      // Fade in background
      await this.fadeInSimple(pageBg);
      console.log('[DayTwoScene] Background faded in');
    }
    
    // Show character at usual place
    const charTexture = Assets.get('PAGE6_CHAR');
    if (charTexture) {
      const charSprite = new Sprite(charTexture);
      charSprite.anchor.set(0, 1);
      charSprite.x = 20;
      charSprite.y = this.canvasHeight - 65;
      charSprite.scale.set(1.4);
      charSprite.alpha = 0;
      this.container.addChild(charSprite);
      this.layeredSprites.push(charSprite);
      
      // Fade in character
      await this.fadeInSimple(charSprite);
      console.log('[DayTwoScene] Character faded in');
    }
    
    // Show PAGE 5 assets 1, 2, 3 in sequence at the middle
    await this.showPage5MessageStatic('PAGE5_1', this.canvasWidth / 2, this.canvasHeight / 2);
    console.log('[DayTwoScene] PAGE5_1 shown');
    await this.wait(600);
    
    await this.showPage5MessageStatic('PAGE5_2', this.canvasWidth / 2, this.canvasHeight / 2);
    console.log('[DayTwoScene] PAGE5_2 shown');
    await this.wait(600);
    
    await this.showPage5MessageStatic('PAGE5_3', this.canvasWidth / 2, this.canvasHeight / 2);
    console.log('[DayTwoScene] PAGE5_3 shown');
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
    console.log('[DayTwoScene] PAGE 5 assets 4 and 5 displayed');
    
    // Add click handlers to banners and PAGE 5 assets (4 and 5)
    this.addPage5ClickHandlers();
    
    console.log('[DayTwoScene] All PAGE 5 assets complete - page should stay visible now');
  }

  async showPage5MessageStatic(assetKey, x, y) {
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
    this.page5Assets.push(sprite); // Add to clickable assets
    
    // Pop in animation (with 0.7 scale like MessageScene)
    await this.popIn(sprite, 0.7);
  }

  addPage5ClickHandlers() {
    console.log('[DayTwoScene] Adding click handlers for page 5 continuation');
    
    // Create clickable area at bottom (0-100px height, full width)
    const bottomArea = new Graphics();
    bottomArea.rect(0, this.canvasHeight - 100, this.canvasWidth, 100);
    bottomArea.fill({ color: 0x000000, alpha: 0.01 }); // Nearly invisible
    bottomArea.eventMode = 'static';
    bottomArea.cursor = 'pointer';
    bottomArea.on('pointerdown', () => this.continueAfterPage5());
    this.container.addChild(bottomArea);
    
    // Create clickable area at top (0-250px from top, full width)
    const topArea = new Graphics();
    topArea.rect(0, 0, this.canvasWidth, 250);
    topArea.fill({ color: 0x000000, alpha: 0.01 }); // Nearly invisible
    topArea.eventMode = 'static';
    topArea.cursor = 'pointer';
    topArea.on('pointerdown', () => this.continueAfterPage5());
    this.container.addChild(topArea);
    
    // Make all PAGE 5 assets clickable (1, 2, 3, 4, 5)
    for (const asset of this.page5Assets) {
      asset.eventMode = 'static';
      asset.cursor = 'pointer';
      asset.on('pointerdown', () => this.continueAfterPage5());
    }
  }

  async continueAfterPage5() {
    console.log('[DayTwoScene] Player clicked to continue after PAGE 5');
    // For now, just log. You can add navigation or other logic here
    // For example, you might want to show the dice button or continue gameplay
  }

  async popIn(sprite, targetScale = 1) {
    const duration = 250; // Match MessageScene
    const startTime = Date.now();
    
    return new Promise(resolve => {
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(1, elapsed / duration);
        
        // Match MessageScene animation
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

  async fadeInSimple(sprite) {
    // Simple fade in for character (like MessageScene)
    const duration = 333;
    const startTime = Date.now();
    
    return new Promise(resolve => {
      const animate = () => {
        const elapsed = Date.now() - startTime;
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

  async fadeIn(sprite, duration) {
    return new Promise(resolve => {
      const startTime = performance.now();
      const startAlpha = sprite.alpha;
      
      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        sprite.alpha = startAlpha + (1 - startAlpha) * progress;
        
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

  centerCameraOnAvatar() {
    if (!this.avatar || !this.scrollContainer) return;
    
    // Calculate target scroll position to center avatar on screen
    const targetY = -this.avatar.y + (this.canvasHeight / 2);
    
    // Clamp to scroll limits
    this.scrollContainer.y = Math.max(this.minY, Math.min(this.maxY, targetY));
    
    console.log('[DayTwoScene] Camera centered on avatar at position:', this.avatar.y, 'Scroll Y:', this.scrollContainer.y);
  }

  isReady() {
    return this.ready;
  }

  destroy() {
    if (this.pulsingGlow) {
      this.pulsingGlow.destroy();
    }
    this.container.removeChildren();
    this.layeredSprites = [];
    this.scrollContainer = null;
    this.longBackground = null;
  }
}
