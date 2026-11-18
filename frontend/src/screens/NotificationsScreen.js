import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import ScreenContainer from '../components/ScreenContainer';
import { ChatbotNotificationList } from '../chatbot';
import { getUserSession } from '../utils/session';
import { spacing, radius, typography } from '../theme';

const C = {
  mauveDark: '#913875',
  pinkSoft: '#FCEEF5',
  plum: '#54356F',
  secondary: '#79647D',
  border: '#E7D7E7',
};

export default function NotificationsScreen({ navigation }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let mounted = true;
    getUserSession().then((u) => {
      if (mounted) setUser(u);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          accessibilityLabel="Back"
        >
          <Ionicons name="arrow-back" size={20} color={C.mauveDark} />
        </Pressable>
        <Text style={styles.title}>Notifications</Text>
      </View>

      <Text style={styles.subtitle}>
        Simulated security messages and training check updates appear here.
      </Text>

      <ChatbotNotificationList
        userId={user?.id}
        userName={user?.name}
        navigation={navigation}
        assessmentRoute="SeBISIntro"
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: C.pinkSoft,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: C.plum,
  },
  subtitle: {
    ...typography.body,
    color: C.secondary,
    marginBottom: spacing.lg,
  },
});