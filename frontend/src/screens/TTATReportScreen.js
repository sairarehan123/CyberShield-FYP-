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
import { getOrCreateGuestUserId } from '../services/guestUser';
import { getUserSession } from '../utils/session';
import { colors, typography, spacing, radius, shadow } from '../theme';

const CONSTRUCTS = [
  {
    key: 'perceived_susceptibility',
    label: 'Perceived Susceptibility',
    description: 'How vulnerable you feel to experiencing a computer security breach.',
  },
  {
    key: 'perceived_severity',
    label: 'Perceived Severity',
    description: 'How serious you believe the consequences of a security breach would be.',
  },
  {
    key: 'perceived_threat',
    label: 'Perceived Threat',
    description: 'Your overall sense of danger and privacy risk from cyber threats.',
  },
  {
    key: 'response_effectiveness',
    label: 'Response Effectiveness',
    description: 'How effective you believe security software is at preventing breaches.',
  },
  {
    key: 'self_efficacy',
    label: 'Self-Efficacy',
    description: 'Your confidence in installing and using security software on your own.',
  },
  {
    key: 'response_cost',
    label: 'Low Response Cost',
    description: 'How easy and low-effort you perceive enabling security software to be (reverse-scored).',
  },
];

const TTAT_IMPROVEMENT_TIPS = {
  perceived_susceptibility: {
    why: 'Assuming breaches only happen to others lowers everyday vigilance.',
    action: 'Stay proactive with phishing checks and account alerts—everyone online is a potential target.',
  },
  perceived_severity: {
    why: 'Downplaying breach consequences can delay protective habits.',
    action: 'Protect sensitive accounts with strong passwords and backups so a single incident cannot cause major disruption.',
  },
  perceived_threat: {
    why: 'Low threat awareness makes risky downloads or links easier to overlook.',
    action: 'Pause before opening unexpected attachments or links and verify the sender first.',
  },
  response_effectiveness: {
    why: 'Doubting security tools can leave devices unprotected.',
    action: 'Keep built-in antivirus, firewalls, and browser protections enabled as your first line of defense.',
  },
  self_efficacy: {
    why: 'Uncertainty about configuring safeguards can prevent you from using them.',
    action: 'Follow guided step-by-step security checklists to build confidence managing your device settings.',
  },
  response_cost: {
    why: 'If safeguards feel inconvenient or slow, they are often disabled.',
    action: 'Enable lightweight, automated security tools that run quietly in the background.',
  },
};

export default function TTATReportScreen({ navigation, route }) {
  const { result, fromLearn } = route.params || {};
  const profile = result?.profile;

  async function handleStartTraining() {
    const userId = result?.user_id || (await getOrCreateGuestUserId());
    const session = await getUserSession();
    const userName = session?.full_name || session?.name || session?.email || undefined;
    navigation.navigate('Chatbot', {
      userId,
      userName,
      assessmentRoute: 'SeBISIntro',
    });
  }

  if (!profile || !profile.construct_scores) {
    return (
      <ScreenBackground circuit={false}>
        <SafeAreaView style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={40} color={colors.error} />
          <Text style={styles.errorText}>
            We couldn't load your TTAT report. Please try submitting the assessment again.
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
            title="Your Threat Avoidance Report"
            subtitle="Based on your TTAT assessment - threat appraisal and safeguard evaluation."
          />

          <ScoreCard
            title="Your Overall TTAT Score"
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
                const tip = TTAT_IMPROVEMENT_TIPS[construct.key];
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
        </ScrollView>

        <View style={styles.bottomBar}>
          {fromLearn ? (
            <CustomButton
              title="Back to Learn"
              variant="outline"
              onPress={() => navigation.goBack()}
            />
          ) : (
            <CustomButton
              title="Start Training"
              onPress={handleStartTraining}
            />
          )}
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
  bottomBar: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});