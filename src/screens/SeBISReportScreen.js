import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenBackground from '../components/ScreenBackground';
import AuthHeader from '../components/AuthHeader';
import CustomButton from '../components/CustomButton';
import { colors, typography, spacing, radius, shadow } from '../theme';
import ScoreCard from '../components/ScoreCard';
import SubscaleResultCard from '../components/SubscaleResultCard';

const SUBSCALE_LABELS = {
  device_securement: 'Device Securement',
  password_generation: 'Password Generation',
  proactive_awareness: 'Proactive Awareness',
  updating: 'Staying Up-to-Date',
};

// Static, rule-based tips (no AI involved yet - placeholder for the
// future AI-guidance module). Based only on what SeBIS actually
// measures - not claiming to assess anything beyond that.
const IMPROVEMENT_TIPS = {
  device_securement: {
    why: 'Leaving devices unlocked means anyone nearby can access your accounts, messages, and files.',
    action: 'Set your phone and laptop to auto-lock after a short period of inactivity, and always use a PIN, passcode, or biometric lock.',
  },
  password_generation: {
    why: 'Reused or simple passwords mean one leaked account can expose all your other accounts too.',
    action: 'Use a different, strong password for every account - a password manager can generate and remember these for you.',
  },
  proactive_awareness: {
    why: 'Missing warning signs (suspicious links, fake sites) is one of the most common ways accounts get compromised.',
    action: 'Before clicking a link or entering information on a site, check the URL carefully and look for "https://" and a lock icon.',
  },
  updating: {
    why: 'Outdated software often has known security holes that attackers specifically look for.',
    action: 'Turn on automatic updates where possible, and install prompted updates as soon as they appear.',
  },
};

const STRENGTH_NOTES = {
  device_securement: 'You consistently lock your devices, reducing the risk of unauthorized physical access.',
  password_generation: 'You follow strong password habits, which significantly lowers your risk from leaked credentials.',
  proactive_awareness: "You're attentive to security warning signs before clicking or sharing information.",
  updating: 'You keep your software up-to-date, closing off a common entry point for attackers.',
};

export default function SeBISReportScreen({ navigation, route }) {
  const { result, answers, questions, answerScale } = route.params || {};

  if (!result || !result.profile) {
    return (
      <ScreenBackground circuit={false}>
        <SafeAreaView style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={40} color={colors.error} />
          <Text style={styles.errorText}>
            We couldn't load your report. Please try submitting the assessment again.
          </Text>
          <CustomButton title="Go Back" onPress={() => navigation.goBack()} />
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  const { profile } = result;
  const subscaleEntries = Object.entries(profile.subscale_scores);
  const weakAreas = subscaleEntries.filter(([key]) => profile.subscale_levels[key] === 'Low');
  const strengths = subscaleEntries.filter(([key]) => profile.subscale_levels[key] === 'High');

  function handleReviewAnswers() {
    if (!answers || !questions || !answerScale) return;
    navigation.navigate('SeBISReview', {
      userId: result.user_id,
      answers,
      questions,
      answerScale,
    });
  }

  function handleReturnHome() {
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  }

  return (
    <ScreenBackground circuit={false}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <AuthHeader
            title="Your Security Report"
            subtitle="Based on your SeBIS assessment - reflecting your reported habits, not a guarantee of safety."
          />

          <ScoreCard overallScore={profile.overall_score} overallLevel={profile.overall_level} />

          <Text style={styles.sectionTitle}>Category Breakdown</Text>
          {subscaleEntries.map(([key, score]) => (
            <SubscaleResultCard
              key={key}
              subscaleKey={key}
              score={score}
              level={profile.subscale_levels[key]}
            />
          ))}

          {weakAreas.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Areas to Improve</Text>
              {weakAreas.map(([key]) => {
                const tip = IMPROVEMENT_TIPS[key];
                return (
                  <View key={key} style={[styles.tipCard, shadow.soft]}>
                    <Text style={styles.tipTitle}>{SUBSCALE_LABELS[key] || key}</Text>
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

          {strengths.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Security Strengths</Text>
              {strengths.map(([key]) => (
                <View key={key} style={[styles.strengthCard, shadow.soft]}>
                  <Ionicons name="star" size={16} color={colors.accent} />
                  <Text style={styles.strengthText}>
                    {STRENGTH_NOTES[key] || `Strong habits in ${SUBSCALE_LABELS[key]}.`}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <Text style={styles.disclaimer}>
            This report reflects your self-reported habits from a validated questionnaire (SeBIS).
            It does not guarantee your accounts or devices are fully secure.
          </Text>
        </ScrollView>

        <View style={styles.bottomBar}>
          <View style={styles.secondaryRow}>
            <CustomButton
              title="Review Answers"
              variant="outline"
              onPress={handleReviewAnswers}
              style={styles.secondaryButton}
            />
            <CustomButton
              title="Return to Home"
              variant="outline"
              onPress={handleReturnHome}
              style={styles.secondaryButton}
            />
          </View>
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
  scrollContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  section: { marginTop: spacing.sm, marginBottom: spacing.lg },
  sectionTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.md },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  comparisonLabel: { ...typography.body, color: colors.textSecondary },
  comparisonValue: { ...typography.bodyStrong },
  tipCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  tipTitle: { ...typography.bodyStrong, color: colors.primary, marginBottom: spacing.xs },
  tipWhy: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.sm },
  actionRow: { flexDirection: 'row', alignItems: 'flex-start' },
  tipAction: { ...typography.body, color: colors.text, marginLeft: spacing.sm, flex: 1 },
  strengthCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  strengthText: { ...typography.body, color: colors.text, marginLeft: spacing.sm, flex: 1 },
  disclaimer: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  bottomBar: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  retakeButton: { marginBottom: spacing.sm },
  secondaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  secondaryButton: { flex: 1, marginHorizontal: spacing.xs },
});
