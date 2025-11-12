import { Application, Assets } from 'pixi.js';
import { SceneManager } from './sceneManager';
import { IntroScene } from './scenes/IntroScene';
import { IntroTwoScene } from './scenes/IntroTwoScene';
import { DiceRollScene } from './scenes/DiceRollScene';
import { WheelSpinScene } from './scenes/WheelSpinScene';
import { MessageScene } from './scenes/MessageScene';
import { ThankYouScene } from './scenes/ThankYouScene';
// Commented out for now
// import { InstantWinScene } from './scenes/InstantWinScene';
// import { FinishSequenceScene } from './scenes/FinishSequenceScene';
import { ASSETS } from './assets';

// NOTE: Removed bulk Assets.add(ASSETS) due to runtime error inside Pixi's resolver (undefined startsWith).
// We'll load each asset directly with an explicit { src, alias } object to bypass the failing code path.

console.log('[INIT] Starting application...');

// Wrap everything in an async IIFE to handle top-level await
(async () => {
  console.log('[INIT] Creating PixiJS application...');
  
  // PixiJS v8: use async init instead of passing options to constructor; use app.canvas not app.view
  const app = new Application();
  // Set canvas to match the updated asset dimensions (572x1247 - portrait format)
  await app.init({ 
    background: '#000000', 
    width: 572,
    height: 1247,
    resolution: 1,
    autoDensity: false
  });

  console.log('[APP] Application initialized');

  // Initialize Assets with basePath for GitHub Pages
  // In production, this ensures assets load from the correct subdirectory
  const basePath = '/Prototyping-Research/';
  console.log('[APP] Initializing Assets with basePath:', basePath);
  await Assets.init({
    basePath: basePath
  });

const mount = document.getElementById('app') as HTMLElement;
if (!mount) {
  console.error('[APP] Could not find #app element!');
}

mount.appendChild(app.canvas);

// Debug: log everything
console.log('[APP] Canvas dimensions:', app.canvas.width, 'x', app.canvas.height);
console.log('[APP] Window dimensions:', window.innerWidth, 'x', window.innerHeight);

// Use CSS transform to scale and center the canvas
const scaleCanvas = () => {
  const canvasWidth = 572;
  const canvasHeight = 1247;
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  
  // Calculate scale to fit
  const scaleX = windowWidth / canvasWidth;
  const scaleY = windowHeight / canvasHeight;
  const scale = Math.min(scaleX, scaleY);
  
  console.log('[APP] Window:', windowWidth, 'x', windowHeight);
  console.log('[APP] Scale X:', scaleX, 'Scale Y:', scaleY, 'Final Scale:', scale);
  
  // Apply transform: translate to center, then scale
  app.canvas.style.transform = `translate(-50%, -50%) scale(${scale})`;
  console.log('[APP] Transform applied:', app.canvas.style.transform);
};

// Initial scale
setTimeout(() => {
  scaleCanvas();
}, 100);
window.addEventListener('resize', scaleCanvas);

const loadingEl = document.getElementById('loading');
const loadingText = document.getElementById('loadingText');
const progressBar = document.getElementById('progressBar');

function updateProgress(current: number, total: number, message: string) {
  const percent = Math.round((current / total) * 100);
  if (progressBar) {
    progressBar.style.width = `${percent}%`;
    progressBar.textContent = `${percent}%`;
  }
  if (loadingText) {
    loadingText.textContent = message;
  }
}

const sceneManager = new SceneManager(app.stage);

// Make sceneManager globally accessible for scene transitions
(window as any).sceneManager = sceneManager;

let currentStep: number = 0; // Start at PAGE 1

async function preload() {
  if (!loadingEl) return;
  
  // Only load assets needed for PAGE 1 and PAGE 2
  const assetsToLoad = [
    'INTRO_BG', 'INTRO_1', 'INTRO_2', 'INTRO_3', 'INTRO_4', 'INTRO_5', 
    'INTRO_6', 'INTRO_7', 'INTRO_8', 'INTRO_9', 'INTRO_10',
    'INTRO2_BG', 'INTRO2_TOP_BANNER', 'INTRO2_1', 'INTRO2_2', 'INTRO2_3',
    'PAGE3_BG', 'PAGE3_TOP_BANNER', 'PAGE3_AVATAR', 'PAGE3_DICE', 'PAGE3_EVENT',
    'PAGE4_BG', 'PAGE4_LOGO', 'PAGE4_SUPERSPINS', 'PAGE4_SUPERSPINSLOGOSMALL', 
    'PAGE4_WHEEL', 'PAGE4_WHEELBACKGROUND', 'PAGE4_COINS', 'PAGE4_TOP_BANNER_AFTER',
    'PAGE5_1', 'PAGE5_2', 'PAGE5_3', 'PAGE5_4', 'PAGE5_5'
  ];
  
  const totalSteps = assetsToLoad.length + 2; // assets + scene init + scene change
  let currentProgress = 0;
  
  let loaded = 0;
  const failed: string[] = [];
  console.time('asset-preload');
  
  for (const key of assetsToLoad) {
    const url = ASSETS[key as keyof typeof ASSETS];
    if (!url) {
      console.warn('[preload] No URL for key', key);
      continue;
    }
    
    try {
      console.log('[preload] loading', key, url);
      await Assets.load({ src: url, alias: key });
      loaded++;
      currentProgress++;
      updateProgress(currentProgress, totalSteps, `Loading assets... ${loaded}/${assetsToLoad.length}`);
    } catch (assetErr) {
      console.error('[preload] asset load error', key, assetErr);
      failed.push(`${key}:asset-error`);
    }
  }
  
  console.timeEnd('asset-preload');
  if (failed.length) {
    updateProgress(totalSteps, totalSteps, `Asset errors: ${failed.join(', ')}`);
    console.error('[preload] failures', failed);
  } else {
    console.log('[preload] All assets loaded successfully!');
  }
  
  return { totalSteps, currentProgress };
}

async function start() {
  console.log('[START] Beginning preload');
  const progress = await preload();
  
  if (progress) {
    const { totalSteps, currentProgress } = progress;
    
    // Update progress for scene initialization
    updateProgress(currentProgress + 1, totalSteps, 'Initializing scene...');
    
    console.log('[START] Creating IntroScene');
    const introScene = new IntroScene();
    
    console.log('[START] Manually testing init...');
    await introScene.init();
    console.log('[START] Manual init complete');
    
    // Update progress for scene change
    updateProgress(currentProgress + 2, totalSteps, 'Loading game...');
    
    console.log('[START] Changing to IntroScene');
    await sceneManager.change(introScene);
    console.log('[START] IntroScene loaded, starting ticker');
    
    app.ticker.add(() => update());
    
    // Wait for multiple frames to ensure scene is fully rendered
    await new Promise(resolve => requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve(undefined));
      });
    }));
    
    // First, fade out the loading screen completely
    if (loadingEl) {
      loadingEl.classList.add('fade-out');
      // Wait for fade to complete
      await new Promise(resolve => setTimeout(resolve, 300));
      loadingEl.remove();
    }
    
    // Then fade in the canvas
    app.canvas.classList.add('ready');
  }
}

