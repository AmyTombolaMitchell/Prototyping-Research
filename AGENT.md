# AGENT.md - Prototyping Research Repository

**Last Updated**: November 24, 2025  
**Purpose**: Internal reference for AI agents to understand repository structure, build processes, and workflows.

---

## Repository Overview

**Repository Name**: Prototyping-Research  
**Primary Purpose**: Tombola Free-to-Play (FTP) game prototyping and testing  
**Technology Stack**: TypeScript, PixiJS v8, Vite  
**Deployment**: GitHub Pages (https://USERNAME.github.io/Prototyping-Research/)

### Repository Structure

```
Prototyping-Research/
├── FTP/                    # Main free-to-play game project (PRIMARY)
│   ├── src/
│   │   ├── main.ts         # Application entry point
│   │   ├── sceneManager.ts # Scene management system
│   │   ├── assets.ts       # Asset path definitions
│   │   ├── scenes/         # Game scenes (.ts + compiled .js)
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets (images, etc.)
│   ├── index.html          # HTML entry point
│   ├── package.json        # Dependencies and scripts
│   ├── vite.config.ts      # Vite build configuration
│   └── tsconfig.json       # TypeScript configuration
├── TESTING/                # Experimental slot game (SECONDARY)
│   ├── src/
│   └── package.json
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Pages deployment
├── package.json            # Root package.json (minimal)
└── .gitignore
```

---

## FTP Project (Primary Focus)

### Project Configuration

**Canvas Dimensions**: 572x1247 (portrait mobile format)  
**Base Path**: `/Prototyping-Research/` (GitHub Pages subdirectory)  
**Public Directory**: `public/` (contains all game assets)

### Key Files

#### 1. `main.ts` (Application Entry Point)
- **Location**: `FTP/src/main.ts`
- **Lines**: 382 lines
- **Purpose**: Initialize PixiJS app, setup canvas, load assets, manage scenes
- **Key Features**:
  - Async initialization with PixiJS v8 API
  - Mobile detection and optimization (devicePixelRatio, performance settings)
  - Canvas scaling/centering via CSS transforms
  - Asset loading with basePath for GitHub Pages
  - Scene registration and initialization
  - Version tracking/cache busting

**Canvas Setup**:
```typescript
await app.init({ 
  background: '#000000', 
  width: 572,
  height: 1247,
  resolution: isMobile ? window.devicePixelRatio : 1,
  autoDensity: true,
  antialias: false,
  powerPreference: 'high-performance'
});
```

**Assets Initialization**:
```typescript
await Assets.init({
  basePath: '/Prototyping-Research/'
});
```

#### 2. `sceneManager.ts` (Scene Management System)
- **Location**: `FTP/src/sceneManager.ts`
- **Lines**: 131 lines
- **Purpose**: Manage scene lifecycle and transitions
- **Key Interfaces**:
  - `IScene`: Interface all scenes must implement
    - `container: Container`
    - `init(): Promise<void> | void`
    - `update(delta: number): void`
    - `destroy(): void`

**Scene Manager Features**:
- Scene registration (name → scene mapping)
- Scene transitions (slide, fade, none)
- Old scene cleanup
- Global scene manager accessible via `(window as any).sceneManager`

#### 3. `assets.ts` (Asset Definitions)
- **Location**: `FTP/src/assets.ts`
- **Lines**: 108 lines
- **Purpose**: Centralized asset path definitions
- **Structure**: Object mapping asset keys to relative paths

**Asset Organization**:
- Legacy assets: `FTP_DICE_ROLL_1.png`, etc.
- Page-based assets: `page1/`, `page2/`, ..., `page11/`
- Top banners: `TOPBANNERS/no_0.png`, ..., `TOPBANNERS/no_29.png`

**Path Format**: All paths are relative (no leading slash) to work with basePath:
```typescript
INTRO_BG: 'page1/BACKGROUND.png',
PAGE3_BG: 'page3/BACKGROUND.png',
```

#### 4. Game Scenes

**Scene Files** (all in `FTP/src/scenes/`):
- Both `.ts` (source) and `.js` (compiled) versions committed to git
- Each scene implements `IScene` interface

**Scene Flow**:
1. `IntroScene.ts` → Initial intro (PAGE 1 assets)
2. `IntroTwoScene.ts` → Second intro (PAGE 2 assets)
3. `DiceRollScene.ts` → Dice roll game (PAGE 3 assets)
4. `WheelSpinScene.ts` → Wheel spin (PAGE 4 assets)
5. `MessageScene.ts` → Message display (PAGE 5 assets)
6. `DayTwoScene.ts` → Day 2 progression (PAGE 6 assets)
7. `TokenShopScene.ts` → Token shop (PAGE 7 assets)
8. `SuperSpinsScene.ts` → Super spins (PAGE 8 assets)
9. `ThankYouScene.ts` → Final thank you
10. Additional scenes: `DaySevenScene.js`, `DayThirtyScene.js`, etc.

**Scene Transition Pattern**:
```typescript
const sceneManager = (window as any).sceneManager;
if (sceneManager) {
  await sceneManager.change(new NextScene(), 'none');
}
```

#### 5. `vite.config.ts` (Build Configuration)
```typescript
export default defineConfig({
  base: '/Prototyping-Research/',  // GitHub Pages base path
  publicDir: 'public',              // Asset directory
  server: {
    port: 5173,
    open: true
  },
  build: {
    target: 'esnext'
  }
});
```

**CRITICAL**: `publicDir` was changed from `'assets'` to `'public'` to match actual directory structure.

#### 6. `tsconfig.json` (TypeScript Configuration)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "Node",
    "strict": true,
    "types": ["pixi.js"]
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}
```

#### 7. `package.json` (Dependencies & Scripts)
```json
{
  "name": "tombola-free-to-play-game",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "pixi.js": "^8.1.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "vite": "^7.2.2"
  }
}
```

### Public Assets Directory

**Location**: `FTP/public/`

**Structure**:
```
public/
├── TOPBANNERS/        # Top banner images (no_0.png to no_29.png)
├── page1/             # Intro scene assets
├── page2/             # Intro two scene assets
├── page3/             # Dice roll scene assets
├── page4/             # Wheel spin scene assets
├── page5/             # Message scene assets
├── page6/             # Day two scene assets
├── page7/             # Token shop scene assets
├── page8/             # Super spins scene assets
├── page10/            # Day 7 assets
└── page11/            # Day 30 assets
```

**Asset Naming**: 
- Lowercase folder names: `page1/`, `page2/`, etc.
- Various file types: `.png`, `.jpg`
- Common assets: `BACKGROUND.png`, `TOP_BANNER.png`, numbered files `1.png`, `2.png`, etc.

---

## Build & Development Workflow

### Local Development

**Working Directory**: `Prototyping-Research/FTP`

**Commands**:
```bash
cd FTP
npm install          # Install dependencies
npm run dev          # Start development server (port 5173)
npm run build        # Build for production
npm run preview      # Preview production build
```

**Development Server**:
- URL: `http://localhost:5173/Prototyping-Research/`
- Auto-opens in browser
- Hot module replacement enabled

