import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../components/ScreenContainer';
import ProgressBar from '../components/ProgressBar';
import { AppCircleButton } from '../components/AppButton';
import AppButton from '../components/AppButton';
import Card from '../components/Card';
import Pill from '../components/Pill';
import { fetchQuestions, submitAssessment } from '../services/sebisApi';
import { getOrCreateGuestUserId } from '../services/guestUser';
import { SUBSCALES, ITEM_SUBSCALE } from './sebisMeta';
import { radius, spacing, typography } from '../theme';
import { appColors } from '../theme/appTheme';

/**
 * NEW design - SeBIS questionnaire, connected to the real backend.
 * Questions come from GET /assessment/sebis/questions; answers are sent to POST /assessment/sebis/score.
 * The backend does all scoring - this screen never calculates anything.
 */
export default function AssessmentQuestionsScreen({ navigation }) {
  const [questions, setQuestions] = useState([]);
  const [scale, setScale] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState('');
  const allowLeave = useRef(false);
  const TOTAL = questions.length;

  const load = () => {
    setLoading(true);
    setLoadError('');
    fetchQuestions()
      .then((d) => { setQuestions(d.questions); setScale(d.answer_scale); })
      .catch((e) => setLoadError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const isReview = TOTAL > 0 && step === TOTAL;
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

  const submit = async () => {
    const firstUnanswered = questions.findIndex((q) => answers[q.id] == null);
    if (firstUnanswered !== -1) {
      setStep(firstUnanswered);
      setError('Please answer this question before submitting.');
      return;
    }
    setSubmitting(true);
    try {
      const userId = await getOrCreateGuestUserId();
      const result = await submitAssessment(userId, answers);
      allowLeave.current = true;
      navigation.replace('AssessmentResult', { profile: result.profile, assessmentId: result.assessment_id });
    } catch (e) {
      setError(e.message);
      setSubmitting(false);
    }
  };

  const labelFor = (qid) => scale.find((s) => s.value === answers[qid])?.label;

  if (loading || loadError) {
    return (
      <ScreenContainer title="Assessment" onBack={() => navigation.goBack()}>
        {loading ? (
          <ActivityIndicator size="large" color={appColors.primary} style={{ marginTop: spacing.xxl }} />
        ) : (
          <View>
            <Text style={styles.reviewLead}>{loadError}</Text>
            <AppButton title="Try again" onPress={load} style={{ marginTop: spacing.lg }} />
          </View>
        )}
      </ScreenContainer>
    );
  }

  const footer = (
    <View style={styles.footer}>
      {step > 0 ? (
        <AppCircleButton icon="arrow-back" label="Previous question" onPress={() => { setError(''); setStep((s) => s - 1); }} />
      ) : (
        <View style={{ width: 54 }} />
      )}
      <View style={{ flex: 1, marginLeft: spacing.md }}>
        {isReview ? (
          <AppButton title={submitting ? 'Submitting…' : 'Submit assessment'} onPress={submit} disabled={submitting} />
        ) : (
          <AppButton title={step === TOTAL - 1 ? 'Review answers' : 'Next'} iconRight="arrow-forward" onPress={next} />
        )}
      </View>
    </View>
  );

  return (
    <ScreenContainer title={isReview ? 'Review answers' : 'Assessment'} onBack={() => navigation.goBack()} edges={['top', 'bottom']} footer={footer}>
      {!isReview ? (
        <>
          <Text style={styles.count}>Question {step + 1} of {TOTAL}</Text>
          <ProgressBar segments={TOTAL} filled={step + 1} style={{ marginTop: spacing.md }} />

          <Pill label={SUBSCALES[ITEM_SUBSCALE[question.id]]?.label} icon={SUBSCALES[ITEM_SUBSCALE[question.id]]?.icon} style={{ marginTop: spacing.xl }} />
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
                  <Text style={[styles.optionText, selected && { color: appColors.white }]}>{opt.label}</Text>
                </Pressable>
              );
            })}
          </View>
          {error ? (
            <View style={styles.errorRow} accessibilityLiveRegion="polite">
              <Ionicons name="alert-circle" size={14} color={appColors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
        </>
      ) : (
        <>
          <Text style={styles.reviewLead}>Check your answers, or tap one to change it. </Text>
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
                <Text style={[styles.reviewA, !labelFor(q.id) && { color: appColors.error }]}>{labelFor(q.id) || 'Unanswered'}</Text>
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
  count: { ...typography.label, color: appColors.textSecondary },
  question: { ...typography.h2, fontSize: 26, lineHeight: 34, fontWeight: '700', color: appColors.text, marginTop: spacing.md },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    backgroundColor: appColors.white,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 28,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  optionOn: { borderColor: appColors.primary, backgroundColor: appColors.primary },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: appColors.lavender, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  radioOn: { borderColor: appColors.white },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: appColors.white },
  optionText: { ...typography.bodyStrong, color: appColors.text },
  errorRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  errorText: { ...typography.caption, color: appColors.error, marginLeft: 4 },
  footer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.md, backgroundColor: appColors.background },
  reviewLead: { ...typography.body, color: appColors.textSecondary },
  reviewRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md },
  reviewDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: appColors.border },
  reviewQ: { ...typography.caption, lineHeight: 17, color: appColors.text, flex: 1, marginRight: spacing.md },
  reviewA: { ...typography.label, color: appColors.primary },
});