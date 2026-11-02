import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenBackground from '../components/ScreenBackground';
import CustomButton from '../components/CustomButton';
import { APP_NAME } from '../config/appConfig';
import { colors, spacing, typography } from '../theme';

// Placeholder – replace with the real dashboard later.
export default function HomeScreen({ navigation }) {
  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe}>
        <Text style={styles.title}>Welcome to {APP_NAME}</Text>
        <Text style={styles.sub}>Your dashboard is coming soon.</Text>
        <View style={{ width: '100%', marginTop: spacing.xl }}>
          <CustomButton
            variant="outline"
            title="Log Out"
            onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}
          />
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  title: { ...typography.h2, color: colors.text, textAlign: 'center' },
  sub: { ...typography.body, color: colors.textSecondary, marginTop: spacing.sm },
});
