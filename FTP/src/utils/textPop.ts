import { Container, Text } from 'pixi.js';

export function createPoppingTextSequence(lines: string[], opts: { delay?: number; style?: any; onComplete?: () => void }, parent: Container) {
  const delay = opts.delay ?? 600;
  const style = opts.style ?? { fill: 0xffffff, fontSize: 36, fontWeight: 'bold' };
  let index = 0;
  const spawned: Text[] = [];

  const ticker = (delta: number) => {
    /* intentionally empty - we rely on timeouts */
  };

  function spawnNext() {
    if (index >= lines.length) {
      opts.onComplete?.();
      return;
    }
    const t = new Text(lines[index], style);
    t.anchor.set(0.5);
    t.alpha = 0;
    t.scale.set(0.5);
    t.x = parent.width / 2;
    t.y = parent.height / 2 + index * 50 - (lines.length * 25);
    parent.addChild(t);
    spawned.push(t);

    // simple pop animation
    let frame = 0;
    const animate = () => {
      frame++;
      t.alpha = Math.min(1, t.alpha + 0.1);
      t.scale.set(Math.min(1, t.scale.x + 0.05));
      if (frame < 20) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
    index++;
    setTimeout(spawnNext, delay);
  }
  spawnNext();
  return spawned;
}
