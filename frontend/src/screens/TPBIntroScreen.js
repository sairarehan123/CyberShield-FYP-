import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import ScreenBackground from '../components/ScreenBackground';
import AuthHeader from '../components/AuthHeader';
import CustomButton from '../components/CustomButton';
import { colors, typography, spacing, radius, shadow } from '../theme';
import { getOrCreateGuestUserId } from '../services/guestUser';

export default function TPBIntroScreen({ navigation }) {
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState(null);

  const handleStart = async () => {
    if (starting) return;

    setStarting(true);
    setError(null);

    try {
      const userId = await getOrCreateGuestUserId();

      navigation.navigate('TPBQuestionnaire', { userId });
    } catch (err) {
      setError(err.message || 'Could not start the assessment.');
    } finally {
      setStarting(false);
    }
  };

  return (
    <ScreenBackground circuit={false}>
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <AuthHeader
            title="Behavior Check-in"
            subtitle="Let's understand the factors behind your cybersecurity decisions."
            onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
          />

          <View style={[styles.iconCircle, shadow.soft]}>
            <Ionicons
              name="people-outline"
              size={48}
              color={colors.primary}
            />
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              14 questions · 7-point answer scale
            </Text>
          </View>

          <Text style={styles.description}>
            This assessment explores your attitude towards cybersecurity,
            the influence of people around you, and how much control you feel
            you have over performing protective actions.
          </Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <CustomButton
            title="Start Assessment"
            onPress={handleStart}
            loading={starting}
            disabled={starting}
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
    marginBottom: spacing.lg,
  },
  infoText: {
    ...typography.label,
    color: colors.primary,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  errorText: {
    ...typography.label,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  startButton: { width: '100%' },
});