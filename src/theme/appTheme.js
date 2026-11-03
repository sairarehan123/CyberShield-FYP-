/**
 * Palette for the NEW SeBIS design.
 * Same component names/keys as Zahra's appTheme, but every colour is taken from the app's ORIGINAL
 * theme (src/theme/colors.js). Only the style/layout is new; the colour scheme is unchanged.
 */
import { colors } from './colors';

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
