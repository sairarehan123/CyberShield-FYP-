import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Background, Card, CircleButton, Chip, Pill, AppButton, Avatar, Icon } from './ui';
import { dayLabel, timeLabel } from './dates';
import { spacing, typography, appColors, appShadow, glass, gradients } from './theme';
import { ASSISTANT_NAME } from './config';

const HERO = {
  general: { title: 'Unlock your training', text: 'Ask me anything about staying safe online. Finish your assessment to unlock your personal plan, quiz and progress.', cta: 'Open chat', icon: 'lock-open' },
  choose_theory: { title: 'Choose your focus', text: 'Your assessments are done. Pick the theory your training is built on.', cta: 'Choose', icon: 'compass' },
  learning: { title: 'Your training plan', text: 'Follow your steps in real life - and ask me anything about them.', cta: 'Open my plan', icon: 'list' },
  quiz: { title: 'Your quiz is ready', text: '5 quick questions. You need 4 right to pass.', cta: 'Continue the quiz', icon: 'school' },
  consent_required: { title: 'One quick thing', text: 'Please confirm one thing to continue your training.', cta: 'Review', icon: 'shield-half' },
  observing: { title: 'You are practising', text: 'Keep following your steps. We will check in over the next days.', cta: 'Open chat', icon: 'time' },
  coaching: { title: "Let's sharpen this area", text: 'Review your steps and keep practising - I am here if you need me.', cta: 'Open chat', icon: 'trending-up' },
  finished: { title: 'All done!', text: 'You completed every training area. Great work!', cta: 'See my chat', icon: 'ribbon' },
};
const PROMPTS = ['Why does this matter?', 'Explain my steps simply', 'Give me a quick tip'];
const GENERAL_PROMPTS = ['How do I make a strong password?', 'How do I spot a phishing message?', 'How does CyberShield work?'];

function Tile({ colors, icon, title, sub, badge, onPress, dim }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={title} style={({ pressed }) => [styles.tileWrap, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }, dim && { opacity: 0.6 }]}>
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.tile}>
        <View style={styles.tileIcon}><Icon name={icon} size={20} color="#fff" /></View>
        {badge > 0 ? <View style={styles.tileBadge}><Text style={styles.tileBadgeText}>{badge}</Text></View> : null}
        <View style={{ flex: 1 }} />
        <Text style={styles.tileTitle} numberOfLines={1}>{title}</Text>
        {sub ? <Text style={styles.tileSub} numberOfLines={1}>{sub}</Text> : null}
      </LinearGradient>
    </Pressable>
  );
}

