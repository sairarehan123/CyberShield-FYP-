import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow, spacing, typography } from '../theme';

/**
 * variant: 'primary' (gradient) | 'outline' | 'text'
 */
export default function CustomButton({
  title,
  onPress,
  variant = 'primary',
  icon,
  iconRight,
  loading = false,
  disabled = false,
  style,
}) {
  const isPrimary = variant === 'primary';
  const inactive = disabled || loading;

  const content = (
    <View style={styles.row}>
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.white : colors.primary} />
      ) : (
        <>
          {icon ? (
            <Ionicons
              name={icon}
              size={20}
              color={isPrimary ? colors.white : colors.text}
              style={styles.icon}
            />
          ) : null}
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
            style={[
              styles.label,
              isPrimary && { color: colors.white },
              variant === 'outline' && { color: colors.text },
              variant === 'text' && { color: colors.primary },
            ]}
          >
            {title}
          </Text>
          {iconRight ? (
            <Ionicons
              name={iconRight}
              size={20}
              color={isPrimary ? colors.white : colors.text}
              style={styles.iconRight}
            />
          ) : null}
        </>
      )}
    </View>
  );

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        isPrimary && shadow.soft,
        variant === 'outline' && styles.outline,
        variant === 'text' && styles.textOnly,
        pressed && { opacity: 0.92, transform: [{ scale: 0.97 }] },
        inactive && { opacity: 0.6 },
        style,
      ]}
    >
      {isPrimary ? (
        <LinearGradient
          colors={colors.gradientPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {content}
        </LinearGradient>
      ) : (
        <View style={styles.inner}>{content}</View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.md, minHeight: 54 },
  gradient: {
    borderRadius: radius.md,
    minHeight: 54,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
  },
  inner: { minHeight: 54, paddingHorizontal: spacing.xl, justifyContent: 'center' },
  outline: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textOnly: { minHeight: 44 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  icon: { marginRight: spacing.sm },
  iconRight: { marginLeft: spacing.sm },
  label: { ...typography.button, flexShrink: 1 },
});