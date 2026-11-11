
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import ScreenContainer from '../components/ScreenContainer';
import Card from '../components/Card';
import CustomButton from '../components/CustomButton';
import SectionHeader from '../components/SectionHeader';

import { colors, spacing, typography } from '../theme';

export default function AssessScreen({ navigation }) {
  return (
    <ScreenContainer title="Assess">
      <Text style={styles.lead}>
        Evaluate your cybersecurity habits and understand how you can
        improve your digital safety.
      </Text>

      <SectionHeader
        title="Available Assessments"
        style={{ marginTop: spacing.xl }}
      />

      {/* SeBIS */}
      <Card style={styles.card}>
        <View style={styles.headingRow}>
          <Ionicons
            name="shield-checkmark-outline"
            size={27}
            color={colors.primary}
          />
          <Text style={styles.cardTitle}>
            SeBIS Assessment
          </Text>
        </View>

        <Text style={styles.description}>
          Security Behaviour Intentions Scale. Evaluate your everyday
          cybersecurity behaviour and security practices.
        </Text>

        <CustomButton
          title="Start SeBIS Assessment"
          onPress={() => navigation.navigate('SeBISIntro')}
          style={styles.button}
        />
      </Card>

      {/* PMT */}
      <Card style={styles.card}>
        <View style={styles.headingRow}>
          <Ionicons
            name="analytics-outline"
            size={27}
            color={colors.primary}
          />
          <Text style={styles.cardTitle}>
            PMT Assessment
          </Text>
        </View>

        <Text style={styles.description}>
          Protection Motivation Theory. Understand your threat appraisal,
          coping appraisal and security intentions.
        </Text>

        <CustomButton
          title="Start PMT Assessment"
          onPress={() => navigation.navigate('PMTIntro')}
          style={styles.button}
        />
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  lead: {
    ...typography.body,
    color: colors.textSecondary,
  },
  card: {
    marginBottom: spacing.lg,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    ...typography.h3,
    color: colors.text,
    marginLeft: spacing.md,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  button: {
    marginTop: spacing.lg,
  },
});
