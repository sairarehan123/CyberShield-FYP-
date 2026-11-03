import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme';

export default function SectionHeader({ title, style }) {
  return (
    <View style={[styles.row, style]}>
      <Text style={styles.title} accessibilityRole="header">{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  title: { ...typography.h3, color: colors.text },
});
