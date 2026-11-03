import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import Card from '../components/Card';
import AppButton from '../components/AppButton';
import IconTile from '../components/IconTile';
import SectionHeader from '../components/SectionHeader';
import { SUBSCALES } from './sebisMeta';
import { spacing, typography } from '../theme';
import { appColors } from '../theme/appTheme';

/** NEW design - SeBIS intro. No "retake": the questionnaire only records your usual behaviour. */
export default function AssessScreen({ navigation }) {
  return (
    <ScreenContainer title="Assess" onBack={() => navigation.goBack()}>
      <Text style={styles.lead}>
        A short check of your everyday security habits. There are no right or wrong answers, just answer honestly.
      </Text>

      <SectionHeader title="What you'll answer" style={{ marginTop: spacing.xl, marginBottom: spacing.xs }} />
      <Text style={styles.meta}>16 questions · about 4 min</Text>

      <View style={styles.grid}>
        {Object.entries(SUBSCALES).map(([key, c], i) => (
          <Card key={key} style={styles.tile}>
            <IconTile icon={c.icon} tone={i % 2 ? 'pink' : 'lilac'} size={40} />
            <Text style={styles.tileLabel}>{c.label}</Text>
          </Card>
        ))}
      </View>

      <AppButton
        title="Start assessment"
        iconRight="arrow-forward"
        onPress={() => navigation.navigate('AssessmentQuestions')}
        style={{ marginTop: spacing.sm }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  lead: { ...typography.body, color: appColors.textSecondary },
  meta: { ...typography.label, color: appColors.textSecondary, marginBottom: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: spacing.sm },
  tile: { width: '48%', marginBottom: spacing.md, padding: spacing.lg },
  tileLabel: { ...typography.bodyStrong, color: appColors.text, marginTop: spacing.md },
});
