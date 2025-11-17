import { Application, Assets } from 'pixi.js';
import { SceneManager } from './sceneManager';
import { IntroScene } from './scenes/IntroScene';
import { IntroTwoScene } from './scenes/IntroTwoScene';
import { DiceRollScene } from './scenes/DiceRollScene';
import { WheelSpinScene } from './scenes/WheelSpinScene';
import { MessageScene } from './scenes/MessageScene';
import { DayTwoScene } from './scenes/DayTwoScene';
import { TokenShopScene } from './scenes/TokenShopScene';
import { SuperSpinsScene } from './scenes/SuperSpinsScene';
import { ThankYouScene } from './scenes/ThankYouScene';
// Commented out for now
// import { InstantWinScene } from './scenes/InstantWinScene';
// import { FinishSequenceScene } from './scenes/FinishSequenceScene';
import { ASSETS } from './assets';

// Version tracking for debugging - UPDATED FOR CACHE BUST
console.log('[VERSION] Build: 2025-11-17-17:00 - Full game flow with Day 30 scene - CACHE BUST');
console.log('[VERSION] If you see this, the new version loaded successfully!');

// Banner assets added - force reload
console.log('[main.ts] ASSETS object keys:', Object.keys(ASSETS).length);

// NOTE: Removed bulk Assets.add(ASSETS) due to runtime error inside Pixi's resolver (undefined startsWith).
// We'll load each asset directly with an explicit { src, alias } object to bypass the failing code path.

console.log('[INIT] Starting application...');

