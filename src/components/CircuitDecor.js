import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme';

// Subtle circuit traces built from plain Views (no extra libraries).
// Each trace runs in from a screen edge, steps vertically, and ends in a node.
const TRACES = [
  { side: 'left', top: 10, len: 70, hook: 26 },
  { side: 'left', top: 30, len: 44, hook: -18 },
  { side: 'left', top: 62, len: 90, hook: 30 },
  { side: 'left', top: 84, len: 52, hook: -22 },
  { side: 'right', top: 14, len: 56, hook: 24 },
  { side: 'right', top: 36, len: 84, hook: -28 },
  { side: 'right', top: 70, len: 60, hook: 20 },
  { side: 'right', top: 90, len: 78, hook: -24 },
];

function Trace({ side, top, len, hook }) {
  const horizontal = {
    position: 'absolute',
    top: `${top}%`,
    [side]: 0,
    width: len,
    height: 1.5,
    backgroundColor: colors.accent,
  };
  const vertical = {
    position: 'absolute',
    top: `${top}%`,
    [side]: len,
    width: 1.5,
    height: Math.abs(hook),
    marginTop: hook < 0 ? hook : 0,
    backgroundColor: colors.accent,
  };
  const dot = {
    position: 'absolute',
    top: `${top}%`,
    [side]: len - 3,
    marginTop: hook - 3,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.accent,
    backgroundColor: colors.white,
  };
  return (
    <>
      <View style={horizontal} />
      <View style={vertical} />
      <View style={dot} />
    </>
  );
}

export default function CircuitDecor({ opacity = 0.22 }) {
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity }]}>
      {TRACES.map((t, i) => (
        <Trace key={i} {...t} />
      ))}
    </View>
  );
}
