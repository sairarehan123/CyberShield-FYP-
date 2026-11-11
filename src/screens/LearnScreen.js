import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../components/ScreenContainer';
import Card from '../components/Card';
import InfoBanner from '../components/InfoBanner';
import { colors, spacing, typography } from '../theme';

// Initial Learn screen (Phase 1). The full lesson library and lesson details arrive in a later phase.
const TOPICS = [
  { icon: 'key-outline', title: 'Passwords', sub: 'Strong, unique and easy to manage' },
  { icon: 'lock-closed-outline', title: 'Account security', sub: 'Two-step verification and access' },
  { icon: 'mail-unread-outline', title: 'Phishing awareness', sub: 'Spotting suspicious messages and links' },
  { icon: 'refresh-outline', title: 'Software updates', sub: 'Why they matter and how to keep up' },
  { icon: 'eye-off-outline', title: 'Privacy', sub: 'Controlling what you share' },
];

export default function LearnScreen() {
  return (
    <ScreenContainer title="Learn">
      <Text style={styles.lead}>Simple, practical security tips will live here. These are the topics we're preparing.</Text>
      <View style={{ marginTop: spacing.lg }}>
        {TOPICS.map((t) => (
          <Card key={t.title} style={styles.topic}>
            <View style={styles.row}>
              <View style={styles.iconTile}>
                <Ionicons name={t.icon} size={22} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{t.title}</Text>
                <Text style={styles.sub}>{t.sub}</Text>
              </View>
            </View>
          </Card>
        ))}
      </View>
      <InfoBanner icon="time-outline" text="Lessons are coming in an upcoming update." style={{ marginTop: spacing.sm }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  lead: { ...typography.body, color: colors.textSecondary },
  topic: { marginBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconTile: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.lilacSoft, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  title: { ...typography.bodyStrong, color: colors.text },
  sub: { ...typography.caption, lineHeight: 17, color: colors.textSecondary, marginTop: 2 },
});
