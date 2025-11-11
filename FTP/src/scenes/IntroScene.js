import { Container, Sprite, Assets } from 'pixi.js';
import { ASSETS } from '../assets';
export class IntroScene {
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
    }
    async init() {
        const order = ['INTRO_BG', 'INTRO_8', 'INTRO_9', 'INTRO_7', 'INTRO_1', 'INTRO_2', 'INTRO_3', 'INTRO_4', 'INTRO_5'];
        const textures = {};
        for (const key of order) {
            try {
                textures[key] = await Assets.load(ASSETS[key]);
            }
            catch (e) {
                console.error('Failed to load intro asset', key, e);
            }
        }
        const popIn = (sprite) => {
            sprite.alpha = 0;
            sprite.scale.set(0.5);
            let frame = 0;
            const animate = () => {
                frame++;
                sprite.alpha = Math.min(1, sprite.alpha + 0.08);
                const nextScale = Math.min(1, sprite.scale.x + 0.05);
                sprite.scale.set(nextScale);
                if (frame < 24)
                    requestAnimationFrame(animate);
            };
            requestAnimationFrame(animate);
        };
        for (let i = 0; i < order.length; i++) {
            const key = order[i];
            const s = new Sprite(textures[key]);
            s.anchor.set(0.5);
            s.x = window.innerWidth / 2;
            s.y = window.innerHeight / 2;
            this.container.addChild(s);
            popIn(s);
            if (i < order.length - 1) {
                await new Promise(r => setTimeout(r, i === 0 ? 200 : 450));
            }
        }
        this.ready = true;
    }
    update() { }
    destroy() { }
    isReady() { return this.ready; }
}