/** Home of the chatbot: greeting, today's training, quick prompts, services and chat history. */
export default function HomeView({ chat, name, onGoHome, onOpenProfile, onOpenChat, onOpenInbox, onTakeAssessment }) {
  const stage = chat && chat.stage;
  const hero = HERO[stage] || HERO.learning;
  const actions = (chat && chat.actions) || [];
  const hasInbox = !!(chat && chat.inbox);
  const openCount = hasInbox ? chat.inbox.filter((m) => m.status === 'open').length : 0;
  const done = chat ? chat.completed_areas.length : 0;
  const locked = stage === 'general';
  const prompts = chat && chat.suggestions && chat.suggestions.length ? chat.suggestions : (locked ? GENERAL_PROMPTS : PROMPTS);

  // chat history = what the user asked, newest first, grouped by day
  const asked = chat ? chat.messages.filter((m) => m.role === 'user' && m.kind === 'text').slice(-12).reverse() : [];
  const groups = [];
  asked.forEach((m) => {
    const label = dayLabel(m.at);
    let g = groups[groups.length - 1];
    if (!g || g.label !== label) { g = { label, items: [] }; groups.push(g); }
    g.items.push(m);
  });

  return (
    <Background>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={styles.header}>
          {onGoHome ? <CircleButton icon="home-outline" label="Home" onPress={onGoHome} /> : <View style={{ width: 44 }} />}
          <View style={styles.titleRow}>
            <Icon name="sparkles" size={16} color={appColors.primary} />
            <Text style={styles.headerTitle}>{ASSISTANT_NAME}</Text>
          </View>
          <Pressable
            onPress={onOpenProfile}
            disabled={!onOpenProfile}
            accessibilityRole="button"
            accessibilityLabel="Profile"
            style={({ pressed }) => [pressed && { opacity: 0.85, transform: [{ scale: 0.96 }] }]}
          >
            <Avatar letter={name} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.hey}>Hey {name},</Text>
          <Text style={styles.big}>Ready for today's win?</Text>

          {!chat ? (
            <ActivityIndicator color={appColors.primary} style={{ marginTop: spacing.xl }} />
          ) : (
            <>
              <Card style={styles.hero}>
                <View style={styles.heroTop}>
                  <LinearGradient colors={gradients.brand} style={styles.heroIcon}><Icon name={hero.icon} size={22} color="#fff" /></LinearGradient>
                  <View style={{ flex: 1, marginLeft: spacing.md }}>
                    {chat.area_name ? <Pill label={`Now training: ${chat.area_name}`} icon="shield-checkmark-outline" /> : null}
                  </View>
                </View>
                <Text style={styles.heroTitle}>{hero.title}</Text>
                <Text style={styles.heroText}>{hero.text}</Text>
                <View style={styles.heroFoot}>
                  <Text style={styles.heroDone}>{locked ? 'Training locked' : `${done} area${done === 1 ? '' : 's'} mastered`}</Text>
                  <AppButton title={locked && onTakeAssessment ? 'Take assessment' : hero.cta} compact iconRight="arrow-forward" onPress={() => (locked && onTakeAssessment ? onTakeAssessment() : onOpenChat())} style={{ paddingHorizontal: spacing.lg }} />
                </View>
              </Card>

              {actions.includes('send_message') ? (
                <>
                  <Text style={styles.section}>Ask {ASSISTANT_NAME}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -spacing.xl }} contentContainerStyle={{ paddingHorizontal: spacing.xl }}>
                    {prompts.map((p) => <Chip key={p} label={p} icon="chatbubble-ellipses-outline" onPress={() => onOpenChat({ kind: 'say', text: p })} />)}
                  </ScrollView>
                </>
              ) : null}

              <Text style={styles.section}>Services</Text>
              <View style={styles.grid}>
                <Tile colors={gradients.tiles[0]} icon="list" title="My plan" sub={locked ? 'Unlocks after assessment' : chat.area_name || 'Your steps'} dim={locked} onPress={() => onOpenChat()} />
                <Tile colors={gradients.tiles[1]} icon="chatbubble-ellipses" title={`Ask ${ASSISTANT_NAME}`} sub="Any question" onPress={() => onOpenChat()} />
                <Tile colors={gradients.tiles[2]} icon="school" title="Quiz" sub={locked ? 'Unlocks after assessment' : actions.includes('start_quiz') ? 'Ready when you are' : stage === 'quiz' ? 'In progress' : 'Unlocks after practice'}
                  dim={!actions.includes('start_quiz') && stage !== 'quiz'}
                  onPress={() => onOpenChat(actions.includes('start_quiz') ? { kind: 'quiz' } : undefined)} />
                <Tile colors={gradients.tiles[3]} icon="mail" title="Inbox" sub={hasInbox ? (openCount ? `${openCount} new` : 'No new messages') : locked ? 'Unlocks after assessment' : 'Opens after your first quiz'}
                  badge={openCount} dim={!hasInbox} onPress={hasInbox ? onOpenInbox : () => onOpenChat()} />
              </View>

              <View style={styles.histHead}>
                <Text style={styles.section}>Chat history</Text>
              </View>
              <Card style={{ paddingVertical: spacing.sm }}>
                {groups.length === 0 ? (
                  <Text style={styles.empty}>Your questions will show up here.</Text>
                ) : groups.map((g, gi) => (
                  <View key={g.label + gi}>
                    <Text style={styles.groupLabel}>{g.label}</Text>
                    {g.items.map((m, i) => (
                      <Pressable key={m.at + i} onPress={() => onOpenChat()} style={({ pressed }) => [styles.histRow, pressed && { opacity: 0.8 }]} accessibilityRole="button">
                        <View style={styles.histIcon}><Icon name="chatbubble-outline" size={15} color={appColors.primary} /></View>
                        <Text style={styles.histText} numberOfLines={1}>{m.text}</Text>
                        <Text style={styles.histTime}>{timeLabel(m.at)}</Text>
                      </Pressable>
                    ))}
                  </View>
                ))}
              </Card>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </Background>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.sm },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { ...typography.bodyStrong, color: appColors.text, marginLeft: 6 },
  scroll: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xxxl },
  hey: { ...typography.h1, color: appColors.textSecondary },
  big: { ...typography.h1, color: appColors.text, marginBottom: spacing.lg },
  hero: { padding: spacing.xl },
  heroTop: { flexDirection: 'row', alignItems: 'center' },
  heroIcon: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  heroTitle: { ...typography.h2, color: appColors.text, marginTop: spacing.lg },
  heroText: { ...typography.body, color: appColors.textSecondary, marginTop: spacing.sm },
  heroFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.lg },
  heroDone: { ...typography.label, color: appColors.textSecondary },
  section: { ...typography.h3, color: appColors.text, marginTop: spacing.xl, marginBottom: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  tileWrap: { width: '50%', padding: 6 },
  tile: { height: 128, borderRadius: 26, padding: spacing.lg, ...appShadow.card },
  tileIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  tileBadge: { position: 'absolute', top: 14, right: 14, minWidth: 22, height: 22, borderRadius: 11, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  tileBadgeText: { ...typography.caption, fontWeight: '800', color: appColors.primary },
  tileTitle: { ...typography.bodyStrong, color: '#fff' },
  tileSub: { ...typography.caption, color: 'rgba(255,255,255,0.85)' },
  histHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  groupLabel: { ...typography.caption, color: appColors.textSecondary, marginTop: spacing.md, marginBottom: 4, marginLeft: 4 },
  histRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: glass.bgStrong, borderRadius: 16, padding: spacing.md, marginTop: 6, borderWidth: 1, borderColor: glass.line },
  histIcon: { width: 28, height: 28, borderRadius: 10, backgroundColor: 'rgba(234,220,245,0.9)', alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  histText: { ...typography.body, color: appColors.text, flex: 1 },
  histTime: { ...typography.caption, color: appColors.textSecondary, marginLeft: spacing.sm },
  empty: { ...typography.body, color: appColors.textSecondary, textAlign: 'center', paddingVertical: spacing.lg },
});