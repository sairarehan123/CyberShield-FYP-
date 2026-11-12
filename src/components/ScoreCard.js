
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

export default function ScoreCard({ overallScore, overallLevel }) {
  const levelColor = LEVEL_COLORS[overallLevel] || colors.primary;

  const numericScore = Number(overallScore);

  const displayScore = Number.isFinite(numericScore)
    ? numericScore.toFixed(2)
    : '—';

  const fillPct = Number.isFinite(numericScore)
    ? Math.max(0, Math.min(100, ((numericScore - 1) / 4) * 100))
    : 0;

  return (
    <View style={[styles.card, shadow.soft]}>

      <Text style={styles.title}>
        Your Overall Security Score
      </Text>

      {/* SCORE DISPLAY */}
      <View style={styles.scoreRow}>
        <Text
          style={styles.scoreValue}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.75}
        >
          {displayScore}
        </Text>

        <Text style={styles.scoreOutOf}>
          / 5
        </Text>
      </View>

      {/* PERFORMANCE LEVEL */}
      <View
        style={[
          styles.levelBadge,
          { backgroundColor: levelColor + '22' },
        ]}
      >
        <Text style={[styles.levelText, { color: levelColor }]}>
          {overallLevel}
        </Text>
      </View>

      {/* PROGRESS BAR */}
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

      {/* EXPLANATION */}
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
    paddingTop: spacing.xl + spacing.sm,
    alignItems: 'center',
    marginBottom: spacing.lg,
    width: '100%',
    overflow: 'visible',
  },

  title: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },

  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: 68,
    paddingTop: 4,
    paddingBottom: 4,
    marginBottom: spacing.sm,
    overflow: 'visible',
  },

  scoreValue: {
    fontSize: 48,
    lineHeight: 62,
    fontWeight: '800',
    color: colors.primary,
    flexShrink: 0,
    includeFontPadding: true,
    textAlign: 'center',
  },

  scoreOutOf: {
    ...typography.h3,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
    flexShrink: 0,
    alignSelf: 'center',
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
    lineHeight: 23,
  },

});
