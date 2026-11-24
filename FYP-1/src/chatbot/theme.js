import { Platform } from 'react-native';
/** Chatbot theme - same brand colours as the app. Self-contained so the chatbot folder has no outside imports. */
export const colors = {
  background: '#FAF8FC',
  white: '#FFFFFF',

  primary: '#8E2F70',
  primaryLight: '#A83F83',
  accent: '#C95A9E',

  lilac: '#EADCF5',
  lilacSoft: '#F1E7F8',
  dotInactive: '#D9C8F0',
  pink: '#F4D7E8',
  pinkStrong: '#EFC4DD',

  text: '#252033',
  textSecondary: '#777184',
  border: '#E6DDF0',
  placeholder: '#A9A3B5',

  error: '#C2334D',
  errorBg: '#FDF0F3',

  gradientPrimary: ['#8E2F70', '#A83F83', '#C95A9E'],
  gradientSoft: ['#F1E7F8', '#F4D7E8'],
};



const fontFamily = Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' });

export const typography = {
  fontFamily,
  h1: { fontSize: 30, fontWeight: '800', letterSpacing: -0.5, lineHeight: 38 },
  h2: { fontSize: 26, fontWeight: '800', letterSpacing: -0.4, lineHeight: 33 },
  h3: { fontSize: 20, fontWeight: '700', lineHeight: 26 },
  body: { fontSize: 15, fontWeight: '400', lineHeight: 22 },
  bodyStrong: { fontSize: 15, fontWeight: '600', lineHeight: 22 },
  label: { fontSize: 13, fontWeight: '600', lineHeight: 18 },
  caption: { fontSize: 12, fontWeight: '500', lineHeight: 16 },
  button: { fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 };
export const radius = { sm: 10, md: 16, lg: 20, xl: 28, pill: 999 };
export const shadow = {
  soft: {
    shadowColor: '#8E2F70',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 4,
  },
};

/**
 * Palette for the NEW SeBIS design.
 * Same component names/keys as Zahra's appTheme, but every colour is taken from the app's ORIGINAL
 * theme (src/theme/colors.js). Only the style/layout is new; the colour scheme is unchanged.
 */

export const appColors = {
  background: colors.background,
  white: colors.white,
  primary: colors.primary,       // brand magenta (buttons, selected options)
  lilac: colors.lilac,
  lavender: colors.dotInactive,  // unselected rings / progress track
  pink: colors.pink,
  plum: colors.primary,          // small icons on pale surfaces
  text: colors.text,
  textSecondary: colors.textSecondary,
  border: colors.border,
  error: colors.error,
};

export const appRadius = { card: 28, hero: 32, pill: 999 };

export const appShadow = {
  card: {
    shadowColor: colors.primary,
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  button: {
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
};

// ---- Glass look (translucent white cards on a soft gradient) - brand colours unchanged
export const glass = {
  bg: 'rgba(255,255,255,0.70)',
  bgStrong: 'rgba(255,255,255,0.92)',
  border: 'rgba(255,255,255,0.95)',
  line: 'rgba(142,47,112,0.12)',
};
export const gradients = {
  aurora: ['#F5ECFB', '#FCE9F3', '#EFE8FC'],
  brand: ['#8E2F70', '#A83F83', '#C95A9E'],
  tiles: [
    ['#8E2F70', '#C95A9E'],
    ['#6C4BA6', '#B791E6'],
    ['#C95A9E', '#F2A7CE'],
    ['#A83F83', '#7A5CC4'],
  ],
};
