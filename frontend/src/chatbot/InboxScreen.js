import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Background, CircleButton } from './ui';
import InboxView from './InboxView';
import { spacing, typography, appColors } from './theme';

/** The user's inbox (the simulated security messages arrive here, like in a normal mail app). */
export default function InboxScreen({ t, onBack }) {
  const inbox = (t.chat && t.chat.inbox) || [];
  return (
    <Background>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <CircleButton icon="chevron-back" label="Back" onPress={onBack} />
          <Text style={styles.title}>Inbox</Text>
          <View style={{ width: 44 }} />
        </View>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <InboxView inbox={inbox} actingId={t.actingId} onClickLink={t.clickLink} onReport={t.reportMsg} onSeeDebrief={t.showDebrief} />
        </ScrollView>
      </SafeAreaView>
    </Background>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.sm },
  title: { ...typography.bodyStrong, color: appColors.text },
  scroll: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xxl },
});
