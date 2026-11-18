import React, { useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography, appColors, appShadow, glass, gradients } from './theme';

/** All icons go through this one component (so the icon source can be swapped in a single place). */
export function Icon({ name, size = 20, color = appColors.primary, style }) {
  return <Ionicons name={name} size={size} color={color} style={style} />;
}

/** A soft glowing circle: stacked translucent circles fake a blur without any extra package. */
function Glow({ size, color, style }) {
  const layers = [1, 0.82, 0.64, 0.46, 0.3];
  return (
    <View pointerEvents="none" style={[{ position: 'absolute', width: size, height: size }, style]}>
      {layers.map((k, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            width: size * k,
            height: size * k,
            borderRadius: (size * k) / 2,
            left: (size - size * k) / 2,
            top: (size - size * k) / 2,
            backgroundColor: color,
            opacity: 0.09,
          }}
        />
      ))}
    </View>
  );
}

/** Soft lilac-pink gradient with glows - the background of every chatbot screen. */
export function Background({ children }) {
  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={gradients.aurora} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <Glow size={380} color="#C95A9E" style={{ top: -120, left: -140 }} />
      <Glow size={340} color="#8F6BD6" style={{ top: 220, right: -170 }} />
      <Glow size={300} color="#F2A7CE" style={{ bottom: -90, left: -80 }} />
      {children}
    </View>
  );
}

/** Translucent white card. tone: 'glass' (default) | 'solid' */
export function Card({ children, onPress, tone = 'glass', style, accessibilityLabel }) {
  const base = [styles.card, tone === 'solid' ? styles.cardSolid : styles.cardGlass, style];
  if (!onPress) return <View style={base}>{children}</View>;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [base, pressed && { opacity: 0.92, transform: [{ scale: 0.99 }] }]}>
      {children}
    </Pressable>
  );
}

/** Round glass icon button (back, menu...). */
export function CircleButton({ icon, onPress, label, size = 44 }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={8}
      style={({ pressed }) => [styles.circle, { width: size, height: size, borderRadius: size / 2 }, pressed && { opacity: 0.85 }]}>
      <Icon name={icon} size={size * 0.46} color={appColors.text} />
    </Pressable>
  );
}

/** variant: 'primary' (brand gradient pill) | 'outline' (glass) | 'text' */
export function AppButton({ title, onPress, variant = 'primary', icon, iconRight, disabled = false, style, compact = false }) {
  const primary = variant === 'primary';
  const fg = primary ? '#fff' : appColors.primary;
  const inner = (
    <View style={styles.btnRow}>
      {icon ? <Icon name={icon} size={compact ? 16 : 20} color={fg} style={{ marginRight: spacing.sm }} /> : null}
      <Text numberOfLines={1} style={[styles.btnLabel, compact && { fontSize: 14 }, { color: fg }]}>{title}</Text>
      {iconRight ? <Icon name={iconRight} size={compact ? 16 : 20} color={fg} style={{ marginLeft: spacing.sm }} /> : null}
    </View>
  );
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={title} accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.btn, compact && { minHeight: 42 },
        variant === 'outline' && styles.btnOutline,
        primary && appShadow.button,
        pressed && { opacity: 0.92, transform: [{ scale: 0.97 }] },
        disabled && { opacity: 0.5 },
        style,
      ]}>
      {primary ? (
        <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[StyleSheet.absoluteFill, { borderRadius: 999 }]} />
      ) : null}
      {inner}
    </Pressable>
  );
}

/** Small rounded chip (suggestions, status). */
export function Chip({ label, icon, onPress, strong, style }) {
  const body = (
    <>
      {icon ? <Icon name={icon} size={14} color={strong ? '#fff' : appColors.primary} style={{ marginRight: 6 }} /> : null}
      <Text style={[styles.chipText, strong && { color: '#fff' }]} numberOfLines={1}>{label}</Text>
    </>
  );
  if (!onPress) return <View style={[styles.chip, strong && styles.chipStrong, style]}>{body}</View>;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label}
      style={({ pressed }) => [styles.chip, strong && styles.chipStrong, pressed && { opacity: 0.85 }, style]}>
      {body}
    </Pressable>
  );
}

export function Pill({ label, icon, style }) {
  return (
    <View style={[styles.pill, style]}>
      {icon ? <Icon name={icon} size={12} color={appColors.plum} style={{ marginRight: 4 }} /> : null}
      <Text style={styles.pillText}>{label}</Text>
    </View>
  );
}

export function ProgressBar({ value = 0, segments, filled = 0, height = 6, style }) {
  if (segments) {
    return (
      <View style={[{ flexDirection: 'row' }, style]} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: segments, now: filled }}>
        {Array.from({ length: segments }, (_, i) => (
          <View key={i} style={{ flex: 1, height, borderRadius: height / 2, marginLeft: i === 0 ? 0 : 4, backgroundColor: i < filled ? appColors.primary : 'rgba(142,47,112,0.15)' }} />
        ))}
      </View>
    );
  }
  const pct = `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%`;
  return (
    <View style={[{ height, borderRadius: height / 2, backgroundColor: 'rgba(142,47,112,0.15)', overflow: 'hidden' }, style]}
      accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(value * 100) }}>
      <View style={{ width: pct, height, borderRadius: height / 2, backgroundColor: appColors.primary }} />
    </View>
  );
}

/** Gradient circle with a letter (the user) or an icon. */
export function Avatar({ letter, size = 42 }) {
  return (
    <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#fff', fontWeight: '800', fontSize: size * 0.42 }}>{(letter || '?').charAt(0).toUpperCase()}</Text>
    </LinearGradient>
  );
}

export function useFloat(amount = 8, duration = 1800) {
  const [v] = useState(() => new Animated.Value(0));
  React.useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(v, { toValue: 1, duration, useNativeDriver: true }),
      Animated.timing(v, { toValue: 0, duration, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [v, duration]);
  return v.interpolate({ inputRange: [0, 1], outputRange: [0, -amount] });
}

const styles = StyleSheet.create({
  card: { borderRadius: 28, padding: spacing.lg },
  cardGlass: { backgroundColor: glass.bg, borderWidth: 1, borderColor: glass.border, ...appShadow.card },
  cardSolid: { backgroundColor: glass.bgStrong, borderWidth: 1, borderColor: glass.border, ...appShadow.card },
  circle: { backgroundColor: glass.bg, borderWidth: 1, borderColor: glass.border, alignItems: 'center', justifyContent: 'center', ...appShadow.card },
  btn: { minHeight: 54, borderRadius: 999, paddingHorizontal: spacing.xl, justifyContent: 'center', overflow: 'hidden' },
  btnOutline: { backgroundColor: glass.bg, borderWidth: 1, borderColor: glass.border },
  btnRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  btnLabel: { ...typography.button, flexShrink: 1 },
  chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: glass.bg, borderWidth: 1, borderColor: glass.border, borderRadius: 999, paddingHorizontal: spacing.md, paddingVertical: 9, marginRight: spacing.sm },
  chipStrong: { backgroundColor: appColors.primary, borderColor: appColors.primary },
  chipText: { ...typography.label, color: appColors.text },
  pill: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: 'rgba(234,220,245,0.85)', borderRadius: 999, paddingHorizontal: spacing.md, paddingVertical: 4 },
  pillText: { ...typography.caption, fontWeight: '600', color: appColors.text },
});
