import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radius, spacing, typography } from '../theme';
import { appColors } from '../theme/appTheme';

export default function Pill({ label, icon, style }) {
  return (
    <View style={[styles.pill, style]}>
      {icon ? <Ionicons name={icon} size={12} color={appColors.plum} style={{ marginRight: 4 }} /> : null}
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: appColors.lilac,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  text: { ...typography.caption, fontWeight: '600', color: appColors.text },
});