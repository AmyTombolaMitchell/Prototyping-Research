import { Container, Sprite, Assets, Graphics, Text } from 'pixi.js';
import type { IScene } from '../sceneManager';
import { ASSETS } from '../assets';

export class DiceRollScene implements IScene {
  container = new Container();
  private ready = false;
  private layeredSprites: Sprite[] = [];
  private readonly canvasWidth = 572;
  private readonly canvasHeight = 1247;
  private avatar: Sprite | null = null;
  private spotlight: Graphics | null = null;
  private winText: Text | null = null;
  private currentPosition = 0;
  private elementsToDestroy: (Sprite | Graphics | Text)[] = [];
  
  // Path positions for avatar movement
  private readonly pathPositions = [
    { x: 266, y: 1087 }, // Starting position (current avatar position)
    { x: 97, y: 1020 },  // Position 1
    { x: 279, y: 912 },  // Position 2
    { x: 458, y: 882 },  // Position 3
    { x: 459, y: 722 },  // Position 4
    { x: 315, y: 664 }   // Position 5
  ];

  async init() {
    console.log('[DiceRollScene] Starting init');
    
    // Add PAGE 3 background
    const bgTexture = Assets.get('PAGE3_BG');
    if (bgTexture) {
      const bg = new Sprite(bgTexture);
      bg.anchor.set(0.5);
      bg.x = this.canvasWidth / 2;
      bg.y = this.canvasHeight / 2;
      this.container.addChild(bg);
      this.layeredSprites.push(bg);
    }
    
    // Add TOP_BANNER at the top
    const topBannerTexture = Assets.get('PAGE3_TOP_BANNER');
    if (topBannerTexture) {
      const banner = new Sprite(topBannerTexture);
      banner.anchor.set(0.5, 0);
      banner.x = this.canvasWidth / 2;
      banner.y = 0;
      this.container.addChild(banner);
      this.layeredSprites.push(banner);
    }
    
    // Add AVATAR at starting position
    const avatarTexture = Assets.get('PAGE3_AVATAR');
    if (avatarTexture) {
      this.avatar = new Sprite(avatarTexture);
      this.avatar.anchor.set(0.5, 1);
      this.avatar.scale.set(0.75);
      this.avatar.x = this.pathPositions[0].x;
      this.avatar.y = this.pathPositions[0].y;
      this.container.addChild(this.avatar);
      this.layeredSprites.push(this.avatar);
    }
    
    // Create animated dice rolling effect
    await this.animateDiceRoll();
    
    // After dice roll, move avatar along the path
    await this.moveAvatarAlongPath();
    
    // Wait 3 seconds then auto-transition to PAGE 4
    await this.wait(3000);
    
    console.log('[DiceRollScene] Auto-transitioning to PAGE 4...');
    const sceneManager = (window as any).sceneManager;
    if (sceneManager) {
      const { WheelSpinScene } = await import('./WheelSpinScene');
      await sceneManager.change(new WheelSpinScene(), 'none');
    }
    
    console.log('[DiceRollScene] All sprites added');
    console.log('[DiceRollScene] 👉 Click anywhere on the screen to see coordinates in console');
    this.ready = true;
    console.log('[DiceRollScene] Marked as ready');
  }
  
  private async moveAvatarAlongPath() {
    if (!this.avatar) return;
    
    // Move through positions 1-5 (skipping 0 which is the starting position)
    for (let i = 1; i < this.pathPositions.length; i++) {
      await this.jumpToPosition(i);
      await this.wait(450); // 50% slower - was 300ms, now 450ms
    }
  }
  
  private async jumpToPosition(positionIndex: number) {
    if (!this.avatar || positionIndex >= this.pathPositions.length) return;
    
    const target = this.pathPositions[positionIndex];
    const startX = this.avatar.x;
    const startY = this.avatar.y;
    const duration = 45; // 50% slower - was 30 frames, now 45 frames
    
    return new Promise<void>((resolve) => {
      let frame = 0;
      const animate = () => {
        frame++;
        const progress = frame / duration;
        
        // Ease out cubic for smooth landing
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        // Move towards target
        this.avatar!.x = startX + (target.x - startX) * easeProgress;
        this.avatar!.y = startY + (target.y - startY) * easeProgress;
        
        // Add jump arc (parabola)
        const jumpHeight = 60;
        const arc = Math.sin(progress * Math.PI) * jumpHeight;
        this.avatar!.y -= arc;
        
        if (frame < duration) {
          requestAnimationFrame(animate);
        } else {
          // Ensure final position is exact
          this.avatar!.x = target.x;
          this.avatar!.y = target.y;
          this.currentPosition = positionIndex;
          
          // If we reached position 5, show the spotlight animation
          if (positionIndex === 5) {
            this.showSpotlight();
          }
          
          resolve();
        }
      };
      requestAnimationFrame(animate);
    });
  }
  
