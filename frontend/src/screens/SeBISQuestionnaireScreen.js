import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenBackground from '../components/ScreenBackground';
import AuthHeader from '../components/AuthHeader';
import CustomButton from '../components/CustomButton';
import { colors, typography, spacing } from '../theme';
import AssessmentProgress from '../components/AssessmentProgress';
import QuestionCard from '../components/QuestionCard';
import { fetchQuestions } from '../services/sebisApi';

export default function SeBISQuestionnaireScreen({ navigation, route }) {
  const { userId, initialAnswers, startAtIndex } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answerScale, setAnswerScale] = useState([]);

  const [currentIndex, setCurrentIndex] = useState(startAtIndex || 0);
  const [answers, setAnswers] = useState(initialAnswers || {});
  const [validationMessage, setValidationMessage] = useState(null);

  useEffect(() => {
    loadQuestions();
  }, []);

  async function loadQuestions() {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchQuestions();
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

  function handleNext() {
    const hasAnswer = answers[currentQuestion.id] !== undefined;
    if (!hasAnswer) {
      setValidationMessage('Please select an answer before continuing.');
      return;
    }
    if (isLastQuestion) {
      navigation.navigate('SeBISReview', { userId, answers, questions, answerScale });
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  // In-quiz "Previous" only moves between questions - exiting the
  // assessment entirely is handled by AuthHeader's own back arrow.
  function handlePrevious() {
    setCurrentIndex((i) => Math.max(0, i - 1));
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
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground circuit={false}>
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <AuthHeader
            title="Security Check-in"
            subtitle="Let's understand your digital safety habits."
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

          {validationMessage && (
            <Text style={styles.validationText}>{validationMessage}</Text>
          )}
        </ScrollView>

        <View style={styles.bottomBar}>
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
