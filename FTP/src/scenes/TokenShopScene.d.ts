import { Container } from 'pixi.js';

export declare class TokenShopScene {
  container: Container;
  init(): Promise<void>;
  update(delta: number): void;
  destroy(): void;
  isReady(): boolean;
}
