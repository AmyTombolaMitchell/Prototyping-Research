import { Application, Assets } from 'pixi.js';
import { SceneManager } from './sceneManager';
import { IntroScene } from './scenes/IntroScene';
import { IntroTwoScene } from './scenes/IntroTwoScene';
import { DiceRollScene } from './scenes/DiceRollScene';
import { InstantWinScene } from './scenes/InstantWinScene';
import { WheelSpinScene } from './scenes/WheelSpinScene';
import { FinishSequenceScene } from './scenes/FinishSequenceScene';
import { ASSETS } from './assets';

// Pre-register asset URLs with Pixi Assets system
// Register all assets in one call (PixiJS v8 expects an object map)
Assets.add(ASSETS);

const app = new Application({ backgroundColor: 0x000000, resizeTo: window });
(document.getElementById('app') as HTMLElement).appendChild(app.view as HTMLCanvasElement);
app.view.style.width = '100%';
app.view.style.height = '100%';

const loadingEl = document.getElementById('loading');

const sceneManager = new SceneManager(app.stage);

let currentStep: number = 0;

async function preload() {
  if (!loadingEl) return;
  const keys = Object.keys(ASSETS);
  let loaded = 0;
  console.time('asset-preload');
  for (const k of keys) {
    try {
      console.log('[preload] loading', k, ASSETS[k as keyof typeof ASSETS]);
      await Assets.load(k);
      loaded++;
      if (loadingEl) loadingEl.textContent = `Loading assets... ${loaded}/${keys.length}`;
    } catch (e) {
      console.error('Failed to load asset', k, e);
      if (loadingEl) loadingEl.textContent = `Error loading ${k}`;
      return; // abort start on failure
    }
  }
  console.timeEnd('asset-preload');
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
