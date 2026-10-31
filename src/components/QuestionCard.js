import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius, shadow } from '../theme';
import AnswerOption from './AnswerOption';

/**
 * questionText: the question being asked
 * answerScale: [{ value: 1, label: 'Never' }, ...]
 * selectedValue: the currently selected value for this question (or undefined)
 * onSelect: (value) => void
 */
export default function QuestionCard({ questionText, answerScale, selectedValue, onSelect }) {
  return (
    <View style={[styles.card, shadow.soft]}>
      <Text style={styles.questionText}>{questionText}</Text>
      <View style={styles.optionsContainer}>
        {answerScale.map((option) => (
          <AnswerOption
            key={option.value}
            label={option.label}
            selected={selectedValue === option.value}
            onPress={() => onSelect(option.value)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
  },
  questionText: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  optionsContainer: {
    marginTop: spacing.xs,
  },
});
