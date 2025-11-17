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
        Object.defineProperty(this, "scenes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        this.root = root;
    }
    register(name, scene) {
        this.scenes.set(name, scene);
    }
    async change(sceneOrName, transition = 'slide') {
        console.log('[SceneManager] Changing scene with transition:', transition);
        const oldScene = this.current;
        // Get scene either from parameter or from registry
        let scene;
        if (typeof sceneOrName === 'string') {
            const registeredScene = this.scenes.get(sceneOrName);
            if (!registeredScene) {
                console.error('[SceneManager] Scene not found:', sceneOrName);
                return;
            }
            scene = registeredScene;
        }
        else {
            scene = sceneOrName;
        }
        // Add new scene
        this.current = scene;
        this.root.addChild(scene.container);
        // Initialize new scene
        console.log('[SceneManager] Calling scene.init()');
        try {
            await scene.init();
            console.log('[SceneManager] Scene init() complete');
        }
        catch (error) {
            console.error('[SceneManager] Error during scene.init():', error);
        }
        // Apply transition
        if (oldScene && transition !== 'none') {
            if (transition === 'slide') {
                await this.slideTransition(oldScene.container, scene.container);
            }
            else if (transition === 'fade') {
                await this.fadeTransition(oldScene.container, scene.container);
            }
        }
        // Clean up old scene
        if (oldScene) {
            oldScene.destroy();
            this.root.removeChild(oldScene.container);
        }
    }
    async slideTransition(oldContainer, newContainer) {
        const duration = 30; // ~0.5 seconds
        const canvasWidth = 572;
        // Start new scene off to the right
        newContainer.x = canvasWidth;
        return new Promise((resolve) => {
            let frame = 0;
            const animate = () => {
                frame++;
                const progress = frame / duration;
                // Ease out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                // Slide old scene to the left
                oldContainer.x = -canvasWidth * eased;
                // Slide new scene in from the right
                newContainer.x = canvasWidth * (1 - eased);
                if (frame < duration) {
                    requestAnimationFrame(animate);
                }
                else {
                    newContainer.x = 0;
                    resolve();
                }
            };
            requestAnimationFrame(animate);
        });
    }
    async fadeTransition(oldContainer, newContainer) {
        const duration = 20; // ~0.33 seconds
        newContainer.alpha = 0;
        return new Promise((resolve) => {
            let frame = 0;
            const animate = () => {
                frame++;
                const progress = frame / duration;
                oldContainer.alpha = 1 - progress;
                newContainer.alpha = progress;
                if (frame < duration) {
                    requestAnimationFrame(animate);
                }
                else {
                    newContainer.alpha = 1;
                    resolve();
                }
            };
            requestAnimationFrame(animate);
        });
    }
    update(delta) {
        this.current?.update(delta);
    }
}