  private showSpotlight() {
    if (!this.avatar) return;
    
    // Create a circular spotlight using Graphics
    this.spotlight = new Graphics();
    
    // Position it behind the avatar
    const avatarIndex = this.container.getChildIndex(this.avatar);
    this.container.addChildAt(this.spotlight, avatarIndex);
    
    // Create "Instant Win" text above the avatar
    this.winText = new Text({
      text: 'Instant Win!',
      style: {
        fontFamily: 'Arial',
        fontSize: 48,
        fontWeight: 'bold',
        fill: 0xFFFFFF,
        stroke: { color: 0x000000, width: 6 },
        align: 'center'
      }
    });
    this.winText.anchor.set(0.5);
    this.winText.x = this.avatar.x;
    this.winText.y = this.avatar.y - 150; // Position above avatar
    this.container.addChild(this.winText);
    this.elementsToDestroy.push(this.winText);
    
    // Animate the spotlight with pulsing effect
    let frame = 0;
    const animate = () => {
      if (!this.spotlight || !this.avatar) return;
      
      frame++;
      
      // Pulsing scale and alpha - much slower animation (50% slower)
      const pulse = Math.sin(frame * 0.02) * 0.3 + 0.7; // slower oscillation - was 0.03, now 0.02
      const radius = 150 * pulse; // much bigger radius
      const alpha = 0.6 * pulse;
      
      // Pulse the text scale and alpha
      if (this.winText) {
        const textPulse = Math.sin(frame * 0.02) * 0.2 + 1.0; // oscillates between 0.8 and 1.2 - was 0.03, now 0.02
        this.winText.scale.set(textPulse);
        this.winText.alpha = pulse;
      }
      
      // Clear and redraw the spotlight
      this.spotlight.clear();
      
      // Draw radial gradient effect with multiple circles - white focused
      this.spotlight.circle(this.avatar.x, this.avatar.y - 50, radius);
      this.spotlight.fill({ color: 0xFFFFFF, alpha: alpha * 0.3 }); // White outer glow
      
      this.spotlight.circle(this.avatar.x, this.avatar.y - 50, radius * 0.7);
      this.spotlight.fill({ color: 0xFFFFFF, alpha: alpha * 0.6 }); // White middle
      
      this.spotlight.circle(this.avatar.x, this.avatar.y - 50, radius * 0.4);
      this.spotlight.fill({ color: 0xFFFFFF, alpha: alpha * 0.9 }); // Bright white core
      
      requestAnimationFrame(animate);
    };
    animate();
  }
  
  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  private async animateDiceRoll() {
    // Create a dice sprite (we'll rotate and scale it to simulate rolling)
    const diceTexture = Assets.get('PAGE3_DICE');
    if (!diceTexture) return;
    
    const dice = new Sprite(diceTexture);
    dice.anchor.set(0.5);
    dice.x = this.canvasWidth / 2 + 150; // Moved more to the right
    dice.y = this.canvasHeight - 260; // Moved up more
    dice.scale.set(0.6); // Slightly bigger (was 0.5)
    this.container.addChild(dice);
    this.layeredSprites.push(dice);
    
    // Rolling animation - spin and bounce (75% slower total)
    let frame = 0;
    const rollDuration = 270; // 75% slower - was 180 frames, now 270 frames (50% slower than current)
    
    return new Promise<void>((resolve) => {
      const animate = () => {
        frame++;
        const progress = frame / rollDuration;
        
        // Spin the dice (slower rotation)
        dice.rotation = frame * 0.2; // Slower - was 0.3, now 0.2
        
        // Bounce effect (slower)
        const bounce = Math.abs(Math.sin(frame * 0.133)) * 50; // Slower - was 0.2, now 0.133
        dice.y = (this.canvasHeight - 260) - bounce;
        
        // Scale pulsing (slower)
        const scale = 0.6 + Math.sin(frame * 0.1) * 0.15; // Slower - was 0.15, now 0.1
        dice.scale.set(scale);
        
        if (frame < rollDuration) {
          requestAnimationFrame(animate);
        } else {
          // Settle the dice - just leave it as is, no number overlay
          dice.rotation = 0;
          dice.scale.set(0.7); // Slightly bigger final size
          dice.y = this.canvasHeight - 260;
          resolve();
        }
      };
      requestAnimationFrame(animate);
    });
  }
  
  update() {}
  
  destroy() {
    for (const s of this.layeredSprites) s.destroy();
    for (const el of this.elementsToDestroy) el.destroy();
    this.container.removeChildren();
  }
  
  isReady() { return this.ready; }
}
