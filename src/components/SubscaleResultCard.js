import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius, shadow } from '../theme';

const SUBSCALE_LABELS = {
  device_securement: 'Device Securement',
  password_generation: 'Password Generation',
  proactive_awareness: 'Proactive Awareness',
  updating: 'Staying Up-to-Date',
};

const LEVEL_COLORS = {
  Low: colors.error,
  Medium: colors.accent,
  High: colors.primary,
};

/**
 * subscaleKey: e.g. 'password_generation'
 * score: e.g. 3.25
 * level: 'Low' | 'Medium' | 'High'
 */
export default function SubscaleResultCard({ subscaleKey, score, level }) {
  const levelColor = LEVEL_COLORS[level] || colors.primary;
  const fillPct = Math.max(0, Math.min(100, ((score - 1) / 4) * 100));
  const label = SUBSCALE_LABELS[subscaleKey] || subscaleKey;

  return (
    <View style={[styles.card, shadow.soft]}>
      <View style={styles.headerRow}>
        <Text style={styles.name}>{label}</Text>
        <View style={[styles.levelBadge, { backgroundColor: levelColor + '22' }]}>
          <Text style={[styles.levelText, { color: levelColor }]}>{level}</Text>
        </View>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${fillPct}%`, backgroundColor: levelColor }]} />
      </View>
      <Text style={styles.scoreText}>{score} / 5</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  name: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  levelBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  levelText: {
    ...typography.caption,
  },
  track: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.lilacSoft,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  scoreText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
