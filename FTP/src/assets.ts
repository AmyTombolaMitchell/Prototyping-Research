// Use relative paths so they work under GitHub Pages sub-paths without leading slash.

export const ASSETS = {
  // Removed legacy FTP_DICE_ROLL_1 and FTP_DICE_ROLL_2 in favor of PAGE 1 and PAGE 2 layered intro assets
  FTP_DICE_ROLL_1: 'FTP_DICE_ROLL_1.png',
  FTP_DICE_ROLL_2: 'FTP_DICE_ROLL_2.png',
  FTP_INSTANT_WIN: 'FTP_INSTANT_WIN.png',
  FTP_INSTANT_WIN_SPIN: 'FTP_INSTANT_WIN_SPIN.png',
  FTP_INSTANT_WIN_PRIZE: 'FTP_INSTANT_WIN_PRIZE.png',
  FTP_FINISH_1: 'FTP_FINISH_1.png',
  FTP_FINISH_2: 'FTP_FINISH_2.png',
  FTP_FINISH_3: 'FTP_FINISH_3.png',
  // PAGE 1 assets for new intro scene
  INTRO_BG: 'PAGE%201/BACKGROUND.png',
  INTRO_1: 'PAGE%201/1.png',
  INTRO_2: 'PAGE%201/2.png',
  INTRO_3: 'PAGE%201/3.png',
  INTRO_4: 'PAGE%201/4.png',
  INTRO_5: 'PAGE%201/5.png',
  INTRO_6: 'PAGE%201/6.png',
  INTRO_7: 'PAGE%201/7.png',
  INTRO_8: 'PAGE%201/8.png',
  INTRO_9: 'PAGE%201/9.png',
  INTRO_10: 'PAGE%201/10.png',
  // PAGE 2 assets for second intro scene
  INTRO2_BG: 'PAGE%202/BACKGROUND2.png',
  INTRO2_TOP_BANNER: 'PAGE%202/TOP_BANNER.png',
  INTRO2_1: 'PAGE%202/1.png',
  INTRO2_2: 'PAGE%202/2.png',
  INTRO2_3: 'PAGE%202/3.png',
  // PAGE 3 assets for dice roll scene
  PAGE3_BG: 'PAGE%203/BACKGROUND.png',
  PAGE3_TOP_BANNER: 'PAGE%203/TOP_BANNER.png',
  PAGE3_AVATAR: 'PAGE%203/AVATAR.png',
  PAGE3_DICE: 'PAGE%203/DICE.png',
  PAGE3_EVENT: 'PAGE%203/EVENT.png',
  // PAGE 4 assets for wheel spin scene
  PAGE4_BG: 'PAGE%204/BACKGROUND.png',
  PAGE4_LOGO: 'PAGE%204/LOGO.png',
  PAGE4_SUPERSPINS: 'PAGE%204/SUPERSPINS.png',
  PAGE4_SUPERSPINSLOGOSMALL: 'PAGE%204/SUPERSPINSLOGOSMALL.png',
  PAGE4_WHEEL: 'PAGE%204/WHEEL.png',
  PAGE4_WHEELBACKGROUND: 'PAGE%204/WHEELBACKGROUND.jpg',
  PAGE4_COINS: 'PAGE%204/COINS.png',
  PAGE4_TOP_BANNER_AFTER: 'PAGE%204/TOP_BANNER_AFTER.png',
  // PAGE 5 assets for message scene
  PAGE5_1: 'PAGE%205/1.png',
  PAGE5_2: 'PAGE%205/2.png',
  PAGE5_3: 'PAGE%205/3.png',
  PAGE5_4: 'PAGE%205/4.png',
  PAGE5_5: 'PAGE%205/5.png'
} as const;

export type AssetKey = keyof typeof ASSETS;
