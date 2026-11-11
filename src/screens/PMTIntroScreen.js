import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenBackground from '../components/ScreenBackground';
import AuthHeader from '../components/AuthHeader';
import CustomButton from '../components/CustomButton';
import { colors, typography, spacing, radius, shadow } from '../theme';
import { getOrCreateGuestUserId } from '../services/guestUser';

/** Mirrors SeBISIntroScreen. Uses the SAME guest user id so PMT links to the SeBIS result. */
export default function PMTIntroScreen({ navigation }) {
  const [starting, setStarting] = useState(false);

  const handleStart = async () => {
    if (starting) return;
    setStarting(true);
    try {
      const userId = await getOrCreateGuestUserId();
      navigation.navigate('PMTQuestionnaire', { userId });
    } finally {
      setStarting(false);
    }
  };

  return (
    <ScreenBackground circuit={false}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <AuthHeader
            title="Motivation Check-in"
            subtitle="Let's understand what motivates your security choices."
            onBack={navigation.canGoBack() ? navigation.goBack : undefined}
          />

          <View style={[styles.iconCircle, shadow.soft]}>
            <Ionicons name="shield-half" size={48} color={colors.primary} />
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>30 statements · 7-point agreement scale · about 5 minutes</Text>
          </View>

          <View style={[styles.card, shadow.soft]}>
            <Text style={styles.cardTitle}>What this measures</Text>
            <Text style={styles.cardText}>
              This check-in looks at your protection motivation: how serious and how likely you think online
              threats are, and how effective, doable and worthwhile you find protecting your devices.
            </Text>
            <Text style={styles.cardText}>
              For each statement, choose how much you agree, from Strongly disagree to Strongly agree.
            </Text>
            <Text style={styles.cardEmphasis}>There are no right or wrong answers. Answer honestly.</Text>
          </View>

          <CustomButton
            title="Start Assessment"
            onPress={handleStart}
            loading={starting}
            style={styles.startButton}
          />
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing.xxl,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: radius.pill,
    backgroundColor: colors.lilacSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  infoBox: {
    backgroundColor: colors.pink,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    marginBottom: spacing.xl,
  },
  infoText: { ...typography.label, color: colors.primary, textAlign: 'center' },
  card: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  cardTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.sm },
  cardText: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.sm },
  cardEmphasis: { ...typography.bodyStrong, color: colors.text },
  startButton: { width: '100%' },
});
