import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenBackground from '../components/ScreenBackground';
import AuthHeader from '../components/AuthHeader';
import CustomButton from '../components/CustomButton';
import { colors, typography, spacing, radius, shadow } from '../theme';
import { getOrCreateGuestUserId } from '../services/guestUser';

/**
 * ASSUMPTION FLAGGED: circuit={false} passed to ScreenBackground to
 * match LoginScreen.js's own choice, since CircuitDecor.js wasn't
 * shared (only needed if circuit={true}).
 * ASSUMPTION FLAGGED: no shield illustration asset was provided -
 * using an Ionicons icon below the logo as a placeholder.
 */
export default function SeBISIntroScreen({ navigation }) {
  const handleStart = async () => {
    const userId = await getOrCreateGuestUserId();
    navigation.navigate('SeBISQuestionnaire', { userId });
  };

  return (
    <ScreenBackground circuit={false}>
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <AuthHeader
            title="Security Check-in"
            subtitle="Let's understand your digital safety habits."
            onBack={navigation.canGoBack() ? navigation.goBack : undefined}
          />

          <View style={[styles.iconCircle, shadow.soft]}>
            <Ionicons name="shield-checkmark" size={48} color={colors.primary} />
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>16 quick questions · about 3 minutes</Text>
          </View>

          <CustomButton title="Start Assessment" onPress={handleStart} style={styles.startButton} />
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
    marginBottom: spacing.xxl,
  },
  infoText: { ...typography.label, color: colors.primary },
  startButton: { width: '100%' },
});
