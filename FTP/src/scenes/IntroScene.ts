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

      // Helper to animate pop/bounce for elements (slower)
      const popIn = (sprite: Sprite): Promise<void> => {
        return new Promise((resolve) => {
          sprite.alpha = 0;
          const originalScale = sprite.scale.x;
          sprite.scale.set(0);
          let frame = 0;
          const totalFrames = 90; // Slower animation (was 50)
          const animate = () => {
            frame++;
            sprite.alpha = Math.min(1, sprite.alpha + 0.02); // Slower fade-in

            // Bounce effect - overshoot then settle
            const progress = frame / totalFrames;
            let scale;
            if (progress < 0.5) {
              scale = originalScale * (progress * 2.4);
            } else if (progress < 0.75) {
              scale = originalScale * (1.2 - (progress - 0.5) * 0.8);
            } else {
              scale = originalScale * (1.0 + (1.0 - progress) * 0.2);
            }
            sprite.scale.set(scale);
            if (frame < totalFrames) {
              requestAnimationFrame(animate);
            } else {
              sprite.scale.set(originalScale);
              resolve();
            }
          };
          requestAnimationFrame(animate);
        });
      };
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
        const fadeIn = (): Promise<void> => {
          return new Promise((resolve) => {
            let frame = 0;
            const animate = () => {
              frame++;
              lady.alpha = Math.min(1, lady.alpha + 0.02);
              if (lady.alpha < 1) {
                requestAnimationFrame(animate);
              } else {
                resolve();
              }
            };
            requestAnimationFrame(animate);
          });
        };
        await fadeIn();
        await new Promise(res => setTimeout(res, 400));
      }

      // Asset 1 - Top center (smaller, lower)
      const asset1Texture = Assets.get('INTRO_1');
      if (asset1Texture) {
        const sprite = new Sprite(asset1Texture);
        sprite.anchor.set(0.5);
          sprite.scale.set(0.75);
        sprite.x = this.canvasWidth / 2;
        sprite.y = 200;
        this.container.addChild(sprite);
        this.layeredSprites.push(sprite);
        await popIn(sprite);
      }

      // Asset 2 - Below asset 1, to the left (slightly bigger)
      const asset2Texture = Assets.get('INTRO_2');
      if (asset2Texture) {
        const sprite = new Sprite(asset2Texture);
        sprite.anchor.set(0.5);
          sprite.scale.set(0.75);
  console.log('[IntroScene] Banner created:', sprite.texture, 'scale:', sprite.scale.x);
        sprite.x = 180;
        sprite.y = 380;
        this.container.addChild(sprite);
        this.layeredSprites.push(sprite);
        await popIn(sprite);
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
        await popIn(sprite);
      }

      // Asset 4 - Under asset 1, a bit left (slightly bigger)
      let asset4Sprite: Sprite | null = null;
      const asset4Texture = Assets.get('INTRO_4');
      if (asset4Texture) {
        asset4Sprite = new Sprite(asset4Texture);
        asset4Sprite.anchor.set(0.5);
        asset4Sprite.scale.set(0.75);
        asset4Sprite.x = (this.canvasWidth / 2) - 80;
        asset4Sprite.y = 620;
        this.container.addChild(asset4Sprite);
        this.layeredSprites.push(asset4Sprite);
        await popIn(asset4Sprite);
      }

      // Asset 5 - Below asset 3, to the right more (same size as asset 3)
      let asset5Sprite: Sprite | null = null;
      let asset5Tex = Assets.get('INTRO_5');
      if (asset5Tex) {
        asset5Sprite = new Sprite(asset5Tex);
        asset5Sprite.anchor.set(0.5);
        asset5Sprite.scale.set(0.75);
        asset5Sprite.x = this.canvasWidth - 120;
        asset5Sprite.y = 700;
        this.container.addChild(asset5Sprite);
        this.layeredSprites.push(asset5Sprite);
        await popIn(asset5Sprite);
      }

      // ...existing code...

      // Asset 6 - To the right of asset 7 (added after lady to appear in front, with jiggle)
      let asset6Sprite: Sprite | null = null;
      const asset6Texture = Assets.get('INTRO_6');
      if (asset6Texture) {
        asset6Sprite = new Sprite(asset6Texture);
        asset6Sprite.anchor.set(0.5);
        asset6Sprite.scale.set(0.7);
        asset6Sprite.x = 350;
        asset6Sprite.y = this.canvasHeight - 150;

        // Initially not interactive
        asset6Sprite.eventMode = 'none';
        asset6Sprite.cursor = 'default';

        // Debug: log when pointer enters/leaves
        asset6Sprite.on('pointerover', () => {
          console.log('[IntroScene] Pointer over Asset 6');
        });
        asset6Sprite.on('pointerout', () => {
          console.log('[IntroScene] Pointer out of Asset 6');
        });

        this.container.addChild(asset6Sprite);
        this.layeredSprites.push(asset6Sprite);
        console.log('[IntroScene] Asset 6 added - interactive:', asset6Sprite.eventMode, 'cursor:', asset6Sprite.cursor);
        await popIn(asset6Sprite);
        jiggle(asset6Sprite); // Start continuous jiggle animation
      }

      // Only enable banner click after ALL assets have loaded and animated
      const page5Asset4 = Assets.get('PAGE5_4');
      const page5Asset5 = Assets.get('PAGE5_5');
      const self = this;
      if (page5Asset4 && page5Asset5 && asset6Sprite && asset4Sprite && asset5Sprite) {
        // Wait a bit longer to ensure all pop-ins are visually complete
        await new Promise(res => setTimeout(res, 600));
        asset6Sprite.eventMode = 'static';
        asset6Sprite.cursor = 'pointer';
        asset6Sprite.on('pointerdown', async () => {
          if (self.isTransitioning) return; // Prevent double-click
          self.isTransitioning = true;
          asset6Sprite.eventMode = 'none';
          asset6Sprite.cursor = 'default';
          console.log('[IntroScene] Asset 6 clicked! Transitioning to PAGE 2...');
          const sceneManager = (window as any).sceneManager;
          if (sceneManager) {
            const { IntroTwoScene } = await import('./IntroTwoScene');
            await sceneManager.change(new IntroTwoScene(), 'none');
          }
        });
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