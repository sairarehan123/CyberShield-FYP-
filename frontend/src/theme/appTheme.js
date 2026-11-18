/**
 * Palette for the authenticated app (Home, Assess, Learn, Profile and the assessment flow).
 * Kept separate from theme/colors.js on purpose: the completed Splash / Onboarding / Login / Sign Up
 * screens use that file and must not change.
 */
export const appColors = {
  background: '#F9F7FF', // soft off-white
  white: '#FFFFFF',
  primary: '#8B5CF6', // lavender purple: buttons, selected states, progress
  lilac: '#E9DFFF', // soft lilac: tiles, pills, tracks
  lavender: '#CBB5F4', // pastel lavender: borders on selection, decorative
  pink: '#F8EAF3', // soft pink: secondary pastel tiles
  text: '#392653', // deep plum
  textSecondary: '#76698E', // muted plum for supporting text
  border: '#ECE6FA',
  inactive: '#A99DC0', // inactive icons
  error: '#C2334D',
};

export const appRadius = { card: 28, hero: 32, pill: 999 };

export const appShadow = {
  card: {
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.07,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  button: {
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
};
