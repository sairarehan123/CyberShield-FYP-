import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { spacing, typography, appColors, appShadow, glass, gradients } from './theme';
import { Icon, Pill } from './ui';

export function CoachAvatar({ size = 32 }) {
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Icon name="sparkles" size={size * 0.5} color={appColors.primary} />
    </View>
  );
}

/** One chat bubble. role: 'assistant' (left, glass) | 'user' (right, brand gradient). `time` is a small label under it. */
export function Bubble({ role, text, time, children }) {
  const mine = role === 'user';
  return (
    <View style={{ marginBottom: spacing.md }}>
      <View style={[styles.row, mine ? styles.rowMine : styles.rowCoach]}>
        {!mine ? <CoachAvatar /> : null}
        {mine ? (
          <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.bubble, styles.mine]}>
            <Text style={[styles.text, { color: '#fff' }]}>{text}</Text>
          </LinearGradient>
        ) : (
          <View style={[styles.bubble, styles.coach, { marginLeft: spacing.sm }]}>
            {text ? <Text style={styles.text}>{text}</Text> : null}
            {children}
          </View>
        )}
      </View>
      {time ? <Text style={[styles.time, mine ? { textAlign: 'right' } : { marginLeft: 32 + spacing.sm }]}>{time}</Text> : null}
    </View>
  );
}

export function TypingBubble() {
  const dots = useRef([new Animated.Value(0.3), new Animated.Value(0.3), new Animated.Value(0.3)]).current;
  useEffect(() => {
    const loops = dots.map((d, i) =>
      Animated.loop(Animated.sequence([
        Animated.delay(i * 160),
        Animated.timing(d, { toValue: 1, duration: 320, useNativeDriver: true }),
        Animated.timing(d, { toValue: 0.3, duration: 320, useNativeDriver: true }),
      ]))
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [dots]);
  return (
    <View style={[styles.row, styles.rowCoach, { marginBottom: spacing.md }]}>
      <CoachAvatar />
      <View style={[styles.bubble, styles.coach, styles.typing, { marginLeft: spacing.sm }]} accessibilityLabel="Your coach is typing">
        {dots.map((d, i) => <Animated.View key={i} style={[styles.dot, { opacity: d }]} />)}
      </View>
    </View>
  );
}

/** A thin labelled line (new area / new day). */
export function Divider({ label }) {
  return (
    <View style={styles.divider}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerText}>{label}</Text>
      <View style={styles.dividerLine} />
    </View>
  );
}

/** The training steps the user should do in real life. */
export function PlanCard({ steps }) {
  return (
    <View style={styles.plan}>
      {steps.map((s, i) => (
        <View key={i} style={[styles.planRow, i > 0 && styles.planRowBorder]}>
          <LinearGradient colors={gradients.brand} style={styles.planNum}><Text style={styles.planNumText}>{i + 1}</Text></LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={styles.planStep}>{s.step}</Text>
            {s.reason ? <Text style={styles.planReason}>{s.reason}</Text> : null}
          </View>
        </View>
      ))}
    </View>
  );
}

/** Result of the 7-day check (mastered / needs coaching). */
export function EvalCard({ data, text }) {
  const mastered = data && data.decision === 'mastered';
  const evidence = (data && data.evidence) || [];
  return (
    <View style={[styles.eval, mastered && { borderColor: appColors.primary }]}>
      <View style={styles.evalHead}>
        <LinearGradient colors={mastered ? gradients.brand : ['#F4D7E8', '#EFC4DD']} style={styles.evalIcon}>
          <Icon name={mastered ? 'ribbon' : 'trending-up'} size={22} color={mastered ? '#fff' : appColors.primary} />
        </LinearGradient>
        <View style={{ flex: 1, marginLeft: spacing.md }}>
          <Text style={styles.evalTitle}>{mastered ? 'Area mastered!' : 'Keep practising'}</Text>
          {data && data.proficiency != null ? <Text style={styles.evalSub}>Proficiency {Math.round(data.proficiency)}%</Text> : null}
        </View>
        {data && data.level ? <Pill label={data.level} /> : null}
      </View>
      {evidence.map((line, i) => (
        <View key={i} style={styles.evalLine}>
          <Icon name="ellipse" size={6} color={appColors.primary} style={{ marginTop: 7 }} />
          <Text style={styles.evalText}>{line}</Text>
        </View>
      ))}
      {text ? <Text style={[styles.evalText, { marginTop: spacing.sm, marginLeft: 0 }]}>{text}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: { alignItems: 'center', justifyContent: 'center', backgroundColor: glass.bgStrong, borderWidth: 1, borderColor: glass.border, ...appShadow.card },
  row: { flexDirection: 'row', alignItems: 'flex-end' },
  rowCoach: { justifyContent: 'flex-start' },
  rowMine: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '82%', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: 22 },
  coach: { backgroundColor: glass.bgStrong, borderWidth: 1, borderColor: glass.border, borderBottomLeftRadius: 6, ...appShadow.card },
  mine: { borderBottomRightRadius: 6, ...appShadow.button },
  text: { ...typography.body, color: appColors.text },
  time: { ...typography.caption, color: appColors.textSecondary, marginTop: 4 },
  typing: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.lg },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: appColors.primary, marginHorizontal: 3 },

  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.lg },
  dividerLine: { flex: 1, height: 1, backgroundColor: glass.line },
  dividerText: { ...typography.caption, color: appColors.textSecondary, marginHorizontal: spacing.md },

  plan: { backgroundColor: glass.bgStrong, borderRadius: 24, borderWidth: 1, borderColor: glass.border, padding: spacing.lg, marginBottom: spacing.lg, marginLeft: 32 + spacing.sm, ...appShadow.card },
  planRow: { flexDirection: 'row', paddingVertical: spacing.md },
  planRowBorder: { borderTopWidth: 1, borderTopColor: glass.line },
  planNum: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  planNumText: { ...typography.label, color: '#fff' },
  planStep: { ...typography.bodyStrong, color: appColors.text },
  planReason: { ...typography.caption, color: appColors.textSecondary, marginTop: 2, lineHeight: 17 },

  eval: { borderRadius: 24, padding: spacing.lg, marginBottom: spacing.lg, borderWidth: 1, borderColor: glass.border, backgroundColor: glass.bgStrong, ...appShadow.card },
  evalHead: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  evalIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  evalTitle: { ...typography.h3, color: appColors.text },
  evalSub: { ...typography.caption, color: appColors.textSecondary },
  evalLine: { flexDirection: 'row', marginTop: 4 },
  evalText: { ...typography.body, color: appColors.text, flex: 1, marginLeft: spacing.sm },
});
