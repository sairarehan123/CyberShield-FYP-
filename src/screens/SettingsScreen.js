import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenBackground from '../components/ScreenBackground';
import CustomButton from '../components/CustomButton';
import { Section, Row, PrefSwitch } from '../components/SettingsList';
import { colors, radius, spacing, typography } from '../theme';
import { clearUserSession } from '../utils/session';
import { apiCall } from '../config/api';

export default function SettingsScreen({ navigation }) {
  const [prefs, setPrefs] = useState({ daily: true, weekly: true, lock: false });
  const setPref = (key) => (value) => setPrefs((p) => ({ ...p, [key]: value }));

  const comingSoon = (title) => () => Alert.alert(title, 'This feature is coming soon.');

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          await apiCall('/auth/logout', 'POST');
          await clearUserSession();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  };

  return (
    <ScreenBackground circuit={false}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.topRow}>
            {navigation.canGoBack() ? (
              <Pressable
                onPress={navigation.goBack}
                style={styles.back}
                accessibilityRole="button"
                accessibilityLabel="Go back"
                hitSlop={8}
              >
                <Ionicons name="chevron-back" size={22} color={colors.text} />
              </Pressable>
            ) : null}
          </View>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Control reminders, privacy and your account.</Text>

          <Section title="Security preferences">
            <Row
              icon="notifications-outline"
              title="Daily security reminders"
              subtitle="A short nudge to finish today's tasks"
              right={<PrefSwitch label="Daily security reminders" value={prefs.daily} onValueChange={setPref('daily')} />}
            />
            <Row
              icon="stats-chart-outline"
              title="Weekly progress summary"
              subtitle="See how your habits are improving"
              right={<PrefSwitch label="Weekly progress summary" value={prefs.weekly} onValueChange={setPref('weekly')} />}
            />
            <Row
              icon="finger-print-outline"
              title="App lock"
              subtitle="Ask for fingerprint or face to open the app"
              last
              right={<PrefSwitch label="App lock" value={prefs.lock} onValueChange={setPref('lock')} />}
            />
          </Section>

          <Section title="Account settings">
            <Row icon="key-outline" title="Change password" onPress={comingSoon('Change password')} />
            <Row icon="lock-closed-outline" title="Privacy & data" onPress={comingSoon('Privacy & data')} />
            <Row icon="help-circle-outline" title="Help & support" onPress={comingSoon('Help & support')} last />
          </Section>

          <CustomButton variant="outline" title="Log Out" icon="log-out-outline" onPress={handleLogout} />
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  topRow: { alignSelf: 'stretch', height: 44, justifyContent: 'center' },
  back: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...typography.h2, color: colors.text, textAlign: 'center', marginTop: spacing.md },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
});