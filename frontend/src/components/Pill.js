import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../theme';

export default function Pill({ label, icon, style }) {
  return (
    <View style={[styles.pill, style]}>
      {icon ? <Ionicons name={icon} size={12} color={colors.primary} style={{ marginRight: 4 }} /> : null}
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.lilacSoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  text: { ...typography.caption, fontWeight: '600', color: colors.primary },
});
