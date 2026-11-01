import React from 'react';
import { StyleSheet, View } from 'react-native';
import CircuitDecor from './CircuitDecor';
import { colors } from '../theme';

// Soft lilac/pink shapes + faint circuit lines behind screen content.
// Background stays white so the logo (white PNG background) blends in seamlessly.
export default function ScreenBackground({ children, style, circuit = true }) {
  return (
    <View style={[styles.root, style]}>
      <View pointerEvents="none" style={[styles.blob, styles.blobTop]} />
      <View pointerEvents="none" style={[styles.blob, styles.blobBottom]} />
      {circuit ? <CircuitDecor /> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white, overflow: 'hidden' },
  blob: { position: 'absolute', borderRadius: 999 },
  blobTop: {
    width: 320,
    height: 320,
    top: -160,
    right: -120,
    backgroundColor: colors.lilac,
    opacity: 0.6,
  },
  blobBottom: {
    width: 360,
    height: 360,
    bottom: -200,
    left: -140,
    backgroundColor: colors.pink,
    opacity: 0.5,
  },
});
