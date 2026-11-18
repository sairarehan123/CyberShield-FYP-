import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { getUserSession } from '../utils/session';
import ScreenBackground from '../components/ScreenBackground';
import AuthHeader from '../components/AuthHeader';
import CustomButton from '../components/CustomButton';
import ScoreCard from '../components/ScoreCard';
import { colors, typography, spacing, radius, shadow } from '../theme';
import { fetchUnifiedUserProfile } from '../services/sebisApi';
import { sebisAreaLabel, prettify } from '../utils/pmtReport';

const SUBSCALE_ORDER = [
  'device_securement',
  'password_generation',
  'proactive_awareness',
  'updating',
];

const THEORY_BADGES = {
  pmt: 'PMT',
  tpb: 'TPB',
  ttat: 'TTAT',
};

const LEVEL_COLORS = {
  Low: colors.error,
  Medium: colors.accent,
  High: colors.primary,
};

export default function Unified4SubscaleReportScreen({ navigation, route }) {
  const { userId } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);

  const loadProfile = useCallback(async () => {
    if (!userId) {
      setError('User ID is missing. Please complete the assessments again.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchUnifiedUserProfile(userId);
      setProfile(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  function handleReturnHome() {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  }

  async function handleStartTraining() {
  const session = await getUserSession();
  const userName = session?.full_name || session?.name || session?.email || undefined;
  navigation.navigate('Chatbot', {
    userId,
    userName,
    assessmentRoute: 'SeBISIntro',
  });
}

  if (loading) {
    return (
      <ScreenBackground circuit={false}>
        <SafeAreaView style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>
            Building your 4-subscale security & behavioral profile...
          </Text>
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  if (error || !profile || !profile.areas) {
    return (
      <ScreenBackground circuit={false}>
        <SafeAreaView style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={40} color={colors.error} />
          <Text style={styles.errorText}>
            {error || 'Unable to load your combined assessment profile.'}
          </Text>
          <CustomButton title="Try Again" onPress={loadProfile} style={styles.centerBtn} />
          <CustomButton
            title="Return to Home"
            variant="outline"
            onPress={handleReturnHome}
            style={styles.centerBtn}
          />
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  const { sebis, areas, theories_completed = [] } = profile;

  return (
    <ScreenBackground circuit={false}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <AuthHeader
            title="Complete Assessment Profile"
            subtitle={`Combined insights from ${theories_completed
              .map((t) => t.toUpperCase())
              .join(', ')} mapped across your 4 security subscales.`}
          />

          <ScoreCard
            title="Overall Security Score"
            overallScore={sebis.overall_score}
            overallLevel={sebis.overall_level}
            maxScore={5}
            caption="Your overall behavioral profile combining habits (SeBIS) with motivation, intention, and threat appraisal."
          />

          <Text style={styles.sectionTitle}>4-Subscale Behavioral Breakdown</Text>

          {SUBSCALE_ORDER.map((areaKey) => {
            const area = areas[areaKey];
            if (!area) return null;

            const levelColor = LEVEL_COLORS[area.sebis_level] || colors.primary;
            const score = Number(area.sebis_score);
            const pct = Number.isFinite(score)
              ? Math.max(0, Math.min(100, ((score - 1) / 4) * 100))
              : 0;

            return (
              <View key={areaKey} style={[styles.subscaleCard, shadow.soft]}>
                {/* Header: Subscale Name + Level Pill */}
                <View style={styles.subscaleHeader}>
                  <Text style={styles.subscaleTitle}>{sebisAreaLabel(areaKey)}</Text>
                  <View
                    style={[
                      styles.levelBadge,
                      { backgroundColor: levelColor + '22' },
                    ]}
                  >
                    <Text style={[styles.levelText, { color: levelColor }]}>
                      {area.sebis_level}
                    </Text>
                  </View>
                </View>

                {/* Score + Progress Bar */}
                <View style={styles.scoreRow}>
                  <Text style={styles.scoreValue}>
                    {Number.isFinite(score) ? score.toFixed(2) : '—'}
                  </Text>
                  <Text style={styles.scoreMax}> / 5</Text>
                </View>

                <View style={styles.track}>
                  <View
                    style={[
                      styles.fill,
                      { width: `${pct}%`, backgroundColor: levelColor },
                    ]}
                  />
                </View>

                {/* Psychological Factors from PMT, TPB & TTAT */}
                {area.reasons && area.reasons.length > 0 ? (
                  <View style={styles.driversBox}>
                    <Text style={styles.driversHeading}>
                      Key Psychological Factors (PMT · TPB · TTAT)
                    </Text>
                    {area.reasons.map((reason, idx) => (
                      <View key={`${reason.theory}-${reason.construct}-${idx}`} style={styles.driverRow}>
                        <View style={styles.theoryPill}>
                          <Text style={styles.theoryPillText}>
                            {THEORY_BADGES[reason.theory] || reason.theory.toUpperCase()}
                          </Text>
                        </View>
                        <View style={styles.driverContent}>
                          <Text style={styles.driverTitle}>
                            {prettify(reason.construct)} ({Number(reason.score).toFixed(2)}/7 · {reason.level})
                          </Text>
                          {reason.meaning_if_low ? (
                            <Text style={styles.driverDesc}>
                              Indicates {reason.meaning_if_low}.
                            </Text>
                          ) : null}
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.strongBox}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color={colors.primary}
                    />
                    <Text style={styles.strongText}>
                      {area.sebis_level === 'High'
                        ? 'Strong habit with supportive motivation, attitude, and threat appraisal.'
                        : 'Your motivation, attitude, and threat appraisal scores are supportive; building consistency will strengthen this area.'}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.bottomBar}>
          <CustomButton title="Start Training" onPress={handleStartTraining} />
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
    textAlign: 'center',
    marginTop: spacing.md,
  },
  errorText: {
    ...typography.body,
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  centerBtn: { width: '100%', marginBottom: spacing.md },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  subscaleCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  subscaleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  subscaleTitle: {
    ...typography.bodyStrong,
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  levelBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  levelText: {
    ...typography.label,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: spacing.xs,
  },
  scoreValue: {
    ...typography.h2,
    color: colors.primary,
  },
  scoreMax: {
    ...typography.body,
    color: colors.textSecondary,
  },
  track: {
    height: 8,
    width: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.lilacSoft,
    overflow: 'hidden',
    marginVertical: spacing.sm,
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  driversBox: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  driversHeading: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  theoryPill: {
    backgroundColor: colors.pink,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: spacing.sm,
    marginTop: 2,
  },
  theoryPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
  driverContent: {
    flex: 1,
  },
  driverTitle: {
    ...typography.label,
    color: colors.text,
  },
  driverDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  strongBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  strongText: {
    ...typography.caption,
    color: colors.textSecondary,
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