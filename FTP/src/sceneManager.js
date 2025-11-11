export class SceneManager {
    constructor(root) {
        Object.defineProperty(this, "current", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "root", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.root = root;
    }
    async change(scene) {
        if (this.current) {
            this.current.destroy();
            this.root.removeChild(this.current.container);
        }
        this.current = scene;
        this.root.addChild(scene.container);
        await scene.init();
    }
    update(delta) {
        this.current?.update(delta);
    }
}
