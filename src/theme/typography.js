import { Platform } from 'react-native';

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
