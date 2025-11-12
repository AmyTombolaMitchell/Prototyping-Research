// Use relative paths so they work under GitHub Pages sub-paths without leading slash.

export const ASSETS = {
  // Removed legacy FTP_INTRO and FTP_INTRO_TWO in favor of PAGE 1 and PAGE 2 layered intro assets
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
  INTRO_10: 'assets/PAGE 1/10.png',
  // PAGE 2 assets for second intro scene
  INTRO2_BG: 'assets/PAGE 2/BACKGROUND2.png',
  INTRO2_TOP_BANNER: 'assets/PAGE 2/TOP_BANNER.png',
  INTRO2_1: 'assets/PAGE 2/1.png',
  INTRO2_2: 'assets/PAGE 2/2.png',
  INTRO2_3: 'assets/PAGE 2/3.png',
  // PAGE 3 assets for dice roll scene
  PAGE3_BG: 'assets/PAGE 3/BACKGROUND.png',
  PAGE3_TOP_BANNER: 'assets/PAGE 3/TOP_BANNER.png',
  PAGE3_AVATAR: 'assets/PAGE 3/AVATAR.png',
  PAGE3_DICE: 'assets/PAGE 3/DICE.png',
  PAGE3_EVENT: 'assets/PAGE 3/EVENT.png',
  // PAGE 4 assets for wheel spin scene
  PAGE4_BG: 'assets/PAGE 4/BACKGROUND.png',
  PAGE4_LOGO: 'assets/PAGE 4/LOGO.png',
  PAGE4_SUPERSPINS: 'assets/PAGE 4/SUPERSPINS.png',
  PAGE4_SUPERSPINSLOGOSMALL: 'assets/PAGE 4/SUPERSPINSLOGOSMALL.png',
  PAGE4_WHEEL: 'assets/PAGE 4/WHEEL.png',
  PAGE4_WHEELBACKGROUND: 'assets/PAGE 4/WHEELBACKGROUND.jpg',
  PAGE4_COINS: 'assets/PAGE 4/COINS.png',
  PAGE4_TOP_BANNER_AFTER: 'assets/PAGE 4/TOP_BANNER_AFTER.png',
  // PAGE 5 assets for message scene
  PAGE5_1: 'assets/PAGE 5/1.png',
  PAGE5_2: 'assets/PAGE 5/2.png',
  PAGE5_3: 'assets/PAGE 5/3.png',
  PAGE5_4: 'assets/PAGE 5/4.png',
  PAGE5_5: 'assets/PAGE 5/5.png'
} as const;

export type AssetKey = keyof typeof ASSETS;
