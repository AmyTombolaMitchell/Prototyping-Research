import { Container, Sprite, Graphics, Assets } from 'pixi.js';

export class SuperSpinsScene {
  constructor() {
    this.container = new Container();
    this.layeredSprites = [];
    this.ready = false;
    this.canvasWidth = 572;
    this.canvasHeight = 1247;
    this.topBanner = null;
    this.tiles = [];
    this.wheelBottom = null;
    this.spinButton = null;
    this.flippedTilesCount = 0;
    this.allTilesFlipped = false;
    this.isSpinning = false;
  }

  async init() {
    console.log('[SuperSpinsScene] Initializing...');

    // Add SUPER_SPINS_BG background (moved down more)
    const bgTexture = Assets.get('PAGE8_SUPER_SPINS_BG');
    if (bgTexture) {
      const bg = new Sprite(bgTexture);
      bg.anchor.set(0.5, 0.5);
      bg.x = this.canvasWidth / 2;
      bg.y = this.canvasHeight / 2 + 60; // Moved down more (was +40)
      bg.alpha = 0; // Start invisible
      this.container.addChild(bg);
      this.layeredSprites.push(bg);
    }

    // Add TOP BANNER (BANNER_NO_0) - Changed from BANNER_NO_30
    const topBannerTexture = Assets.get('BANNER_NO_0');
    if (topBannerTexture) {
      this.topBanner = new Sprite(topBannerTexture);
      this.topBanner.anchor.set(0.5, 0);
      this.topBanner.x = this.canvasWidth / 2;
      this.topBanner.y = 0;
      this.topBanner.scale.set(0.75);
      // Banner stays visible (alpha = 1)
      this.container.addChild(this.topBanner);
      this.layeredSprites.push(this.topBanner);
    }

    // Add BOTTOM_BANNER (same as previous pages)
    const bottomBannerTexture = Assets.get('PAGE6_BOTTOM_BANNER');
    if (bottomBannerTexture) {
      this.bottomBanner = new Sprite(bottomBannerTexture);
      this.bottomBanner.anchor.set(0.5, 1);
      this.bottomBanner.x = this.canvasWidth / 2;
      this.bottomBanner.y = this.canvasHeight;
      this.bottomBanner.scale.set(1.0);
      // Banner stays visible (alpha = 1)
      this.container.addChild(this.bottomBanner);
      this.layeredSprites.push(this.bottomBanner);
    }

    // Add SUPERSPINS_WHEEL at bottom, cut in half, behind bottom banner
    const wheelTexture = Assets.get('PAGE8_SUPERSPINS_WHEEL');
    if (wheelTexture) {
      const wheel = new Sprite(wheelTexture);
      wheel.anchor.set(0.5, 0); // Anchor at top center
      wheel.x = this.canvasWidth / 2;
      wheel.y = this.canvasHeight - 100; // Position so bottom half is cut off
      wheel.scale.set(1.0);
      wheel.alpha = 0; // Start invisible
      // Move wheel behind bottom banner
      this.container.removeChild(this.bottomBanner);
      this.container.addChild(wheel);
      this.container.addChild(this.bottomBanner);
      this.layeredSprites.push(wheel);
    }

    // Add flip tiles at specified coordinates (moved down more, bit to the right, 3% smaller)
    this.tiles[0] = this.addFlipTile(125, 699, 'PAGE8_FLIP_SPIN', 0);      // 1
    this.tiles[1] = this.addFlipTile(280, 697, 'PAGE8_FLIP_FP', 1);        // 2
    this.tiles[2] = this.addFlipTile(449, 700, 'PAGE8_FLIP_FP', 2);        // 3
    this.tiles[3] = this.addFlipTile(127, 794, 'PAGE8_FLIP_20', 3);        // 4
    this.tiles[4] = this.addFlipTile(286, 797, 'PAGE8_FLIP_SPIN', 4);      // 5
    this.tiles[5] = this.addFlipTile(444, 798, 'PAGE8_FLIP_20', 5);        // 6
    this.tiles[6] = this.addFlipTile(128, 893, 'PAGE8_FLIP_5', 6);         // 7
    this.tiles[7] = this.addFlipTile(287, 893, 'PAGE8_FLIP_FP', 7);        // 8
    this.tiles[8] = this.addFlipTile(446, 890, 'PAGE8_FLIP_5', 8);         // 9

    // Add superspins_wheel at bottom (only half visible, on top of tiles)
    const wheelBottomTexture = Assets.get('PAGE8_SUPERSPINS_WHEEL');
    if (wheelBottomTexture) {
      this.wheelBottom = new Sprite(wheelBottomTexture);
      this.wheelBottom.anchor.set(0.5, 0); // Anchor at top center
      this.wheelBottom.x = this.canvasWidth / 2;
      this.wheelBottom.y = this.canvasHeight - (wheelBottomTexture.height / 2) - 65; // Moved up more
      this.wheelBottom.scale.set(0.92); // Smaller
      // Add on top of tiles (after tiles in render order)
      this.container.addChild(this.wheelBottom);
      this.layeredSprites.push(this.wheelBottom);
    }

    // Re-add bottom banner on top of wheel
    const bottomBannerTopTexture = Assets.get('PAGE6_BOTTOM_BANNER');
    if (bottomBannerTopTexture) {
      const bottomBannerTop = new Sprite(bottomBannerTopTexture);
      bottomBannerTop.anchor.set(0.5, 1);
      bottomBannerTop.x = this.canvasWidth / 2;
      bottomBannerTop.y = this.canvasHeight;
      bottomBannerTop.scale.set(1.0);
      // Banner stays visible (alpha = 1)
      this.container.addChild(bottomBannerTop);
      this.layeredSprites.push(bottomBannerTop);
    }

    // Fade in all content except banners
    await this.fadeInContent();

    // Tiles will be added with specific coordinates from user
    // For now, just mark as ready
    this.ready = true;
    console.log('[SuperSpinsScene] Marked as ready with flip tiles');
  }