### TypeScript Compilation

**Important**: Both `.ts` and `.js` files are committed to git.

**Workflow**:
1. Edit `.ts` source files
2. Run `tsc` to compile to `.js`
3. Vite serves the built output

**Manual Compilation**:
```bash
cd FTP
tsc                  # Compile all TypeScript files
```

**Build Process**:
- `npm run build` runs `tsc && vite build`
- TypeScript → JavaScript compilation
- Vite bundles and optimizes
- Output to `FTP/dist/`

### GitHub Pages Deployment

**Workflow File**: `.github/workflows/deploy.yml`

**Triggers**:
- Push to `main`, `dev`, or `a` branches

**Process**:
1. Checkout code
2. Setup Node.js v20
3. `cd FTP && npm ci`
4. `npm run build`
5. Upload `FTP/dist/` artifact
6. Deploy to GitHub Pages

**Live URL**: `https://USERNAME.github.io/Prototyping-Research/`

**Key Configuration**:
- Base path in vite.config.ts: `/Prototyping-Research/`
- Assets.init basePath in main.ts: `/Prototyping-Research/`
- Both must match for proper asset loading

---

## Critical Debugging Information

### Asset Loading Issues (RESOLVED)

**Root Cause**: `vite.config.ts` had `publicDir: 'assets'` but actual folder was `public/`

**Solution**: Changed to `publicDir: 'public'`

**Symptoms**:
- All 82+ assets failing with "InvalidStateError: The source image could not be decoded"
- Browser showed 404 errors for asset paths

### Path Formatting

**CRITICAL**: Asset paths must be relative (no leading `/`) for basePath to work:
```typescript
// ✅ CORRECT
'page1/BACKGROUND.png'

// ❌ WRONG
'/page1/BACKGROUND.png'
```

### Case Sensitivity

**Folder names**: `page1/`, `page2/`, etc. (lowercase)  
**File names**: Mixed case (`BACKGROUND.png`, `TOP_BANNER.png`, `1.png`)

### Browser Caching

**Problem**: Browser caches old JavaScript files

**Solutions**:
1. Hard refresh (Cmd+Shift+R on Mac)
2. Version tracking in main.ts console.log
3. Cache-Control meta tags in index.html

