# Tombola Free-To-Play Game (PixiJS + TypeScript)

A scripted prototype implementing the flow you described: intro -> second intro -> dice roll (landing on 5) -> instant win -> wheel spin (landing on 20 tokens) -> finish sequence.

## Features Implemented
- Asset manifest in `src/assets.ts` (expects PNGs in `assets/` named exactly as IDs).
- Scene system (`src/sceneManager.ts`) with sequential transitions.
- Intro text popping animation and interactive buttons.
- Forced dice roll outcome (always 5) with token movement animation.
- Instant win pulsating text.
- Wheel spin slowing to reveal prize (20 tokens) then finish sequence cycling 3 finish screens.

## Getting Started

### 1. Install dependencies (PowerShell)
```powershell
npm install
```

### 2. Run dev server
```powershell
npm run dev
```
This will open the game at http://localhost:5173.

### 3. Build for production
```powershell
npm run build
```
Output appears in `dist/`.

## Asset Requirements
Place the following PNG files in the `assets/` folder:
```
FTP_INTRO.png
FTP_INTRO_TWO.png
FTP_DICE_ROLL_1.png
FTP_DICE_ROLL_2.png
FTP_INSTANT_WIN.png
FTP_INSTANT_WIN_SPIN.png
FTP_INSTANT_WIN_PRIZE.png
FTP_FINISH_1.png
FTP_FINISH_2.png
FTP_FINISH_3.png
```
Add any board, dice, or player art as needed; current prototype uses a simple gold circle token.

## Customization Ideas
- Replace placeholder movement spacing logic with positions derived from a board layout.
- Add sound effects (roll, win, spin).
- Add accessibility (keyboard navigation, focus outlines).
- Add a restart button at end of finish sequence.

## Notes
- All animations are time-based approximations using `requestAnimationFrame` or Pixi ticker delta.
- Prize and dice outcomes are scripted; make them dynamic later by randomizing and adding validation.

## Next Steps
1. Provide final artwork (optimize sizes, maybe use texture atlas).  
2. Add preloader progress bar.  
3. Integrate analytics / event tracking if required.  
4. Add token count persistence (localStorage or backend).  

---
Enjoy iterating! Let me know if you’d like tests or a restart loop added.
