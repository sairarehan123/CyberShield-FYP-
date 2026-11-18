import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import ScreenBackground from '../components/ScreenBackground';
import CustomButton from '../components/CustomButton';
import { colors, radius, shadow, spacing, typography } from '../theme';
import { getUserSession } from '../utils/session';
import { fetchUnifiedUserProfile } from '../services/sebisApi';

const THEORY_RESULTS = [
  {
    key: 'sebis',
    title: 'SeBIS Result',
    subtitle: 'Security Behavior Intentions Scale report',
    icon: 'shield-checkmark-outline',
    screen: 'SeBISReport',
    introScreen: 'SeBISIntro',
  },
  {
    key: 'pmt',
    title: 'PMT Result',
    subtitle: 'Protection Motivation Theory report',
    icon: 'pulse-outline',
    screen: 'PMTReport',
    introScreen: 'PMTIntro',
  },
  {
    key: 'tpb',
    title: 'TPB Result',
    subtitle: 'Theory of Planned Behavior report',
    icon: 'compass-outline',
    screen: 'TPBReport',
    introScreen: 'TPBIntro',
  },
  {
    key: 'ttat',
    title: 'TTAT Result',
    subtitle: 'Technology Threat Avoidance Theory report',
    icon: 'eye-outline',
    screen: 'TTATReport',
    introScreen: 'TTATIntro',
  },
];

function extractTheoryProfile(unifiedData, key) {
  if (!unifiedData) return null;

  // SeBIS is returned at top-level `data.sebis`; PMT, TPB, TTAT are under `data.theories.{key}`
  const raw =
    key === 'sebis'
      ? unifiedData.sebis || unifiedData.theories?.sebis || unifiedData.profile
      : unifiedData.theories?.[key] || unifiedData[key];

  if (!raw) return null;

  // Unwrap if nested under `.profile`, otherwise return the profile object itself
  const inner = raw.profile ? raw.profile : raw;

  // Verify it actually has completed score data (not an empty placeholder)
  const hasScores =
    inner.overall_score !== undefined ||
    inner.subscale_scores !== undefined ||
    inner.construct_scores !== undefined;

  return hasScores ? inner : null;
}

export default function LearnScreen({ navigation }) {
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('');
  const [loadingKey, setLoadingKey] = useState(null);

  useEffect(() => {
    async function loadUser() {
      const session = await getUserSession();
      if (session) {
        setUserId(session.id || session.user_id || session.userId || null);
        setUserName(session.name || session.full_name || '');
      }
    }
    loadUser();
  }, []);

  const handleOpenResult = async (item) => {
    if (!userId) {
      Alert.alert('Session required', 'Please log in again to view your saved results.');
      return;
    }

    setLoadingKey(item.key);
    try {
      const unifiedData = await fetchUnifiedUserProfile(userId);
      const savedProfile = extractTheoryProfile(unifiedData, item.key);

      if (!savedProfile) {
        Alert.alert(
          `${item.title} not found`,
          `You have not completed the ${item.title.replace(' Result', '')} questionnaire yet. Would you like to take it now?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Start Questionnaire',
              onPress: () => navigation.navigate(item.introScreen, { userId }),
            },
          ]
        );
        return;
      }

      // All 4 report screens read `route.params.result.profile`
      navigation.navigate(item.screen, {
        result: {
          profile: savedProfile,
          user_id: userId,
        },
        userId,
        fromLearn: true,
      });
    } catch (err) {
      Alert.alert(
        'Could not load result',
        err.message || 'Please check your connection and try again.'
      );
    } finally {
      setLoadingKey(null);
    }
  };

  return (
    <ScreenBackground circuit={false}>
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Learn & Results</Text>
          <Text style={styles.subtitle}>
            Review your individual theory assessment reports or train with your AI coach.
          </Text>

          {/* AI Security Coach Card */}
          <View style={styles.coachCard}>
            <LinearGradient
              colors={colors.gradientPrimary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.coachIcon}
            >
              <Ionicons name="sparkles" size={24} color={colors.white} />
            </LinearGradient>
            <Text style={styles.coachTitle}>Aegis AI Security Coach</Text>
            <Text style={styles.coachText}>
              Personalized step-by-step security training tailored to your assessment results.
            </Text>
            <CustomButton
              title="Open AI Security Coach"
              icon="chatbubbles-outline"
              onPress={() =>
                navigation.navigate('Chatbot', {
                  userId,
                  userName,
                  assessmentRoute: 'SeBISIntro',
                })
              }
              style={styles.coachBtn}
            />
          </View>

          {/* 4 Theory Result Buttons */}
          <Text style={styles.sectionLabel}>Assessment Theory Results</Text>
          <View style={styles.list}>
            {THEORY_RESULTS.map((item) => {
              const isLoading = loadingKey === item.key;
              return (
                <Pressable
                  key={item.key}
                  onPress={() => handleOpenResult(item)}
                  disabled={loadingKey !== null}
                  style={({ pressed }) => [
                    styles.resultCard,
                    pressed && styles.pressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`View ${item.title}`}
                >
                  <View style={styles.iconBox}>
                    <Ionicons name={item.icon} size={22} color={colors.primary} />
                  </View>
                  <View style={styles.cardBody}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                  </View>
                  {isLoading ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={colors.textSecondary}
                    />
                  )}
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  coachCard: {
    alignItems: 'center',
    padding: spacing.xl,
    marginBottom: spacing.xl,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.soft,
  },
  coachIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  coachTitle: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'center',
  },
  coachText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  coachBtn: {
    alignSelf: 'stretch',
    marginTop: spacing.lg,
  },
  sectionLabel: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  list: {
    gap: spacing.md,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.soft,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.lilac,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.text,
  },
  cardSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
});