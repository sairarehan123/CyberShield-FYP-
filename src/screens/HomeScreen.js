
import React from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import ScreenContainer from '../components/ScreenContainer';
import Card from '../components/Card';
import { ArrowChip } from '../components/IconTile';
import SectionHeader from '../components/SectionHeader';

import { APP_NAME, APP_TAGLINE } from '../config/appConfig';
import { spacing, radius, typography } from '../theme';

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

export default function HomeScreen({ onSwitchTab }) {
  return (
    <ScreenContainer>

      {/* HEADER */}
      <View style={styles.top}>
        <View style={{ flex: 1 }}>
          <Text style={styles.hello}>
            Welcome to {APP_NAME}
          </Text>
        </View>

        <Pressable
          onPress={() =>
            Alert.alert(
              'Notifications',
              "You don't have any notifications yet."
            )
          }
          style={styles.roundBtn}
          accessibilityLabel="Notifications"
        >
          <Ionicons
            name="notifications-outline"
            size={21}
            color={C.mauveDark}
          />
        </Pressable>

        <Pressable
          onPress={() => onSwitchTab?.('profile')}
          style={styles.roundBtn}
          accessibilityLabel="Open profile"
        >
          <Ionicons
            name="person-outline"
            size={21}
            color={C.mauveDark}
          />
        </Pressable>
      </View>

      {/* HEADLINE */}
      <Text style={styles.headline}>
        {APP_TAGLINE}
      </Text>

      {/* HERO SECTION */}
      <View style={styles.hero}>

        <View style={styles.heroDecor}>
          <View style={[styles.decorBar, styles.barOne]} />
          <View style={[styles.decorBar, styles.barTwo]} />
          <View style={[styles.decorBar, styles.barThree]} />
        </View>

        <View style={styles.heroBadge}>
          <Ionicons
            name="shield-checkmark"
            size={28}
            color={C.mauveDark}
          />
        </View>

        <Text style={styles.heroEyebrow}>
          YOUR DIGITAL SAFETY JOURNEY
        </Text>

        <Text style={styles.heroTitle}>
          Your security starts with awareness.
        </Text>

        <Text style={styles.heroText}>
          Discover your cybersecurity habits, understand your
          protection motivation, and take steps towards a safer
          digital life.
        </Text>

        <View style={styles.heroFooter}>
          <Text style={styles.heroFooterText}>
            2 research-based assessments
          </Text>

          <Ionicons
            name="arrow-forward-circle"
            size={25}
            color={C.mauveDark}
          />
        </View>
      </View>

      {/* ASSESSMENTS SHORTCUT */}
      <SectionHeader
        title="Your Assessments"
        style={{ marginTop: spacing.xl }}
      />

      <Card
        onPress={() => onSwitchTab?.('assess')}
        accessibilityLabel="View all assessments"
        style={styles.assessmentShortcut}
      >
        <View style={styles.learningRow}>

          <View style={styles.assessmentIcon}>
            <Ionicons
              name="clipboard-outline"
              size={25}
              color={C.mauveDark}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>
              Explore Assessments
            </Text>

            <Text style={styles.description}>
              Discover your cybersecurity behaviour and
              protection motivation.
            </Text>

            <Text style={styles.shortcutText}>
              View all assessments →
            </Text>
          </View>

          <ArrowChip />

        </View>
      </Card>

      {/* LEARNING SECTION */}
      <SectionHeader
        title="Keep Learning"
        style={{ marginTop: spacing.xl }}
      />

      <Card
        onPress={() => onSwitchTab?.('learn')}
        accessibilityLabel="Open Learn"
      >
        <View style={styles.learningRow}>

          <View style={styles.learningIcon}>
            <Ionicons
              name="book-outline"
              size={24}
              color={C.mauveDark}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>
              Security Tips
            </Text>

            <Text style={styles.description}>
              Passwords, phishing, updates and privacy,
              explained simply.
            </Text>
          </View>

          <ArrowChip />

        </View>
      </Card>

    </ScreenContainer>
  );
}

const styles = StyleSheet.create({

  // HEADER
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },

  hello: {
    ...typography.bodyStrong,
    color: C.mauveDark,
  },

  headline: {
    fontSize: 33,
    lineHeight: 41,
    fontWeight: '700',
    letterSpacing: -0.6,
    color: C.plum,
    marginBottom: spacing.xl,
  },

  roundBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: C.pinkSoft,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },

  // HERO SECTION
  hero: {
    backgroundColor: C.pink,
    borderRadius: 23,
    padding: spacing.xl,
    overflow: 'hidden',
  },

  heroDecor: {
    position: 'absolute',
    right: spacing.xl,
    top: spacing.xl,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },

  decorBar: {
    width: 19,
    borderRadius: 12,
    marginLeft: 6,
  },

  barOne: {
    height: 45,
    backgroundColor: C.mauve,
  },

  barTwo: {
    height: 76,
    backgroundColor: C.white,
  },

  barThree: {
    height: 55,
    backgroundColor: '#E9B7D2',
  },

  heroBadge: {
    width: 54,
    height: 54,
    borderRadius: 19,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroEyebrow: {
    ...typography.caption,
    color: C.mauveDark,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: spacing.lg,
  },

  heroTitle: {
    fontSize: 26,
    lineHeight: 33,
    fontWeight: '700',
    color: C.plum,
    marginTop: spacing.sm,
    maxWidth: '90%',
  },

  heroText: {
    ...typography.body,
    color: C.secondary,
    marginTop: spacing.sm,
  },

  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E8C6D9',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
  },

  heroFooterText: {
    ...typography.caption,
    color: C.plum,
    fontWeight: '600',
  },

  // ASSESSMENTS SHORTCUT
  assessmentShortcut: {
    borderWidth: 1,
    borderColor: C.border,
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

  shortcutText: {
    ...typography.caption,
    color: C.mauveDark,
    fontWeight: '700',
    marginTop: spacing.md,
  },

  // SHARED CARD STYLES
  cardTitle: {
    ...typography.bodyStrong,
    color: C.plum,
  },

  description: {
    ...typography.body,
    color: C.secondary,
    marginTop: spacing.md,
    lineHeight: 21,
  },

  // LEARNING SECTION
  learningRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  learningIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: C.pink,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },

});
