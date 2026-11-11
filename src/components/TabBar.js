import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../theme';

/** Custom bottom bar (no extra navigation package needed). Rendered only by MainTabsScreen. */
export default function TabBar({ tabs, active, onChange }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      {tabs.map((t) => {
        const selected = t.key === active;
        return (
          <Pressable
            key={t.key}
            onPress={() => onChange(t.key)}
            style={styles.item}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={t.label}
          >
            <View style={[styles.pill, selected && styles.pillActive]}>
              <Ionicons name={selected ? t.iconActive : t.icon} size={22} color={selected ? colors.primary : colors.textSecondary} />
            </View>
            <Text style={[styles.label, selected && styles.labelActive]}>{t.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    shadowColor: colors.primary,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  item: { flex: 1, alignItems: 'center', minHeight: 52 },
  pill: { width: 52, height: 30, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  pillActive: { backgroundColor: colors.lilacSoft },
  label: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  labelActive: { color: colors.primary, fontWeight: '700' },
});
