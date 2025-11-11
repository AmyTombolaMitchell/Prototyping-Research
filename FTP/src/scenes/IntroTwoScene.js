import { Container, Sprite, Text, Assets } from 'pixi.js';
import { ASSETS } from '../assets';
export class IntroTwoScene {
    constructor() {
        Object.defineProperty(this, "container", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Container()
        });
        Object.defineProperty(this, "rollButton", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "ready", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
    }
    async init() {
        const texture = await Assets.load(ASSETS.FTP_INTRO_TWO);
        const bg = new Sprite(texture);
        bg.anchor.set(0.5);
        bg.x = window.innerWidth / 2;
        bg.y = window.innerHeight / 2;
        this.container.addChild(bg);
        this.rollButton = new Text('ROLL DICE', { fill: 0xffffff, fontSize: 48, fontWeight: 'bold' });
        this.rollButton.anchor.set(0.5);
        this.rollButton.x = window.innerWidth / 2;
        this.rollButton.y = window.innerHeight / 2 + 180;
        this.rollButton.eventMode = 'static';
        this.rollButton.cursor = 'pointer';
        this.rollButton.on('pointertap', () => this.ready = true);
        this.container.addChild(this.rollButton);
    }
    update() { }
    destroy() { }
    isReady() { return this.ready; }
}
