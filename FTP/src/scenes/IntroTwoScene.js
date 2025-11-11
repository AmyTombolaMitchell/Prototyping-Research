import { Container, Sprite, Assets } from 'pixi.js';
import { ASSETS } from '../assets';
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
    }
    async init() {
        const keys = ['INTRO2_BG', 'INTRO2_1', 'INTRO2_2', 'INTRO2_3'];
        const textures = {};
        for (const k of keys) {
            try {
                textures[k] = await Assets.load(ASSETS[k]);
            }
            catch (e) {
                console.error('IntroTwoScene failed to load', k, e);
            }
        }
        const bg = new Sprite(textures['INTRO2_BG']);
        bg.anchor.set(0.5);
        bg.x = window.innerWidth / 2;
        bg.y = window.innerHeight / 2;
        this.container.addChild(bg);
        const s1 = new Sprite(textures['INTRO2_1']);
        s1.anchor.set(0.5);
        s1.x = window.innerWidth / 2;
        s1.y = window.innerHeight / 2;
        this.container.addChild(s1);
        const popIn = (sprite) => {
            sprite.alpha = 0;
            sprite.scale.set(0.5);
            let frame = 0;
            const animate = () => {
                frame++;
                sprite.alpha = Math.min(1, sprite.alpha + 0.08);
                sprite.scale.set(Math.min(1, sprite.scale.x + 0.05));
                if (frame < 24)
                    requestAnimationFrame(animate);
            };
            requestAnimationFrame(animate);
        };
        const s2 = new Sprite(textures['INTRO2_2']);
        s2.anchor.set(0.5);
        s2.x = window.innerWidth / 2;
        s2.y = window.innerHeight / 2;
        this.container.addChild(s2);
        popIn(s2);
        await new Promise(r => setTimeout(r, 450));
        const s3 = new Sprite(textures['INTRO2_3']);
        s3.anchor.set(0.5);
        s3.x = window.innerWidth / 2;
        s3.y = window.innerHeight / 2;
        this.container.addChild(s3);
        popIn(s3);
        await new Promise(r => setTimeout(r, 450));
        this.ready = true;
    }
    update() { }
    destroy() { }
    isReady() { return this.ready; }
}
