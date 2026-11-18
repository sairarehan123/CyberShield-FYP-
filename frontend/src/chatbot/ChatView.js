import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Background, Card, CircleButton, Chip, AppButton, Pill, Icon } from './ui';
import { Bubble, TypingBubble, Divider, PlanCard, EvalCard } from './ChatParts';
import QuizCard from './QuizCard';
import ConsentCard from './ConsentCard';
import TheoryCard from './TheoryCard';
import LockedCard from './LockedCard';
import { dayLabel, timeLabel } from './dates';
import { spacing, typography, appColors, appShadow, glass, gradients } from './theme';
import { ASSISTANT_NAME } from './config';

const pretty = (s) => (s ? s.replace(/_/g, ' ') : '');
const PROMPTS = ['Why does this matter?', 'Explain my steps simply', 'Give me a quick tip'];

/** The conversation. The backend's `stage` decides what is drawn under the messages. */
export default function ChatView({ t, onBack, onOpenInbox, seed, onSeedUsed, onLeave, onTakeAssessment }) {
  const { chat, busy, pending } = t;
  const [draft, setDraft] = useState('');
  const [changing, setChanging] = useState(false);   // theory card re-opened while still learning
  const scrollRef = useRef(null);
  const actions = (chat && chat.actions) || [];
  const stage = chat ? chat.stage : null;
  const count = chat ? chat.messages.length : 0;

  // A shortcut from the home screen ("Why does this matter?", "Quiz") runs once.
  useEffect(() => {
    if (!seed || !chat || busy) return;
    if (seed.kind === 'say' && actions.includes('send_message') && stage !== 'quiz') t.send(seed.text);
    if (seed.kind === 'quiz' && actions.includes('start_quiz')) t.beginQuiz();
    onSeedUsed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed, chat]);

  useEffect(() => {
    const id = setTimeout(() => scrollRef.current && scrollRef.current.scrollToEnd({ animated: true }), 120);
    return () => clearTimeout(id);
  }, [count, stage, busy, pending]);

  const send = () => {
    const text = draft.trim();
    if (!text || busy) return;
    setDraft('');
    t.send(text);
  };

  const hasInbox = !!(chat && chat.inbox);
  const openCount = hasInbox ? chat.inbox.filter((m) => m.status === 'open').length : 0;
  const showInput = actions.includes('send_message') && stage !== 'quiz';
  const canQuiz = actions.includes('start_quiz');
  const suggestions = chat && chat.suggestions && chat.suggestions.length ? chat.suggestions : PROMPTS;
  const canChangeTheory = stage === 'learning' && chat && chat.theory_options && chat.theory_options.length > 1;

  let prevArea = null;
  let prevDay = null;
  const rendered = (chat ? chat.messages : []).map((m, i) => {
    const out = [];
    if (prevArea && m.area !== prevArea) out.push(<Divider key={`a${i}`} label={prevArea === '_general' ? 'Your personal training' : `New area: ${pretty(m.area)}`} />);
    prevArea = m.area;
    const day = dayLabel(m.at);
    if (day && day !== prevDay) out.push(<Divider key={`d${i}`} label={day} />);
    prevDay = day;
    const time = timeLabel(m.at);
    if (m.kind === 'plan' && m.data && m.data.steps) {
      out.push(<View key={`m${i}`}><Bubble role="assistant" text={m.text} time={time} /><PlanCard steps={m.data.steps} /></View>);
    } else if (m.kind === 'evaluation_result') {
      out.push(<EvalCard key={`m${i}`} data={m.data} text={m.text} />);
    } else {
      out.push(<Bubble key={`m${i}`} role={m.role} text={m.text} time={time} />);
    }
    return out;
  });

  return (
    <Background>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
          <View style={styles.header}>
            <CircleButton icon="chevron-back" label="Back" onPress={onBack} />
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.headerTitle}>{ASSISTANT_NAME}</Text>
              <View style={styles.online}><View style={styles.onlineDot} /><Text style={styles.onlineText}>Security coach</Text></View>
            </View>
            {hasInbox ? (
              <View>
                <CircleButton icon="mail-outline" label="Inbox" onPress={onOpenInbox} />
                {openCount > 0 ? <View style={styles.badge}><Text style={styles.badgeText}>{openCount}</Text></View> : null}
              </View>
            ) : <View style={{ width: 44 }} />}
          </View>

          {chat && chat.area_name ? (
            <View style={styles.strip}>
              <Pill label={`Now training: ${chat.area_name}${chat.focus_theory ? ` · ${chat.focus_theory.toUpperCase()}` : ''}`} icon="shield-checkmark-outline" />
              <Text style={styles.stripText}>{chat.completed_areas.length} done</Text>
            </View>
          ) : null}

          <ScrollView ref={scrollRef} style={{ flex: 1 }} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {rendered}
            {pending ? <Bubble role="user" text={pending} /> : null}
            {busy && pending ? <TypingBubble /> : null}

            {stage === 'general' ? <LockedCard missing={chat.missing_assessments} onTakeAssessment={onTakeAssessment} /> : null}

            {stage === 'choose_theory' ? <TheoryCard options={chat.theory_options} selected={chat.focus_theory} busy={busy} onChoose={t.chooseTheory} /> : null}

            {changing && stage === 'learning' ? (
              <TheoryCard title="Change your training focus" options={chat.theory_options} selected={chat.focus_theory} busy={busy}
                onChoose={async (k) => { await t.chooseTheory(k); setChanging(false); }} />
            ) : null}

            {stage === 'learning' && !chat.background ? (
              <Card style={{ marginBottom: spacing.md }}>
                <Text style={styles.q}>So I can explain things at the right level - how comfortable are you with technology?</Text>
                <View style={{ flexDirection: 'row', marginTop: spacing.md }}>
                  <AppButton title="Quite comfortable" variant="outline" compact onPress={() => t.chooseBackground('technical')} style={{ flex: 1, marginRight: spacing.sm, paddingHorizontal: spacing.md }} />
                  <AppButton title="Beginner" variant="outline" compact onPress={() => t.chooseBackground('non_technical')} style={{ flex: 1, paddingHorizontal: spacing.md }} />
                </View>
              </Card>
            ) : null}

            {stage === 'quiz' && chat.quiz ? <QuizCard key={chat.quiz.attempt} quiz={chat.quiz} busy={busy} onSubmit={t.submitAnswers} /> : null}

            {stage === 'consent_required' ? <ConsentCard busy={busy} onAccept={t.accept} onLater={onLeave} /> : null}

            {stage === 'observing' ? (
              <View style={styles.note}>
                <Icon name="time-outline" size={18} color={appColors.primary} />
                <Text style={styles.noteText}>Keep following your steps in everyday life. We will check in over the next days - ask me anything meanwhile.</Text>
              </View>
            ) : null}

            {stage === 'finished' ? (
              <Card style={styles.center}>
                <LinearGradient colors={gradients.brand} style={styles.bigIcon}><Icon name="trophy" size={28} color="#fff" /></LinearGradient>
                <Text style={styles.centerTitle}>All areas completed</Text>
                <Text style={styles.centerText}>{chat.message || 'You have finished your whole training. Great work!'}</Text>
              </Card>
            ) : null}
          </ScrollView>

          {showInput ? (
            <View style={styles.footer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" style={{ marginBottom: spacing.sm }}>
                {canQuiz ? <Chip strong icon="school-outline" label="I'm ready for the quiz" onPress={() => !busy && t.beginQuiz()} /> : null}
                {canChangeTheory ? <Chip icon="swap-horizontal-outline" label="Change theory" onPress={() => setChanging(!changing)} /> : null}
                {suggestions.map((p) => <Chip key={p} label={p} onPress={() => !busy && t.send(p)} />)}
              </ScrollView>
              <View style={styles.pill}>
                <TextInput
                  value={draft}
                  onChangeText={setDraft}
                  placeholder="Write your message..."
                  placeholderTextColor={appColors.textSecondary}
                  style={styles.input}
                  multiline
                  maxLength={500}
                  editable={!busy}
                />
                <Pressable onPress={send} disabled={!draft.trim() || busy} accessibilityRole="button" accessibilityLabel="Send" style={(!draft.trim() || busy) && { opacity: 0.4 }}>
                  <LinearGradient colors={gradients.brand} style={styles.send}><Icon name="send" size={17} color="#fff" /></LinearGradient>
                </Pressable>
              </View>
            </View>
          ) : null}
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Background>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.sm },
  headerTitle: { ...typography.bodyStrong, color: appColors.text },
  online: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#3DBE8B', marginRight: 5 },
  onlineText: { ...typography.caption, color: appColors.textSecondary },
  badge: { position: 'absolute', top: -4, right: -4, minWidth: 20, height: 20, borderRadius: 10, backgroundColor: appColors.primary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  badgeText: { ...typography.caption, fontWeight: '800', color: '#fff' },
  strip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingBottom: spacing.sm },
  stripText: { ...typography.caption, color: appColors.textSecondary },
  scroll: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xl },
  q: { ...typography.bodyStrong, color: appColors.text },
  note: { flexDirection: 'row', backgroundColor: glass.bg, borderWidth: 1, borderColor: glass.border, borderRadius: 18, padding: spacing.md, marginTop: spacing.sm },
  noteText: { ...typography.caption, lineHeight: 18, color: appColors.text, flex: 1, marginLeft: spacing.sm },
  center: { alignItems: 'center', padding: spacing.xl },
  bigIcon: { width: 64, height: 64, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  centerTitle: { ...typography.h3, color: appColors.text, textAlign: 'center' },
  centerText: { ...typography.body, color: appColors.textSecondary, textAlign: 'center', marginTop: spacing.sm },
  footer: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm, paddingBottom: spacing.sm },
  pill: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: glass.bgStrong, borderWidth: 1, borderColor: glass.border, borderRadius: 28, paddingLeft: spacing.lg, paddingRight: 6, paddingVertical: 6, ...appShadow.card },
  input: { flex: 1, maxHeight: 110, minHeight: 38, paddingTop: 9, paddingBottom: 9, ...typography.body, color: appColors.text },
  send: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginLeft: spacing.sm },
});
