import { Container, Sprite, Assets } from 'pixi.js';
import { ASSETS } from '../assets';
export class FinishSequenceScene {
    constructor() {
        Object.defineProperty(this, "container", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Container()
        });
        Object.defineProperty(this, "index", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "sprites", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "done", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
    }
    async init() {
        const keys = [ASSETS.FTP_FINISH_1, ASSETS.FTP_FINISH_2, ASSETS.FTP_FINISH_3];
        for (const k of keys) {
            const tex = await Assets.load(k);
            const s = new Sprite(tex);
            s.anchor.set(0.5);
            s.x = window.innerWidth / 2;
            s.y = window.innerHeight / 2;
            s.visible = false;
            this.container.addChild(s);
            this.sprites.push(s);
        }
        this.sprites[0].visible = true;
        let step = 0;
        const advance = () => {
            step++;
            if (step < this.sprites.length) {
                this.sprites.forEach((s, i) => s.visible = i === step);
                setTimeout(advance, 1500);
            }
            else {
                this.done = true;
            }
        };
        setTimeout(advance, 1500);
    }
    update() { }
    destroy() { }
    isDone() { return this.done; }
}
