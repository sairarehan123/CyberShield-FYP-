import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import ScreenContainer from '../components/ScreenContainer';
import Card from '../components/Card';
import SectionHeader from '../components/SectionHeader';

import { spacing, typography } from '../theme';

// CyberShield — rich magenta, soft pink and deep plum palette
const C = {
  background: '#FCF9FD',
  white: '#FFFFFF',

  mauve: '#A84A8B',
  mauveDark: '#913875',

  pink: '#F7E2EE',
  pinkSoft: '#FCEEF5',

  plum: '#54356F',
  text: '#34263F',
  secondary: '#79647D',

  border: '#E7D7E7',
};

export default function AssessScreen({ navigation }) {
  return (
    <ScreenContainer title="Assess">
      <Text style={styles.lead}>
        Evaluate your cybersecurity habits and understand how you can
        improve your digital safety.
      </Text>

      {/* ASSESSMENTS */}
      <SectionHeader
        title="Security Assessment"
        style={{ marginTop: spacing.xl }}
      />

      {/* SEBIS CARD (Entry Point to Guided 4-Theory Flow) */}
      <Card style={styles.assessmentCard}>
        <View style={styles.cardHeader}>
          <View style={styles.assessmentIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={25}
              color={C.mauveDark}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>
              SeBIS Assessment
            </Text>

            <Text style={styles.cardSubtitle}>
              Security Behaviour Intentions Scale
            </Text>
          </View>

          <View style={styles.tag}>
            <Text style={styles.tagText}>STEP 1</Text>
          </View>
        </View>

        <Text style={styles.description}>
          Start by evaluating your everyday cybersecurity habits across four
          core security categories. Once you view your SeBIS report, you will
          continue smoothly through the behavioral and threat-avoidance
          questionnaires.
        </Text>

        <Pressable
          style={styles.primaryButton}
          onPress={() => navigation.navigate('SeBISIntro')}
        >
          <Text style={styles.primaryButtonText}>
            Start SeBIS Assessment
          </Text>

          <Ionicons
            name="arrow-forward"
            size={19}
            color={C.white}
          />
        </Pressable>
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  lead: {
    ...typography.body,
    color: C.secondary,
  },

  assessmentCard: {
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: C.border,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  assessmentIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: C.pink,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },

  cardTitle: {
    ...typography.bodyStrong,
    color: C.plum,
  },

  cardSubtitle: {
    ...typography.caption,
    color: C.secondary,
    marginTop: 3,
  },

  tag: {
    backgroundColor: C.pinkSoft,
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  tagText: {
    fontSize: 9,
    fontWeight: '700',
    color: C.mauveDark,
    letterSpacing: 0.4,
  },

  description: {
    ...typography.body,
    color: C.secondary,
    marginTop: spacing.md,
    lineHeight: 21,
  },

  primaryButton: {
    minHeight: 49,
    borderRadius: 14,
    backgroundColor: C.mauve,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
  },

  primaryButtonText: {
    color: C.white,
    fontSize: 14,
    fontWeight: '700',
    marginRight: spacing.sm,
  },
});