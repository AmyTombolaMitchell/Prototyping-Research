import { Container, Sprite, Assets, Graphics } from 'pixi.js';
export class IntroTwoScene {
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
        Object.defineProperty(this, "pulsingGlow", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "asset2Sprite", {
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
        Object.defineProperty(this, "isTransitioning", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        }); // Prevent multiple clicks
    }
    async init() {
        console.log('[IntroTwoScene] Starting init');
        // Helper to animate pop/bounce for elements (same as page 1)
        const popIn = (sprite) => {
            sprite.alpha = 0;
            const originalScale = sprite.scale.x;
            sprite.scale.set(0);
            let frame = 0;
            const animate = () => {
                frame++;
                sprite.alpha = Math.min(1, sprite.alpha + 0.05);
                // Bounce effect - overshoot then settle
                const progress = frame / 50;
                let scale;
                if (progress < 0.5) {
                    scale = originalScale * (progress * 2.4);
                }
                else if (progress < 0.75) {
                    scale = originalScale * (1.2 - (progress - 0.5) * 0.8);
                }
                else {
                    scale = originalScale * (1.0 + (1.0 - progress) * 0.2);
                }
                sprite.scale.set(scale);
                if (frame < 50) {
                    requestAnimationFrame(animate);
                }
                else {
                    sprite.scale.set(originalScale);
                }
            };
            requestAnimationFrame(animate);
        };
        // Use PAGE 1 background
        const bgTexture = Assets.get('INTRO_BG');
        if (bgTexture) {
            const bg = new Sprite(bgTexture);
            bg.anchor.set(0.5);
            bg.x = this.canvasWidth / 2;
            bg.y = this.canvasHeight / 2;
            this.container.addChild(bg);
            this.layeredSprites.push(bg);
        }
        // Add TOP_BANNER at the top
        const topBannerTexture = Assets.get('INTRO2_TOP_BANNER');
        if (topBannerTexture) {
            const banner = new Sprite(topBannerTexture);
            banner.anchor.set(0.5, 0); // Anchor at top center
            banner.x = this.canvasWidth / 2;
            banner.y = 0; // At the very top
            this.container.addChild(banner);
            this.layeredSprites.push(banner);
        }
        // Add asset 7 (lady) from PAGE 1 - same position and size as page 1
        const ladyTexture = Assets.get('INTRO_7');
        if (ladyTexture) {
            const lady = new Sprite(ladyTexture);
            lady.anchor.set(0, 1);
            lady.x = 50;
            lady.y = this.canvasHeight - 63;
            lady.scale.set(0.7);
            this.container.addChild(lady);
            this.layeredSprites.push(lady);
        }
        // Add PAGE 2 asset 3 in the middle of the screen (appears first, smaller)
        const asset3Texture = Assets.get('INTRO2_3');
        if (asset3Texture) {
            const sprite = new Sprite(asset3Texture);
            sprite.anchor.set(0.5);
            sprite.scale.set(0.7); // Smaller
            sprite.x = this.canvasWidth / 2;
            sprite.y = this.canvasHeight / 2;
            this.container.addChild(sprite);
            this.layeredSprites.push(sprite);
            popIn(sprite);
            await new Promise(res => setTimeout(res, 500));
        }
        // Add PAGE 2 asset 2 to the right of asset 7 (appears second, clickable button)
        const asset2Texture = Assets.get('INTRO2_2');
        if (asset2Texture) {
            // Create pulsing red glow behind the button
            this.pulsingGlow = new Graphics();
            this.container.addChild(this.pulsingGlow);
            const sprite = new Sprite(asset2Texture);
            sprite.anchor.set(0.5);
            sprite.scale.set(0.8); // Slightly bigger
            sprite.x = 330; // Slightly to the left
            sprite.y = this.canvasHeight - 170; // Moved down a bit
            this.asset2Sprite = sprite;
            // Make it interactive/clickable
            sprite.eventMode = 'static';
            sprite.cursor = 'pointer';
            sprite.on('pointerdown', async () => {
                if (this.isTransitioning)
                    return; // Prevent double-click
                this.isTransitioning = true;
                // Disable button immediately
                sprite.eventMode = 'none';
                sprite.cursor = 'default';
                console.log('[IntroTwoScene] Roll button clicked! Transitioning to PAGE 3...');
                const sceneManager = window.sceneManager;
                if (sceneManager) {
                    const { DiceRollScene } = await import('./DiceRollScene');
                    await sceneManager.change(new DiceRollScene(), 'none');
                }
            });
            this.container.addChild(sprite);
            this.layeredSprites.push(sprite);
            popIn(sprite);
            await new Promise(res => setTimeout(res, 500));
        }
        console.log('[IntroTwoScene] All sprites added, total:', this.layeredSprites.length);
        // Wait before marking ready
        await new Promise(res => setTimeout(res, 1000));
        this.ready = true;
        console.log('[IntroTwoScene] Marked as ready');
    }
    update() {
        // Animate the pulsing red glow around Asset 2 (50% slower, smaller radius)
        if (this.pulsingGlow && this.asset2Sprite) {
            this.animationFrame++;
            // Clear previous drawing
            this.pulsingGlow.clear();
            // Create pulsing effect with oscillating radius (50% slower, smaller expansion)
            const baseRadius = 80;
            const pulse = Math.sin(this.animationFrame * 0.025) * 10; // Slower (0.05 -> 0.025), smaller expansion (30 -> 10)
            const radius = baseRadius + pulse;
            // Draw multiple circles for a soft glow effect
            const centerX = this.asset2Sprite.x;
            const centerY = this.asset2Sprite.y;
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
    destroy() {
        if (this.pulsingGlow)
            this.pulsingGlow.destroy();
        this.layeredSprites.forEach(sprite => {
            sprite.removeAllListeners();
        });
        for (const s of this.layeredSprites)
            s.destroy();
        this.container.removeChildren();
        this.container.removeAllListeners();
    }
    isReady() { return this.ready; }
}