  async fadeInContent() {
    const duration = 800;
    const startTime = performance.now();
    
    // Get references to banners to exclude
    const bannersToKeep = [this.topBanner, this.bottomBanner];
    
    // Collect all items to fade
    const itemsToFade = [];
    
    // Add sprites (except banners)
    for (const sprite of this.layeredSprites) {
      if (!bannersToKeep.includes(sprite)) {
        itemsToFade.push(sprite);
      }
    }
    
    // Add tiles
    for (const tile of this.tiles) {
      if (tile) {
        itemsToFade.push(tile);
      }
    }
    
    // Add wheelBottom
    if (this.wheelBottom) {
      itemsToFade.push(this.wheelBottom);
    }
    
    return new Promise(resolve => {
      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Fade in all collected items
        for (const item of itemsToFade) {
          item.alpha = progress;
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

  addFlipTile(x, y, flipToTexture, index) {
    const tileTexture = Assets.get('PAGE8_FLIP_TILE');
    if (!tileTexture) return;

    const tile = new Sprite(tileTexture);
    tile.anchor.set(0.5);
    tile.x = x;
    tile.y = y;
    tile.scale.set(0.97); // 3% smaller
    tile.alpha = 0; // Start invisible
    tile.eventMode = 'static';
    tile.cursor = 'pointer';
    tile.userData = { index }; // Store index for later reference
    
    let isFlipped = false;
    
    tile.on('pointerdown', async () => {
      if (isFlipped) return;
      isFlipped = true;
      
      console.log('[SuperSpinsScene] Tile clicked, flipping to:', flipToTexture);
      
      // Flip animation
      await this.flipTile(tile, flipToTexture);
      
      // Track flipped tiles
      this.flippedTilesCount++;
      console.log('[SuperSpinsScene] Flipped tiles:', this.flippedTilesCount, '/ 9');
      
      // Check if all tiles are flipped
      if (this.flippedTilesCount === 9 && !this.allTilesFlipped) {
        this.allTilesFlipped = true;
        console.log('[SuperSpinsScene] All tiles flipped! Starting tile greying and wheel transformation');
        await this.greyOutLosingTiles();
      }
    });

    this.container.addChild(tile);
    this.layeredSprites.push(tile);
    
    return tile;
  }

  async flipTile(tile, textureName) {
    const flipTexture = Assets.get(textureName);
    if (!flipTexture) return;

    return new Promise(resolve => {
      const duration = 300;
      const startTime = performance.now();
      const originalScaleX = tile.scale.x;

      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        if (progress < 0.5) {
          // First half: scale down to 0
          tile.scale.x = originalScaleX * (1 - progress * 2);
        } else {
          // Halfway point: change texture
          if (tile.texture !== flipTexture) {
            tile.texture = flipTexture;
          }
          // Second half: scale back up
          tile.scale.x = originalScaleX * ((progress - 0.5) * 2);
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          tile.scale.x = originalScaleX;
          resolve();
        }
      };
      animate();
    });
  }

  update(delta) {
    // Rotate wheel if spinning
    if (this.isSpinning && this.wheelBottom) {
      // Wheel rotation is handled by spinWheel animation
    }
  }

  async greyOutLosingTiles() {
    console.log('[SuperSpinsScene] Waiting 1 second before greying out losing tiles');
    await this.wait(1000);
    
    // Grey out tiles: 1, 4, 5, 6, 7, 9 (indices 0, 3, 4, 5, 6, 8)
    const tilesToGrey = [
      { index: 0, afterTexture: 'PAGE8_FLIP_SPIN_AFTER' },  // Tile 1
      { index: 3, afterTexture: 'PAGE8_FLIP_20_AFTER' },    // Tile 4
      { index: 4, afterTexture: 'PAGE8_FLIP_SPIN_AFTER' },  // Tile 5
      { index: 5, afterTexture: 'PAGE8_FLIP_20_AFTER' },    // Tile 6
      { index: 6, afterTexture: 'PAGE8_FLIP_5_AFTER' },     // Tile 7
      { index: 8, afterTexture: 'PAGE8_FLIP_5_AFTER' }      // Tile 9
    ];
    
    console.log('[SuperSpinsScene] Greying out losing tiles (fade transition)');
    
    // Fade each tile to its greyed out version
    const fadePromises = tilesToGrey.map(({ index, afterTexture }) => {
      const tile = this.tiles[index];
      if (tile) {
        return this.fadeTileTexture(tile, afterTexture);
      }
      return Promise.resolve();
    });
    
    await Promise.all(fadePromises);
    console.log('[SuperSpinsScene] Losing tiles greyed out');
    
    // Wait another second before wheel transformation
    await this.wait(1000);
    
    // Now start wheel transformation
    await this.transformWheelForSpin();
  }

  async fadeTileTexture(tile, newTextureName) {
    const newTexture = Assets.get(newTextureName);
    if (!newTexture) return;
    
    return new Promise(resolve => {
      const duration = 500;
      const startTime = performance.now();
      const startAlpha = tile.alpha;

      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        if (progress < 0.5) {
          // Fade out
          tile.alpha = startAlpha * (1 - progress * 2);
        } else {
          // Change texture at halfway
          if (tile.texture !== newTexture) {
            tile.texture = newTexture;
          }
          // Fade in
          tile.alpha = startAlpha * ((progress - 0.5) * 2);
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          tile.alpha = startAlpha;
          resolve();
        }
      };
      animate();
    });
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async transformWheelForSpin() {
    console.log('[SuperSpinsScene] Starting wheel transformation');
    
    // Step 1: Fade wheel texture to superspins_wheel_after
    await this.fadeWheelTexture();
    
    // Step 2: Move wheel up (not as high as before)
    await this.moveWheelUp();
    
    // Step 3: Add spin button in middle of wheel
    this.addSpinButton();
  }

  async fadeWheelTexture() {
    if (!this.wheelBottom) return;
    
    console.log('[SuperSpinsScene] Fading wheel to superspins_wheel_after');
    const newTexture = Assets.get('PAGE8_SUPERSPINS_WHEEL_AFTER');
    if (!newTexture) {
      console.warn('[SuperSpinsScene] superspins_wheel_after texture not found!');
      return;
    }
    
    return new Promise(resolve => {
      const duration = 500;
      const startTime = performance.now();
      const startAlpha = this.wheelBottom.alpha;

      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        if (progress < 0.5) {
          // Fade out
          this.wheelBottom.alpha = startAlpha * (1 - progress * 2);
        } else {
          // Change texture at halfway
          if (this.wheelBottom.texture !== newTexture) {
            this.wheelBottom.texture = newTexture;
          }
          // Fade in
          this.wheelBottom.alpha = startAlpha * ((progress - 0.5) * 2);
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          this.wheelBottom.alpha = startAlpha;
          console.log('[SuperSpinsScene] Wheel texture faded to superspins_wheel_after');
          resolve();
        }
      };
      animate();
    });
  }

  async moveWheelUp() {
    if (!this.wheelBottom) return;
    
    console.log('[SuperSpinsScene] Moving wheel up (not as high)');
    
    // Change anchor to center the wheel
    this.wheelBottom.anchor.set(0.5, 0.5);
    
    return new Promise(resolve => {
      const duration = 1000;
      const startTime = performance.now();
      const startY = this.wheelBottom.y;
      // Move to lower position - around 75% down the screen
      const targetY = this.canvasHeight * 0.75;

      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out cubic for smooth deceleration
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        this.wheelBottom.y = startY + (targetY - startY) * easeProgress;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          this.wheelBottom.y = targetY;
          console.log('[SuperSpinsScene] Wheel moved up to position:', targetY);
          resolve();
        }
      };
      animate();
    });
  }

