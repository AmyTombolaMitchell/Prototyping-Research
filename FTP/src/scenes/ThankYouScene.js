import { Container, Text } from 'pixi.js';
export class ThankYouScene {
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
        console.log('[ThankYouScene] Starting init');
        // Create a simple black background
        this.container.interactive = true;
        // Add thank you message
        const thankYouText = new Text({
            text: 'Thank you for taking part in this research\n\nPlease return to the User Testing page',
            style: {
                fontFamily: 'Arial',
                fontSize: 32,
                fontWeight: 'bold',
                fill: 0xFFFFFF,
                align: 'center',
                wordWrap: true,
                wordWrapWidth: this.canvasWidth - 80
            }
        });
        thankYouText.anchor.set(0.5);
        thankYouText.x = this.canvasWidth / 2;
        thankYouText.y = this.canvasHeight / 2;
        this.container.addChild(thankYouText);
        this.ready = true;
        console.log('[ThankYouScene] Init complete');
    }
    isReady() {
        return this.ready;
    }
    update() { }
    destroy() {
        this.container.removeChildren();
    }
}
