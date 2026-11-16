import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
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
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { Section, Row } from '../components/SettingsList';
import { colors, radius, shadow, spacing, typography } from '../theme';
import { getUserSession, saveUserSession } from '../utils/session';
import { apiCall } from '../config/api';

const SECURITY_GUIDELINES = [
  {
    id: 'passwords',
    icon: 'key-outline',
    title: 'Passwords',
    subtitle: 'Strong, unique credentials & password managers',
    summary:
      'Weak or reused passwords are the single fastest way attackers take over multiple accounts from one data breach.',
    rules: [
      'Use at least 12–16 characters mixing uppercase, lowercase, numbers, and symbols.',
      'Never reuse the same password across email, banking, university, or social accounts.',
      'Store credentials in a reputable password manager instead of browser notes or screenshots.',
      'Change passwords immediately if a service notifies you of suspicious sign-in activity.',
    ],
  },
  {
    id: 'account_security',
    icon: 'lock-closed-outline',
    title: 'Account security',
    subtitle: 'Two-factor authentication & device lock hygiene',
    summary:
      'Adding a second verification layer blocks unauthorized access even if your password is exposed.',
    rules: [
      'Enable Two-Factor Authentication (2FA) using an authenticator app rather than SMS whenever available.',
      'Set your phone and laptop screen lock timeout to 1 minute or less with a strong PIN or biometric lock.',
      'Review active login sessions regularly and sign out of unrecognized or old devices.',
      'Keep backup recovery codes stored offline in a secure location.',
    ],
  },
  {
    id: 'phishing_awareness',
    icon: 'mail-unread-outline',
    title: 'Phishing awareness',
    subtitle: 'Spotting fake links, urgent lures & impersonation',
    summary:
      'Phishing messages create artificial urgency to trick you into clicking malicious links or sharing login codes.',
    rules: [
      'Inspect the full sender email address—not just the display name—for subtle spelling changes.',
      'Hover or long-press links to verify the real domain before tapping, especially on login pages.',
      'Never share one-time verification codes (OTPs) or passwords over email, SMS, or phone calls.',
      'Open official apps or type trusted website URLs manually instead of using links inside messages.',
    ],
  },
  {
    id: 'software_updates',
    icon: 'refresh-circle-outline',
    title: 'Software updates',
    subtitle: 'OS, browser & app security patch hygiene',
    summary:
      'Software updates close publicly known security vulnerabilities that attackers actively scan for.',
    rules: [
      'Turn on automatic updates for iOS, Android, Windows, or macOS.',
      'Keep web browsers and messaging apps updated so zero-day patches apply promptly.',
      'Install apps only from official stores (Google Play Store, Apple App Store) and remove unused apps.',
      'Avoid downloading cracked software, unofficial APKs, or unverified browser extensions.',
    ],
  },
  {
    id: 'privacy',
    icon: 'eye-off-outline',
    title: 'Privacy',
    subtitle: 'App permissions, public Wi-Fi & data minimization',
    summary:
      'Limiting unnecessary data exposure reduces your digital footprint and prevents tracking or profiling.',
    rules: [
      'Audit app permissions and revoke camera, microphone, contacts, or location access that an app does not need.',
      'Set social media profiles to private and avoid posting personal identifiers like phone numbers or IDs.',
      'Avoid accessing banking or sensitive accounts on unencrypted public Wi-Fi without a trusted VPN.',
      'Turn off lock-screen notification previews so verification codes cannot be read while your phone is locked.',
    ],
  },
];

const SAMPLE_HISTORY = [
  { id: '1', date: '12 Oct 2026', score: 86 },
  { id: '2', date: '28 Sep 2026', score: 71 },
  { id: '3', date: '10 Sep 2026', score: 62 },
];

const getInitials = (name) =>
  (name || 'User')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

