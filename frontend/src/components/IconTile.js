import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { appColors } from '../theme/appTheme';

/** Pastel rounded tile with a purple outline icon. tone: 'lilac' | 'pink' */
export default function IconTile({ icon, tone = 'lilac', size = 44, style }) {
  return (
    <View
      style={[
        styles.tile,
        { width: size, height: size, borderRadius: size * 0.36, backgroundColor: tone === 'pink' ? appColors.pink : appColors.lilac },
        style,
      ]}
    >
      <Ionicons name={icon} size={size * 0.5} color={appColors.plum} />
    </View>
  );
}

/** Soft rounded arrow button shown on the right of tappable list cards. */
export function ArrowChip({ size = 40 }) {
  return (
    <View style={[styles.tile, { width: size, height: size, borderRadius: size * 0.36, backgroundColor: appColors.lilac }]}>
      <Ionicons name="arrow-forward" size={size * 0.5} color={appColors.plum} />
    </View>
  );
}

const styles = StyleSheet.create({ tile: { alignItems: 'center', justifyContent: 'center' } });