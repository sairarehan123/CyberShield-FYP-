import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenBackground from '../components/ScreenBackground';
import AuthHeader from '../components/AuthHeader';
import CustomButton from '../components/CustomButton';
import ScoreCard from '../components/ScoreCard';
import SubscaleResultCard from '../components/SubscaleResultCard';
import { colors, typography, spacing, radius, shadow } from '../theme';
import { fetchCombinedProfile } from '../services/sebisApi';
import {
  PMT_CONSTRUCTS,
  PMT_GROUPS,
  constructLabel,
  extractReport,
} from '../utils/pmtReport';

const PMT_LEVEL_EXPLANATIONS = {
  Low: 'Your answers suggest your motivation to protect your devices is currently low. Small, confidence-building steps can help.',
  Medium: 'Your motivation to protect your devices is moderate, with some factors stronger than others.',
  High: 'Your answers suggest strong motivation to protect your devices.',
};

const PMT_IMPROVEMENT_TIPS = {
  perceived_severity: {
    why: 'Underestimating the impact of a breach can make everyday precautions feel unnecessary.',
    action: 'Consider how losing access to your email, banking, or personal photos would affect your daily life.',
  },
  perceived_vulnerability: {
    why: 'Feeling immune to attacks often leads to overlooking suspicious messages or unpatched apps.',
    action: 'Remember that automated attacks target everyday users indiscriminately—stay alert even on familiar accounts.',
  },
  response_efficacy: {
    why: 'Doubting that security habits work reduces motivation to keep them up.',
    action: 'Focus on proven high-impact habits like strong unique passwords and two-factor authentication.',
  },
  self_efficacy: {
    why: 'Security steps feel overwhelming when you are unsure how to configure them.',
    action: 'Start with one simple built-in setting at a time, such as enabling automatic device lock or updates.',
  },
  response_cost: {
    why: 'When security feels slow or inconvenient, it is tempting to skip it.',
    action: 'Use tools like biometric unlock and password managers so staying secure takes almost zero extra effort.',
  },
};

export default function PMTReportScreen({ navigation, route }) {
  const { userId, result: initialResult, fromLearn } = route.params || {};
  const [status, setStatus] = useState(initialResult?.profile ? 'ready' : 'loading');
  const [error, setError] = useState(null);
  const [pmtProfile, setPmtProfile] = useState(initialResult?.profile || null);

  const load = useCallback(async () => {
    if (initialResult?.profile) {
      setPmtProfile(initialResult.profile);
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
      const data = await fetchCombinedProfile(userId);
      const report = extractReport(data);
      if (!report.hasPmt) {
        setError("We couldn't find your PMT results yet.");
        setStatus('error');
        return;
      }
      setPmtProfile(report.pmtProfile);
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
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  }

  function handleContinueToTPB() {
    navigation.navigate('TPBIntro', { userId });
  }

  if (status === 'loading') {
    return (
      <ScreenBackground circuit={false}>
        <SafeAreaView style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading your PMT report...</Text>
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  if (status === 'error' || !pmtProfile) {
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

  const scores = pmtProfile.construct_scores || {};
  const levels = pmtProfile.construct_levels || {};
  const allConstructs = PMT_GROUPS.flatMap((g) => g.constructs).filter((c) => scores[c] !== undefined);
  const weakAreas = allConstructs.filter((c) => levels[c] === 'Low' && PMT_IMPROVEMENT_TIPS[c]);

  return (
    <ScreenBackground circuit={false}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <AuthHeader
            title="Your Motivation Report"
            subtitle="Based on your PMT assessment - reflecting your protection motivation and threat appraisal."
          />

          <ScoreCard
            title="Your Overall PMT Score"
            overallScore={pmtProfile.overall_score}
            overallLevel={pmtProfile.overall_level}
            maxScore={7}
            explanations={PMT_LEVEL_EXPLANATIONS}
          />

          <Text style={styles.sectionTitle}>Category Breakdown</Text>
          {allConstructs.map((c) => (
            <SubscaleResultCard
              key={c}
              subscaleKey={c}
              label={constructLabel(c)}
              score={scores[c]}
              level={levels[c]}
              maxScore={7}
              note={PMT_CONSTRUCTS[c] ? PMT_CONSTRUCTS[c].note : undefined}
            />
          ))}

          {weakAreas.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Areas to Improve</Text>
              {weakAreas.map((c) => {
                const tip = PMT_IMPROVEMENT_TIPS[c];
                return (
                  <View key={c} style={[styles.tipCard, shadow.soft]}>
                    <Text style={styles.tipTitle}>{constructLabel(c)}</Text>
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
                <Text style={styles.nextStepTitle}>Next: Theory of Planned Behavior (TPB)</Text>
              </View>
              <Text style={styles.nextStepBody}>
                Continue to the Theory of Planned Behavior (TPB) questionnaire to evaluate how your
                attitudes, social expectations, and perceived control shape your cybersecurity decisions.
              </Text>
              <CustomButton
                title="Continue to TPB Assessment"
                onPress={handleContinueToTPB}
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
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  loadingText: { ...typography.body, color: colors.textSecondary, marginTop: spacing.md },
  errorText: { ...typography.body, color: colors.text, textAlign: 'center', marginTop: spacing.md, marginBottom: spacing.lg },
  centerButton: { width: '100%', marginBottom: spacing.md },
  scrollContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
  section: { marginTop: spacing.sm, marginBottom: spacing.lg },
  sectionTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.md },
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