import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenBackground from '../components/ScreenBackground';
import AuthHeader from '../components/AuthHeader';
import CustomButton from '../components/CustomButton';
import { colors, typography, spacing, radius, shadow } from '../theme';
import { submitPmt } from '../services/sebisApi';

/** Mirrors SeBISReviewScreen. Sends the RAW answers to the backend; scoring happens only there. */
export default function PMTReviewScreen({ navigation, route }) {
  const { userId, answers, questions, answerScale } = route.params;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const submittingRef = useRef(false);

  const validValues = answerScale.map((o) => o.value);
  const isValidAnswer = (v) => Number.isInteger(v) && validValues.includes(v);

  const unansweredQuestions = questions.filter((q) => !isValidAnswer(answers[q.id]));
  const canSubmit = questions.length > 0 && unansweredQuestions.length === 0;

  function labelForValue(value) {
    const match = answerScale.find((o) => o.value === value);
    return match ? match.label : '-';
  }

  // Change ONE answer, then come straight back here (see PMTQuestionnaireScreen "editSingle").
  function handleEdit(questionIndex) {
    navigation.navigate('PMTQuestionnaire', {
      userId,
      initialAnswers: answers,
      startAtIndex: questionIndex,
      editSingle: true,
      questions,
      answerScale,
    });
  }

  async function handleSubmit() {
    if (!canSubmit || submittingRef.current) return; // prevents duplicate submissions

    submittingRef.current = true;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const result = await submitPmt(userId, answers);
      // Replace the questionnaire history with Home -> Report, so Back cannot return here and
      // submit again (there is no retake).
      navigation.reset({
        index: 1,
        routes: [
          { name: 'Home' },
          { name: 'PMTReport', params: { userId, assessmentId: result.assessment_id } },
        ],
      });
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <ScreenBackground circuit={false}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <AuthHeader
            title="Review Your Answers"
            subtitle="Tap any answer to change it before submitting."
            onBack={navigation.canGoBack() ? navigation.goBack : undefined}
          />

          {!canSubmit && (
            <View style={styles.warningBox}>
              <Ionicons name="alert-circle-outline" size={18} color={colors.error} />
              <Text style={styles.warningText}>
                {unansweredQuestions.length} question
                {unansweredQuestions.length !== 1 ? 's' : ''} still need
                {unansweredQuestions.length === 1 ? 's' : ''} an answer.
              </Text>
            </View>
          )}

          {questions.map((q, index) => {
            const value = answers[q.id];
            const isUnanswered = !isValidAnswer(value);
            return (
              <TouchableOpacity
                key={q.id}
                style={[styles.card, shadow.soft, isUnanswered && styles.cardUnanswered]}
                onPress={() => handleEdit(index)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`Edit answer to question ${index + 1}`}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.questionNumber}>Q{index + 1}</Text>
                  <Ionicons name="pencil-outline" size={16} color={colors.textSecondary} />
                </View>
                <Text style={styles.questionText} numberOfLines={3}>
                  {q.text}
                </Text>
                <Text style={[styles.answerText, isUnanswered && styles.answerTextUnanswered]}>
                  {isUnanswered ? 'Not answered yet' : labelForValue(value)}
                </Text>
              </TouchableOpacity>
            );
          })}

          {submitError && <Text style={styles.submitErrorText}>{submitError}</Text>}
        </ScrollView>

        <View style={styles.bottomBar}>
          <CustomButton
            title="Submit Assessment"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={!canSubmit}
          />
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorBg,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
  warningText: {
    ...typography.label,
    color: colors.error,
    marginLeft: spacing.sm,
    flexShrink: 1,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardUnanswered: { borderColor: colors.error },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  questionNumber: { ...typography.caption, color: colors.textSecondary },
  questionText: { ...typography.body, color: colors.text, marginBottom: spacing.sm },
  answerText: { ...typography.bodyStrong, color: colors.primary },
  answerTextUnanswered: { color: colors.error },
  submitErrorText: {
    ...typography.label,
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  bottomBar: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
