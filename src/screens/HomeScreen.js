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

const EXPECT = [
  {
    icon: 'time-outline',
    text: 'Short questions about your cybersecurity habits.',
  },
  {
    icon: 'chatbubble-ellipses-outline',
    text: 'There are no right or wrong answers. Answer honestly.',
  },
  {
    icon: 'shield-checkmark-outline',
    text: 'Understand your security behaviour and improve your digital safety.',
  },
];

export default function HomeScreen({ navigation, onSwitchTab }) {
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

      {/* ASSESSMENTS */}
      <SectionHeader
        title="Explore Assessments"
        style={{ marginTop: spacing.xl }}
      />

      {/* SEBIS CARD */}
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
            <Text style={styles.tagText}>BEHAVIOUR</Text>
          </View>
        </View>

        <Text style={styles.description}>
          Evaluate your everyday cybersecurity behaviour and
          understand your current security practices.
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

      {/* PMT CARD */}
      <Card style={styles.assessmentCard}>
        <View style={styles.cardHeader}>
          <View style={styles.assessmentIcon}>
            <Ionicons
              name="analytics-outline"
              size={25}
              color={C.mauveDark}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>
              PMT Assessment
            </Text>

            <Text style={styles.cardSubtitle}>
              Protection Motivation Theory
            </Text>
          </View>

          <View style={styles.tag}>
            <Text style={styles.tagText}>MOTIVATION</Text>
          </View>
        </View>

        <Text style={styles.description}>
          Explore your threat appraisal, coping appraisal,
          and motivation to adopt protective security behaviours.
        </Text>

        <Pressable
          style={styles.primaryButton}
          onPress={() => navigation.navigate('PMTIntro')}
        >
          <Text style={styles.primaryButtonText}>
            Start PMT Assessment
          </Text>

          <Ionicons
            name="arrow-forward"
            size={19}
            color={C.white}
          />
        </Pressable>
      </Card>

      {/* WHAT TO EXPECT */}
      <SectionHeader
        title="What to expect"
        style={{ marginTop: spacing.xl }}
      />

      <Card style={styles.expectCard}>
        {EXPECT.map((item, index) => (
          <View
            key={item.icon}
            style={[
              styles.expectRow,
              index > 0 && styles.expectSpacing,
            ]}
          >
            <View style={styles.expectIcon}>
              <Ionicons
                name={item.icon}
                size={21}
                color={C.mauveDark}
              />
            </View>

            <Text style={styles.expectText}>
              {item.text}
            </Text>
          </View>
        ))}
      </Card>

      {/* LEARNING */}
      <SectionHeader
        title="Keep learning"
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

  expectCard: {
    borderWidth: 1,
    borderColor: C.border,
  },

  expectRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  expectSpacing: {
    marginTop: spacing.lg,
  },

  expectIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: C.pinkSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },

  expectText: {
    ...typography.body,
    color: C.secondary,
    flex: 1,
    lineHeight: 21,
  },

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