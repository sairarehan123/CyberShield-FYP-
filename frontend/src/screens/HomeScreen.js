import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import ScreenContainer from '../components/ScreenContainer';
import Card from '../components/Card';
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
  successSoft: '#EBF7F0',
  success: '#2E7D5B',
};

const PILLARS = [
  {
    id: 'behaviour',
    stage: 'PILLAR 01 · STAGE 1',
    label: 'Behaviour',
    theory: 'SeBIS',
    fullName: 'Security Behavior Intentions Scale',
    icon: 'shield-checkmark-outline',
    info: 'Measures everyday digital security habits like password hygiene, updates, and device locking.',
    focus: ['Device Securement', 'Password Hygiene', 'Proactive Awareness', 'Software Updates'],
    meta: '16 Questions · 5-Point Scale',
  },
  {
    id: 'motivation',
    stage: 'PILLAR 02 · STAGE 2',
    label: 'Motivation',
    theory: 'PMT',
    fullName: 'Protection Motivation Theory',
    icon: 'analytics-outline',
    info: 'Explores how you weigh cyber threats against your ability to take protective action.',
    focus: ['Threat Severity', 'Vulnerability', 'Self-Efficacy', 'Response Cost'],
    meta: '24 Questions · 7-Point Scale',
  },
  {
    id: 'social',
    stage: 'PILLAR 03 · STAGE 3',
    label: 'Social Control',
    theory: 'TPB',
    fullName: 'Theory of Planned Behavior',
    icon: 'people-outline',
    info: 'Looks at personal attitudes, peer influence, and confidence in practising safe habits.',
    focus: ['Security Attitude', 'Social Norms', 'Perceived Control', 'Intentions'],
    meta: '16 Questions · 7-Point Scale',
  },
  {
    id: 'avoidance',
    stage: 'PILLAR 04 · STAGE 4',
    label: 'Threat Avoidance',
    theory: 'TTAT',
    fullName: 'Technology Threat Avoidance Theory',
    icon: 'eye-outline',
    info: 'Examines how you perceive risks and evaluate the effort vs. effectiveness of safeguards.',
    focus: ['Perceived Threat', 'Safeguard Effectiveness', 'Safeguard Cost', 'Avoidance'],
    meta: '20 Questions · 7-Point Scale',
  },
];

const MYTH_FACTS = [
  {
    statement: 'Incognito mode hides your browsing activity from your Wi-Fi provider.',
    answer: 'Myth',
    explanation:
      'Private browsing only stops your device from saving local history. Your internet provider and network admin can still see visited domains.',
  },
  {
    statement: 'Turning on Two-Factor Authentication (2FA) blocks the vast majority of automated account takeovers.',
    answer: 'Fact',
    explanation:
      'Even if a password leaks, a second verification step stops attackers from signing in without your device or authenticator code.',
  },
  {
    statement: 'A strong password with symbols never needs to be unique across different websites.',
    answer: 'Myth',
    explanation:
      'If one site suffers a data breach, attackers test that same password across your email, banking, and social accounts.',
  },
  {
    statement: 'Software updates often patch active security vulnerabilities before hackers can exploit them.',
    answer: 'Fact',
    explanation:
      'Delaying OS or browser updates leaves known entry points open—enabling auto-updates closes those gaps automatically.',
  },
];

