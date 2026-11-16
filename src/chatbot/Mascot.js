import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon, useFloat } from './ui';
import { appColors } from './theme';

/** The assistant's face: a friendly floating robot with a shield on its chest. Drawn with plain views. */
export default function Mascot({ size = 220, floating = true }) {
  const y = useFloat(10, 1700);
  const k = size / 220;
  const s = (n) => n * k;
  return (
    <View style={{ width: size, height: size * 1.12, alignItems: 'center' }}>
      <Animated.View style={{ alignItems: 'center', transform: [{ translateY: floating ? y : 0 }] }}>
        {/* head */}
        <LinearGradient colors={['#FFFFFF', '#EBDDF7', '#D9C4F0']} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }}
          style={{ width: s(150), height: s(138), borderRadius: s(70), alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#fff' }}>
          <LinearGradient colors={['#3A1B52', '#5B2A7E']} style={{ width: s(110), height: s(74), borderRadius: s(37), alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
            <View style={[styles.eye, { width: s(24), height: s(13), borderTopLeftRadius: s(13), borderTopRightRadius: s(13), marginRight: s(16) }]} />
            <View style={[styles.eye, { width: s(24), height: s(13), borderTopLeftRadius: s(13), borderTopRightRadius: s(13) }]} />
          </LinearGradient>
        </LinearGradient>
        {/* ears */}
        <View style={[styles.ear, { left: s(-8), top: s(52), width: s(16), height: s(40), borderRadius: s(8) }]} />
        <View style={[styles.ear, { right: s(-8), top: s(52), width: s(16), height: s(40), borderRadius: s(8) }]} />
        {/* body */}
        <LinearGradient colors={['#FFFFFF', '#E6D4F5']} style={{ width: s(86), height: s(78), borderRadius: s(43), marginTop: s(-6), alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#fff' }}>
          <LinearGradient colors={['#8E2F70', '#C95A9E']} style={{ width: s(38), height: s(38), borderRadius: s(19), alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="shield-checkmark" size={s(22)} color="#fff" />
          </LinearGradient>
        </LinearGradient>
        {/* arms */}
        <View style={[styles.arm, { left: s(-18), top: s(150), width: s(26), height: s(54), borderRadius: s(13), transform: [{ rotate: '18deg' }] }]} />
        <View style={[styles.arm, { right: s(-18), top: s(150), width: s(26), height: s(54), borderRadius: s(13), transform: [{ rotate: '-18deg' }] }]} />
      </Animated.View>
      {/* ground shadow */}
      <View style={{ width: s(120), height: s(14), borderRadius: s(60), backgroundColor: appColors.primary, opacity: 0.12, marginTop: s(16) }} />
    </View>
  );
}

const styles = StyleSheet.create({
  eye: { borderWidth: 4, borderBottomWidth: 0, borderColor: '#F4D7E8' },
  ear: { position: 'absolute', backgroundColor: '#E2CFF3' },
  arm: { position: 'absolute', backgroundColor: '#EBDDF7', borderWidth: 1, borderColor: '#fff' },
});
