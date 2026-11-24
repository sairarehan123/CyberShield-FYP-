import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme';

/** value: 0–1 */
export default function ProgressBar({ value, height = 6, style }) {
  const pct = `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%`;
  return (
    <View
      style={[styles.track, { height, borderRadius: height / 2 }, style]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(value * 100) }}
    >
      <View style={{ width: pct, height, borderRadius: height / 2, backgroundColor: colors.primaryLight }} />
    </View>
  );
}

const styles = StyleSheet.create({ track: { backgroundColor: colors.lilac, overflow: 'hidden' } });
