import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../components/ScreenContainer';
import ProgressBar from '../components/ProgressBar';
import { AppCircleButton } from '../components/AppButton';
import AppButton from '../components/AppButton';
import Card from '../components/Card';
import Pill from '../components/Pill';
import { QUESTIONNAIRE, getCategory } from '../data/questionnaire';
import { getSebisQuestions, submitSebisAssessment } from '../services/sebisApi';
import { useAppStore } from '../store/AppStore';
import { radius, spacing, typography } from '../theme';
import { appColors } from '../theme/appTheme';

const FALLBACK_SCALE = QUESTIONNAIRE.scale;

export default function AssessmentQuestionsScreen({ navigation }) {
  const { saveAssessment } = useAppStore();
  const [questions, setQuestions] = useState([]);
  const [scale, setScale] = useState(FALLBACK_SCALE);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState(null);
  const allowLeave = useRef(false);

  const TOTAL = questions.length;
  const isReview = TOTAL > 0 && step === TOTAL;
  const question = questions[step];
  const answeredCount = Object.keys(answers).length;

  useEffect(() => {
    let active = true;
    getSebisQuestions()
      .then((data) => {
        if (!active) return;
        // The backend uses `subscale`; the UI's category helper uses the same key values.
        setQuestions(data.questions.map((item) => ({
          id: item.id,
          text: item.text,
          category: item.subscale || item.category,
        })));
        setScale(data.scale);
        setLoading(false);
      })
      .catch((e) => {
        if (!active) return;
        setError(`${e.message}\n\nCheck that FastAPI is running and your phone and PC are on the same Wi-Fi.`);
        setLoading(false);
      });
    return () => { active = false; };
  }, []);

  useEffect(
    () => navigation.addListener('beforeRemove', (e) => {
      if (allowLeave.current || answeredCount === 0 || completed) return;
      e.preventDefault();
      Alert.alert('Leave assessment?', 'Your answers so far will be lost.', [
        { text: 'Keep going', style: 'cancel' },
        { text: 'Leave', style: 'destructive', onPress: () => {
          allowLeave.current = true;
          navigation.dispatch(e.data.action);
        } },
      ]);
    }),
    [navigation, answeredCount, completed]
  );

  const select = (value) => {
    setAnswers((current) => ({ ...current, [question.id]: value }));
    setError('');
  };

  const next = () => {
    if (answers[question.id] == null) {
      setError('Please choose an answer to continue.');
      return;
    }
    setError('');
    setStep((current) => current + 1);
  };

  const submit = async () => {
    const firstUnanswered = questions.findIndex((item) => answers[item.id] == null);
    if (firstUnanswered !== -1) {
      setStep(firstUnanswered);
      setError('Please answer this question before submitting.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const result = await submitSebisAssessment(answers);
      setAssessmentResult(result);
      saveAssessment({
        answers,
        questionnaireVersion: QUESTIONNAIRE.version,
        isPlaceholder: false,
        questionCount: TOTAL,
        backendAssessmentId: result.assessment_id,
        profile: result.profile,
        attemptNumber: result.attempt_number,
        comparison: result.comparison || null,
      });
      allowLeave.current = true;
      setCompleted(true);
    } catch (e) {
      setError(`${e.message}\n\nYour answers are still on this screen. Please try submitting again.`);
    } finally {
      setSubmitting(false);
    }
  };

  const finish = () => navigation.goBack();
  const labelFor = (qid) => scale.find((option) => option.value === answers[qid])?.label;

  if (loading) {
    return (
      <ScreenContainer title="Assessment" edges={['top', 'bottom']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={appColors.primary} />
          <Text style={styles.loadingText}>Loading SeBIS questions from the server...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!TOTAL) {
    return (
      <ScreenContainer title="Assessment" edges={['top', 'bottom']}>
        <Text style={styles.errorText}>{error || 'No questions were received from the backend.'}</Text>
        <AppButton title="Go back" onPress={finish} style={{ marginTop: spacing.lg }} />
      </ScreenContainer>
    );
  }

  if (completed) {
    const profile = assessmentResult?.profile;
    return (
      <ScreenContainer scroll={true} edges={['top', 'bottom']} contentStyle={styles.doneWrap}
        footer={<View style={styles.footer}><AppButton title="Done" onPress={finish} /></View>}>
        <View style={styles.doneIcon}><Ionicons name="checkmark" size={40} color={appColors.white} /></View>
        <Text style={styles.doneTitle}>Assessment complete</Text>
        <Text style={styles.doneText}>Your SeBIS assessment was scored and saved by the Python backend.</Text>
        {profile ? (
          <Card style={styles.resultCard}>
            <Text style={styles.resultHeading}>Your security profile</Text>
            <Text style={styles.score}>Overall score: {profile.overall_score} / 5</Text>
            <Text style={styles.level}>Overall level: {profile.overall_level}</Text>
            <Text style={styles.resultLine}>Device securement: {profile.subscale_scores?.device_securement}</Text>
            <Text style={styles.resultLine}>Password generation: {profile.subscale_scores?.password_generation}</Text>
            <Text style={styles.resultLine}>Proactive awareness: {profile.subscale_scores?.proactive_awareness}</Text>
            <Text style={styles.resultLine}>Updating: {profile.subscale_scores?.updating}</Text>
            <Text style={styles.resultLine}>Weakest area: {String(profile.weakest_area || '').replaceAll('_', ' ')}</Text>
          </Card>
        ) : null}
      </ScreenContainer>
    );
  }

  const footer = (
    <View style={styles.footer}>
      {step > 0 ? (
        <AppCircleButton icon="arrow-back" label="Previous question" onPress={() => { setError(''); setStep((current) => current - 1); }} />
      ) : <View style={{ width: 54 }} />}
      <View style={{ flex: 1, marginLeft: spacing.md }}>
        {isReview ? (
          <AppButton title={submitting ? 'Submitting...' : 'Submit assessment'} onPress={submit} disabled={submitting} />
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
          <Pill label={getCategory(question.category)?.label || question.category?.replaceAll('_', ' ')} icon={getCategory(question.category)?.icon} style={{ marginTop: spacing.xl }} />
          <Text style={styles.question} accessibilityRole="header">{question.text}</Text>
          <View accessibilityRole="radiogroup" style={{ marginTop: spacing.lg }}>
            {scale.map((option) => {
              const selected = answers[question.id] === option.value;
              return (
                <Pressable key={option.value} onPress={() => select(option.value)} accessibilityRole="radio"
                  accessibilityState={{ selected }} accessibilityLabel={option.label}
                  style={[styles.option, selected && styles.optionOn]}>
                  <View style={[styles.radio, selected && styles.radioOn]}>{selected ? <View style={styles.radioDot} /> : null}</View>
                  <Text style={[styles.optionText, selected && { color: appColors.white }]}>{option.label}</Text>
                </Pressable>
              );
            })}
          </View>
          {error ? <View style={styles.errorRow}><Ionicons name="alert-circle" size={14} color={appColors.error} /><Text style={styles.errorText}>{error}</Text></View> : null}
        </>
      ) : (
        <>
          <Text style={styles.reviewLead}>Check your answers, or tap one to change it. Your answers will be sent to the SeBIS backend when you submit.</Text>
          <Card style={{ marginTop: spacing.lg, paddingVertical: spacing.sm }}>
            {questions.map((item, index) => (
              <Pressable key={item.id} onPress={() => { setError(''); setStep(index); }} accessibilityRole="button"
                accessibilityLabel={`Question ${index + 1}: ${item.text}. Answer: ${labelFor(item.id) || 'not answered'}. Tap to change.`}
                style={[styles.reviewRow, index < TOTAL - 1 && styles.reviewDivider]}>
                <Text style={styles.reviewQ} numberOfLines={2}>{item.text}</Text>
                <Text style={[styles.reviewA, !labelFor(item.id) && { color: appColors.error }]}>{labelFor(item.id) || 'Unanswered'}</Text>
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  loadingText: { ...typography.body, color: appColors.textSecondary, marginTop: spacing.md, textAlign: 'center' },
  count: { ...typography.label, color: appColors.textSecondary },
  question: { ...typography.h2, fontSize: 26, lineHeight: 34, fontWeight: '700', color: appColors.text, marginTop: spacing.md },
  option: { flexDirection: 'row', alignItems: 'center', minHeight: 56, backgroundColor: appColors.white, borderWidth: 1, borderColor: appColors.border, borderRadius: 28, paddingHorizontal: spacing.xl, marginBottom: spacing.md },
  optionOn: { borderColor: appColors.primary, backgroundColor: appColors.primary },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: appColors.lavender, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  radioOn: { borderColor: appColors.white },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: appColors.white },
  optionText: { ...typography.bodyStrong, color: appColors.text },
  errorRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: spacing.sm },
  errorText: { ...typography.caption, color: appColors.error, marginLeft: 4, flexShrink: 1 },
  footer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.md, backgroundColor: appColors.background },
  reviewLead: { ...typography.body, color: appColors.textSecondary },
  reviewRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md },
  reviewDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: appColors.border },
  reviewQ: { ...typography.caption, lineHeight: 17, color: appColors.text, flex: 1, marginRight: spacing.md },
  reviewA: { ...typography.label, color: appColors.primary },
  doneWrap: { alignItems: 'center', justifyContent: 'center' },
  doneIcon: { width: 84, height: 84, borderRadius: 42, backgroundColor: appColors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl },
  doneTitle: { ...typography.h2, color: appColors.text, textAlign: 'center' },
  doneText: { ...typography.body, color: appColors.textSecondary, textAlign: 'center', marginTop: spacing.md, maxWidth: 320 },
  resultCard: { width: '100%', marginTop: spacing.xl, padding: spacing.lg },
  resultHeading: { ...typography.h3, color: appColors.text, marginBottom: spacing.sm },
  score: { ...typography.h2, color: appColors.primary, marginBottom: spacing.xs },
  level: { ...typography.bodyStrong, color: appColors.text, marginBottom: spacing.md },
  resultLine: { ...typography.body, color: appColors.text, marginTop: spacing.xs, textTransform: 'capitalize' },
});
