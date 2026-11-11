import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenBackground from '../components/ScreenBackground';
import AuthHeader from '../components/AuthHeader';
import CustomButton from '../components/CustomButton';
import { colors, typography, spacing } from '../theme';
import AssessmentProgress from '../components/AssessmentProgress';
import QuestionCard from '../components/QuestionCard';
import { fetchPmtQuestions } from '../services/sebisApi';
import { getOrCreateGuestUserId } from '../services/guestUser';

/**
 * Route params:
 *   userId           same guest id as SeBIS (falls back to getOrCreateGuestUserId if missing)
 *   initialAnswers   answers so far (when returning from Review)
 *   startAtIndex     question to open
 *   editSingle       true when opened from Review to change ONE answer (returns straight to Review)
 *   questions, answerScale   optional: reuse what Review already has instead of fetching again
 * Questions and the 7 scale labels ALWAYS come from the API; nothing is hardcoded here.
 */
export default function PMTQuestionnaireScreen({ navigation, route }) {
  const params = route.params || {};
  const { initialAnswers, startAtIndex, editSingle } = params;

  const [userId, setUserId] = useState(params.userId);
  const [loading, setLoading] = useState(!params.questions);
  const [loadError, setLoadError] = useState(null);
  const [questions, setQuestions] = useState(params.questions || []);
  const [answerScale, setAnswerScale] = useState(params.answerScale || []);

  const [currentIndex, setCurrentIndex] = useState(startAtIndex || 0);
  const [answers, setAnswers] = useState(initialAnswers || {});
  const [validationMessage, setValidationMessage] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!params.questions) loadQuestions();
    if (!params.userId) getOrCreateGuestUserId().then(setUserId);
  }, []);

  // Seven options make the page tall: always start each question at the top.
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ y: 0, animated: false });
  }, [currentIndex]);

  async function loadQuestions() {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchPmtQuestions();
      setQuestions(data.questions);
      setAnswerScale(data.answer_scale);
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const isFirstQuestion = currentIndex === 0;

  function handleSelect(value) {
    setValidationMessage(null);
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  }

  function requireAnswer() {
    if (answers[currentQuestion.id] === undefined) {
      setValidationMessage('Please select an answer before continuing.');
      return false;
    }
    return true;
  }

  function handleNext() {
    if (!requireAnswer()) return;
    if (isLastQuestion) {
      navigation.navigate('PMTReview', { userId, answers, questions, answerScale });
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  function handlePrevious() {
    setValidationMessage(null);
    setCurrentIndex((i) => Math.max(0, i - 1));
  }

  // Edit mode: save this one answer and go straight back to the existing Review screen.
  function handleSaveEdit() {
    if (!requireAnswer()) return;
    navigation.popTo('PMTReview', { userId, answers, questions, answerScale }, { merge: true });
  }

  if (loading) {
    return (
      <ScreenBackground circuit={false}>
        <SafeAreaView style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading questions...</Text>
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  if (loadError) {
    return (
      <ScreenBackground circuit={false}>
        <SafeAreaView style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={40} color={colors.error} />
          <Text style={styles.errorText}>{loadError}</Text>
          <CustomButton title="Try Again" onPress={loadQuestions} />
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  if (!currentQuestion) {
    return (
      <ScreenBackground circuit={false}>
        <SafeAreaView style={styles.centered}>
          <Text style={styles.errorText}>No questions available.</Text>
          <CustomButton title="Try Again" onPress={loadQuestions} />
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground circuit={false}>
      <SafeAreaView style={styles.safe}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <AuthHeader
            title="Motivation Check-in"
            subtitle="Choose how much you agree with each statement."
            onBack={navigation.canGoBack() ? navigation.goBack : undefined}
          />

          <AssessmentProgress
            current={currentIndex + 1}
            total={totalQuestions}
            answeredCount={answeredCount}
          />

          <QuestionCard
            questionText={currentQuestion.text}
            answerScale={answerScale}
            selectedValue={answers[currentQuestion.id]}
            onSelect={handleSelect}
          />

          {validationMessage && <Text style={styles.validationText}>{validationMessage}</Text>}
        </ScrollView>

        <View style={styles.bottomBar}>
          {editSingle ? (
            <>
              <CustomButton
                title="Cancel"
                variant="outline"
                onPress={() => navigation.goBack()}
                style={styles.previousButton}
              />
              <CustomButton title="Save Answer" onPress={handleSaveEdit} style={styles.nextButton} />
            </>
          ) : (
            <>
              {!isFirstQuestion && (
                <CustomButton
                  title="Previous"
                  variant="outline"
                  onPress={handlePrevious}
                  style={styles.previousButton}
                />
              )}
              <CustomButton
                title={isLastQuestion ? 'Review My Answers' : 'Next Question'}
                onPress={handleNext}
                style={styles.nextButton}
              />
            </>
          )}
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  loadingText: { ...typography.body, color: colors.textSecondary, marginTop: spacing.md },
  errorText: {
    ...typography.body,
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  scrollContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
  validationText: { ...typography.label, color: colors.error, marginTop: spacing.sm },
  bottomBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  previousButton: { flex: 1, marginRight: spacing.md },
  nextButton: { flex: 1 },
});