export default function ProfileScreen({ navigation, route }) {
  const params = (route && route.params) || {};
  const [name, setName] = useState(params.name || '');
  const [email, setEmail] = useState(params.email || '');

  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(name);
  const [nameError, setNameError] = useState('');
  const [saving, setSaving] = useState(false);
  const [selectedGuideline, setSelectedGuideline] = useState(null);

  useEffect(() => {
    async function loadSession() {
      const storedUser = await getUserSession();
      if (storedUser) {
        if (!name) setName(storedUser.name || 'User');
        if (!email) setEmail(storedUser.email || '');
      }
    }
    loadSession();
  }, []);

  const comingSoon = (title) => () => Alert.alert(title, 'This feature is coming soon.');

  const startEdit = () => {
    setDraftName(name);
    setNameError('');
    setEditing(true);
  };

  const handleSave = async () => {
    if (!draftName.trim()) {
      setNameError('Full name is required.');
      return;
    }
    setSaving(true);

    await apiCall('/profile', 'PATCH', { name: draftName.trim() });

    const updatedName = draftName.trim();
    setName(updatedName);
    await saveUserSession({ name: updatedName, email });

    setSaving(false);
    setEditing(false);
  };

  return (
    <ScreenBackground circuit={false}>
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.topRow}>
            {navigation.canGoBack() ? (
              <Pressable
                onPress={navigation.goBack}
                style={styles.circle}
                accessibilityRole="button"
                accessibilityLabel="Go back"
                hitSlop={8}
              >
                <Ionicons name="chevron-back" size={22} color={colors.text} />
              </Pressable>
            ) : (
              <View style={styles.spacer} />
            )}
            <Pressable
              onPress={() => navigation.navigate('Settings')}
              style={styles.circle}
              accessibilityRole="button"
              accessibilityLabel="Open settings"
              hitSlop={8}
            >
              <Ionicons name="settings-outline" size={21} color={colors.text} />
            </Pressable>
          </View>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>Your account, guidelines, and security progress.</Text>

          {/* Profile Card */}
          <View style={styles.profileCard}>
            <LinearGradient
              colors={colors.gradientPrimary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>{getInitials(name)}</Text>
            </LinearGradient>

            {editing ? (
              <View style={styles.editBox}>
                <CustomInput
                  label="Full Name"
                  icon="person-outline"
                  placeholder="Enter your full name"
                  value={draftName}
                  onChangeText={(t) => {
                    setDraftName(t);
                    if (nameError) setNameError('');
                  }}
                  error={nameError}
                  returnKeyType="done"
                  onSubmitEditing={handleSave}
                />
                <CustomButton title="Save changes" onPress={handleSave} loading={saving} />
                <CustomButton variant="text" title="Cancel" onPress={() => setEditing(false)} />
              </View>
            ) : (
              <>
                <Text style={styles.name}>{name || 'CyberShield User'}</Text>
                <Text style={styles.email}>{email}</Text>
                <CustomButton
                  variant="outline"
                  title="Edit profile"
                  icon="create-outline"
                  onPress={startEdit}
                  style={styles.editButton}
                />
              </>
            )}
          </View>

          {/* Security Guidelines (Standalone — no chatbot navigation) */}
          <Section title="Security guidelines">
            {SECURITY_GUIDELINES.map((item, index) => (
              <Row
                key={item.id}
                icon={item.icon}
                title={item.title}
                subtitle={item.subtitle}
                onPress={() => setSelectedGuideline(item)}
                last={index === SECURITY_GUIDELINES.length - 1}
              />
            ))}
          </Section>

          {/* Assessment History */}
          <Section title="Assessment history" actionLabel="View all" onAction={comingSoon('Assessment history')}>
            {SAMPLE_HISTORY.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No assessments yet. Take your first assessment to see it here.</Text>
              </View>
            ) : (
              SAMPLE_HISTORY.map((item, index) => (
                <Row
                  key={item.id}
                  icon="shield-checkmark-outline"
                  title="Security assessment"
                  subtitle={item.date}
                  onPress={comingSoon('Assessment details')}
                  last={index === SAMPLE_HISTORY.length - 1}
                  right={
                    <View style={styles.scorePill}>
                      <Text style={styles.scoreText}>{item.score}</Text>
                    </View>
                  }
                />
              ))
            )}
          </Section>
        </ScrollView>

        {/* Standalone Guideline Detail Modal */}
        <Modal
          visible={Boolean(selectedGuideline)}
          animationType="slide"
          transparent
          onRequestClose={() => setSelectedGuideline(null)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              {selectedGuideline && (
                <>
                  <View style={styles.modalHeader}>
                    <View style={styles.modalIconBox}>
                      <Ionicons
                        name={selectedGuideline.icon}
                        size={24}
                        color={colors.primary}
                      />
                    </View>
                    <Pressable
                      onPress={() => setSelectedGuideline(null)}
                      style={styles.closeBtn}
                      accessibilityRole="button"
                      accessibilityLabel="Close guideline"
                    >
                      <Ionicons name="close" size={20} color={colors.text} />
                    </Pressable>
                  </View>

                  <Text style={styles.modalTitle}>{selectedGuideline.title}</Text>
                  <Text style={styles.modalSummary}>{selectedGuideline.summary}</Text>

                  <ScrollView
                    style={styles.rulesScroll}
                    showsVerticalScrollIndicator={false}
                  >
                    {selectedGuideline.rules.map((rule, idx) => (
                      <View key={idx} style={styles.ruleRow}>
                        <Ionicons
                          name="checkmark-circle"
                          size={18}
                          color={colors.primary}
                          style={styles.ruleIcon}
                        />
                        <Text style={styles.ruleText}>{rule}</Text>
                      </View>
                    ))}
                  </ScrollView>

                  <CustomButton
                    title="Got it"
                    onPress={() => setSelectedGuideline(null)}
                    style={styles.modalBtn}
                  />
                </>
              )}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },

  topRow: {
    alignSelf: 'stretch',
    height: 44,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  circle: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spacer: { width: 44, height: 44 },
  title: { ...typography.h2, color: colors.text, textAlign: 'center', marginTop: spacing.md },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },

  profileCard: {
    alignItems: 'center',
    padding: spacing.xl,
    marginBottom: spacing.xl,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.soft,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: { ...typography.h2, color: colors.white },
  name: { ...typography.h3, color: colors.text },
  email: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
  editButton: { alignSelf: 'stretch', marginTop: spacing.lg },
  editBox: { alignSelf: 'stretch', marginTop: spacing.sm },

  scorePill: {
    minWidth: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    backgroundColor: colors.lilac,
    alignItems: 'center',
  },
  scoreText: { ...typography.label, color: colors.primary },
  empty: { padding: spacing.lg },
  emptyText: { ...typography.caption, color: colors.textSecondary },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl || 24,
    borderTopRightRadius: radius.xl || 24,
    padding: spacing.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.lilac,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.background || '#F4F4F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text,
  },
  modalSummary: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  rulesScroll: {
    marginBottom: spacing.lg,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  ruleIcon: {
    marginTop: 2,
    marginRight: spacing.sm,
  },
  ruleText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  modalBtn: {
    alignSelf: 'stretch',
  },
});