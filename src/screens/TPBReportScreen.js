import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import ScreenBackground from '../components/ScreenBackground';
import AuthHeader from '../components/AuthHeader';
import CustomButton from '../components/CustomButton';
import ScoreCard from '../components/ScoreCard';
import SubscaleResultCard from '../components/SubscaleResultCard';
import { colors, typography, spacing, radius, shadow } from '../theme';

const CONSTRUCTS = [
  {
    key: 'attitude',
    label: 'Attitude',
    description: 'Your personal evaluation of performing cybersecurity behaviors.',
  },
  {
    key: 'subjective_norm',
    label: 'Subjective Norm',
    description: 'How much people important to you influence your cybersecurity behavior.',
  },
  {
    key: 'perceived_behavioral_control',
    label: 'Perceived Behavioral Control',
    description: 'How capable and in control you feel when performing cybersecurity behaviors.',
  },
];

const TPB_IMPROVEMENT_TIPS = {
  attitude: {
    why: 'Viewing security precautions as tedious makes it harder to stay consistent.',
    action: 'Reframe daily security habits as quick safeguards that protect your personal identity and work.',
  },
  subjective_norm: {
    why: 'When people around you ignore security, it is easy to lower your own standards.',
    action: 'Follow best practices recommended by security professionals even if peers take shortcuts.',
  },
  perceived_behavioral_control: {
    why: 'Feeling uncertain about security settings reduces follow-through.',
    action: 'Use built-in security checkups on your phone and browser to gain confidence step by step.',
  },
};

export default function TPBReportScreen({ navigation, route }) {
  const { result, userId, fromLearn } = route.params || {};
  const profile = result?.profile;

  function handleReturnHome() {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  }

  function handleContinueToTTAT() {
    navigation.navigate('TTATIntro', { userId });
  }

  if (!profile || !profile.construct_scores) {
    return (
      <ScreenBackground circuit={false}>
        <SafeAreaView style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={40} color={colors.error} />
          <Text style={styles.errorText}>
            We couldn't load your TPB report. Please try submitting the assessment again.
          </Text>
          <CustomButton title="Go Back" onPress={() => navigation.goBack()} />
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  const scores = profile.construct_scores;
  const levels = profile.construct_levels || {};
  const weakAreas = CONSTRUCTS.filter((c) => levels[c.key] === 'Low');

  return (
    <ScreenBackground circuit={false}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <AuthHeader
            title="Your Behavior Report"
            subtitle="Based on your TPB assessment - attitudes, social influences, and perceived control."
          />

          <ScoreCard
            title="Your Overall TPB Score"
            overallScore={profile.overall_score}
            overallLevel={profile.overall_level}
            maxScore={7}
          />

          <Text style={styles.sectionTitle}>Category Breakdown</Text>
          {CONSTRUCTS.map((construct) => (
            <SubscaleResultCard
              key={construct.key}
              subscaleKey={construct.key}
              label={construct.label}
              score={scores[construct.key]}
              level={levels[construct.key]}
              maxScore={7}
              note={construct.description}
            />
          ))}

          {weakAreas.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Areas to Improve</Text>
              {weakAreas.map((construct) => {
                const tip = TPB_IMPROVEMENT_TIPS[construct.key];
                return (
                  <View key={construct.key} style={[styles.tipCard, shadow.soft]}>
                    <Text style={styles.tipTitle}>{construct.label}</Text>
                    {tip && (
                      <>
                        <Text style={styles.tipWhy}>{tip.why}</Text>
                        <View style={styles.actionRow}>
                          <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                          <Text style={styles.tipAction}>{tip.action}</Text>
                        </View>
                      </>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {!fromLearn && (
            <View style={[styles.nextStepCard, shadow.soft]}>
              <View style={styles.nextStepHeader}>
                <Ionicons name="arrow-forward-circle" size={22} color={colors.primary} />
                <Text style={styles.nextStepTitle}>Next: Threat Avoidance (TTAT)</Text>
              </View>
              <Text style={styles.nextStepBody}>
                Complete the final questionnaire—Technology Threat Avoidance Theory (TTAT)—to evaluate
                how you perceive cyber threats and protective safeguards.
              </Text>
              <CustomButton
                title="Continue to TTAT Assessment"
                onPress={handleContinueToTTAT}
              />
            </View>
          )}
        </ScrollView>

        <View style={styles.bottomBar}>
          <CustomButton
            title={fromLearn ? 'Back to Learn' : 'Return to Home'}
            variant="outline"
            onPress={fromLearn ? () => navigation.goBack() : handleReturnHome}
          />
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  errorText: {
    ...typography.body,
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  section: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  tipCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  tipTitle: {
    ...typography.bodyStrong,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  tipWhy: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipAction: {
    ...typography.body,
    color: colors.text,
    marginLeft: spacing.sm,
    flex: 1,
  },
  nextStepCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: spacing.lg,
    marginTop: spacing.sm,
  },
  nextStepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  nextStepTitle: {
    ...typography.bodyStrong,
    color: colors.primary,
    marginLeft: spacing.sm,
  },
  nextStepBody: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 21,
    marginBottom: spacing.lg,
  },
  bottomBar: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});