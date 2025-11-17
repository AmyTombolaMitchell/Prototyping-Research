// ...existing code...

console.log('[main.ts] ASSETS object keys:', Object.keys(ASSETS).length);

console.log('[INIT] Starting application...');

(async () => {
  console.log('[INIT] Creating PixiJS application...');
  const app = new Application();
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  await app.init({ 
    background: '#000000', 
    width: 572,
    height: 1247,
    resolution: isMobile ? window.devicePixelRatio : 1,
    autoDensity: true,
    antialias: false,
    powerPreference: 'high-performance'
  });
  console.log('[APP] Application initialized');
  const basePath = '/Prototyping-Research/';
  console.log('[APP] Initializing Assets with basePath:', basePath);
  await Assets.init({ basePath });
  const mount = document.getElementById('app') as HTMLElement;
  if (!mount) {
    console.error('[APP] Could not find #app element!');
  }
  mount.appendChild(app.canvas);
  console.log('[APP] Canvas dimensions:', app.canvas.width, 'x', app.canvas.height);
  console.log('[APP] Window dimensions:', window.innerWidth, 'x', window.innerHeight);
  const scaleCanvas = () => {
    const canvasWidth = 572;
    const canvasHeight = 1247;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const scaleX = windowWidth / canvasWidth;
    const scaleY = windowHeight / canvasHeight;
    const scale = Math.min(scaleX, scaleY);
    console.log('[APP] Window:', windowWidth, 'x', windowHeight);
    console.log('[APP] Scale X:', scaleX, 'Scale Y:', scaleY, 'Final Scale:', scale);
    app.canvas.style.transform = `translate(-50%, -50%) scale(${scale})`;
    app.canvas.style.willChange = 'transform';
    console.log('[APP] Transform applied:', app.canvas.style.transform);
  };
  setTimeout(() => { scaleCanvas(); }, 100);
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
  (window as any).sceneManager = sceneManager;
  let currentStep: number = 0;
  async function preload() {
    console.log('[preload] Waiting 5 seconds before loading...');
    if (loadingText) loadingText.textContent = 'Preparing to load...';
    await new Promise(resolve => setTimeout(resolve, 5000));
    console.log('[preload] Starting asset loading now...');
    const assetsToLoad = [
      // page1 assets
      'INTRO_BG', 'INTRO_1', 'INTRO_2', 'INTRO_3', 'INTRO_4', 'INTRO_5', 
      'INTRO_6', 'INTRO_7', 'INTRO_8', 'INTRO_9', 'INTRO_10',
      'INTRO2_BG', 'INTRO2_1', 'INTRO2_2', 'INTRO2_3',
      // page3 assets
      'PAGE3_BG', 'PAGE3_AVATAR', 'PAGE3_DICE', 'PAGE3_EVENT',
      // page4 assets
      'PAGE4_BG', 'PAGE4_LOGO', 'PAGE4_SUPERSPINS', 'PAGE4_SUPERSPINSLOGOSMALL', 
      'PAGE4_WHEEL', 'PAGE4_WHEELBACKGROUND', 'PAGE4_COINS',
      // page5 assets
      'PAGE5_1', 'PAGE5_2', 'PAGE5_3', 'PAGE5_4', 'PAGE5_5',
      // page6 assets
      'PAGE6_LONG_BACKGROUND', 'PAGE6_BOTTOM_BANNER', 'PAGE6_CHAR', 'PAGE6_CHAT_1', 'PAGE6_CHAT_2', 'PAGE6_CHAT_3', 'PAGE6_TOKEN_SHOP'
    ];
    const totalSteps = assetsToLoad.length + 2;
    let currentProgress = 0;
    let loaded = 0;
    const failed: string[] = [];
    console.time('asset-preload');
    let firstAssetLoaded = false;
    for (const key of assetsToLoad) {
  let url = ASSETS[key as keyof typeof ASSETS];
  // Patch asset paths to use /public/ subfolders
  if (url && url.startsWith('/Prototyping-Research/PAGE 1/')) url = url.replace('/Prototyping-Research/PAGE 1/', '/page1/');
  if (url && url.startsWith('/Prototyping-Research/PAGE 2/')) url = url.replace('/Prototyping-Research/PAGE 2/', '/page2/');
  if (url && url.startsWith('/Prototyping-Research/PAGE 3/')) url = url.replace('/Prototyping-Research/PAGE 3/', '/page3/');
  if (url && url.startsWith('/Prototyping-Research/PAGE 4/')) url = url.replace('/Prototyping-Research/PAGE 4/', '/page4/');
  if (url && url.startsWith('/Prototyping-Research/PAGE 5/')) url = url.replace('/Prototyping-Research/PAGE 5/', '/page5/');
  if (url && url.startsWith('/Prototyping-Research/PAGE 6/')) url = url.replace('/Prototyping-Research/PAGE 6/', '/page6/');
  if (url && url.startsWith('/Prototyping-Research/PAGE 7/')) url = url.replace('/Prototyping-Research/PAGE 7/', '/page7/');
  if (url && url.startsWith('/Prototyping-Research/PAGE 8/')) url = url.replace('/Prototyping-Research/PAGE 8/', '/page8/');
  if (url && url.startsWith('/Prototyping-Research/PAGE 10/')) url = url.replace('/Prototyping-Research/PAGE 10/', '/page10/');
  if (url && url.startsWith('/Prototyping-Research/PAGE 11/')) url = url.replace('/Prototyping-Research/PAGE 11/', '/page11/');
  if (url && url.startsWith('/Prototyping-Research/TOPBANNERS/')) url = url.replace('/Prototyping-Research/TOPBANNERS/', '/TOPBANNERS/');
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
        if (!firstAssetLoaded) {
          firstAssetLoaded = true;
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
    console.log('[preload] Loading banners with hardcoded paths...');
    const bannerAssets = [
  { key: 'BANNER_NO_0', url: '/TOPBANNERS/no_0.png' },
  { key: 'BANNER_NO_1', url: '/TOPBANNERS/no_1.png' },
  { key: 'BANNER_NO_2', url: '/TOPBANNERS/no_2.png' },
  { key: 'BANNER_NO_3', url: '/TOPBANNERS/no_3.png' },
  { key: 'BANNER_NO_4', url: '/TOPBANNERS/no_4.png' },
  { key: 'BANNER_NO_5', url: '/TOPBANNERS/no_5.png' },
  { key: 'BANNER_NO_25', url: '/TOPBANNERS/no_25.png' },
  { key: 'BANNER_NO_26', url: '/TOPBANNERS/no_26.png' },
  { key: 'BANNER_NO_27', url: '/TOPBANNERS/no_27.png' },
  { key: 'BANNER_NO_28', url: '/TOPBANNERS/no_28.png' },
  { key: 'BANNER_NO_29', url: '/TOPBANNERS/no_29.png' },
  { key: 'BANNER_NO_30', url: '/TOPBANNERS/no_30.png' },
  { key: 'COIN_COLLECT', url: '/TOPBANNERS/coin_collect.png' },
  { key: 'PAGE6_CHAR', url: '/page6/char.png' },
  { key: 'PAGE6_CHAT_1', url: '/page6/chat_1.png' },
  { key: 'PAGE6_CHAT_2', url: '/page6/chat_2.png' },
  { key: 'PAGE6_CHAT_3', url: '/page6/chat_3.png' },
  { key: 'PAGE6_TOKEN_SHOP', url: '/page6/token_shop.png' },
  { key: 'PAGE7_LONG_BACKGROUND_SHOP', url: '/page7/LONG_BACKGROUND_SHOP.png' },
  { key: 'PAGE7_SHOP_1', url: '/page7/shop_1.png' },
  { key: 'PAGE7_SHOP_2', url: '/page7/shop_2.png' },
  { key: 'PAGE8_SUPER_SPINS_BG', url: '/page8/super_spins_bg.png' },
  { key: 'PAGE8_SUPERSPINS_WHEEL', url: '/page8/superspins_wheel.png' },
  { key: 'PAGE8_SUPERSPINS_WHEEL_AFTER', url: '/page8/superspins_wheel_after.png' },
  { key: 'PAGE8_SPIN_BUTTON', url: '/page8/spin_button.png' },
  { key: 'PAGE8_SUPERSPINS_WIN', url: '/page8/superspins_win.png' },
  { key: 'PAGE8_FLIP_TILE', url: '/page8/flip_tile.png' },
  { key: 'PAGE8_FLIP_100', url: '/page8/flip_100.png' },
  { key: 'PAGE8_FLIP_20', url: '/page8/flip_20.png' },
  { key: 'PAGE8_FLIP_5', url: '/page8/flip_5.png' },
  { key: 'PAGE8_FLIP_FP', url: '/page8/flip_fp.png' },
  { key: 'PAGE8_FLIP_SPIN', url: '/page8/flip_spin.png' },
  { key: 'PAGE8_FLIP_100_AFTER', url: '/page8/flip_100_after.png' },
  { key: 'PAGE8_FLIP_20_AFTER', url: '/page8/flip_20_after.png' },
  { key: 'PAGE8_FLIP_5_AFTER', url: '/page8/flip_5_after.png' },
  { key: 'PAGE8_FLIP_SPIN_AFTER', url: '/page8/flip_spin_after.png' },
  { key: 'BANNER_NO_STREAK', url: '/TOPBANNERS/no_streak.png' },
  { key: 'PAGE10_FLAME', url: '/page10/flame.png' },
  { key: 'PAGE10_CHAT_1', url: '/page10/chat_1.png' },
  { key: 'PAGE10_CHAT_2', url: '/page10/chat_2.png' },
  { key: 'PAGE11_LK_BACKGROUND', url: '/page11/lk_background.png' },
  { key: 'PAGE11_LK_CHAR', url: '/page11/lk_char.png' },
  { key: 'PAGE11_LK_CHAT_1', url: '/page11/lk_chat_1.png' },
  { key: 'PAGE11_LK_CHAT_2', url: '/page11/lk_chat_2.png' }
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
      sceneManager.register('IntroScene', introScene);
      sceneManager.register('IntroTwoScene', introTwoScene);
      sceneManager.register('DiceRollScene', diceRollScene);
      sceneManager.register('WheelSpinScene', wheelSpinScene);
      sceneManager.register('MessageScene', messageScene);
      sceneManager.register('DayTwoScene', dayTwoScene);
      sceneManager.register('TokenShopScene', tokenShopScene);
      sceneManager.register('SuperSpinsScene', superSpinsScene);
      console.log('[START] Starting from IntroScene');
      updateProgress(currentProgress + 2, totalSteps, 'Loading game...');
      console.log('[START] Changing to IntroScene');
      await sceneManager.change(introScene);
      console.log('[START] IntroScene loaded, starting ticker');
      currentStep = 0;
      app.ticker.add(() => update());
      await new Promise(resolve => requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => resolve(undefined));
        });
      }));
    }
  }
  async function update() {
    sceneManager.update(app.ticker.deltaMS / 16.6667);
    switch (currentStep) {
      case 0: {
        const s = sceneManager['current'] as IntroScene & { isReady?: () => boolean };
        if (s?.isReady?.()) { 
          console.log('[scene] IntroScene ready - waiting for user interaction'); 
          currentStep = 1;
        }
        break;
      }
      case 1: {
        const s = sceneManager['current'] as IntroTwoScene & { isReady?: () => boolean };
        if (s?.isReady?.()) { 
          console.log('[scene] IntroTwoScene ready - waiting for user interaction'); 
          currentStep = 2;
        }
        break;
      }
      case 2: {
        const s = sceneManager['current'] as DiceRollScene & { isReady?: () => boolean };
        if (s?.isReady?.()) { 
          console.log('[scene] DiceRollScene ready - waiting for user interaction'); 
          currentStep = 3;
        }
        break;
      }
      case 3: {
        const s = sceneManager['current'] as WheelSpinScene & { isReady?: () => boolean };
        if (s?.isReady?.()) { 
          console.log('[scene] WheelSpinScene ready - waiting for user interaction'); 
          currentStep = 4;
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
  await start();
})().catch(err => {
  console.error('[INIT] Fatal error:', err);
  const loadingEl = document.getElementById('loading');
  if (loadingEl) {
    loadingEl.textContent = `Error: ${err.message}`;
  }
});
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

console.log('[main.ts] ASSETS object keys:', Object.keys(ASSETS).length);

console.log('[INIT] Starting application...');

(async () => {
  console.log('[INIT] Creating PixiJS application...');
  const app = new Application();
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  await app.init({ 
    background: '#000000', 
    width: 572,
    height: 1247,
    resolution: isMobile ? window.devicePixelRatio : 1,
    autoDensity: true,
    antialias: false,
    powerPreference: 'high-performance'
  });
  console.log('[APP] Application initialized');
  const basePath = '/Prototyping-Research/';
  console.log('[APP] Initializing Assets with basePath:', basePath);
  await Assets.init({ basePath });
  const mount = document.getElementById('app') as HTMLElement;
  if (!mount) {
    console.error('[APP] Could not find #app element!');
  }
  mount.appendChild(app.canvas);
  console.log('[APP] Canvas dimensions:', app.canvas.width, 'x', app.canvas.height);
  console.log('[APP] Window dimensions:', window.innerWidth, 'x', window.innerHeight);
  const scaleCanvas = () => {
    const canvasWidth = 572;
    const canvasHeight = 1247;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const scaleX = windowWidth / canvasWidth;
    const scaleY = windowHeight / canvasHeight;
    const scale = Math.min(scaleX, scaleY);
    console.log('[APP] Window:', windowWidth, 'x', windowHeight);
    console.log('[APP] Scale X:', scaleX, 'Scale Y:', scaleY, 'Final Scale:', scale);
    app.canvas.style.transform = `translate(-50%, -50%) scale(${scale})`;
    app.canvas.style.willChange = 'transform';
    console.log('[APP] Transform applied:', app.canvas.style.transform);
  };
  setTimeout(() => { scaleCanvas(); }, 100);
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
  (window as any).sceneManager = sceneManager;
  let currentStep: number = 0;
  async function preload() {
    console.log('[preload] Waiting 5 seconds before loading...');
    if (loadingText) loadingText.textContent = 'Preparing to load...';
    await new Promise(resolve => setTimeout(resolve, 5000));
    console.log('[preload] Starting asset loading now...');
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
    const totalSteps = assetsToLoad.length + 2;
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
        if (!firstAssetLoaded) {
          firstAssetLoaded = true;
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
      sceneManager.register('IntroScene', introScene);
      sceneManager.register('IntroTwoScene', introTwoScene);
      sceneManager.register('DiceRollScene', diceRollScene);
      sceneManager.register('WheelSpinScene', wheelSpinScene);
      sceneManager.register('MessageScene', messageScene);
      sceneManager.register('DayTwoScene', dayTwoScene);
      sceneManager.register('TokenShopScene', tokenShopScene);
      sceneManager.register('SuperSpinsScene', superSpinsScene);
      console.log('[START] Starting from IntroScene');
      updateProgress(currentProgress + 2, totalSteps, 'Loading game...');
      console.log('[START] Changing to IntroScene');
      await sceneManager.change(introScene);
      console.log('[START] IntroScene loaded, starting ticker');
      currentStep = 0;
      app.ticker.add(() => update());
      await new Promise(resolve => requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => resolve(undefined));
        });
      }));
    }
  }
  async function update() {
    sceneManager.update(app.ticker.deltaMS / 16.6667);
    switch (currentStep) {
      case 0: {
        const s = sceneManager['current'] as IntroScene & { isReady?: () => boolean };
        if (s?.isReady?.()) { 
          console.log('[scene] IntroScene ready - waiting for user interaction'); 
          currentStep = 1;
        }
        break;
      }
      case 1: {
        const s = sceneManager['current'] as IntroTwoScene & { isReady?: () => boolean };
        if (s?.isReady?.()) { 
          console.log('[scene] IntroTwoScene ready - waiting for user interaction'); 
          currentStep = 2;
        }
        break;
      }
      case 2: {
        const s = sceneManager['current'] as DiceRollScene & { isReady?: () => boolean };
        if (s?.isReady?.()) { 
          console.log('[scene] DiceRollScene ready - waiting for user interaction'); 
          currentStep = 3;
        }
        break;
      }
      case 3: {
        const s = sceneManager['current'] as WheelSpinScene & { isReady?: () => boolean };
        if (s?.isReady?.()) { 
          console.log('[scene] WheelSpinScene ready - waiting for user interaction'); 
          currentStep = 4;
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
  await start();
})().catch(err => {
  console.error('[INIT] Fatal error:', err);
  const loadingEl = document.getElementById('loading');
  if (loadingEl) {
    loadingEl.textContent = `Error: ${err.message}`;
  }
});

  // ...existing code...

// ...existing code...

const loadingEl = document.getElementById('loading');
const loadingText = document.getElementById('loadingText');
const progressBar = document.getElementById('progressBar');

  // ...existing code...

// ...existing code...
