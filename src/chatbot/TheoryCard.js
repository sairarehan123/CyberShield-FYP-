import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { spacing, typography, appColors, appShadow, glass } from './theme';
import { Icon } from './ui';

const ICONS = { pmt: 'shield-checkmark-outline', tpb: 'people-outline', ttat: 'alert-circle-outline' };

/**
 * The user chooses which theory the training is based on (PMT / TPB / TTAT).
 * `options` comes from the backend (chat.theory_options); `selected` is chat.focus_theory.
 */
export default function TheoryCard({ options, selected, busy, onChoose, title }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title || 'Choose your training focus'}</Text>
      <Text style={styles.body}>Your training is built around one theory about security behaviour. Pick the one that sounds most like you.</Text>
      {(options || []).map((o) => {
        const on = o.key === selected;
        return (
          <Pressable key={o.key} disabled={busy} onPress={() => onChoose(o.key)} accessibilityRole="button" accessibilityLabel={o.label}
            style={({ pressed }) => [styles.row, on && styles.rowOn, pressed && { opacity: 0.85 }]}>
            <View style={styles.icon}><Icon name={ICONS[o.key] || 'bulb-outline'} size={20} color={appColors.primary} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{o.label}</Text>
              <Text style={styles.about}>{o.about}</Text>
            </View>
            {on ? <Icon name="checkmark-circle" size={22} color={appColors.primary} /> : null}
          </Pressable>
        );
      })}
      {busy ? <ActivityIndicator color={appColors.primary} style={{ marginTop: spacing.md }} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: glass.bgStrong, borderRadius: 28, borderWidth: 1, borderColor: glass.border, padding: spacing.xl, marginBottom: spacing.md, ...appShadow.card },
  title: { ...typography.h3, color: appColors.text },
  body: { ...typography.body, color: appColors.textSecondary, marginTop: spacing.sm, marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: glass.bg, borderRadius: 18, borderWidth: 1, borderColor: glass.line, padding: spacing.md, marginTop: spacing.sm },
  rowOn: { borderColor: appColors.primary, borderWidth: 2 },
  icon: { width: 38, height: 38, borderRadius: 13, backgroundColor: 'rgba(234,220,245,0.9)', alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  label: { ...typography.bodyStrong, color: appColors.text },
  about: { ...typography.caption, color: appColors.textSecondary, marginTop: 2 },
});
