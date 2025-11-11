import { Application, Assets } from 'pixi.js';
import { SceneManager } from './sceneManager';
import { IntroScene } from './scenes/IntroScene';
import { IntroTwoScene } from './scenes/IntroTwoScene';
import { DiceRollScene } from './scenes/DiceRollScene';
import { InstantWinScene } from './scenes/InstantWinScene';
import { WheelSpinScene } from './scenes/WheelSpinScene';
import { FinishSequenceScene } from './scenes/FinishSequenceScene';
import { ASSETS } from './assets';

// NOTE: Removed bulk Assets.add(ASSETS) due to runtime error inside Pixi's resolver (undefined startsWith).
// We'll load each asset directly with an explicit { src, alias } object to bypass the failing code path.

// PixiJS v8: use async init instead of passing options to constructor; use app.canvas not app.view
const app = new Application();
await app.init({ background: '#000000', resizeTo: window });
const mount = document.getElementById('app') as HTMLElement;
mount.appendChild(app.canvas);
app.canvas.style.width = '100%';
app.canvas.style.height = '100%';

const loadingEl = document.getElementById('loading');

const sceneManager = new SceneManager(app.stage);

let currentStep: number = 0;

async function preload() {
  if (!loadingEl) return;
  const entries = Object.entries(ASSETS);
  let loaded = 0;
  const failed: string[] = [];
  console.time('asset-preload');
  for (const [key, url] of entries) {
    // First probe the raw URL to surface HTTP status early.
    try {
      console.log('[preload] probe fetch', key, url);
      const resp = await fetch(url, { cache: 'no-store' });
      console.log('[preload] fetch status', key, resp.status, url);
      if (!resp.ok) {
        failed.push(`${key}:http-${resp.status}`);
        continue; // Skip attempting to load via Assets if HTTP failed.
      }
    } catch (fetchErr) {
      console.error('[preload] fetch error', key, fetchErr);
      failed.push(`${key}:fetch-error`);
      continue;
    }
    // Direct load providing src & alias; avoids resolver path that triggered undefined error.
    try {
      await Assets.load({ src: url, alias: key });
      loaded++;
      if (loadingEl) loadingEl.textContent = `Loading assets... ${loaded}/${entries.length}`;
    } catch (assetErr) {
      console.error('[preload] asset load error', key, assetErr);
      failed.push(`${key}:asset-error`);
    }
  }
  console.timeEnd('asset-preload');
  if (failed.length) {
    if (loadingEl) loadingEl.textContent = `Asset errors: ${failed.join(', ')}`;
    console.error('[preload] failures', failed);
  }
}

async function start() {
  await preload();
  if (loadingEl) loadingEl.remove();
  const intro = new IntroScene();
  console.log('[scene] IntroScene start');
  await sceneManager.change(intro);
  app.ticker.add(() => update());
}

// Removed old immediate start; now using preloader

async function update() {
  sceneManager.update(app.ticker.deltaMS / 16.6667);
  switch (currentStep) {
    case 0: {
      const s = sceneManager['current'] as IntroScene & { isReady?: () => boolean };
      if (s?.isReady?.()) { console.log('[scene] Transition Intro -> IntroTwo'); currentStep = 1; sceneManager.change(new IntroTwoScene()); }
      break;
    }
    case 1: {
      const s = sceneManager['current'] as IntroTwoScene & { isReady?: () => boolean };
      if (s?.isReady?.()) { console.log('[scene] Transition IntroTwo -> DiceRoll'); currentStep = 2; sceneManager.change(new DiceRollScene()); }
      break;
    }
    case 2: {
      const s = sceneManager['current'] as DiceRollScene & { isDone?: () => boolean };
      if (s?.isDone?.()) { console.log('[scene] Transition DiceRoll -> InstantWin'); currentStep = 3; sceneManager.change(new InstantWinScene()); }
      break;
    }
    case 3: {
      const s = sceneManager['current'] as InstantWinScene & { isDone?: () => boolean };
      if (s?.isDone?.()) { console.log('[scene] Transition InstantWin -> WheelSpin'); currentStep = 4; sceneManager.change(new WheelSpinScene()); }
      break;
    }
    case 4: {
      const s = sceneManager['current'] as WheelSpinScene & { isDone?: () => boolean };
      if (s?.isDone?.()) { console.log('[scene] Transition WheelSpin -> FinishSequence'); currentStep = 5; sceneManager.change(new FinishSequenceScene()); }
      break;
    }
    case 5: {
      const s = sceneManager['current'] as FinishSequenceScene & { isDone?: () => boolean };
      if (s?.isDone?.()) { console.log('[scene] FinishSequence complete'); currentStep = 6; /* end state */ }
      break;
    }
  }
}

start();
