import { Container, Sprite, Assets } from 'pixi.js';
export class IntroSplashScene {
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
    }
    async init() {
        console.log('[IntroSplashScene] init() called');
        // Show BACKGROUND_intro centered
        const splashTexture = Assets.get('BACKGROUND_intro');
        if (splashTexture) {
            const splash = new Sprite(splashTexture);
            splash.anchor.set(0.5);
            splash.x = this.canvasWidth / 2;
            splash.y = this.canvasHeight / 2;
            this.container.addChild(splash);
            // Wait 2 seconds
            await new Promise(res => setTimeout(res, 2000));
            this.container.removeChild(splash);
            splash.destroy();
        }
        // Transition to the main intro scene
        const sceneManager = window.sceneManager;
        if (sceneManager) {
            const { IntroScene } = await import('./IntroScene');
            await sceneManager.change(new IntroScene(), 'none');
        }
        this.ready = true;
    }
    update() { }
    destroy() {
        this.container.removeChildren();
        this.container.removeAllListeners();
    }
    isReady() { return this.ready; }
}
