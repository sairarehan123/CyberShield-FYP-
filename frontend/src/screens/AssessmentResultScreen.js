import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import Card from '../components/Card';
import AppButton from '../components/AppButton';
import IconTile from '../components/IconTile';
import Pill from '../components/Pill';
import ProgressBar from '../components/ProgressBar';
import SectionHeader from '../components/SectionHeader';
import { SUBSCALES } from './sebisMeta';
import { spacing, typography } from '../theme';
import { appColors } from '../theme/appTheme';

/** NEW design - SeBIS result. Shows the profile exactly as the backend calculated it. */
export default function AssessmentResultScreen({ navigation, route }) {
  const { profile } = route.params;

  return (
    <ScreenContainer
      title="Your results"
      scroll
      edges={['top', 'bottom']}
      footer={<View style={styles.footer}><AppButton title="Back to Home" onPress={() => navigation.navigate('Home')} /></View>}
    >
      <Card tone="soft" style={styles.hero}>
        <Text style={styles.heroLabel}>Overall security behaviour</Text>
        <Text style={styles.heroScore}>{profile.overall_score.toFixed(2)}<Text style={styles.heroOutOf}> / 5</Text></Text>
        <Pill label={`${profile.overall_level} level`} icon="shield-checkmark-outline" />
      </Card>

      <SectionHeader title="By area" style={{ marginTop: spacing.xl }} />
      {Object.entries(profile.subscale_scores).map(([key, score], i) => {
        const meta = SUBSCALES[key] || { label: key, icon: 'shield-outline' };
        return (
          <Card key={key} style={styles.row}>
            <View style={styles.rowTop}>
              <IconTile icon={meta.icon} tone={i % 2 ? 'pink' : 'lilac'} size={40} />
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={styles.rowTitle}>{meta.label}</Text>
                <Text style={styles.rowLevel}>{profile.subscale_levels[key]}</Text>
              </View>
              <Text style={styles.rowScore}>{score.toFixed(2)}</Text>
            </View>
            <ProgressBar value={score / 5} style={{ marginTop: spacing.md }} />
          </Card>
        );
      })}

      {profile.weakest_area ? (
        <Text style={styles.note}>
          Area with the most room to grow: {(SUBSCALES[profile.weakest_area] || {}).label || profile.weakest_area}.
        </Text>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', paddingVertical: spacing.xl },
  heroLabel: { ...typography.label, color: appColors.textSecondary },
  heroScore: { ...typography.h1, fontSize: 48, lineHeight: 56, color: appColors.primary, marginVertical: spacing.sm },
  heroOutOf: { ...typography.h3, color: appColors.textSecondary },
  row: { marginBottom: spacing.md },
  rowTop: { flexDirection: 'row', alignItems: 'center' },
  rowTitle: { ...typography.bodyStrong, color: appColors.text },
  rowLevel: { ...typography.caption, color: appColors.textSecondary },
  rowScore: { ...typography.h3, color: appColors.primary },
  note: { ...typography.body, color: appColors.textSecondary, marginTop: spacing.md },
  footer: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md, backgroundColor: appColors.background },
});
