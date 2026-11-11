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
  sebisAreaLabel,
  isDraftMapping,
  extractReport,
} from '../utils/pmtReport';

const PMT_LEVEL_EXPLANATIONS = {
  Low: 'Your answers suggest your motivation to protect your devices is currently low. Small, confidence-building steps can help.',
  Medium: 'Your motivation to protect your devices is moderate, with some factors stronger than others.',
  High: 'Your answers suggest strong motivation to protect your devices.',
};

const LEVEL_COLORS = { Low: colors.error, Medium: colors.accent, High: colors.primary };

/**
 * Shows the PMT result (and the combined SeBIS + PMT picture) exactly as the backend returns it from
 * GET /assessment/profile/{user_id}. No score is calculated or reversed here.
 */
export default function PMTReportScreen({ navigation, route }) {
  const { userId } = route.params || {};
  const [status, setStatus] = useState('loading'); // 'loading' | 'error' | 'ready'
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const load = useCallback(async () => {
    if (!userId) {
      setError('We could not tell whose results to show. Please go back and try again.');
      setStatus('error');
      return;
    }
    setStatus('loading');
    setError(null);
    try {
      setData(await fetchCombinedProfile(userId));
      setStatus('ready');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  function handleReturnHome() {
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  }

  if (status === 'loading') {
    return (
      <ScreenBackground circuit={false}>
        <SafeAreaView style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading your results...</Text>
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  if (status === 'error') {
    return (
      <ScreenBackground circuit={false}>
        <SafeAreaView style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={40} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <CustomButton title="Try Again" onPress={load} style={styles.centerButton} />
          <CustomButton title="Return to Home" variant="outline" onPress={handleReturnHome} style={styles.centerButton} />
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  const report = extractReport(data);
  const { pmtProfile } = report;

  // The user's PMT result is missing (e.g. only SeBIS was ever submitted).
  if (!report.hasPmt) {
    return (
      <ScreenBackground circuit={false}>
        <SafeAreaView style={styles.centered}>
          <Ionicons name="information-circle-outline" size={40} color={colors.primary} />
          <Text style={styles.errorText}>
            We couldn't find your PMT results yet. Complete the PMT questionnaire to see them here.
          </Text>
          <CustomButton title="Start PMT Questionnaire" onPress={() => navigation.navigate('PMTIntro')} style={styles.centerButton} />
          <CustomButton title="Return to Home" variant="outline" onPress={handleReturnHome} style={styles.centerButton} />
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  const scores = pmtProfile.construct_scores;
  const levels = pmtProfile.construct_levels || {};
  const weakest = pmtProfile.weakest_area;

  return (
    <ScreenBackground circuit={false}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <AuthHeader
            title="Your Motivation Report"
            subtitle="Based on your PMT answers: why you do, or don't, protect your devices."
          />

          <ScoreCard
            title="Your Protection Motivation"
            overallScore={pmtProfile.overall_score}
            overallLevel={pmtProfile.overall_level}
            maxScore={7}
            explanations={PMT_LEVEL_EXPLANATIONS}
            caption="Based on the five PMT factors. A higher score always means stronger protection motivation."
          />

          <Text style={styles.sectionTitle}>Threat vs. Coping</Text>
          <SubscaleResultCard
            subscaleKey="threat_appraisal"
            label="Threat appraisal"
            score={pmtProfile.threat_appraisal_score}
            maxScore={7}
            note="How serious and how personal online threats feel to you."
          />
          <SubscaleResultCard
            subscaleKey="coping_appraisal"
            label="Coping appraisal"
            score={pmtProfile.coping_appraisal_score}
            maxScore={7}
            note="How effective, doable and low-effort protective actions feel to you."
          />

          {PMT_GROUPS.map((group) => {
            const present = group.constructs.filter((c) => scores[c] !== undefined);
            if (!present.length) return null;
            return (
              <View key={group.key} style={styles.section}>
                <Text style={styles.sectionTitle}>{group.title}</Text>
                <Text style={styles.sectionDescription}>{group.description}</Text>
                {present.map((c) => (
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
              </View>
            );
          })}

          {report.extraConstructs.map((c) => (
            <SubscaleResultCard key={c} subscaleKey={c} label={constructLabel(c)} score={scores[c]} level={levels[c]} maxScore={7} />
          ))}

          {weakest ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Weakest PMT Area</Text>
              <View style={[styles.highlightCard, shadow.soft]}>
                <Text style={styles.highlightTitle}>{constructLabel(weakest)}</Text>
                <Text style={styles.highlightText}>
                  This was the lowest-scoring of your five PMT factors, so it is a good place to focus.
                  {weakest === 'response_cost'
                    ? ' A lower score here means protective steps feel costly, slow or inconvenient to you.'
                    : ''}
                </Text>
              </View>
            </View>
          ) : null}

          <CombinedProfile
            report={report}
            data={data}
            onStartSebis={() => navigation.navigate('SeBISIntro')}
          />

          <Text style={styles.disclaimer}>
            These results reflect your self-reported answers to the PMT questionnaire. They describe your
            motivation, not a guarantee of how safe your devices are.
          </Text>
        </ScrollView>

        <View style={styles.bottomBar}>
          <CustomButton title="Return to Home" variant="outline" onPress={handleReturnHome} />
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}

/** SeBIS (habits) + PMT (motivation) together, via the backend's theory_links. Always labelled draft. */
function CombinedProfile({ report, data, onStartSebis }) {
  const { sebisProfile, theoryLinks, areas } = report;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Habits and Motivation Together</Text>

      {!report.hasSebis || !theoryLinks ? (
        <View style={[styles.infoCard, shadow.soft]}>
          <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
          <View style={styles.infoBody}>
            <Text style={styles.infoText}>
              Complete the SeBIS check-in to see how your everyday habits connect to the motivation shown above.
            </Text>
            <CustomButton title="Start SeBIS Questionnaire" variant="outline" onPress={onStartSebis} style={styles.infoButton} />
          </View>
        </View>
      ) : (
        <>
          <ProvisionalBanner status={theoryLinks.mapping_status} />

          <SubscaleResultCard
            subscaleKey="sebis_overall"
            label="Your everyday habits (SeBIS overall)"
            score={sebisProfile.overall_score}
            level={sebisProfile.overall_level}
            maxScore={5}
          />

          {theoryLinks.focus && theoryLinks.focus.message ? (
            <View style={[styles.highlightCard, shadow.soft]}>
              <Text style={styles.highlightTitle}>Suggested focus (draft)</Text>
              <Text style={styles.highlightText}>{theoryLinks.focus.message}</Text>
            </View>
          ) : null}

          {areas.length ? <Text style={styles.subTitle}>By habit area</Text> : null}
          {areas.map(([key, info]) => {
            const levelColor = LEVEL_COLORS[info.sebis_level] || colors.primary;
            return (
              <View key={key} style={[styles.areaCard, shadow.soft]}>
                <View style={styles.areaHeader}>
                  <Text style={styles.areaName}>{sebisAreaLabel(key)}</Text>
                  {info.sebis_level ? (
                    <View style={[styles.badge, { backgroundColor: levelColor + '22' }]}>
                      <Text style={[styles.badgeText, { color: levelColor }]}>{info.sebis_level}</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.areaBarrier}>
                  {info.likely_barrier
                    ? `Possible barrier (draft): ${constructLabel(info.likely_barrier)}`
                    : 'No motivation barrier flagged for this area.'}
                </Text>
              </View>
            );
          })}
        </>
      )}
    </View>
  );
}

function ProvisionalBanner({ status }) {
  const draft = isDraftMapping(status);
  return (
    <View style={styles.provisional}>
      <Ionicons name="construct-outline" size={18} color={colors.primary} />
      <Text style={styles.provisionalText}>
        {draft
          ? 'Provisional: this link between your habits (SeBIS) and your motivation (PMT) is a draft mapping, pending supervisor approval. Treat it as a working idea, not a confirmed conclusion.'
          : `Mapping status: ${status}.`}
      </Text>
    </View>
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
  sectionTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.sm },
  sectionDescription: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.md },
  subTitle: { ...typography.bodyStrong, color: colors.text, marginTop: spacing.md, marginBottom: spacing.sm },
  highlightCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  highlightTitle: { ...typography.bodyStrong, color: colors.primary, marginBottom: spacing.xs },
  highlightText: { ...typography.body, color: colors.text },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  infoBody: { flex: 1, marginLeft: spacing.sm },
  infoText: { ...typography.body, color: colors.text },
  infoButton: { marginTop: spacing.md },
  provisional: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.lilacSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  provisionalText: { ...typography.label, color: colors.text, marginLeft: spacing.sm, flex: 1 },
  areaCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  areaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  areaName: { ...typography.bodyStrong, color: colors.text, flex: 1, marginRight: spacing.sm },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.pill },
  badgeText: { ...typography.caption },
  areaBarrier: { ...typography.body, color: colors.textSecondary },
  disclaimer: { ...typography.caption, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md },
  bottomBar: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