// Removed old immediate start; now using preloader

async function update() {
  sceneManager.update(app.ticker.deltaMS / 16.6667);
  // Transitions are now handled by click events in each scene, not automatically here
  switch (currentStep) {
    case 0: {
      const s = sceneManager['current'] as IntroScene & { isReady?: () => boolean };
      if (s?.isReady?.()) { 
        console.log('[scene] IntroScene ready - waiting for user interaction'); 
        currentStep = 1;
        // Transition to PAGE 2 is handled by click event in IntroScene
      }
      break;
    }
    case 1: {
      const s = sceneManager['current'] as IntroTwoScene & { isReady?: () => boolean };
      if (s?.isReady?.()) { 
        console.log('[scene] IntroTwoScene ready - waiting for user interaction'); 
        currentStep = 2;
        // Transition to PAGE 3 is handled by click event in IntroTwoScene
      }
      break;
    }
    case 2: {
      const s = sceneManager['current'] as DiceRollScene & { isReady?: () => boolean };
      if (s?.isReady?.()) { 
        console.log('[scene] DiceRollScene ready - waiting for user interaction'); 
        currentStep = 3;
        // Transition to PAGE 4 is handled by click event in DiceRollScene
      }
      break;
    }
    case 3: {
      const s = sceneManager['current'] as WheelSpinScene & { isReady?: () => boolean };
      if (s?.isReady?.()) { 
        console.log('[scene] WheelSpinScene ready - waiting for user interaction'); 
        currentStep = 4;
        // Transition to PAGE 5 is handled by click event in WheelSpinScene
      }
      break;
    }
    case 4: {
      const s = sceneManager['current'] as MessageScene & { isReady?: () => boolean };
      if (s?.isReady?.()) { 
        console.log('[scene] MessageScene complete - end of demo'); 
        currentStep = 5; 
      }
      break;
    }
  }
}

start();

})().catch(err => {
  console.error('[INIT] Fatal error:', err);
  const loadingEl = document.getElementById('loading');
  if (loadingEl) {
    loadingEl.textContent = `Error: ${err.message}`;
  }
});