  addSpinButton() {
    const spinButtonTexture = Assets.get('PAGE8_SPIN_BUTTON');
    if (!spinButtonTexture) {
      console.warn('[SuperSpinsScene] spin_button texture not found!');
      return;
    }
    
    this.spinButton = new Sprite(spinButtonTexture);
    this.spinButton.anchor.set(0.5);
    this.spinButton.x = this.canvasWidth / 2;
    // Position lower - around 80% down the screen
    this.spinButton.y = this.canvasHeight * 0.8;
    this.spinButton.scale.set(0.85); // Slightly smaller
    this.spinButton.eventMode = 'static';
    this.spinButton.cursor = 'pointer';
    
    this.spinButton.on('pointerdown', async () => {
      console.log('[SuperSpinsScene] Spin button clicked!');
      if (this.isSpinning) return;
      
      // Hide spin button
      this.spinButton.visible = false;
      
      // Spin the wheel
      await this.spinWheel();
      
      // Show win popup
      await this.showWinPopup();
      
      // Wait a moment then navigate back to DayTwoScene
      await this.wait(2000);
      await this.navigateToDayTwoScene();
    });
    
    this.container.addChild(this.spinButton);
    this.layeredSprites.push(this.spinButton);
    
    console.log('[SuperSpinsScene] Spin button added at wheel center');
  }

