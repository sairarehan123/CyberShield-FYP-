import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius, shadow } from '../theme';

const LEVEL_EXPLANATIONS = {
  Low: "Your reported habits suggest there's meaningful room to strengthen your everyday security behavior.",
  Medium: 'You follow some good security habits consistently, with a few areas still worth improving.',
  High: 'Your reported habits reflect strong, consistent security awareness. Keep it up.',
};

const LEVEL_COLORS = {
  Low: colors.error,
  Medium: colors.accent,
  High: colors.primary,
};

/**
 * overallScore: numeric score (e.g. 3.43), on the same 1-5 scale as
 *               the underlying SeBIS questions - this is NOT out of 100.
 * overallLevel: 'Low' | 'Medium' | 'High'
 */
export default function ScoreCard({ overallScore, overallLevel }) {
  const levelColor = LEVEL_COLORS[overallLevel] || colors.primary;
  // Scale is 1-5, so we show fill relative to that range for the visual indicator.
  const fillPct = Math.max(0, Math.min(100, ((overallScore - 1) / 4) * 100));

  return (
    <View style={[styles.card, shadow.soft]}>
      <Text style={styles.title}>Your Overall Security Score</Text>

      <View style={styles.scoreRow}>
        <Text style={styles.scoreValue}>{overallScore}</Text>
        <Text style={styles.scoreOutOf}>/ 5</Text>
      </View>

      <View style={[styles.levelBadge, { backgroundColor: levelColor + '22' }]}>
        <Text style={[styles.levelText, { color: levelColor }]}>{overallLevel}</Text>
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${fillPct}%`, backgroundColor: levelColor }]} />
      </View>

      <Text style={styles.explanation}>
        {LEVEL_EXPLANATIONS[overallLevel] || ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: spacing.sm,
  },
  scoreValue: {
    ...typography.h1,
    fontSize: 48,
    color: colors.primary,
  },
  scoreOutOf: {
    ...typography.h3,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
  },
  levelBadge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    marginBottom: spacing.lg,
  },
  levelText: {
    ...typography.bodyStrong,
  },
  track: {
    width: '100%',
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.lilacSoft,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  explanation: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
