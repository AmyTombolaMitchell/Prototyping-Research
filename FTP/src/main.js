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
document.getElementById('app').appendChild(app.view);
app.view.style.width = '100%';
app.view.style.height = '100%';
const loadingEl = document.getElementById('loading');
const sceneManager = new SceneManager(app.stage);
let currentStep = 0;
async function preload() {
    if (!loadingEl)
        return;
    const entries = Object.entries(ASSETS);
    let loaded = 0;
    const failed = [];
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
        }
        catch (fetchErr) {
            console.error('[preload] fetch error', key, fetchErr);
            failed.push(`${key}:fetch-error`);
            continue;
        }
        // Attempt alias load first; fallback to direct src load if alias fails.
        try {
            await Assets.load(key).catch(async (aliasErr) => {
                console.warn('[preload] alias load failed, retry with direct src', key, aliasErr);
                await Assets.load({ src: url, alias: key });
            });
            loaded++;
            if (loadingEl)
                loadingEl.textContent = `Loading assets... ${loaded}/${entries.length}`;
        }
        catch (assetErr) {
            console.error('[preload] asset load error', key, assetErr);
            failed.push(`${key}:asset-error`);
        }
    }
    console.timeEnd('asset-preload');
    if (failed.length) {
        if (loadingEl)
            loadingEl.textContent = `Asset errors: ${failed.join(', ')}`;
        console.error('[preload] failures', failed);
    }
}
async function start() {
    await preload();
    if (loadingEl)
        loadingEl.remove();
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
            const s = sceneManager['current'];
            if (s?.isReady?.()) {
                console.log('[scene] Transition Intro -> IntroTwo');
                currentStep = 1;
                sceneManager.change(new IntroTwoScene());
            }
            break;
        }
        case 1: {
            const s = sceneManager['current'];
            if (s?.isReady?.()) {
                console.log('[scene] Transition IntroTwo -> DiceRoll');
                currentStep = 2;
                sceneManager.change(new DiceRollScene());
            }
            break;
        }
        case 2: {
            const s = sceneManager['current'];
            if (s?.isDone?.()) {
                console.log('[scene] Transition DiceRoll -> InstantWin');
                currentStep = 3;
                sceneManager.change(new InstantWinScene());
            }
            break;
        }
        case 3: {
            const s = sceneManager['current'];
            if (s?.isDone?.()) {
                console.log('[scene] Transition InstantWin -> WheelSpin');
                currentStep = 4;
                sceneManager.change(new WheelSpinScene());
            }
            break;
        }
        case 4: {
            const s = sceneManager['current'];
            if (s?.isDone?.()) {
                console.log('[scene] Transition WheelSpin -> FinishSequence');
                currentStep = 5;
                sceneManager.change(new FinishSequenceScene());
            }
            break;
        }
        case 5: {
            const s = sceneManager['current'];
            if (s?.isDone?.()) {
                console.log('[scene] FinishSequence complete');
                currentStep = 6; /* end state */
            }
            break;
        }
    }
}
start();
