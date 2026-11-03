import React from 'react';
import { StyleSheet, View } from 'react-native';
import { appColors } from '../theme/appTheme';

/**
 * value: 0–1 continuous bar, OR pass `segments` + `filled` for a row of pill segments
 * (used by the assessment, echoing the pill shapes of the visual style).
 */
export default function ProgressBar({ value = 0, segments, filled = 0, height = 6, style }) {
  if (segments) {
    return (
      <View
        style={[styles.segRow, style]}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: segments, now: filled }}
      >
        {Array.from({ length: segments }, (_, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height,
              borderRadius: height / 2,
              marginLeft: i === 0 ? 0 : 4,
              backgroundColor: i < filled ? appColors.lavender : appColors.lilac,
            }}
          />
        ))}
      </View>
    );
  }
  const pct = `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%`;
  return (
    <View
      style={[styles.track, { height, borderRadius: height / 2 }, style]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(value * 100) }}
    >
      <View style={{ width: pct, height, borderRadius: height / 2, backgroundColor: appColors.lavender }} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { backgroundColor: appColors.lilac, overflow: 'hidden' },
  segRow: { flexDirection: 'row' },
});