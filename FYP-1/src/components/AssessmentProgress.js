import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '../theme';

/**
 * current: 1-based index of the question currently shown (e.g. 1 of 16)
 * total: total number of questions (16)
 * answeredCount: number of questions with a saved answer (independent
 *                of how far the user has navigated)
 */
export default function AssessmentProgress({ current, total, answeredCount }) {
  const progressPct = Math.min(100, Math.round((current / total) * 100));

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.questionLabel}>
          QUESTION {current} OF {total}
        </Text>
        <Text style={styles.answeredLabel}>{answeredCount} answered</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progressPct}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  questionLabel: {
    ...typography.label,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  answeredLabel: {
    ...typography.label,
    color: colors.primary,
  },
  track: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.lilacSoft,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
});
