import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius, shadow } from '../theme';

const DEFAULT_EXPLANATIONS = {
  Low: 'Your current score suggests room to strengthen your everyday cybersecurity habits.',
  Medium: 'You have solid foundations, with a few key areas where consistent habits will boost your protection.',
  High: 'Your answers reflect strong, consistent cybersecurity practices.',
};

const LEVEL_COLORS = {
  Low: colors.error,
  Medium: colors.accent,
  High: colors.primary,
};

export default function ScoreCard({
  title = 'Your Overall Score',
  overallScore,
  overallLevel,
  maxScore = 7,
  explanations = DEFAULT_EXPLANATIONS,
  caption,
}) {
  const numericScore = Number(overallScore);
  const scaleMax = Number(maxScore) || 7;
  const levelColor = LEVEL_COLORS[overallLevel] || colors.primary;

  // 1..7 -> ((score - 1) / 6) * 100 | 1..5 -> ((score - 1) / 4) * 100
  const denominator = scaleMax > 1 ? scaleMax - 1 : 1;
  const fillPct = Number.isFinite(numericScore)
    ? Math.max(0, Math.min(100, ((numericScore - 1) / denominator) * 100))
    : 0;

  const explanationText =
    (overallLevel && explanations && explanations[overallLevel]) || caption || '';

  return (
    <View style={[styles.card, shadow.soft]}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.scoreRow}>
        <Text style={styles.score}>
          {Number.isFinite(numericScore) ? numericScore.toFixed(2) : '—'}
        </Text>
        <Text style={styles.outOf}> / {scaleMax}</Text>
      </View>

      {overallLevel ? (
        <View style={[styles.badge, { backgroundColor: levelColor + '22' }]}>
          <Text style={[styles.badgeText, { color: levelColor }]}>
            {overallLevel}
          </Text>
        </View>
      ) : null}

      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            {
              width: `${fillPct}%`,
              backgroundColor: levelColor,
            },
          ]}
        />
      </View>

      {explanationText ? (
        <Text style={styles.explanation}>{explanationText}</Text>
      ) : null}
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
  score: {
    ...typography.h1,
    fontSize: 48,
    color: colors.primary,
  },
  outOf: {
    ...typography.body,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
    marginBottom: spacing.xs,
  },
  badge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    marginBottom: spacing.md,
  },
  badgeText: {
    ...typography.label,
  },
  track: {
    height: 8,
    width: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.lilacSoft,
    overflow: 'hidden',
    marginVertical: spacing.sm,
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  explanation: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});