import { Container } from 'pixi.js';

export interface IScene {
  container: Container;
  init(): Promise<void> | void;
  update(delta: number): void;
  destroy(): void;
}

export class SceneManager {
  private current: IScene | null = null;
  private root: Container;

  constructor(root: Container) {
    this.root = root;
  }

  async change(scene: IScene) {
    if (this.current) {
      this.current.destroy();
      this.root.removeChild(this.current.container);
    }
    this.current = scene;
    this.root.addChild(scene.container);
    await scene.init();
  }

  update(delta: number) {
    this.current?.update(delta);
  }
}
