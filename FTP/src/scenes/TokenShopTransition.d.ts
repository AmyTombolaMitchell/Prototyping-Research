import { Container } from 'pixi.js';

export declare class TokenShopTransition {
  container: Container;
  init(): Promise<void>;
  update(delta: number): void;
  destroy(): void;
  isReady(): boolean;
}
