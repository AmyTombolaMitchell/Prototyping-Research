// Use relative paths so they work under GitHub Pages sub-paths without leading slash.

export const ASSETS = {
  // Removed legacy FTP_INTRO in favor of PAGE 1 layered intro assets
  FTP_INTRO_TWO: 'assets/FTP_INTRO_TWO.png',
  FTP_DICE_ROLL_1: 'assets/FTP_DICE_ROLL_1.png',
  FTP_DICE_ROLL_2: 'assets/FTP_DICE_ROLL_2.png',
  FTP_INSTANT_WIN: 'assets/FTP_INSTANT_WIN.png',
  FTP_INSTANT_WIN_SPIN: 'assets/FTP_INSTANT_WIN_SPIN.png',
  FTP_INSTANT_WIN_PRIZE: 'assets/FTP_INSTANT_WIN_PRIZE.png',
  FTP_FINISH_1: 'assets/FTP_FINISH_1.png',
  FTP_FINISH_2: 'assets/FTP_FINISH_2.png',
  FTP_FINISH_3: 'assets/FTP_FINISH_3.png',
  // PAGE 1 assets for new intro scene
  INTRO_BG: 'assets/PAGE 1/BACKGROUND.png',
  INTRO_1: 'assets/PAGE 1/1.png',
  INTRO_2: 'assets/PAGE 1/2.png',
  INTRO_3: 'assets/PAGE 1/3.png',
  INTRO_4: 'assets/PAGE 1/4.png',
  INTRO_5: 'assets/PAGE 1/5.png',
  INTRO_6: 'assets/PAGE 1/6.png',
  INTRO_7: 'assets/PAGE 1/7.png',
  INTRO_8: 'assets/PAGE 1/8.png',
  INTRO_9: 'assets/PAGE 1/9.png',
  // PAGE 2 assets for second intro scene
  INTRO2_BG: 'assets/PAGE 2/BACKGROUND2.png',
  INTRO2_1: 'assets/PAGE 2/1.png',
  INTRO2_2: 'assets/PAGE 2/2.png',
  INTRO2_3: 'assets/PAGE 2/3.png'
} as const;

export type AssetKey = keyof typeof ASSETS;
