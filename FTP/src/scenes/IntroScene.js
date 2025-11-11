import { Container, Sprite, Text, Assets } from 'pixi.js';
import { ASSETS } from '../assets';
import { createPoppingTextSequence } from '../utils/textPop';
export class IntroScene {
    constructor() {
        Object.defineProperty(this, "container", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Container()
        });
        Object.defineProperty(this, "playButton", {
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
        try {
            const texture = await Assets.load(ASSETS.FTP_INTRO);
            const bg = new Sprite(texture);
            bg.anchor.set(0.5);
            bg.x = window.innerWidth / 2;
            bg.y = window.innerHeight / 2;
            this.container.addChild(bg);
        }
        catch (e) {
            console.error('IntroScene background failed to load', e);
        }
        createPoppingTextSequence([
            'Welcome to Tombola\'s new free game',
            'Roll the dice'
        ], { onComplete: () => this.showButton() }, this.container);
    }
    showButton() {
        this.playButton = new Text('LET\'S PLAY', { fill: 0xffd700, fontSize: 42, fontWeight: '900' });
        this.playButton.anchor.set(0.5);
        this.playButton.x = window.innerWidth / 2;
        this.playButton.y = window.innerHeight / 2 + 150;
        this.playButton.eventMode = 'static';
        this.playButton.cursor = 'pointer';
        this.playButton.on('pointertap', () => {
            this.ready = true;
        });
        this.container.addChild(this.playButton);
    }
    update() { }
    destroy() { }
    isReady() { return this.ready; }
}
