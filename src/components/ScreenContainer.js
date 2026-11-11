import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenBackground from './ScreenBackground';
import { colors, radius, spacing, typography } from '../theme';

/**
 * Shell for authenticated screens: safe area, soft background, consistent header.
 * - No onBack -> large left-aligned title (tab screens).
 * - onBack    -> circular back button + compact title (pushed screens).
 * - `footer` is pinned below the scroll area (primary actions).
 */
export default function ScreenContainer({ title, onBack, children, scroll = true, edges = ['top'], footer, contentStyle }) {
  return (
    <ScreenBackground circuit={false} style={{ backgroundColor: colors.background }}>
      <SafeAreaView style={styles.safe} edges={edges}>
        {title || onBack ? (
          <View style={styles.header}>
            {onBack ? (
              <Pressable onPress={onBack} style={styles.back} accessibilityRole="button" accessibilityLabel="Go back" hitSlop={8}>
                <Ionicons name="chevron-back" size={22} color={colors.text} />
              </Pressable>
            ) : null}
            <Text style={[styles.title, onBack ? styles.titleCompact : styles.titleLarge]} numberOfLines={1} accessibilityRole="header">
              {title}
            </Text>
          </View>
        ) : null}
        {scroll ? (
          <ScrollView contentContainerStyle={[styles.content, contentStyle]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.content, { flex: 1 }, contentStyle]}>{children}</View>
        )}
        {footer}
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.sm, minHeight: 56 },
  back: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  title: { flex: 1, color: colors.text },
  titleLarge: { ...typography.h2 },
  titleCompact: { ...typography.h3 },
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xxl },
});
