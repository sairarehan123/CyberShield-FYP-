import React, { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../components/ScreenContainer';
import ProgressBar from '../components/ProgressBar';
import CircleButton from '../components/CircleButton';
import CustomButton from '../components/CustomButton';
import Card from '../components/Card';
import Pill from '../components/Pill';
import { QUESTIONNAIRE, getCategory } from '../data/questionnaire';
import { useAppStore } from '../store/AppStore';
import { colors, radius, spacing, typography } from '../theme';

const { questions, scale } = QUESTIONNAIRE;
const TOTAL = questions.length;

/**
 * Steps: 0..TOTAL-1 = questions, TOTAL = review, then a completion view.
 * Answers are saved RAW through the store. PHASE 2 HOOK: in `submit`, replace the completion view with
 * `navigation.replace('Results', { assessmentId: saved.id })` and compute scores from the saved answers.
 */
export default function AssessmentQuestionsScreen({ navigation }) {
  const { saveAssessment } = useAppStore();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState(false);
  const allowLeave = useRef(false);

  const isReview = step === TOTAL;
  const question = questions[step];
  const answeredCount = Object.keys(answers).length;

  // Warn before discarding answers (header back button, Android back, swipe).
  useEffect(
    () =>
      navigation.addListener('beforeRemove', (e) => {
        if (allowLeave.current || answeredCount === 0) return;
        e.preventDefault();
        Alert.alert('Leave assessment?', 'Your answers so far will be lost.', [
          { text: 'Keep going', style: 'cancel' },
          {
            text: 'Leave',
            style: 'destructive',
            onPress: () => {
              allowLeave.current = true;
              navigation.dispatch(e.data.action);
            },
          },
        ]);
      }),
    [navigation, answeredCount]
  );

  const select = (value) => {
    setAnswers((a) => ({ ...a, [question.id]: value }));
    setError('');
  };

  const next = () => {
    if (answers[question.id] == null) {
      setError('Please choose an answer to continue.');
      return;
    }
    setError('');
    setStep((s) => s + 1);
  };

  const submit = () => {
    const firstUnanswered = questions.findIndex((q) => answers[q.id] == null);
    if (firstUnanswered !== -1) {
      setStep(firstUnanswered);
      setError('Please answer this question before submitting.');
      return;
    }
    saveAssessment({
      answers,
      questionnaireVersion: QUESTIONNAIRE.version,
      isPlaceholder: QUESTIONNAIRE.isPlaceholder,
      questionCount: TOTAL,
    });
    allowLeave.current = true;
    setCompleted(true);
  };

  // goBack() works on every React Navigation version and returns to the tab the user started from.
  const finish = () => navigation.goBack();
  const labelFor = (qid) => scale.find((s) => s.value === answers[qid])?.label;

  // ---------- completion ----------
  if (completed) {
    return (
      <ScreenContainer
        scroll={false}
        edges={['top', 'bottom']}
        contentStyle={styles.doneWrap}
        footer={
          <View style={styles.footer}>
            <CustomButton title="Done" onPress={finish} />
          </View>
        }
      >
        <View style={styles.doneIcon}>
          <Ionicons name="checkmark" size={40} color={colors.white} />
        </View>
        <Text style={styles.doneTitle}>Assessment complete</Text>
        <Text style={styles.doneText}>
          Thank you. Your answers have been saved on this device. Your results and personalised guidance will be available in an upcoming update.
        </Text>
      </ScreenContainer>
    );
  }

  const footer = (
    <View style={styles.footer}>
      {step > 0 ? (
        <CircleButton variant="light" icon="arrow-back" label="Previous question" onPress={() => { setError(''); setStep((s) => s - 1); }} />
      ) : (
        <View style={{ width: 54 }} />
      )}
      <View style={{ flex: 1, marginLeft: spacing.md }}>
        {isReview ? (
          <CustomButton title="Submit assessment" onPress={submit} />
        ) : (
          <CustomButton title={step === TOTAL - 1 ? 'Review answers' : 'Next'} iconRight="arrow-forward" onPress={next} />
        )}
      </View>
    </View>
  );

  return (
    <ScreenContainer title={isReview ? 'Review answers' : 'Assessment'} onBack={() => navigation.goBack()} edges={['top', 'bottom']} footer={footer}>
      {!isReview ? (
        <>
          <Text style={styles.count}>Question {step + 1} of {TOTAL}</Text>
          <ProgressBar value={(step + 1) / TOTAL} style={{ marginTop: spacing.sm }} />

          <Pill label={getCategory(question.category)?.label} icon={getCategory(question.category)?.icon} style={{ marginTop: spacing.xl }} />
          <Text style={styles.question} accessibilityRole="header">{question.text}</Text>

          <View accessibilityRole="radiogroup" style={{ marginTop: spacing.lg }}>
            {scale.map((opt) => {
              const selected = answers[question.id] === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => select(opt.value)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={opt.label}
                  style={[styles.option, selected && styles.optionOn]}
                >
                  <View style={[styles.radio, selected && styles.radioOn]}>{selected ? <View style={styles.radioDot} /> : null}</View>
                  <Text style={[styles.optionText, selected && { color: colors.primary }]}>{opt.label}</Text>
                </Pressable>
              );
            })}
          </View>
          {error ? (
            <View style={styles.errorRow} accessibilityLiveRegion="polite">
              <Ionicons name="alert-circle" size={14} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
        </>
      ) : (
        <>
          <Text style={styles.reviewLead}>Check your answers, or tap one to change it. Your answers stay on this device.</Text>
          <Card style={{ marginTop: spacing.lg, paddingVertical: spacing.sm }}>
            {questions.map((q, i) => (
              <Pressable
                key={q.id}
                onPress={() => { setError(''); setStep(i); }}
                accessibilityRole="button"
                accessibilityLabel={`Question ${i + 1}: ${q.text}. Answer: ${labelFor(q.id) || 'not answered'}. Tap to change.`}
                style={[styles.reviewRow, i < TOTAL - 1 && styles.reviewDivider]}
              >
                <Text style={styles.reviewQ} numberOfLines={2}>{q.text}</Text>
                <Text style={[styles.reviewA, !labelFor(q.id) && { color: colors.error }]}>{labelFor(q.id) || 'Unanswered'}</Text>
              </Pressable>
            ))}
          </Card>
          {error ? <Text style={[styles.errorText, { marginTop: spacing.md }]}>{error}</Text> : null}
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  count: { ...typography.label, color: colors.textSecondary },
  question: { ...typography.h2, fontSize: 22, lineHeight: 30, color: colors.text, marginTop: spacing.md },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  optionOn: { borderColor: colors.primaryLight, backgroundColor: colors.lilacSoft },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.dotInactive, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  radioOn: { borderColor: colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  optionText: { ...typography.bodyStrong, color: colors.text },
  errorRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  errorText: { ...typography.caption, color: colors.error, marginLeft: 4 },
  footer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.md, backgroundColor: colors.background },
  reviewLead: { ...typography.body, color: colors.textSecondary },
  reviewRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md },
  reviewDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  reviewQ: { ...typography.caption, lineHeight: 17, color: colors.text, flex: 1, marginRight: spacing.md },
  reviewA: { ...typography.label, color: colors.primary },
  doneWrap: { alignItems: 'center', justifyContent: 'center' },
  doneIcon: { width: 84, height: 84, borderRadius: 42, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl },
  doneTitle: { ...typography.h2, color: colors.text, textAlign: 'center' },
  doneText: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md, maxWidth: 320 },
});
