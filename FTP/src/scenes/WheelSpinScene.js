import { Container, Sprite, Text, Assets, Graphics } from 'pixi.js';
export class WheelSpinScene {
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
        Object.defineProperty(this, "wheel", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "wheelBackground", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "topBanner", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "isSpinning", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "elementsToDestroy", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "spotlight", {
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
    }
    async init() {
        console.log('[WheelSpinScene] Starting init');
        // Add PAGE 4 background
        const bgTexture = Assets.get('PAGE4_BG');
        if (bgTexture) {
            const bg = new Sprite(bgTexture);
            bg.anchor.set(0.5);
            bg.x = this.canvasWidth / 2;
            bg.y = this.canvasHeight / 2;
            this.container.addChild(bg);
            this.layeredSprites.push(bg);
        }
        // Add TOP_BANNER from PAGE 3 at the top
        const topBannerTexture = Assets.get('PAGE3_TOP_BANNER');
        if (topBannerTexture) {
            this.topBanner = new Sprite(topBannerTexture);
            this.topBanner.anchor.set(0.5, 0);
            this.topBanner.x = this.canvasWidth / 2;
            this.topBanner.y = 0;
            this.container.addChild(this.topBanner);
            this.layeredSprites.push(this.topBanner);
        }
        // Add WHEELBACKGROUND in lower middle
        const wheelBgTexture = Assets.get('PAGE4_WHEELBACKGROUND');
        if (wheelBgTexture) {
            this.wheelBackground = new Sprite(wheelBgTexture);
            this.wheelBackground.anchor.set(0.5);
            this.wheelBackground.x = this.canvasWidth / 2;
            this.wheelBackground.y = this.canvasHeight - 400; // Lower middle of screen
            this.wheelBackground.scale.set(1.2); // Make it bigger
            this.container.addChild(this.wheelBackground);
            this.layeredSprites.push(this.wheelBackground);
            console.log('[WheelSpinScene] Wheel background added at', this.wheelBackground.x, this.wheelBackground.y);
        }
        // Add WHEEL on top of wheel background - this will spin
        const wheelTexture = Assets.get('PAGE4_WHEEL');
        if (wheelTexture) {
            this.wheel = new Sprite(wheelTexture);
            this.wheel.anchor.set(0.5);
            this.wheel.x = this.canvasWidth / 2;
            this.wheel.y = this.canvasHeight - 400; // Same position as wheel background
            this.container.addChild(this.wheel);
            this.layeredSprites.push(this.wheel);
        }
        // Add LOGO above the wheel
        const logoTexture = Assets.get('PAGE4_LOGO');
        if (logoTexture) {
            const logo = new Sprite(logoTexture);
            logo.anchor.set(0.5);
            logo.scale.set(0.8); // Make it a bit smaller
            logo.x = this.canvasWidth / 2;
            logo.y = this.canvasHeight - 850; // Moved up even more
            this.container.addChild(logo);
            this.layeredSprites.push(logo);
        }
        // Add SUPERSPINSLOGOSMALL in bottom right corner
        const smallLogoTexture = Assets.get('PAGE4_SUPERSPINSLOGOSMALL');
        if (smallLogoTexture) {
            const smallLogo = new Sprite(smallLogoTexture);
            smallLogo.anchor.set(1, 1); // Anchor to bottom-right of sprite
            smallLogo.x = this.canvasWidth - 20; // 20px from right edge
            smallLogo.y = this.canvasHeight - 80; // Moved up higher
            this.container.addChild(smallLogo);
            this.layeredSprites.push(smallLogo);
        }
        // Pause, then animate the wheel
        await this.animateWheel();
        console.log('[WheelSpinScene] All sprites added');
        this.ready = true;
        console.log('[WheelSpinScene] Marked as ready');
    }
    async animateWheel() {
        if (!this.wheel)
            return;
        // Step 1: Pause for 1 second
        await this.wait(1000);
        // Step 2: Build-up animation - wheel grows bigger
        await this.buildUpAnimation();
        // Step 3: Spin the wheel
        await this.spinWheel();
        // Step 4: Make wheel and background disappear
        await this.hideWheel();
        // Step 5: Show coins and win text
        await this.showWinResult();
    }
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async buildUpAnimation() {
        if (!this.wheel)
            return;
        const originalScale = 1.0;
        const targetScale = 1.15; // Grow 15% bigger
        const duration = 1000; // milliseconds (was 60 frames, now 1000ms)
        const startTime = Date.now();
        return new Promise((resolve) => {
            const animate = () => {
                if (!this.wheel)
                    return;
                const elapsed = Date.now() - startTime;
                const progress = Math.min(1, elapsed / duration);
                // Ease in-out for smooth growth
                const easeProgress = progress < 0.5
                    ? 2 * progress * progress
                    : 1 - Math.pow(-2 * progress + 2, 2) / 2;
                // Scale up
                const scale = originalScale + (targetScale - originalScale) * easeProgress;
                this.wheel.scale.set(scale);
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
                else {
                    this.wheel.scale.set(targetScale);
                    resolve();
                }
            };
            requestAnimationFrame(animate);
        });
    }
    async spinWheel() {
        if (!this.wheel)
            return;
        this.isSpinning = true;
        // The wheel is currently showing 20 at the top, so we want to end at rotation 0
        const fullSpins = 20; // More rotations for a longer, more dramatic spin
        const targetRotation = 0; // Land at current position (20 at top)
        const totalRotation = (fullSpins * Math.PI * 2) + targetRotation;
        // Multi-phase animation: slow start, moderate middle, very slow ticking end
        const warmUpDuration = 3000; // 3 seconds to slowly speed up
        const steadySpinDuration = 7000; // 7 seconds of steady moderate spinning
        const slowDownDuration = 15000; // 15 seconds to slow down very gradually with ticking effect
        const totalDuration = warmUpDuration + steadySpinDuration + slowDownDuration;
        const startTime = Date.now();
        return new Promise((resolve) => {
            const animate = () => {
                if (!this.wheel)
                    return;
                const elapsed = Date.now() - startTime;
                const progress = Math.min(1, elapsed / totalDuration);
                let rotationProgress = 0;
                if (elapsed <= warmUpDuration) {
                    // Phase 1: Slow start - speed up gradually (ease in cubic)
                    const phaseProgress = elapsed / warmUpDuration;
                    const easeIn = phaseProgress * phaseProgress * phaseProgress; // Cubic for slower start
                    rotationProgress = easeIn * 0.1; // Only 10% of total rotation during warmup (2 spins)
                }
                else if (elapsed <= warmUpDuration + steadySpinDuration) {
                    // Phase 2: Steady moderate spin
                    const phaseProgress = (elapsed - warmUpDuration) / steadySpinDuration;
                    rotationProgress = 0.1 + (phaseProgress * 0.6); // 60% during steady spin (12 spins, total 70%)
                }
                else {
                    // Phase 3: Slow down with same gradual speed as warmup (ease out cubic)
                    const phaseProgress = (elapsed - warmUpDuration - steadySpinDuration) / slowDownDuration;
                    const easeOut = 1 - Math.pow(1 - phaseProgress, 3); // Cubic for same gradual speed as start
                    rotationProgress = 0.7 + (easeOut * 0.3); // Final 30% during slowdown (6 spins over 15 seconds)
                }
                // Apply rotation
                this.wheel.rotation = totalRotation * rotationProgress;
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
                else {
                    // Ensure final rotation is exact
                    this.wheel.rotation = targetRotation;
                    this.isSpinning = false;
                    resolve();
                }
            };
            requestAnimationFrame(animate);
        });
    }
    async hideWheel() {
        // Fade out and hide the wheel and wheel background
        const duration = 500; // milliseconds (was 30 frames, now 500ms)
        const startTime = Date.now();
        return new Promise((resolve) => {
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(1, elapsed / duration);
                // Fade out
                const alpha = 1 - progress;
                if (this.wheel)
                    this.wheel.alpha = alpha;
                if (this.wheelBackground)
                    this.wheelBackground.alpha = alpha;
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
                else {
                    // Make completely invisible
                    if (this.wheel)
                        this.wheel.visible = false;
                    if (this.wheelBackground)
                        this.wheelBackground.visible = false;
                    resolve();
                }
            };
            requestAnimationFrame(animate);
        });
    }
    async showWinResult() {
        // Change banner to TOP_BANNER_AFTER
        if (this.topBanner) {
            const afterBannerTexture = Assets.get('PAGE4_TOP_BANNER_AFTER');
            if (afterBannerTexture) {
                this.topBanner.texture = afterBannerTexture;
            }
        }
        // Create pulsing white spotlight behind where coins will appear
        this.spotlight = new Graphics();
        this.container.addChild(this.spotlight);
        this.elementsToDestroy.push(this.spotlight);
        // Add COINS asset
        const coinsTexture = Assets.get('PAGE4_COINS');
        if (coinsTexture) {
            const coins = new Sprite(coinsTexture);
            coins.anchor.set(0.5);
            coins.x = this.canvasWidth / 2;
            coins.y = this.canvasHeight - 600; // Position for coins
            coins.alpha = 0; // Start invisible
            this.container.addChild(coins);
            this.elementsToDestroy.push(coins);
            // Pop in animation for coins
            await this.popIn(coins);
        }
        // Add "You Won 20 Tokens!" text below the coins
        const winText = new Text({
            text: 'You Won 20 Tokens!',
            style: {
                fontFamily: 'Arial',
                fontSize: 52,
                fontWeight: 'bold',
                fill: 0xFFFFFF,
                stroke: { color: 0x114A59, width: 8 },
                align: 'center'
            }
        });
        winText.anchor.set(0.5);
        winText.x = this.canvasWidth / 2;
        winText.y = this.canvasHeight - 400; // Below the coins
        winText.alpha = 0; // Start invisible
        this.container.addChild(winText);
        this.elementsToDestroy.push(winText);
        // Pop in animation for text
        await this.popIn(winText);
        // Wait a few seconds then auto-transition to PAGE 5
        await this.wait(3000);
        if (this.isTransitioning)
            return; // Prevent double-transition
        this.isTransitioning = true;
        console.log('[WheelSpinScene] Auto-transitioning to PAGE 5...');
        const sceneManager = window.sceneManager;
        if (sceneManager) {
            const { MessageScene } = await import('./MessageScene');
            await sceneManager.change(new MessageScene(), 'none');
        }
    }
    async popIn(sprite) {
        const duration = 500; // milliseconds (was 30 frames, now 500ms)
        const startTime = Date.now();
        return new Promise((resolve) => {
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(1, elapsed / duration);
                // Bounce effect with scale and alpha
                const bounce = Math.sin(progress * Math.PI);
                const scale = 0.5 + (bounce * 0.7); // Scale from 0.5 to 1.2 and back to 1
                const alpha = progress;
                sprite.scale.set(scale);
                sprite.alpha = alpha;
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
                else {
                    sprite.scale.set(1);
                    sprite.alpha = 1;
                    resolve();
                }
            };
            requestAnimationFrame(animate);
        });
    }
    update() {
        // Animate the spotlight with pulsing effect (slower)
        if (this.spotlight) {
            this.animationFrame++;
            // Clear previous drawing
            this.spotlight.clear();
            // Create pulsing effect with oscillating radius (slower)
            const baseRadius = 150;
            const pulse = Math.sin(this.animationFrame * 0.02) * 20; // Slower - was 0.03, now 0.02
            const radius = baseRadius + pulse;
            // Draw multiple circles for a soft glow effect
            const centerX = this.canvasWidth / 2;
            const centerY = this.canvasHeight - 600; // Match coins position
            // Outer glow (most transparent)
            this.spotlight.circle(centerX, centerY, radius * 1.2);
            this.spotlight.fill({ color: 0xFFFFFF, alpha: 0.1 });
            // Middle glow
            this.spotlight.circle(centerX, centerY, radius * 0.8);
            this.spotlight.fill({ color: 0xFFFFFF, alpha: 0.2 });
            // Inner glow (brightest)
            this.spotlight.circle(centerX, centerY, radius * 0.5);
            this.spotlight.fill({ color: 0xFFFFFF, alpha: 0.3 });
        }
    }
    destroy() {
        this.layeredSprites.forEach(sprite => {
            sprite.removeAllListeners();
        });
        for (const s of this.layeredSprites)
            s.destroy();
        for (const el of this.elementsToDestroy)
            el.destroy();
        this.container.removeChildren();
        this.container.removeAllListeners();
    }
    isReady() { return this.ready; }
}
