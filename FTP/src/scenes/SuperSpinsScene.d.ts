import { Container } from 'pixi.js';

export declare class SuperSpinsScene {
  container: Container;
  init(): Promise<void>;
  update(delta: number): void;
  destroy(): void;
  isReady(): boolean;
}