// Wrap everything in an async IIFE to handle top-level await
(async () => {
  console.log('[INIT] Creating PixiJS application...');
  
  // PixiJS v8: use async init instead of passing options to constructor; use app.canvas not app.view
  const app = new Application();
  
  // Detect if we're on mobile for performance optimization
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  // Set canvas to match the updated asset dimensions (572x1247 - portrait format)
  await app.init({ 
    background: '#000000', 
    width: 572,
    height: 1247,
    resolution: isMobile ? window.devicePixelRatio : 1, // Use device pixel ratio on mobile for sharper images
    autoDensity: true, // Enable auto density for better mobile rendering
    antialias: false, // Disable antialiasing for better mobile performance
    powerPreference: 'high-performance' // Request high-performance GPU
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
  // Use translate3d for hardware acceleration on mobile
  app.canvas.style.transform = `translate(-50%, -50%) scale(${scale})`;
  app.canvas.style.willChange = 'transform'; // Hint browser to optimize for transform changes
  console.log('[APP] Transform applied:', app.canvas.style.transform);
};

// Initial scale
setTimeout(() => {
  scaleCanvas();
}, 100);

// Throttle resize events for better mobile performance
let resizeTimeout: ReturnType<typeof setTimeout>;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(scaleCanvas, 150);
});

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
  // Wait 5 seconds before starting to load assets
  console.log('[preload] Waiting 5 seconds before loading...');
  if (loadingText) {
    loadingText.textContent = 'Preparing to load...';
  }
  await new Promise(resolve => setTimeout(resolve, 5000));
  console.log('[preload] Starting asset loading now...');
  
  // Only load assets needed for PAGE 1 and PAGE 2
  const assetsToLoad = [
    'INTRO_BG', 'INTRO_1', 'INTRO_2', 'INTRO_3', 'INTRO_4', 'INTRO_5', 
    'INTRO_6', 'INTRO_7', 'INTRO_8', 'INTRO_9', 'INTRO_10',
    'INTRO2_BG', 'INTRO2_1', 'INTRO2_2', 'INTRO2_3',
    'PAGE3_BG', 'PAGE3_AVATAR', 'PAGE3_DICE', 'PAGE3_EVENT',
    'PAGE4_BG', 'PAGE4_LOGO', 'PAGE4_SUPERSPINS', 'PAGE4_SUPERSPINSLOGOSMALL', 
    'PAGE4_WHEEL', 'PAGE4_WHEELBACKGROUND', 'PAGE4_COINS',
    'PAGE5_1', 'PAGE5_2', 'PAGE5_3', 'PAGE5_4', 'PAGE5_5',
    'PAGE6_LONG_BACKGROUND', 'PAGE6_BOTTOM_BANNER', 'PAGE6_CHAR', 'PAGE6_CHAT_1', 'PAGE6_CHAT_2', 'PAGE6_CHAT_3', 'PAGE6_TOKEN_SHOP'
  ];
  
  const totalSteps = assetsToLoad.length + 2; // assets + scene init + scene change
  let currentProgress = 0;
  
  let loaded = 0;
  const failed: string[] = [];
  console.time('asset-preload');
  
  let firstAssetLoaded = false;
  
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
      
      // Hide loading bar after first asset loads and appears on screen
      if (!firstAssetLoaded) {
        firstAssetLoaded = true;
        // Wait a tiny moment for the asset to render, then hide the loading bar
        setTimeout(() => {
          if (loadingEl) {
            loadingEl.classList.add('fade-out');
            setTimeout(() => loadingEl.remove(), 300);
          }
        }, 100);
      }
    } catch (assetErr) {
      console.error('[preload] asset load error', key, assetErr);
      failed.push(`${key}:asset-error`);
    }
  }
  
  console.timeEnd('asset-preload');
  
  // Load banners with hardcoded paths
  console.log('[preload] Loading banners with hardcoded paths...');
  const bannerAssets = [
    { key: 'BANNER_NO_0', url: '/Prototyping-Research/TOPBANNERS/no_0.png' },
    { key: 'BANNER_NO_1', url: '/Prototyping-Research/TOPBANNERS/no_1.png' },
    { key: 'BANNER_NO_2', url: '/Prototyping-Research/TOPBANNERS/no_2.png' },
    { key: 'BANNER_NO_3', url: '/Prototyping-Research/TOPBANNERS/no_3.png' },
    { key: 'BANNER_NO_4', url: '/Prototyping-Research/TOPBANNERS/no_4.png' },
    { key: 'BANNER_NO_5', url: '/Prototyping-Research/TOPBANNERS/no_5.png' },
    { key: 'BANNER_NO_25', url: '/Prototyping-Research/TOPBANNERS/no_25.png' },
    { key: 'BANNER_NO_26', url: '/Prototyping-Research/TOPBANNERS/no_26.png' },
    { key: 'BANNER_NO_27', url: '/Prototyping-Research/TOPBANNERS/no_27.png' },
    { key: 'BANNER_NO_28', url: '/Prototyping-Research/TOPBANNERS/no_28.png' },
    { key: 'BANNER_NO_29', url: '/Prototyping-Research/TOPBANNERS/no_29.png' },
    { key: 'BANNER_NO_30', url: '/Prototyping-Research/TOPBANNERS/no_30.png' },
    { key: 'COIN_COLLECT', url: '/Prototyping-Research/TOPBANNERS/coin_collect.png' },
    { key: 'PAGE6_CHAR', url: '/Prototyping-Research/PAGE 6/char.png' },
    { key: 'PAGE6_CHAT_1', url: '/Prototyping-Research/PAGE 6/chat_1.png' },
    { key: 'PAGE6_CHAT_2', url: '/Prototyping-Research/PAGE 6/chat_2.png' },
    { key: 'PAGE6_CHAT_3', url: '/Prototyping-Research/PAGE 6/chat_3.png' },
    { key: 'PAGE6_TOKEN_SHOP', url: '/Prototyping-Research/PAGE 6/token_shop.png' },
    { key: 'PAGE7_LONG_BACKGROUND_SHOP', url: '/Prototyping-Research/PAGE 7/LONG_BACKGROUND_SHOP.png' },
    { key: 'PAGE7_SHOP_1', url: '/Prototyping-Research/PAGE 7/shop_1.png' },
    { key: 'PAGE7_SHOP_2', url: '/Prototyping-Research/PAGE 7/shop_2.png' },
    { key: 'PAGE8_SUPER_SPINS_BG', url: '/Prototyping-Research/PAGE 8/super_spins_bg.png' },
    { key: 'PAGE8_SUPERSPINS_WHEEL', url: '/Prototyping-Research/PAGE 8/superspins_wheel.png' },
    { key: 'PAGE8_SUPERSPINS_WHEEL_AFTER', url: '/Prototyping-Research/PAGE 8/superspins_wheel_after.png' },
    { key: 'PAGE8_SPIN_BUTTON', url: '/Prototyping-Research/PAGE 8/spin_button.png' },
    { key: 'PAGE8_SUPERSPINS_WIN', url: '/Prototyping-Research/PAGE 8/superspins_win.png' },
    { key: 'PAGE8_FLIP_TILE', url: '/Prototyping-Research/PAGE 8/flip_tile.png' },
    { key: 'PAGE8_FLIP_100', url: '/Prototyping-Research/PAGE 8/flip_100.png' },
    { key: 'PAGE8_FLIP_20', url: '/Prototyping-Research/PAGE 8/flip_20.png' },
    { key: 'PAGE8_FLIP_5', url: '/Prototyping-Research/PAGE 8/flip_5.png' },
    { key: 'PAGE8_FLIP_FP', url: '/Prototyping-Research/PAGE 8/flip_fp.png' },
    { key: 'PAGE8_FLIP_SPIN', url: '/Prototyping-Research/PAGE 8/flip_spin.png' },
    { key: 'PAGE8_FLIP_100_AFTER', url: '/Prototyping-Research/PAGE 8/flip_100_after.png' },
    { key: 'PAGE8_FLIP_20_AFTER', url: '/Prototyping-Research/PAGE 8/flip_20_after.png' },
    { key: 'PAGE8_FLIP_5_AFTER', url: '/Prototyping-Research/PAGE 8/flip_5_after.png' },
    { key: 'PAGE8_FLIP_SPIN_AFTER', url: '/Prototyping-Research/PAGE 8/flip_spin_after.png' },
    { key: 'BANNER_NO_STREAK', url: '/Prototyping-Research/TOPBANNERS/no_streak.png' },
    { key: 'PAGE10_FLAME', url: '/Prototyping-Research/PAGE 10/flame.png' },
    { key: 'PAGE10_CHAT_1', url: '/Prototyping-Research/PAGE 10/chat_1.png' },
    { key: 'PAGE10_CHAT_2', url: '/Prototyping-Research/PAGE 10/chat_2.png' },
    { key: 'PAGE11_LK_BACKGROUND', url: '/Prototyping-Research/PAGE 11/lk_background.png' },
    { key: 'PAGE11_LK_CHAR', url: '/Prototyping-Research/PAGE 11/lk_char.png' },
    { key: 'PAGE11_LK_CHAT_1', url: '/Prototyping-Research/PAGE 11/lk_chat_1.png' },
    { key: 'PAGE11_LK_CHAT_2', url: '/Prototyping-Research/PAGE 11/lk_chat_2.png' }
  ];
  
  for (const banner of bannerAssets) {
    try {
      console.log('[preload] loading banner', banner.key, banner.url);
      await Assets.load({ src: banner.url, alias: banner.key });
      loaded++;
    } catch (err) {
      console.error('[preload] banner load error', banner.key, err);
      failed.push(`${banner.key}:banner-error`);
    }
  }
  
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
    
    console.log('[START] Creating scenes');
    const introScene = new IntroScene();
    const introTwoScene = new IntroTwoScene();
    const diceRollScene = new DiceRollScene();
    const wheelSpinScene = new WheelSpinScene();
    const messageScene = new MessageScene();
    const dayTwoScene = new DayTwoScene();
    const tokenShopScene = new TokenShopScene();
    const superSpinsScene = new SuperSpinsScene();
    
    // Register all scenes
    sceneManager.register('IntroScene', introScene);
    sceneManager.register('IntroTwoScene', introTwoScene);
    sceneManager.register('DiceRollScene', diceRollScene);
    sceneManager.register('WheelSpinScene', wheelSpinScene);
    sceneManager.register('MessageScene', messageScene);
    sceneManager.register('DayTwoScene', dayTwoScene);
    sceneManager.register('TokenShopScene', tokenShopScene);
    sceneManager.register('SuperSpinsScene', superSpinsScene);
    
    // Start from the beginning
    console.log('[START] Starting from IntroScene');
    
    // Update progress for scene change
    updateProgress(currentProgress + 2, totalSteps, 'Loading game...');
    
    console.log('[START] Changing to IntroScene');
    await sceneManager.change(introScene);
    console.log('[START] IntroScene loaded, starting ticker');
    
    currentStep = 0;
    app.ticker.add(() => update());
    
    // Wait for multiple frames to ensure scene is fully rendered
    await new Promise(resolve => requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve(undefined));
      });
    }));
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
        console.log('[scene] MessageScene complete - transitioning to Day Two'); 
        currentStep = 5; 
      }
      break;
    }
    case 5: {
      const s = sceneManager['current'] as DayTwoScene & { isReady?: () => boolean };
      if (s?.isReady?.()) { 
        console.log('[scene] DayTwoScene loaded - waiting for user interaction'); 
        currentStep = 6; 
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
