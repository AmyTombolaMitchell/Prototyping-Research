# Prototyping Research - Tombola Free-to-Play Game

A mobile-first free-to-play game built with PixiJS v8 and TypeScript, featuring a multi-scene progression system with dice rolls, wheel spins, token shops, and super spins.

## 🎮 Live Demo

**GitHub Pages**: [https://USERNAME.github.io/Prototyping-Research/](https://USERNAME.github.io/Prototyping-Research/)

> Replace `USERNAME` with your GitHub username

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Development](#development)
- [Building](#building)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Contributing](#contributing)

## ✨ Features

- **Mobile-Optimized**: Portrait format (572x1247) with responsive scaling
- **Scene-Based Architecture**: Modular scene management system
- **Rich Animations**: Sprite-based animations with pop-in effects
- **Asset Management**: Centralized asset loading and caching
- **GitHub Pages Deployment**: Automated CI/CD pipeline
- **TypeScript**: Full type safety with PixiJS v8

### Game Flow

1. **Intro Scenes** - Two-part introduction with layered animations
2. **Dice Roll** - Interactive dice rolling mechanic
3. **Wheel Spin** - Spinning wheel mini-game
4. **Message Display** - Story progression and messaging
5. **Day Progression** - Multi-day gameplay (Day 2, Day 7, Day 30)
6. **Token Shop** - In-game token purchase system
7. **Super Spins** - Special spinning mechanic with tile flips
8. **Thank You** - Completion screen

## 🛠 Tech Stack

- **Game Engine**: [PixiJS v8.1.0](https://pixijs.com/)
- **Language**: [TypeScript 5.4.0](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 7.2.2](https://vitejs.dev/)
- **Deployment**: GitHub Pages
- **CI/CD**: GitHub Actions

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v20 or higher
- npm (comes with Node.js)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/USERNAME/Prototyping-Research.git
   cd Prototyping-Research
   ```

2. **Navigate to the FTP project**

   ```bash
   cd FTP
   ```

3. **Install dependencies**

   ```bash
   npm install
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**

   The game will automatically open at:
   ```
   http://localhost:5173/Prototyping-Research/
   ```

## 💻 Development

### Available Scripts

```bash
# Start development server (port 5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Compile TypeScript manually
tsc
```

### Development Workflow

1. **Edit TypeScript files** in `src/`
2. **Hot Module Replacement** (HMR) will automatically reload changes
3. For production builds, run `tsc && npm run build`

### Working with Scenes

All game scenes are located in `src/scenes/`. Each scene implements the `IScene` interface:

```typescript
export interface IScene {
  container: Container;
  init(): Promise<void> | void;
  update(delta: number): void;
  destroy(): void;
}
```

**Creating a New Scene:**

```typescript
import { Container, Sprite, Assets } from 'pixi.js';
import type { IScene } from '../sceneManager';

export class MyNewScene implements IScene {
  container = new Container();

  async init() {
    // Load assets and setup scene
    const sprite = new Sprite(Assets.get('MY_ASSET'));
    this.container.addChild(sprite);
  }

  update(delta: number) {
    // Update logic (called every frame)
  }

  destroy() {
    // Cleanup resources
    this.container.destroy({ children: true });
  }
}
```

### Adding Assets

1. Add your assets to the `public/` directory (organized by page)
2. Update `src/assets.ts` with the new asset path:

   ```typescript
   export const ASSETS = {
     MY_NEW_ASSET: 'page1/my-asset.png',
     // ... other assets
   };
   ```

3. Load and use in your scene:

   ```typescript
   const texture = Assets.get('MY_NEW_ASSET');
   const sprite = new Sprite(texture);
   ```

## 🏗 Building

### Build for Production

```bash
cd FTP
npm run build
```

This will:
1. Compile TypeScript to JavaScript (`tsc`)
2. Bundle and optimize with Vite
3. Output to `FTP/dist/`

### Preview Production Build

```bash
npm run preview
```

Opens a local server with the production build.

## 🚢 Deployment

### Automatic Deployment (GitHub Pages)

The project uses GitHub Actions for automatic deployment:

1. **Push to main, dev, or a branch**
2. GitHub Actions workflow triggers
3. Project builds automatically
4. Deploys to GitHub Pages

**Workflow**: `.github/workflows/deploy.yml`

### Manual Deployment

1. Build the project:
   ```bash
   cd FTP
   npm run build
   ```

2. Deploy the `dist/` folder to your hosting provider

### Configuration

**Important**: The base path is set to `/Prototyping-Research/` for GitHub Pages.

If deploying to a different path, update:

1. **vite.config.ts**:
   ```typescript
   export default defineConfig({
     base: '/YOUR-REPO-NAME/',
     // ...
   });
   ```

2. **src/main.ts**:
   ```typescript
   await Assets.init({
     basePath: '/YOUR-REPO-NAME/'
   });
   ```

## 📁 Project Structure

```
Prototyping-Research/
├── FTP/                          # Main game project
│   ├── src/
│   │   ├── main.ts               # Application entry point
│   │   ├── sceneManager.ts       # Scene management system
│   │   ├── assets.ts             # Asset path definitions
│   │   ├── scenes/               # Game scenes
│   │   │   ├── IntroScene.ts     # First intro
│   │   │   ├── IntroTwoScene.ts  # Second intro
│   │   │   ├── DiceRollScene.ts  # Dice roll game
│   │   │   ├── WheelSpinScene.ts # Wheel spin
│   │   │   ├── MessageScene.ts   # Message display
│   │   │   ├── DayTwoScene.ts    # Day 2 progression
│   │   │   ├── TokenShopScene.ts # Token shop
│   │   │   ├── SuperSpinsScene.ts# Super spins
│   │   │   └── ThankYouScene.ts  # Thank you screen
│   │   └── utils/                # Utility functions
│   ├── public/                   # Static assets
│   │   ├── TOPBANNERS/           # Top banner images
│   │   ├── page1/                # Intro assets
│   │   ├── page2/                # Intro 2 assets
│   │   ├── page3/                # Dice roll assets
│   │   ├── page4/                # Wheel spin assets
│   │   ├── page5/                # Message assets
│   │   ├── page6/                # Day 2 assets
│   │   ├── page7/                # Token shop assets
│   │   ├── page8/                # Super spins assets
│   │   ├── page10/               # Day 7 assets
│   │   └── page11/               # Day 30 assets
│   ├── index.html                # HTML entry
│   ├── package.json              # Dependencies
│   ├── vite.config.ts            # Vite config
│   └── tsconfig.json             # TypeScript config
├── TESTING/                      # Experimental slot game
├── .github/
│   └── workflows/
│       └── deploy.yml            # GitHub Pages deployment
├── README.md                     # This file
└── AGENT.md                      # Internal documentation
```

## 🎨 Canvas & Scaling

**Canvas Dimensions**: 572 x 1247 (portrait mobile format)

The game automatically scales to fit any screen size while maintaining aspect ratio:

```typescript
// CSS transform scaling
const scale = Math.min(windowWidth / 572, windowHeight / 1247);
canvas.style.transform = `translate(-50%, -50%) scale(${scale})`;
```

**Mobile Optimizations**:
- Device pixel ratio for sharper images
- Hardware-accelerated transforms (`translate3d`)
- Disabled antialiasing for performance
- High-performance GPU preference

## 🐛 Troubleshooting

### Assets Not Loading

**Issue**: All assets show 404 errors or fail to decode

**Solution**:
1. Check `vite.config.ts` has `publicDir: 'public'`
2. Verify asset paths in `assets.ts` are relative (no leading `/`)
3. Ensure folder names are lowercase (`page1/`, not `PAGE1/`)

### TypeScript Changes Not Reflecting

**Issue**: Code changes don't appear in browser

**Solution**:
```bash
tsc           # Compile TypeScript
npm run dev   # Restart dev server
```

### Browser Caching

**Issue**: Old version loads after deployment

**Solution**:
- Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
- Clear browser cache
- Check version in console log

### Build Errors

**Issue**: Build fails with TypeScript errors

**Solution**:
```bash
tsc --noEmit  # Check errors without building
```

Fix TypeScript errors, then run `npm run build` again.

## 📝 TypeScript Notes

**Important**: Both `.ts` and `.js` files are committed to git.

- Edit the `.ts` source files
- Run `tsc` to compile to `.js`
- The build process uses both

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🔗 Links

- [PixiJS Documentation](https://pixijs.com/guides)
- [Vite Documentation](https://vitejs.dev/guide/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## 📧 Contact

For questions or issues, please open a GitHub issue.

---

**Built with ❤️ using PixiJS and TypeScript**