---

## TESTING Project (Secondary)

**Location**: `Prototyping-Research/TESTING/`  
**Purpose**: Experimental slot game with PixiJS v7  
**Status**: Minimal, not actively developed

**Structure**:
```
TESTING/
├── src/
│   ├── main.ts
│   ├── game.ts
│   ├── engine.ts
│   └── slotGame.ts
└── package.json
```

**Dependencies**:
- PixiJS v7.3.0 (older version than FTP)
- Vite v5.0.0
- TypeScript v5.0.0

---

## Common Issues & Solutions

### 1. Assets Not Loading
**Check**:
- `vite.config.ts` has `publicDir: 'public'`
- `main.ts` has correct basePath
- Asset paths in `assets.ts` are relative (no leading `/`)
- Folder names match case (lowercase)

### 2. TypeScript Changes Not Reflecting
**Solution**:
```bash
cd FTP
tsc              # Compile TypeScript
npm run dev      # Restart dev server
```

### 3. Scene Transitions Not Working
**Check**:
- Scene implements `IScene` interface
- SceneManager is registered globally: `(window as any).sceneManager`
- Scene has `init()`, `update()`, `destroy()` methods

### 4. Build Failures
**Common Causes**:
- TypeScript compilation errors
- Missing dependencies
- Vite configuration issues

**Debug**:
```bash
cd FTP
tsc --noEmit        # Check TypeScript errors without compiling
npm run build       # See full error output
```

### 5. GitHub Pages Not Updating
**Check**:
- GitHub Actions workflow completed successfully
- Pushed to correct branch (`main`, `dev`, or `a`)
- Wait 2-3 minutes for Pages to update
- Clear browser cache

---

## Development Best Practices

### 1. File Modifications
- **Edit .ts files**, not .js files
- Run `tsc` after TypeScript changes
- Commit both `.ts` and `.js` to git

### 2. Asset Management
- Add new assets to `public/` directory
- Update `assets.ts` with new paths
- Use relative paths (no leading `/`)
- Maintain folder organization (page1/, page2/, etc.)

### 3. Scene Creation
```typescript
// 1. Create scene file in src/scenes/
import { Container, Sprite, Assets } from 'pixi.js';
import type { IScene } from '../sceneManager';

export class NewScene implements IScene {
  container = new Container();
  
  async init() {
    // Load assets, create sprites
  }
  
  update(delta: number) {
    // Update animation/logic
  }
  
  destroy() {
    // Cleanup
  }
}

// 2. Register in main.ts
import { NewScene } from './scenes/NewScene';
sceneManager.register('newScene', new NewScene());

// 3. Transition from another scene
const sceneManager = (window as any).sceneManager;
await sceneManager.change(new NewScene(), 'fade');
```

### 4. Testing Workflow
1. Local development: `npm run dev`
2. Test changes at `localhost:5173/Prototyping-Research/`
3. Build for production: `npm run build`
4. Preview build: `npm run preview`
5. Push to branch for GitHub Pages deployment

---

## Repository History & Context

### Recent Changes (Nov 2025)

1. **Asset Loading Fix**:
   - Changed `vite.config.ts` publicDir from `'assets'` to `'public'`
   - Fixed all asset paths in `assets.ts` (PAGE X/ → pageX/)
   - Fixed hardcoded banner paths in `main.ts`

2. **Scene Flow Updates**:
   - Updated MessageScene to transition to DayTwoScene
   - Added multiple day progression scenes
   - Implemented token shop and super spins

3. **TypeScript Compilation**:
   - Both .ts and .js files committed to git
   - Manual `tsc` compilation required after .ts changes

### Git Workflow

**Branches**:
- `main`: Production branch
- `dev`: Development branch
- `a`: Alternate/testing branch

**Deployment**: All three branches trigger GitHub Pages deployment

---

## Quick Reference Commands

```bash
# Navigate to FTP project
cd Prototyping-Research/FTP

# Install dependencies
npm install

# Start development server
npm run dev

# Compile TypeScript manually
tsc

# Build for production
npm run build

# Preview production build
npm run preview

# Check TypeScript errors without compiling
tsc --noEmit
```

---

## Agent Instructions

When working with this repository:

1. **Always work in FTP directory** unless specifically dealing with TESTING
2. **Edit .ts files**, then run `tsc` to compile
3. **Check vite.config.ts** for publicDir and base path settings
4. **Verify asset paths** are relative and match actual folder structure
5. **Test locally** before pushing to GitHub
6. **Use console.log** liberally for debugging (check browser console)
7. **Reference this file** instead of chat history for repository context

---

**End of AGENT.md**
