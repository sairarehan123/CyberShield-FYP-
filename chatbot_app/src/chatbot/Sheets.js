import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { spacing, typography, glass } from './theme';
import { appColors } from './theme';
import { AppButton, Icon } from './ui';

function Sheet({ visible, onClose, children }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityLabel="Close" />
        <View style={styles.sheet}>
          <View style={styles.grabber} />
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.lg }}>{children}</ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const OUTCOMES = {
  fell_victim: { icon: 'warning', bad: true, title: 'That was a simulated phishing message', sub: 'You tapped the link. In a real attack this could have cost you an account or money. This time it was only a drill.' },
  reported: { icon: 'shield-checkmark', title: 'Great catch!', sub: 'It was a phishing message and you reported it. That is exactly the right move.' },
  ignored: { icon: 'eye-off-outline', title: 'This was a phishing message', sub: 'You did not tap the link, which is good. Reporting it as well helps protect everyone.' },
  ok: { icon: 'checkmark-circle', title: 'This one was genuine', sub: 'Not every message is a scam, and you stayed calm.' },
  false_alarm: { icon: 'alert-circle-outline', title: 'This one was genuine', sub: 'Being careful is good - next time look for the warning signs before you report.' },
  opened_genuine: { icon: 'checkmark-circle', title: 'This one was genuine', sub: 'It was safe to open.' },
};

/** What a message really was - shown only AFTER the user acted (or it expired). */
export function DebriefSheet({ debrief, onClose }) {
  if (!debrief) return <Sheet visible={false} onClose={onClose} />;
  const o = OUTCOMES[debrief.outcome] || OUTCOMES.ok;
  return (
    <Sheet visible onClose={onClose}>
      <View style={[styles.badge, o.bad && { backgroundColor: appColors.pink }]}>
        <Icon name={o.icon} size={30} color={appColors.primary} />
      </View>
      <Text style={styles.title}>{o.title}</Text>
      <Text style={styles.sub}>{o.sub}</Text>

      <View style={styles.msg}>
        <Text style={styles.msgSender}>{debrief.sender}</Text>
        <Text style={styles.msgText}>{debrief.message_text}</Text>
        {debrief.link_text ? <Text style={styles.msgLink}>{debrief.link_text}</Text> : null}
      </View>

      {debrief.was_phishing && (debrief.red_flags || []).length > 0 ? (
        <>
          <Text style={styles.section}>Warning signs</Text>
          {debrief.red_flags.map((f, i) => (
            <View key={i} style={styles.flag}>
              <Icon name="flag" size={16} color={appColors.primary} style={{ marginTop: 2 }} />
              <Text style={styles.flagText}>{f}</Text>
            </View>
          ))}
        </>
      ) : null}

      {debrief.explanation ? (
        <>
          <Text style={styles.section}>Why</Text>
          <Text style={styles.explain}>{debrief.explanation}</Text>
        </>
      ) : null}

      <AppButton title="Got it" onPress={onClose} style={{ marginTop: spacing.xl }} />
    </Sheet>
  );
}

/** Result of one quiz attempt: score, feedback, and which answers were right. */
export function QuizResultSheet({ result, onClose }) {
  if (!result) return <Sheet visible={false} onClose={onClose} />;
  const q = result.quiz || {};
  const items = (result.review && result.review.quiz) || [];
  return (
    <Sheet visible onClose={onClose}>
      <View style={styles.badge}>
        <Icon name={result.passed ? 'ribbon' : 'refresh'} size={30} color={appColors.primary} />
      </View>
      <Text style={styles.title}>{result.passed ? 'Quiz passed!' : 'Not quite yet'}</Text>
      <Text style={styles.score}>{q.correct}/{q.total}</Text>
      {result.feedback ? <Text style={styles.sub}>{result.feedback}</Text> : null}

      <Text style={styles.section}>Your answers</Text>
      {items.map((it) => (
        <View key={it.id} style={styles.review}>
          <Icon name={it.is_correct ? 'checkmark-circle' : 'close-circle'} size={22} color={it.is_correct ? appColors.primary : appColors.error} />
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={styles.reviewQ}>{it.question}</Text>
            {!it.is_correct ? <Text style={styles.reviewA}>Correct answer: {it.correct_text}</Text> : null}
            {!it.is_correct && it.explanation ? <Text style={styles.explain}>{it.explanation}</Text> : null}
          </View>
        </View>
      ))}

      <AppButton title={result.passed ? 'Continue' : 'Back to my plan'} onPress={onClose} style={{ marginTop: spacing.xl }} />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(37,32,51,0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#FBF6FD', borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xl, maxHeight: '88%' },
  grabber: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: appColors.lavender, marginBottom: spacing.lg },
  badge: { width: 60, height: 60, borderRadius: 22, backgroundColor: appColors.lilac, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  title: { ...typography.h2, color: appColors.text },
  score: { ...typography.h1, color: appColors.primary, marginTop: spacing.xs },
  sub: { ...typography.body, color: appColors.textSecondary, marginTop: spacing.sm },
  section: { ...typography.label, color: appColors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: spacing.xl, marginBottom: spacing.sm },
  msg: { backgroundColor: glass.bgStrong, borderRadius: 20, borderWidth: 1, borderColor: glass.border, padding: spacing.lg, marginTop: spacing.lg },
  msgSender: { ...typography.bodyStrong, color: appColors.text },
  msgText: { ...typography.body, color: appColors.text, marginTop: 4 },
  msgLink: { ...typography.body, color: '#1A5FD0', textDecorationLine: 'underline', marginTop: spacing.sm },
  flag: { flexDirection: 'row', marginBottom: spacing.sm },
  flagText: { ...typography.body, color: appColors.text, flex: 1, marginLeft: spacing.sm },
  explain: { ...typography.body, color: appColors.textSecondary },
  review: { flexDirection: 'row', marginBottom: spacing.md },
  reviewQ: { ...typography.bodyStrong, color: appColors.text },
  reviewA: { ...typography.body, color: appColors.primary, marginTop: 2 },
});