export default function HomeScreen({ navigation, onSwitchTab }) {
  const [mythIndex, setMythIndex] = useState(0);
  const [selectedGuess, setSelectedGuess] = useState(null);
  const [activePillar, setActivePillar] = useState(null);

  const currentMyth = MYTH_FACTS[mythIndex];

  function handleNextMyth() {
    setSelectedGuess(null);
    setMythIndex((prev) => (prev + 1) % MYTH_FACTS.length);
  }

  return (
    <ScreenContainer>
      {/* HEADER */}
      <View style={styles.top}>
        <View style={{ flex: 1 }}>
          <Text style={styles.hello}>
            Welcome to {APP_NAME}
          </Text>
        </View>
      </View>

      <Text style={styles.headline}>
        {APP_TAGLINE}
      </Text>

      {/* HERO SECTION */}
      <View style={styles.hero}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroBadge}>
            <Ionicons
              name="shield-checkmark"
              size={28}
              color={C.mauveDark}
            />
          </View>

          <View style={styles.heroDecor}>
            <View style={[styles.decorBar, styles.barOne]} />
            <View style={[styles.decorBar, styles.barTwo]} />
            <View style={[styles.decorBar, styles.barThree]} />
          </View>
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

        <Pressable
          style={styles.heroFooter}
          onPress={() => onSwitchTab?.('assess')}
        >
          <Text style={styles.heroFooterText}>
            4 research-based assessments
          </Text>

          <Ionicons
            name="arrow-forward-circle"
            size={25}
            color={C.mauveDark}
          />
        </Pressable>
      </View>

      {/* 1. THE 4 PILLARS OF CYBERSHIELD */}
      <SectionHeader
        title="The 4 Pillars of CyberShield"
        style={{ marginTop: spacing.xl }}
      />

      <View style={styles.pillarsGrid}>
        {PILLARS.map((pillar) => (
          <Pressable
            key={pillar.id}
            style={styles.pillarPill}
            onPress={() => setActivePillar(pillar)}
          >
            <View style={styles.pillarIcon}>
              <Ionicons
                name={pillar.icon}
                size={18}
                color={C.mauveDark}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.pillarLabel}>{pillar.label}</Text>
              <Text style={styles.pillarTheory}>{pillar.theory}</Text>
            </View>
          </Pressable>
        ))}
      </View>

      {/* 2. CYBER MYTH VS. FACT */}
      <SectionHeader
        title="Cyber Myth vs. Fact"
        style={{ marginTop: spacing.xl }}
      />

      <Card style={styles.mythCard}>
        <View style={styles.mythTopRow}>
          <View style={styles.mythBadge}>
            <Text style={styles.mythBadgeText}>
              QUICK PULSE · {mythIndex + 1}/{MYTH_FACTS.length}
            </Text>
          </View>

          <Pressable onPress={handleNextMyth} style={styles.nextPill}>
            <Text style={styles.nextPillText}>Next</Text>
            <Ionicons
              name="chevron-forward"
              size={14}
              color={C.mauveDark}
            />
          </Pressable>
        </View>

        <Text style={styles.mythStatement}>
          “{currentMyth.statement}”
        </Text>

        {selectedGuess === null ? (
          <View style={styles.guessRow}>
            <Pressable
              style={styles.guessBtn}
              onPress={() => setSelectedGuess('Myth')}
            >
              <Ionicons
                name="close-circle-outline"
                size={19}
                color={C.plum}
              />
              <Text style={styles.guessBtnText}>Myth</Text>
            </Pressable>

            <Pressable
              style={styles.guessBtn}
              onPress={() => setSelectedGuess('Fact')}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={19}
                color={C.mauveDark}
              />
              <Text style={styles.guessBtnText}>Fact</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.revealBox}>
            <View style={styles.revealHeader}>
              <View
                style={[
                  styles.verdictPill,
                  selectedGuess === currentMyth.answer
                    ? styles.verdictCorrect
                    : styles.verdictInfo,
                ]}
              >
                <Text
                  style={[
                    styles.verdictText,
                    selectedGuess === currentMyth.answer
                      ? styles.verdictTextCorrect
                      : styles.verdictTextInfo,
                  ]}
                >
                  {selectedGuess === currentMyth.answer
                    ? `Spot on! It's a ${currentMyth.answer}`
                    : `Actually, it's a ${currentMyth.answer}`}
                </Text>
              </View>
            </View>

            <Text style={styles.revealExplanation}>
              {currentMyth.explanation}
            </Text>

            <Pressable
              style={styles.nextStatementBtn}
              onPress={handleNextMyth}
            >
              <Text style={styles.nextStatementText}>
                Try Another Statement
              </Text>
              <Ionicons
                name="arrow-forward"
                size={16}
                color={C.white}
              />
            </Pressable>
          </View>
        )}
      </Card>

      {/* CUSTOM PILLAR POPUP MODAL */}
      <Modal
        visible={Boolean(activePillar)}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setActivePillar(null)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setActivePillar(null)}
        >
          {activePillar && (
            <Pressable style={styles.modalCard} onPress={() => {}}>
              {/* Decorative top pink banner matching Hero */}
              <View style={styles.modalBanner}>
                <View style={styles.modalIconBox}>
                  <Ionicons
                    name={activePillar.icon}
                    size={26}
                    color={C.mauveDark}
                  />
                </View>

                <View style={styles.modalStagePill}>
                  <Text style={styles.modalStageText}>
                    {activePillar.stage}
                  </Text>
                </View>

                <Pressable
                  onPress={() => setActivePillar(null)}
                  style={styles.modalCloseBtn}
                  accessibilityLabel="Close modal"
                >
                  <Ionicons name="close" size={18} color={C.plum} />
                </Pressable>
              </View>

              {/* Content */}
              <View style={styles.modalBody}>
                <Text style={styles.modalTheoryTag}>
                  {activePillar.theory} · {activePillar.fullName}
                </Text>

                <Text style={styles.modalTitle}>
                  {activePillar.label}
                </Text>

                <Text style={styles.modalInfo}>
                  {activePillar.info}
                </Text>

                {/* Key Dimensions Chips */}
                <View style={styles.modalFocusBox}>
                  <Text style={styles.modalFocusLabel}>
                    KEY DIMENSIONS MEASURED
                  </Text>
                  <View style={styles.modalChipsRow}>
                    {activePillar.focus.map((item) => (
                      <View key={item} style={styles.modalChip}>
                        <Ionicons
                          name="checkmark-circle"
                          size={13}
                          color={C.mauve}
                        />
                        <Text style={styles.modalChipText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Meta Row */}
                <View style={styles.modalMetaRow}>
                  <Ionicons
                    name="layers-outline"
                    size={15}
                    color={C.mauveDark}
                  />
                  <Text style={styles.modalMetaText}>
                    {activePillar.meta}
                  </Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.modalActions}>
                  <Pressable
                    style={styles.modalSecondaryBtn}
                    onPress={() => setActivePillar(null)}
                  >
                    <Text style={styles.modalSecondaryText}>Got It</Text>
                  </Pressable>

                  <Pressable
                    style={styles.modalPrimaryBtn}
                    onPress={() => {
                      setActivePillar(null);
                      onSwitchTab?.('assess');
                    }}
                  >
                    <Text style={styles.modalPrimaryText}>
                      Go to Assessments
                    </Text>
                    <Ionicons
                      name="arrow-forward"
                      size={15}
                      color={C.white}
                    />
                  </Pressable>
                </View>
              </View>
            </Pressable>
          )}
        </Pressable>
      </Modal>
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

  hero: {
    backgroundColor: C.pink,
    borderRadius: 23,
    padding: spacing.xl,
    overflow: 'hidden',
  },

  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },

  heroDecor: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },

  decorBar: {
    width: 17,
    borderRadius: 10,
    marginLeft: 6,
  },

  barOne: {
    height: 32,
    backgroundColor: C.mauve,
  },

  barTwo: {
    height: 54,
    backgroundColor: C.white,
  },

  barThree: {
    height: 40,
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

  pillarsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },

  pillarPill: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    padding: spacing.md,
  },

  pillarIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: C.pinkSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },

  pillarLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: C.plum,
  },

  pillarTheory: {
    fontSize: 10,
    fontWeight: '600',
    color: C.mauveDark,
    marginTop: 1,
  },

  mythCard: {
    borderWidth: 1,
    borderColor: C.border,
  },

  mythTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },

  mythBadge: {
    backgroundColor: C.pinkSoft,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  mythBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: C.mauveDark,
    letterSpacing: 0.5,
  },

  nextPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },

  nextPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: C.mauveDark,
  },

  mythStatement: {
    ...typography.bodyStrong,
    color: C.plum,
    fontSize: 16,
    lineHeight: 23,
  },

  guessRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },

  guessBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 14,
    backgroundColor: C.pinkSoft,
    borderWidth: 1,
    borderColor: C.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  guessBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: C.plum,
  },

  revealBox: {
    marginTop: spacing.md,
    backgroundColor: C.pinkSoft,
    borderRadius: 16,
    padding: spacing.md,
  },

  revealHeader: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },

  verdictPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },

  verdictCorrect: {
    backgroundColor: C.successSoft,
  },

  verdictInfo: {
    backgroundColor: C.pink,
  },

  verdictText: {
    fontSize: 11,
    fontWeight: '700',
  },

  verdictTextCorrect: {
    color: C.success,
  },

  verdictTextInfo: {
    color: C.mauveDark,
  },

  revealExplanation: {
    ...typography.body,
    color: C.text,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },

  nextStatementBtn: {
    minHeight: 40,
    borderRadius: 12,
    backgroundColor: C.mauve,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.md,
  },

  nextStatementText: {
    color: C.white,
    fontSize: 13,
    fontWeight: '700',
  },

  /* CUSTOM PILLAR POPUP MODAL STYLES */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(52, 38, 63, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },

  modalCard: {
    width: '100%',
    backgroundColor: C.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },

  modalBanner: {
    backgroundColor: C.pink,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E8C6D9',
  },

  modalIconBox: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalStagePill: {
    marginLeft: spacing.sm,
    backgroundColor: C.white,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },

  modalStageText: {
    fontSize: 10,
    fontWeight: '700',
    color: C.mauveDark,
    letterSpacing: 0.6,
  },

  modalCloseBtn: {
    marginLeft: 'auto',
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalBody: {
    padding: spacing.xl,
  },

  modalTheoryTag: {
    fontSize: 11,
    fontWeight: '700',
    color: C.mauveDark,
    letterSpacing: 0.3,
    marginBottom: 4,
  },

  modalTitle: {
    fontSize: 23,
    fontWeight: '700',
    color: C.plum,
    marginBottom: spacing.sm,
  },

  modalInfo: {
    ...typography.body,
    color: C.secondary,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: spacing.md,
  },

  modalFocusBox: {
    backgroundColor: C.pinkSoft,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },

  modalFocusLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: C.mauveDark,
    letterSpacing: 0.7,
    marginBottom: spacing.xs,
  },

  modalChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },

  modalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },

  modalChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: C.plum,
  },

  modalMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.lg,
  },

  modalMetaText: {
    fontSize: 12,
    fontWeight: '600',
    color: C.secondary,
  },

  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  modalSecondaryBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 14,
    backgroundColor: C.pinkSoft,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalSecondaryText: {
    fontSize: 13,
    fontWeight: '700',
    color: C.plum,
  },

  modalPrimaryBtn: {
    flex: 1.5,
    minHeight: 44,
    borderRadius: 14,
    backgroundColor: C.mauve,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  modalPrimaryText: {
    fontSize: 13,
    fontWeight: '700',
    color: C.white,
  },
});