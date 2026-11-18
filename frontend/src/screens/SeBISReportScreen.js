import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import ScreenBackground from '../components/ScreenBackground';
import AuthHeader from '../components/AuthHeader';
import CustomButton from '../components/CustomButton';
import ScoreCard from '../components/ScoreCard';
import SubscaleResultCard from '../components/SubscaleResultCard';
import { colors, typography, spacing, radius, shadow } from '../theme';
import { fetchLatestProfile } from '../services/sebisApi';

const SEBIS_LEVEL_EXPLANATIONS = {
  Low: 'Your current answers suggest room to build stronger everyday cybersecurity habits.',
  Medium: 'You already follow several good security practices, with a few key areas to strengthen.',
  High: 'Your answers reflect strong, consistent everyday cybersecurity habits.',
};

const IMPROVEMENT_TIPS = {
  device_securement: {
    why: 'Leaving phones or laptops unlocked makes it easy for anyone nearby to access your accounts.',
    action: 'Set an automatic screen lock under 1 minute and use a strong PIN, password, or biometric lock.',
  },
  password_generation: {
    why: 'Reusing simple passwords allows a single leak to compromise multiple accounts.',
    action: 'Use a password manager to generate unique, complex passwords for every important account.',
  },
  proactive_awareness: {
    why: 'Rushing through links and security warnings increases the risk of phishing and malware.',
    action: 'Pause to verify sender addresses and website URLs before clicking links or entering credentials.',
  },
  updating: {
    why: 'Delaying software updates leaves known security flaws open to attackers.',
    action: 'Enable automatic operating system and app updates so patches install promptly.',
  },
};

export default function SeBISReportScreen({ navigation, route }) {
  const { userId, result: initialResult, fromLearn } = route.params || {};
  const [status, setStatus] = useState(initialResult?.profile ? 'ready' : 'loading');
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(initialResult?.profile || null);

  const load = useCallback(async () => {
    if (initialResult?.profile) {
      setProfile(initialResult.profile);
      setStatus('ready');
      return;
    }
    if (!userId) {
      setError('We could not tell whose results to show. Please go back and try again.');
      setStatus('error');
      return;
    }
    setStatus('loading');
    setError(null);
    try {
      const data = await fetchLatestProfile(userId);
      setProfile(data.profile);
      setStatus('ready');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }, [userId, initialResult]);

  useEffect(() => {
    load();
  }, [load]);

  function handleReturnHome() {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  }

  function handleContinueToPMT() {
    navigation.navigate('PMTIntro', { userId });
  }

  if (status === 'loading') {
    return (
      <ScreenBackground circuit={false}>
        <SafeAreaView style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading your SeBIS report...</Text>
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  if (status === 'error' || !profile) {
    return (
      <ScreenBackground circuit={false}>
        <SafeAreaView style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={40} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <CustomButton title="Try Again" onPress={load} style={styles.centerButton} />
          <CustomButton
            title={fromLearn ? 'Back to Learn' : 'Return to Home'}
            variant="outline"
            onPress={fromLearn ? () => navigation.goBack() : handleReturnHome}
            style={styles.centerButton}
          />
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  const scores = profile.subscale_scores || {};
  const levels = profile.subscale_levels || {};
  const weakAreas = Object.keys(scores).filter(
    (key) => levels[key] === 'Low' && IMPROVEMENT_TIPS[key]
  );

  return (
    <ScreenBackground circuit={false}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <AuthHeader
            title="Your Security Report"
            subtitle="Based on your SeBIS assessment - reflecting your everyday cybersecurity habits."
          />

          <ScoreCard
            title="Your Overall SeBIS Score"
            overallScore={profile.overall_score}
            overallLevel={profile.overall_level}
            maxScore={5}
            explanations={SEBIS_LEVEL_EXPLANATIONS}
          />

          <Text style={styles.sectionTitle}>Category Breakdown</Text>
          {Object.keys(scores).map((subscaleKey) => (
            <SubscaleResultCard
              key={subscaleKey}
              subscaleKey={subscaleKey}
              score={scores[subscaleKey]}
              level={levels[subscaleKey]}
              maxScore={5}
            />
          ))}

          {weakAreas.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Areas to Improve</Text>
              {weakAreas.map((key) => {
                const tip = IMPROVEMENT_TIPS[key];
                return (
                  <View key={key} style={[styles.tipCard, shadow.soft]}>
                    <Text style={styles.tipTitle}>
                      {key
                        .split('_')
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(' ')}
                    </Text>
                    <Text style={styles.tipWhy}>{tip.why}</Text>
                    <View style={styles.actionRow}>
                      <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                      <Text style={styles.tipAction}>{tip.action}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {!fromLearn && (
            <View style={[styles.nextStepCard, shadow.soft]}>
              <View style={styles.nextStepHeader}>
                <Ionicons name="arrow-forward-circle" size={22} color={colors.primary} />
                <Text style={styles.nextStepTitle}>Next: Protection Motivation (PMT)</Text>
              </View>
              <Text style={styles.nextStepBody}>
                Continue to the Protection Motivation Theory (PMT) questionnaire to assess how you
                perceive cyber threats and your confidence in protective actions.
              </Text>
              <CustomButton
                title="Continue to PMT Assessment"
                onPress={handleContinueToPMT}
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
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  errorText: {
    ...typography.body,
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  centerButton: {
    width: '100%',
    marginBottom: spacing.md,
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