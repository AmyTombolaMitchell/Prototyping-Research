import { Container, Sprite, Assets } from 'pixi.js';
import type { IScene } from '../sceneManager';
import { ASSETS } from '../assets';

export class IntroScene implements IScene {
  container = new Container();
  private ready = false;
  private layeredSprites: Sprite[] = [];
  private readonly canvasWidth = 572;
  private readonly canvasHeight = 1247;
  private isTransitioning = false; // Prevent multiple clicks

  async init() {
    console.log('[IntroScene] init() called - BEFORE try block');
    
    // Make container interactive to allow child events
    this.container.eventMode = 'static';
    
    try {
      console.log('[IntroScene] Starting init - INSIDE try block');
      
      // First add the background
      const bgTexture = Assets.get('INTRO_BG');
      if (bgTexture) {
        const bg = new Sprite(bgTexture);
        bg.anchor.set(0.5);
        bg.x = this.canvasWidth / 2;
        bg.y = this.canvasHeight / 2;
        this.container.addChild(bg);
        this.layeredSprites.push(bg);
      }
      
      // Helper to animate pop/bounce for elements
      const popIn = (sprite: Sprite) => {
        sprite.alpha = 0;
        const originalScale = sprite.scale.x;
        sprite.scale.set(0);
        let frame = 0;
        const animate = () => {
          frame++;
          sprite.alpha = Math.min(1, sprite.alpha + 0.05);
          
          // Bounce effect - overshoot then settle
          const progress = frame / 50; // Increased from 30 to 50 for slower animation
          let scale;
          if (progress < 0.5) {
            // Quick expansion with overshoot
            scale = originalScale * (progress * 2.4);
          } else if (progress < 0.75) {
            // Bounce back (overshoot)
            scale = originalScale * (1.2 - (progress - 0.5) * 0.8);
          } else {
            // Settle to final size
            scale = originalScale * (1.0 + (1.0 - progress) * 0.2);
          }
          
          sprite.scale.set(scale);
          
          if (frame < 50) { // Increased from 30 to 50
            requestAnimationFrame(animate);
          } else {
            sprite.scale.set(originalScale);
          }
        };
        requestAnimationFrame(animate);
      };
      
      // Helper for jiggle animation (periodic for clickable button)
      const jiggle = (sprite: Sprite) => {
        let jiggleFrame = 0;
        let isJiggling = false;
        let jiggleStartTime = 0;
        const baseRotation = 0;
        
        const jiggleAnimate = () => {
          const currentTime = Date.now();
          
          // Start jiggling every 1 second (1000ms on, 1000ms off)
          if (!isJiggling && (currentTime - jiggleStartTime >= 1000 || jiggleStartTime === 0)) {
            isJiggling = true;
            jiggleStartTime = currentTime;
            jiggleFrame = 0;
          }
          
          // Stop jiggling after 1 second
          if (isJiggling && currentTime - jiggleStartTime >= 1000) {
            isJiggling = false;
            sprite.rotation = baseRotation;
            jiggleStartTime = currentTime;
          }
          
          // Perform jiggle animation
          if (isJiggling) {
            jiggleFrame++;
            const wiggle = Math.sin(jiggleFrame * 0.15) * 0.08; // Gentle wiggle
            sprite.rotation = baseRotation + wiggle;
          }
          
          requestAnimationFrame(jiggleAnimate);
        };
        requestAnimationFrame(jiggleAnimate);
      };
      
      // Asset 7 (lady) - First to appear with slow fade-in
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
        
        // Slow fade-in animation
        let frame = 0;
        const fadeIn = () => {
          frame++;
          lady.alpha = Math.min(1, lady.alpha + 0.02);
          if (lady.alpha < 1) {
            requestAnimationFrame(fadeIn);
          }
        };
        requestAnimationFrame(fadeIn);
        await new Promise(res => setTimeout(res, 400));
      }
      
      // Asset 1 - Top center (smaller, lower)
      const asset1Texture = Assets.get('INTRO_1');
      if (asset1Texture) {
        const sprite = new Sprite(asset1Texture);
        sprite.anchor.set(0.5);
        sprite.scale.set(0.8);
        sprite.x = this.canvasWidth / 2;
        sprite.y = 200;
        this.container.addChild(sprite);
        this.layeredSprites.push(sprite);
        popIn(sprite);
        await new Promise(res => setTimeout(res, 500));
      }
      
      // Asset 2 - Below asset 1, to the left (slightly bigger)
      const asset2Texture = Assets.get('INTRO_2');
      if (asset2Texture) {
        const sprite = new Sprite(asset2Texture);
        sprite.anchor.set(0.5);
        sprite.scale.set(0.75);
        sprite.x = 180;
        sprite.y = 380;
        this.container.addChild(sprite);
        this.layeredSprites.push(sprite);
        popIn(sprite);
        await new Promise(res => setTimeout(res, 500));
      }
      
      // Asset 3 - To the right of asset 2 (slightly bigger, same size as asset 5)
      const asset3Texture = Assets.get('INTRO_3');
      if (asset3Texture) {
        const sprite = new Sprite(asset3Texture);
        sprite.anchor.set(0.5);
        sprite.scale.set(0.75);
        sprite.x = this.canvasWidth - 150;
        sprite.y = 450;
        this.container.addChild(sprite);
        this.layeredSprites.push(sprite);
        popIn(sprite);
        await new Promise(res => setTimeout(res, 500));
      }
      
      // Asset 4 - Under asset 1, a bit left (slightly bigger)
      const asset4Texture = Assets.get('INTRO_4');
      if (asset4Texture) {
        const sprite = new Sprite(asset4Texture);
        sprite.anchor.set(0.5);
        sprite.scale.set(0.75);
        sprite.x = (this.canvasWidth / 2) - 80;
        sprite.y = 620;
        this.container.addChild(sprite);
        this.layeredSprites.push(sprite);
        popIn(sprite);
        await new Promise(res => setTimeout(res, 500));
      }
      
      // Asset 5 - Below asset 3, to the right more (same size as asset 3)
      const asset5Texture = Assets.get('INTRO_5');
      if (asset5Texture) {
        const sprite = new Sprite(asset5Texture);
        sprite.anchor.set(0.5);
        sprite.scale.set(0.75);
        sprite.x = this.canvasWidth - 120;
        sprite.y = 700;
        this.container.addChild(sprite);
        this.layeredSprites.push(sprite);
        popIn(sprite);
        await new Promise(res => setTimeout(res, 500));
      }
      
      // Asset 6 - To the right of asset 7 (added after lady to appear in front, with jiggle)
      const asset6Texture = Assets.get('INTRO_6');
      if (asset6Texture) {
        const sprite = new Sprite(asset6Texture);
        sprite.anchor.set(0.5);
        sprite.scale.set(0.7);
        sprite.x = 350;
        sprite.y = this.canvasHeight - 150;
        
        // Make it interactive/clickable
        sprite.eventMode = 'static';
        sprite.cursor = 'pointer';
        sprite.on('pointerdown', async () => {
          if (this.isTransitioning) return; // Prevent double-click
          this.isTransitioning = true;
          
          // Disable button immediately
          sprite.eventMode = 'none';
          sprite.cursor = 'default';
          
          console.log('[IntroScene] Asset 6 clicked! Transitioning to PAGE 2...');
          const sceneManager = (window as any).sceneManager;
          if (sceneManager) {
            const { IntroTwoScene } = await import('./IntroTwoScene');
            await sceneManager.change(new IntroTwoScene(), 'none');
          }
        });
        
        // Debug: log when pointer enters/leaves
        sprite.on('pointerover', () => {
          console.log('[IntroScene] Pointer over Asset 6');
        });
        sprite.on('pointerout', () => {
          console.log('[IntroScene] Pointer out of Asset 6');
        });
        
        this.container.addChild(sprite);
        this.layeredSprites.push(sprite);
        console.log('[IntroScene] Asset 6 added - interactive:', sprite.eventMode, 'cursor:', sprite.cursor);
        popIn(sprite);
        jiggle(sprite); // Start continuous jiggle animation
        await new Promise(res => setTimeout(res, 400));
      }
    console.log('[IntroScene] All sprites added, total:', this.layeredSprites.length);
    // Wait before marking ready
    await new Promise(res => setTimeout(res, 1000));
    // Mark ready to advance once sequence completes
    this.ready = true;
    console.log('[IntroScene] Marked as ready');
    } catch (error) {
      console.error('[IntroScene] Error in init():', error);
      this.ready = true; // Mark as ready even on error to prevent hanging
    }
  }

  update() {}
  destroy() {
    // Remove all event listeners
    this.layeredSprites.forEach(sprite => {
      sprite.removeAllListeners();
    });
    
    for (const s of this.layeredSprites) s.destroy();
    this.container.removeChildren();
    this.container.removeAllListeners();
  }
  public isReady() { return this.ready; }
}