  async spinWheel() {
    if (!this.wheelBottom) return;
    
    this.isSpinning = true;
    console.log('[SuperSpinsScene] Starting wheel spin');
    
    // Spin parameters (similar to WheelSpinScene)
    const fullSpins = 20;
    // Adjust rotation to land on 5 - rotate forward further past default (0)
    const targetRotation = Math.PI / 5; // Rotate forward more to land on 5
    const totalRotation = (fullSpins * Math.PI * 2) + targetRotation;
    
    const warmUpDuration = 1000;
    const steadySpinDuration = 2000;
    const slowDownDuration = 3000;
    const totalDuration = warmUpDuration + steadySpinDuration + slowDownDuration;
    
    const startTime = Date.now();
    
    return new Promise(resolve => {
      const animate = () => {
        if (!this.wheelBottom) return;
        
        const elapsed = Date.now() - startTime;
        const progress = Math.min(1, elapsed / totalDuration);
        
        let rotationProgress = 0;
        
        if (elapsed <= warmUpDuration) {
          const phaseProgress = elapsed / warmUpDuration;
          const easeIn = phaseProgress * phaseProgress * phaseProgress;
          rotationProgress = easeIn * 0.1;
        } else if (elapsed <= warmUpDuration + steadySpinDuration) {
          const phaseProgress = (elapsed - warmUpDuration) / steadySpinDuration;
          rotationProgress = 0.1 + (phaseProgress * 0.6);
        } else {
          const phaseProgress = (elapsed - warmUpDuration - steadySpinDuration) / slowDownDuration;
          const easeOut = 1 - Math.pow(1 - phaseProgress, 3);
          rotationProgress = 0.7 + (easeOut * 0.3);
        }
        
        this.wheelBottom.rotation = totalRotation * rotationProgress;
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          this.wheelBottom.rotation = targetRotation;
          this.isSpinning = false;
          console.log('[SuperSpinsScene] Wheel spin complete');
          resolve();
        }
      };
      requestAnimationFrame(animate);
    });
  }

  async showWinPopup() {
    console.log('[SuperSpinsScene] Showing win popup with dark overlay and confetti');
    
    // Create dark overlay (80% opacity black cover)
    const darkOverlay = new Graphics();
    darkOverlay.rect(0, 0, this.canvasWidth, this.canvasHeight);
    darkOverlay.fill({ color: 0x000000, alpha: 0 });
    
    // Find the indices of top and bottom banners to keep them on top
    const topBannerIndex = this.layeredSprites.indexOf(this.topBanner);
    const bottomBannerIndex = this.layeredSprites.findIndex(sprite => 
      sprite.texture && sprite.texture === Assets.get('PAGE6_BOTTOM_BANNER')
    );
    
    // Remove banners temporarily
    if (this.topBanner) this.container.removeChild(this.topBanner);
    const bottomBanner = this.layeredSprites[bottomBannerIndex];
    if (bottomBanner) this.container.removeChild(bottomBanner);
    
    // Add overlay
    this.container.addChild(darkOverlay);
    
    // Re-add banners on top of overlay
    if (this.topBanner) this.container.addChild(this.topBanner);
    if (bottomBanner) this.container.addChild(bottomBanner);
    
    // Fade in overlay
    await new Promise(resolve => {
      const duration = 500;
      const startTime = performance.now();
      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        darkOverlay.clear();
        darkOverlay.rect(0, 0, this.canvasWidth, this.canvasHeight);
        darkOverlay.fill({ color: 0x000000, alpha: 0.8 * progress });
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      animate();
    });
    
    // Create confetti particles
    const confettiParticles = this.createConfetti();
    confettiParticles.forEach(particle => this.container.addChild(particle));
    
    // Animate confetti falling
    this.animateConfetti(confettiParticles);
    
    // Add win popup
    const winTexture = Assets.get('PAGE8_SUPERSPINS_WIN');
    if (!winTexture) {
      console.warn('[SuperSpinsScene] superspins_win texture not found!');
      return;
    }
    
    const winPopup = new Sprite(winTexture);
    winPopup.anchor.set(0.5);
    winPopup.x = this.canvasWidth / 2;
    winPopup.y = this.canvasHeight / 2;
    winPopup.scale.set(0);
    winPopup.alpha = 0;
    
    this.container.addChild(winPopup);
    this.layeredSprites.push(winPopup);
    
    // Animate popup appearing (scale and fade in)
    return new Promise(resolve => {
      const duration = 500;
      const startTime = performance.now();

      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out back for bouncy effect
        const easeProgress = progress < 0.5 
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        
        winPopup.scale.set(easeProgress * 1.0);
        winPopup.alpha = progress;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          winPopup.scale.set(1.0);
          winPopup.alpha = 1;
          console.log('[SuperSpinsScene] Win popup displayed');
          // Wait a bit then transition back to DayTwoScene
          setTimeout(async () => {
            await this.transitionToDayTwo();
          }, 2000);
          resolve();
        }
      };
      animate();
    });
  }

  async transitionToDayTwo() {
    console.log('[SuperSpinsScene] Transitioning to MessageTwoScene (Page 9)');
    const sceneManager = window.sceneManager;
    if (sceneManager) {
      const { MessageTwoScene } = await import('./MessageTwoScene.js');
      await sceneManager.change(new MessageTwoScene(), 'none');
    }
  }

  createConfetti() {
    const particles = [];
    const colors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF, 0x00FFFF, 0xFFA500];
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = new Graphics();
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = Math.random() * 8 + 4;
      
      // Random confetti shape (rectangle or circle)
      if (Math.random() > 0.5) {
        particle.rect(0, 0, size, size * 1.5);
      } else {
        particle.circle(0, 0, size / 2);
      }
      particle.fill({ color });
      
      particle.x = Math.random() * this.canvasWidth;
      particle.y = -20 - Math.random() * 100;
      particle.rotation = Math.random() * Math.PI * 2;
      
      // Store velocity data
      particle.userData = {
        velocityY: Math.random() * 2 + 1,
        velocityX: (Math.random() - 0.5) * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1
      };
      
      particles.push(particle);
    }
    
    return particles;
  }

  animateConfetti(particles) {
    const animate = () => {
      particles.forEach(particle => {
        particle.y += particle.userData.velocityY;
        particle.x += particle.userData.velocityX;
        particle.rotation += particle.userData.rotationSpeed;
        
        // Reset particle if it falls off screen
        if (particle.y > this.canvasHeight + 20) {
          particle.y = -20;
          particle.x = Math.random() * this.canvasWidth;
        }
      });
      
      requestAnimationFrame(animate);
    };
    animate();
  }

  async navigateToDayTwoScene() {
    console.log('[SuperSpinsScene] Navigating back to DayTwoScene');
    const sceneManager = window.sceneManager;
    if (sceneManager) {
      const dayTwoScene = sceneManager.scenes.get('DayTwoScene');
      if (dayTwoScene) {
        // Set flag to start at position 5 with BANNER_NO_0 and PAGE 5 assets
        dayTwoScene.startAtPosition5 = true;
        await sceneManager.change(dayTwoScene, 'none');
      }
    }
  }

  isReady() {
    return this.ready;
  }

  destroy() {
    this.container.removeChildren();
    this.layeredSprites = [];
    this.tiles = [];
  }
}
