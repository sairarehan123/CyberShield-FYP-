import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getNotifications, markNotificationsRead } from './api';
import { agoLabel } from './dates';
import { DEFAULT_USER_ID } from './config';
import { spacing, typography, appColors, glass } from './theme';
import { Icon } from './ui';

/**
 * For the host app's NOTIFICATION screen.
 *
 *   import { ChatbotNotificationList, useChatbotNotifications } from '../chatbot';
 *
 *   <ChatbotNotificationList userId={user.id} userName={user.name} navigation={navigation} />
 *
 * or, to build your own rows / a badge:
 *
 *   const { items, unread, refresh, markRead } = useChatbotNotifications(user.id);
 *
 * Each item: { id, kind: 'message' | 'result', title, body, at, read, channel, target: { screen: 'inbox' | 'chat', message_id } }.
 * Notifications are only about simulated messages / progress-check results. They never say whether a message is phishing.
 */
export function useChatbotNotifications(userId = DEFAULT_USER_ID, { pollMs = 20000 } = {}) {
  const [state, setState] = useState({ items: [], unread: 0, loading: true, error: null });
  const alive = useRef(true);

  const refresh = useCallback(async () => {
    try {
      const data = await getNotifications(userId);
      if (alive.current) setState({ items: data.notifications, unread: data.unread, loading: false, error: null });
    } catch (e) {
      if (alive.current) setState((s) => ({ ...s, loading: false, error: e.message }));
    }
  }, [userId]);

  const markRead = useCallback(async (ids) => {
    try {
      const data = await markNotificationsRead(userId, ids);
      if (alive.current) setState({ items: data.notifications, unread: data.unread, loading: false, error: null });
    } catch (e) {
      // not important: the list refreshes on the next poll
    }
  }, [userId]);

  useEffect(() => {
    alive.current = true;
    refresh();
    const timer = pollMs ? setInterval(refresh, pollMs) : null;
    return () => { alive.current = false; if (timer) clearInterval(timer); };
  }, [refresh, pollMs]);

  return { ...state, refresh, markRead };
}

const ICON = { Email: 'mail-outline', SMS: 'chatbubble-ellipses-outline' };

export function ChatbotNotificationList({ userId = DEFAULT_USER_ID, userName, navigation, chatbotRoute = 'Chatbot', assessmentRoute, onOpen, pollMs, emptyText }) {
  const { items, loading, error, markRead } = useChatbotNotifications(userId, { pollMs });

  const open = (n) => {
    if (!n.read) markRead([n.id]);
    if (onOpen) { onOpen(n); return; }
    if (navigation && navigation.navigate) {
      navigation.navigate(chatbotRoute, { userId, userName, assessmentRoute, initialView: n.target.screen, messageId: n.target.message_id });
    }
  };

  if (loading) return <Text style={styles.hint}>Loading...</Text>;
  if (error && !items.length) return <Text style={styles.hint}>{error}</Text>;
  if (!items.length) return <Text style={styles.hint}>{emptyText || 'No notifications yet.'}</Text>;

  return (
    <View>
      {items.map((n) => (
        <Pressable key={n.id} onPress={() => open(n)} accessibilityRole="button" accessibilityLabel={n.title}
          style={({ pressed }) => [styles.row, !n.read && styles.rowUnread, pressed && { opacity: 0.85 }]}>
          <View style={styles.icon}>
            <Icon name={n.kind === 'result' ? 'ribbon-outline' : ICON[n.channel] || 'mail-outline'} size={20} color={appColors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, !n.read && { fontWeight: '700' }]} numberOfLines={1}>{n.title}</Text>
            <Text style={styles.body} numberOfLines={2}>{n.body}</Text>
          </View>
          <View style={styles.side}>
            <Text style={styles.time}>{agoLabel(n.at)}</Text>
            {!n.read ? <View style={styles.dot} /> : null}
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  hint: { ...typography.body, color: appColors.textSecondary, textAlign: 'center', padding: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: glass.bg, borderRadius: 18, borderWidth: 1, borderColor: glass.line, padding: spacing.md, marginBottom: spacing.sm },
  rowUnread: { backgroundColor: glass.bgStrong, borderColor: appColors.primary },
  icon: { width: 40, height: 40, borderRadius: 14, backgroundColor: 'rgba(234,220,245,0.9)', alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  title: { ...typography.bodyStrong, color: appColors.text },
  body: { ...typography.caption, color: appColors.textSecondary, marginTop: 2 },
  side: { alignItems: 'flex-end', marginLeft: spacing.sm },
  time: { ...typography.caption, color: appColors.textSecondary },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: appColors.primary, marginTop: 6 },
});
