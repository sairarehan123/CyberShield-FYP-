import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radius, spacing, typography } from '../theme';
import { appColors } from '../theme/appTheme';

// Quiet notice for honest "provisional / not connected yet" messages.
export default function InfoBanner({ text, icon = 'information-circle-outline', style }) {
  return (
    <View style={[styles.box, style]}>
      <Ionicons name={icon} size={18} color={appColors.plum} style={{ marginTop: 1 }} />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: 'row', backgroundColor: appColors.lilac, borderRadius: radius.md, padding: spacing.md },
  text: { ...typography.caption, lineHeight: 18, color: appColors.text, flex: 1, marginLeft: spacing.sm },
});