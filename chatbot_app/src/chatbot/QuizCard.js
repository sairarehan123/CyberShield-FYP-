import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { spacing, typography, appColors, appShadow, glass } from './theme';
import { ProgressBar, AppButton, Icon } from './ui';

/** 5-mark quiz. Calls onSubmit({q1:'a', ...}). The backend grades it; the answers are never on the device. */
export default function QuizCard({ quiz, busy, onSubmit }) {
  const [answers, setAnswers] = useState({});
  const questions = quiz.quiz || [];
  const answered = questions.filter((q) => answers[q.id]).length;
  const ready = questions.length > 0 && answered === questions.length;

  return (
    <View>
      <View style={styles.head}>
        <Text style={styles.title}>Quick quiz</Text>
        <Text style={styles.sub}>{answered} of {questions.length} answered - you need {Math.ceil(questions.length * (quiz.pass_mark || 0.7))} right to pass</Text>
        <ProgressBar segments={questions.length} filled={answered} height={6} style={{ marginTop: spacing.md }} />
      </View>

      {questions.map((q, qi) => (
        <View key={q.id} style={styles.card}>
          <Text style={styles.qNum}>Question {qi + 1}</Text>
          <Text style={styles.question}>{q.question}</Text>
          {q.options.map((o) => {
            const selected = answers[q.id] === o.id;
            return (
              <Pressable
                key={o.id}
                onPress={() => setAnswers((a) => ({ ...a, [q.id]: o.id }))}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                style={({ pressed }) => [styles.option, selected && styles.optionOn, pressed && { opacity: 0.9 }]}
              >
                <View style={[styles.radio, selected && styles.radioOn]}>
                  {selected ? <Icon name="checkmark" size={14} color="#fff" /> : null}
                </View>
                <Text style={[styles.optionText, selected && { color: appColors.text, fontWeight: '600' }]}>{o.text}</Text>
              </Pressable>
            );
          })}
        </View>
      ))}

      {busy ? (
        <ActivityIndicator color={appColors.primary} style={{ marginVertical: spacing.lg }} />
      ) : (
        <AppButton title="Submit answers" icon="checkmark-done-outline" disabled={!ready} onPress={() => onSubmit(answers)} style={{ marginTop: spacing.sm }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  head: { marginBottom: spacing.lg },
  title: { ...typography.h3, color: appColors.text },
  sub: { ...typography.caption, color: appColors.textSecondary, marginTop: 2 },
  card: { backgroundColor: glass.bgStrong, borderRadius: 24, borderWidth: 1, borderColor: glass.border, padding: spacing.lg, marginBottom: spacing.md, ...appShadow.card },
  qNum: { ...typography.caption, color: appColors.primary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
  question: { ...typography.bodyStrong, color: appColors.text, marginTop: 4, marginBottom: spacing.md },
  option: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1, borderColor: glass.border, paddingVertical: spacing.md, paddingHorizontal: spacing.md, marginTop: spacing.sm, backgroundColor: glass.bg },
  optionOn: { borderColor: appColors.primary, backgroundColor: appColors.lilac },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: appColors.lavender, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  radioOn: { backgroundColor: appColors.primary, borderColor: appColors.primary },
  optionText: { ...typography.body, color: appColors.textSecondary, flex: 1 },
});
