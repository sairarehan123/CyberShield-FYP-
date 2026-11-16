import React, { useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Background, Card, AppButton, Icon } from './ui';
import useTrainingChat from './useTrainingChat';
import SplashView from './SplashView';
import HomeView from './HomeView';
import ChatView from './ChatView';
import InboxScreen from './InboxScreen';
import { DebriefSheet, QuizResultSheet } from './Sheets';
import { DEFAULT_USER_ID } from './config';
import { spacing, typography, appColors } from './theme';

/**
 * The whole chatbot as ONE screen for the host app. It switches between its own views
 * (splash -> home -> chat / inbox) by itself, so the host only needs a single route.
 *
 * Props (all optional): userId, userName, onExit, onTakeAssessment. userId / userName can also come from route.params.
 * onTakeAssessment: called when the user taps "Take my assessment" (the host opens its assessment screen).
 * Or pass route.params.assessmentRoute = the name of that screen and the module navigates there itself.
 */
export default function ChatbotApp({ navigation, route, userId: userIdProp, userName: userNameProp, onExit, onTakeAssessment: onTakeAssessmentProp }) {
  const params = (route && route.params) || {};
  const userId = userIdProp || params.userId || DEFAULT_USER_ID;
  const name = userNameProp || params.userName || userId;
  const exit = onExit || (navigation && navigation.canGoBack && navigation.canGoBack() ? () => navigation.goBack() : undefined);

  const goHome = navigation
    ? () =>
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'Home',
              params: { tab: 'home', ts: Date.now(), userId, userName: name },
            },
          ],
        })
    : exit;

  const goProfile = navigation
    ? () =>
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'Home',
              params: { tab: 'profile', ts: Date.now(), userId, userName: name },
            },
          ],
        })
    : undefined;

  const takeAssessment = onTakeAssessmentProp || (navigation && navigation.navigate && params.assessmentRoute ? () => navigation.navigate(params.assessmentRoute) : undefined);
  const t = useTrainingChat(userId);
  const [view, setView] = useState('splash'); // splash | home | chat | inbox
  const [seed, setSeed] = useState(null);

  // Coming back from the assessment screens: reload, so the chat unlocks by itself.
  useEffect(() => {
    if (!navigation || !navigation.addListener) return undefined;
    return navigation.addListener('focus', () => t.refresh());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]);

  // Android back button: go up one level inside the chatbot first.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (view === 'chat' || view === 'inbox') { setView('home'); return true; }
      return false;
    });
    return () => sub.remove();
  }, [view]);

  const openChat = (s) => { setSeed(s ? { ...s, id: Date.now() } : null); setView('chat'); };

  if (view === 'splash') return <SplashView onStart={() => setView('home')} />;

  if (t.error) {
    return (
      <Background>
        <SafeAreaView style={styles.center}>
          <Card style={styles.errCard}>
            <View style={styles.bigIcon}><Icon name={t.error.needsAssessment ? 'clipboard-outline' : 'cloud-offline-outline'} size={30} color={appColors.primary} /></View>
            <Text style={styles.errTitle}>{t.error.needsAssessment ? 'Take your assessment first' : 'Something went wrong'}</Text>
            <Text style={styles.errText}>{t.error.needsAssessment ? 'Your coach builds your training from your assessment results.' : t.error.message}</Text>
            <AppButton title="Try again" onPress={t.reload} style={{ marginTop: spacing.lg, alignSelf: 'stretch' }} />
            {goHome ? <AppButton title="Go to Home" variant="text" onPress={goHome} /> : null}
          </Card>
        </SafeAreaView>
      </Background>
    );
  }

  let body;
  if (view === 'home') {
    body = (
      <HomeView
        chat={t.chat}
        name={name}
        onGoHome={goHome}
        onOpenProfile={goProfile}
        onTakeAssessment={takeAssessment}
        onOpenChat={openChat}
        onOpenInbox={() => setView('inbox')}
      />
    );
  } else if (!t.chat) {
    body = (
      <Background>
        <SafeAreaView style={styles.center}>
          <ActivityIndicator size="large" color={appColors.primary} />
          <Text style={[styles.errText, { marginTop: spacing.lg }]}>Preparing your personal training...</Text>
        </SafeAreaView>
      </Background>
    );
  } else if (view === 'chat') {
    body = <ChatView t={t} onTakeAssessment={takeAssessment} onBack={() => setView('home')} onOpenInbox={() => setView('inbox')} seed={seed} onSeedUsed={() => setSeed(null)} onLeave={() => setView('home')} />;
  } else {
    body = <InboxScreen t={t} onBack={() => setView('home')} />;
  }

  return (
    <View style={{ flex: 1 }}>
      {body}
      <DebriefSheet debrief={t.debrief} onClose={t.closeDebrief} />
      <QuizResultSheet result={t.quizResult} onClose={t.closeQuizResult} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  errCard: { alignItems: 'center', alignSelf: 'stretch', padding: spacing.xl },
  bigIcon: { width: 64, height: 64, borderRadius: 22, backgroundColor: 'rgba(234,220,245,0.9)', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  errTitle: { ...typography.h3, color: appColors.text, textAlign: 'center' },
  errText: { ...typography.body, color: appColors.textSecondary, textAlign: 'center', marginTop: spacing.sm },
});