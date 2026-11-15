import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';
import { spacing, typography, appColors, appShadow, glass } from './theme';
import { AppButton, Icon } from './ui';

/**
 * One-time consent for the simulated security messages.
 * Wording is deliberately general: it does NOT say when, how many, or which message is a test.
 */
export default function ConsentCard({ busy, onAccept, onLater }) {
  const [email, setEmail] = useState('');
  return (
    <View style={styles.card}>
      <View style={styles.icon}><Icon name="shield-half-outline" size={26} color={appColors.primary} /></View>
      <Text style={styles.title}>One more thing</Text>
      <Text style={styles.body}>
        As part of your training, CyberShield will test your everyday security habits with simulated security messages
        (for example, emails or notifications). They are harmless, and you will always be told what they were afterwards.
      </Text>

      <Text style={styles.label}>Email for these messages (optional)</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        placeholderTextColor={appColors.textSecondary}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        style={styles.input}
      />
      <Text style={styles.hint}>So a message can reach you even when the app is closed.</Text>

      {busy ? (
        <ActivityIndicator color={appColors.primary} style={{ marginVertical: spacing.md }} />
      ) : (
        <>
          <AppButton title="I agree" icon="checkmark-circle-outline" onPress={() => onAccept(email.trim())} style={{ marginTop: spacing.lg }} />
          <AppButton title="Not now" variant="text" onPress={onLater} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: glass.bgStrong, borderRadius: 28, borderWidth: 1, borderColor: glass.border, padding: spacing.xl, ...appShadow.card },
  icon: { width: 52, height: 52, borderRadius: 18, backgroundColor: appColors.lilac, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  title: { ...typography.h3, color: appColors.text },
  body: { ...typography.body, color: appColors.textSecondary, marginTop: spacing.sm },
  label: { ...typography.label, color: appColors.text, marginTop: spacing.lg, marginBottom: spacing.sm },
  input: { borderWidth: 1, borderColor: glass.border, borderRadius: 16, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, ...typography.body, color: appColors.text, backgroundColor: glass.bg },
  hint: { ...typography.caption, color: appColors.textSecondary, marginTop: 6 },
});
