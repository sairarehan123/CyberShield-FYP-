import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '../theme';

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
  base: { borderRadius: radius.lg, padding: spacing.lg },
  default: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 1,
  },
  soft: { backgroundColor: colors.lilacSoft },
});
