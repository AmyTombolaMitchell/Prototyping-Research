import { Container, Sprite, Assets } from 'pixi.js';
import { ASSETS } from '../assets';
export class WheelSpinScene {
    constructor() {
        Object.defineProperty(this, "container", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Container()
        });
        Object.defineProperty(this, "prizeShown", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "done", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "wheel", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "elapsed", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
    }
    async init() {
        const texture = await Assets.load(ASSETS.FTP_INSTANT_WIN_SPIN);
        this.wheel = new Sprite(texture);
        this.wheel.anchor.set(0.5);
        this.wheel.x = window.innerWidth / 2;
        this.wheel.y = window.innerHeight / 2;
        this.container.addChild(this.wheel);
    }
    update(delta) {
        if (this.done)
            return;
        if (!this.prizeShown) {
            this.elapsed += delta;
            // spin then slow down
            const spinTime = 240; // frames
            const t = Math.min(1, this.elapsed / spinTime);
            const speed = (1 - t) * 0.5 + 0.05;
            this.wheel.rotation += speed * delta * 0.1;
            if (t >= 1) {
                // show prize landing on 20
                this.prizeShown = true;
                this.showPrize();
            }
        }
    }
    async showPrize() {
        const texture = await Assets.load(ASSETS.FTP_INSTANT_WIN_PRIZE);
        const prize = new Sprite(texture);
        prize.anchor.set(0.5);
        prize.x = window.innerWidth / 2;
        prize.y = window.innerHeight / 2 + 250;
        this.container.addChild(prize);
        setTimeout(() => this.done = true, 2000);
    }
    destroy() { }
    isDone() { return this.done; }
}
