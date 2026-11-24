import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius, shadow } from '../theme';

const SEBIS_LABELS = {
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

function formatKey(key) {
  return String(key || '')
    .split('_')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default function SubscaleResultCard({
  subscaleKey,
  label,
  score,
  level,
  maxScore = 7,
  note,
}) {
  const displayLabel = label || SEBIS_LABELS[subscaleKey] || formatKey(subscaleKey);
  const numericScore = Number(score);
  const scaleMax = Number(maxScore) || 7;

  // 1..7 -> ((score - 1) / 6) * 100 | 1..5 -> ((score - 1) / 4) * 100
  const denominator = scaleMax > 1 ? scaleMax - 1 : 1;
  const percentage = Number.isFinite(numericScore)
    ? Math.max(0, Math.min(100, ((numericScore - 1) / denominator) * 100))
    : 0;

  const badgeColor = LEVEL_COLORS[level] || colors.primary;

  return (
    <View style={[styles.card, shadow.soft]}>
      <View style={styles.header}>
        <Text style={styles.title}>{displayLabel}</Text>
        {level ? (
          <View style={[styles.badge, { backgroundColor: badgeColor + '22' }]}>
            <Text style={[styles.badgeText, { color: badgeColor }]}>{level}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            {
              width: `${percentage}%`,
              backgroundColor: badgeColor,
            },
          ]}
        />
      </View>

      <Text style={styles.scoreText}>
        {Number.isFinite(numericScore) ? numericScore.toFixed(2) : '—'} / {scaleMax}
      </Text>

      {note ? <Text style={styles.noteText}>{note}</Text> : null}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.bodyStrong,
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
    borderRadius: radius.pill,
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
    marginVertical: spacing.xs,
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  scoreText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  noteText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});