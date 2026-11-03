import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { spacing } from '../theme';
import { appColors, appRadius, appShadow } from '../theme/appTheme';

/** tone: 'default' (white, bordered) | 'soft' (lilac tint) */
export default function Card({ children, onPress, tone = 'default', style, accessibilityLabel }) {
  const toneStyle = tone === 'soft' ? styles.soft : styles.default;
  if (!onPress) return <View style={[styles.base, toneStyle, style]}>{children}</View>;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.base, toneStyle, style, pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: appRadius.card, padding: spacing.lg },
  default: {
    backgroundColor: appColors.white,
    borderWidth: 1,
    borderColor: appColors.border,
    ...appShadow.card,
  },
  soft: { backgroundColor: appColors.lilac },
});