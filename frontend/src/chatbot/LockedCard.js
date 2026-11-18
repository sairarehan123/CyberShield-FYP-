import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { spacing, typography, appColors, appShadow, glass } from './theme';
import { AppButton, Icon } from './ui';

const NAMES = { sebis: 'SeBIS', pmt: 'PMT', tpb: 'TPB', ttat: 'TTAT' };

/** Shown in the chat before the assessments are finished. Training, quiz and inbox are locked. */
export default function LockedCard({ missing, onTakeAssessment }) {
  const left = (missing || []).map((k) => NAMES[k] || k.toUpperCase());
  return (
    <View style={styles.card}>
      <View style={styles.icon}><Icon name="lock-closed-outline" size={24} color={appColors.primary} /></View>
      <Text style={styles.title}>Your personal training is locked</Text>
      <Text style={styles.body}>
        You can already ask me anything about staying safe online or about this app. Finish your assessment to unlock your
        training plan, the quiz and your progress.
      </Text>
      {left.length ? <Text style={styles.left}>Still to do: {left.join(', ')}</Text> : null}
      {onTakeAssessment ? <AppButton title="Take my assessment" icon="clipboard-outline" onPress={onTakeAssessment} style={{ marginTop: spacing.lg }} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: glass.bgStrong, borderRadius: 28, borderWidth: 1, borderColor: glass.border, padding: spacing.xl, marginBottom: spacing.md, ...appShadow.card },
  icon: { width: 48, height: 48, borderRadius: 16, backgroundColor: 'rgba(234,220,245,0.9)', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  title: { ...typography.h3, color: appColors.text },
  body: { ...typography.body, color: appColors.textSecondary, marginTop: spacing.sm },
  left: { ...typography.label, color: appColors.text, marginTop: spacing.md },
});
