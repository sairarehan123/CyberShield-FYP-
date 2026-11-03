import React, { useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadow } from '../theme';

const SIZE = 54;

/** Circular icon button. variant: 'primary' (gradient) | 'light' */
export default function CircleButton({ icon, onPress, label, variant = 'primary' }) {
  const [scale] = useState(() => new Animated.Value(1));
  const isPrimary = variant === 'primary';

  const animate = (to) =>
    Animated.spring(scale, {
      toValue: to,
      speed: 40,
      bounciness: 0,
      useNativeDriver: true,
    }).start();

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => animate(0.92)}
      onPressOut={() => animate(1)}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
    >
      <Animated.View
        style={[
          styles.base,
          isPrimary ? styles.primaryShadow : styles.light,
          { transform: [{ scale }] },
        ]}
      >
        {isPrimary ? (
          <LinearGradient
            colors={colors.gradientPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fill}
          >
            <Ionicons name={icon} size={22} color={colors.white} />
          </LinearGradient>
        ) : (
          <View style={styles.fill}>
            <Ionicons name={icon} size={22} color={colors.primary} />
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { width: SIZE, height: SIZE, borderRadius: SIZE / 2, backgroundColor: colors.primary },
  primaryShadow: { ...shadow.soft },
  light: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 1,
  },
  fill: {
    flex: 1,
    borderRadius: SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
