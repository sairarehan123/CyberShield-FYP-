import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { spacing, typography, appColors, appShadow, glass } from './theme';
import { Pill, AppButton, Icon } from './ui';

const LINK_BLUE = '#1A5FD0';

function timeLabel(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

const CHANNEL_ICON = { Email: 'mail-outline', SMS: 'chatbubble-outline' };
const channelIcon = (c) => CHANNEL_ICON[c] || 'notifications-outline';

const ACTION_LABEL = { reported: 'Reported', clicked: 'Link opened', ignored: 'No action' };

/**
 * The user's inbox of delivered messages. Looks like a normal inbox - nothing marks a message as a test.
 * IMPORTANT: the link is only DISPLAYED. Tapping it tells the backend "clicked" and shows the debrief;
 * it never opens a web page.
 */
export default function InboxView({ inbox, actingId, onClickLink, onReport, onSeeDebrief }) {
  const [openId, setOpenId] = useState(null);
  const items = [...inbox].reverse(); // newest first
  const selected = items.find((m) => m.id === openId);

  if (selected) {
    const open = selected.status === 'open';
    const busy = actingId === selected.id;
    return (
      <View>
        <Pressable onPress={() => setOpenId(null)} style={styles.backRow} accessibilityRole="button" accessibilityLabel="Back to inbox">
          <Icon name="chevron-back" size={18} color={appColors.primary} />
          <Text style={styles.backText}>Inbox</Text>
        </Pressable>

        <View style={styles.mail}>
          <View style={styles.mailHead}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{(selected.sender || '?').charAt(0).toUpperCase()}</Text></View>
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={styles.sender}>{selected.sender}</Text>
              <Text style={styles.meta}>{timeLabel(selected.received_at)}</Text>
            </View>
            <Pill label={selected.channel} icon={channelIcon(selected.channel)} />
          </View>
          {selected.subject ? <Text style={styles.subject}>{selected.subject}</Text> : null}
          <Text style={styles.body}>{selected.text}</Text>
          {selected.link_text ? (
            <Pressable
              disabled={!open || busy}
              onPress={() => onClickLink(selected)}
              accessibilityRole="link"
              accessibilityLabel={`Link: ${selected.link_text}`}
            >
              <Text style={[styles.link, !open && { opacity: 0.6 }]}>{selected.link_text}</Text>
            </Pressable>
          ) : null}
        </View>

        {open ? (
          busy ? (
            <ActivityIndicator color={appColors.primary} style={{ marginTop: spacing.lg }} />
          ) : (
            <AppButton title="Report as phishing" icon="flag-outline" variant="outline" onPress={() => onReport(selected)} style={{ marginTop: spacing.lg }} />
          )
        ) : (
          <View style={{ marginTop: spacing.lg }}>
            <Pill label={ACTION_LABEL[selected.your_action] || 'Done'} icon="checkmark-circle-outline" />
            {selected.debrief ? (
              <AppButton title="See what this was" icon="eye-outline" variant="outline" onPress={() => onSeeDebrief(selected.debrief)} style={{ marginTop: spacing.md }} />
            ) : null}
          </View>
        )}
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <View style={styles.emptyIcon}><Icon name="mail-open-outline" size={30} color={appColors.primary} /></View>
        <Text style={styles.emptyTitle}>Your inbox is empty</Text>
        <Text style={styles.emptyText}>Messages sent to you will show up here. Keep following your training steps.</Text>
      </View>
    );
  }

  return (
    <View>
      {items.map((m) => {
        const open = m.status === 'open';
        return (
          <Pressable key={m.id} onPress={() => setOpenId(m.id)} style={({ pressed }) => [styles.rowCard, pressed && { opacity: 0.9 }]} accessibilityRole="button">
            <View style={[styles.avatar, !open && { backgroundColor: appColors.lilac }]}>
              <Text style={[styles.avatarText, !open && { color: appColors.primary }]}>{(m.sender || '?').charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1, marginHorizontal: spacing.md }}>
              <Text style={[styles.rowSender, open && { fontWeight: '800' }]} numberOfLines={1}>{m.sender}</Text>
              <Text style={styles.rowSubject} numberOfLines={1}>{m.subject || m.text}</Text>
              <Text style={styles.rowPreview} numberOfLines={1}>{m.text}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.meta}>{timeLabel(m.received_at)}</Text>
              {open ? <View style={styles.unread} /> : <Icon name="checkmark" size={16} color={appColors.textSecondary} style={{ marginTop: 6 }} />}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  backRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  backText: { ...typography.bodyStrong, color: appColors.primary },
  mail: { backgroundColor: glass.bgStrong, borderRadius: 24, borderWidth: 1, borderColor: glass.border, padding: spacing.lg, ...appShadow.card },
  mailHead: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: appColors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { ...typography.bodyStrong, color: '#fff' },
  sender: { ...typography.bodyStrong, color: appColors.text },
  meta: { ...typography.caption, color: appColors.textSecondary },
  subject: { ...typography.h3, color: appColors.text, marginBottom: spacing.sm },
  body: { ...typography.body, color: appColors.text },
  link: { ...typography.body, color: LINK_BLUE, textDecorationLine: 'underline', marginTop: spacing.md },

  rowCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: glass.bgStrong, borderRadius: 20, borderWidth: 1, borderColor: glass.border, padding: spacing.md, marginBottom: spacing.sm },
  rowSender: { ...typography.bodyStrong, color: appColors.text },
  rowSubject: { ...typography.label, color: appColors.text },
  rowPreview: { ...typography.caption, color: appColors.textSecondary },
  unread: { width: 10, height: 10, borderRadius: 5, backgroundColor: appColors.primary, marginTop: 8 },

  empty: { alignItems: 'center', paddingVertical: spacing.xxl * 1.5, paddingHorizontal: spacing.xl },
  emptyIcon: { width: 64, height: 64, borderRadius: 22, backgroundColor: appColors.lilac, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  emptyTitle: { ...typography.h3, color: appColors.text },
  emptyText: { ...typography.body, color: appColors.textSecondary, textAlign: 'center', marginTop: spacing.sm },
});
