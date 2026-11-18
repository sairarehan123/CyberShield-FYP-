import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import CustomButton from './CustomButton';
import { colors, spacing, typography } from '../theme';

export default function SocialButtons() {
  // TODO: hook up real Google / Apple auth when the backend is ready.
  const soon = (provider) => () =>
    Alert.alert(provider, `${provider} sign-in will be available soon.`);

  return (
    <View>
      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.or}>OR</Text>
        <View style={styles.line} />
      </View>
      <CustomButton
        variant="outline"
        icon="logo-google"
        title="Continue with Google"
        onPress={soon('Google')}
        style={{ marginBottom: spacing.md }}
      />
      <CustomButton
        variant="outline"
        icon="logo-apple"
        title="Continue with Apple"
        onPress={soon('Apple')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.xl },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  or: { ...typography.caption, color: colors.textSecondary, marginHorizontal: spacing.lg },
});
