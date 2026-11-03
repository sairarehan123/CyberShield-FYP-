import React, { useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radius, spacing, typography } from '../theme';
import { appColors, appShadow } from '../theme/appTheme';

/** Button for the authenticated app. variant: 'primary' (purple) | 'outline' | 'text' */
export default function AppButton({ title, onPress, variant = 'primary', icon, iconRight, disabled = false, style }) {
  const primary = variant === 'primary';
  // White label on the filled brand button; brand-coloured label on outline/text buttons.
  const fg = primary ? appColors.white : appColors.primary;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.base,
        primary && styles.primary,
        variant === 'outline' && styles.outline,
        variant === 'text' && styles.text,
        pressed && { opacity: 0.92, transform: [{ scale: 0.97 }] },
        disabled && { opacity: 0.5 },
        style,
      ]}
    >
      <View style={styles.row}>
        {icon ? <Ionicons name={icon} size={20} color={fg} style={{ marginRight: spacing.sm }} /> : null}
        <Text numberOfLines={1} style={[styles.label, { color: fg }]}>{title}</Text>
        {iconRight ? <Ionicons name={iconRight} size={20} color={fg} style={{ marginLeft: spacing.sm }} /> : null}
      </View>
    </Pressable>
  );
}

/** Round icon button (e.g. Back in the assessment). */
export function AppCircleButton({ icon, onPress, label }) {
  const [scale] = useState(() => new Animated.Value(1));
  const to = (v) => Animated.spring(scale, { toValue: v, speed: 40, bounciness: 0, useNativeDriver: true }).start();
  return (
    <Pressable onPress={onPress} onPressIn={() => to(0.92)} onPressOut={() => to(1)} accessibilityRole="button" accessibilityLabel={label} hitSlop={6}>
      <Animated.View style={[styles.circle, { transform: [{ scale }] }]}>
        <Ionicons name={icon} size={22} color={appColors.plum} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: 54, borderRadius: radius.pill, paddingHorizontal: spacing.xl, justifyContent: 'center' },
  primary: { backgroundColor: appColors.primary, ...appShadow.button },
  outline: { backgroundColor: appColors.white, borderWidth: 1, borderColor: appColors.border },
  text: { minHeight: 44 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  label: { ...typography.button, flexShrink: 1 },
  circle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: appColors.white,
    borderWidth: 1,
    borderColor: appColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...appShadow.card,
  },
});