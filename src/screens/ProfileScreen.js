import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../components/ScreenContainer';
import Card from '../components/Card';
import CustomButton from '../components/CustomButton';
import InfoBanner from '../components/InfoBanner';
import useLogout from '../hooks/useLogout';
import { colors, radius, spacing, typography } from '../theme';

// Initial Profile screen (Phase 1). Profile details, edit profile and settings arrive in a later phase.
export default function ProfileScreen({ navigation }) {
  const confirmLogout = useLogout(navigation);
  return (
    <ScreenContainer title="Profile">
      <Card style={styles.card}>
        <View style={styles.avatar}>
          <Ionicons name="person-outline" size={34} color={colors.primary} />
        </View>
        <Text style={styles.title}>Your profile</Text>
        <Text style={styles.sub}>Account details will appear here once your account is connected.</Text>
      </Card>
      <InfoBanner text="Profile settings are coming in an upcoming update." icon="time-outline" style={{ marginTop: spacing.lg }} />
      <CustomButton variant="outline" icon="log-out-outline" title="Log out" onPress={confirmLogout} style={{ marginTop: spacing.xl }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', paddingVertical: spacing.xxl },
  avatar: { width: 76, height: 76, borderRadius: radius.pill, backgroundColor: colors.lilacSoft, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  title: { ...typography.h3, color: colors.text },
  sub: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm, maxWidth: 280 },
});
