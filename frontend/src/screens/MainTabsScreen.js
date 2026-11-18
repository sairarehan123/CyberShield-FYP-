import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import TabBar from '../components/TabBar';
import HomeScreen from './HomeScreen';
import AssessScreen from './AssessScreen';
import LearnScreen from './LearnScreen';
import ProfileScreen from './ProfileScreen';
import { colors } from '../theme';

const TABS = [
  { key: 'home', label: 'Home', icon: 'home-outline', iconActive: 'home', Screen: HomeScreen },
  { key: 'assess', label: 'Assess', icon: 'shield-checkmark-outline', iconActive: 'shield-checkmark', Screen: AssessScreen },
  { key: 'learn', label: 'Learn', icon: 'book-outline', iconActive: 'book', Screen: LearnScreen },
  { key: 'profile', label: 'Profile', icon: 'person-outline', iconActive: 'person', Screen: ProfileScreen },
];

/**
 * Registered on the EXISTING 'Home' route, so Login / Sign Up navigation (which reset to 'Home')
 * keeps working untouched. Hosts the four tabs; full-screen flows (e.g. the assessment questions)
 * are pushed on the root stack above it, so the tab bar is hidden during them.
 * Open a specific tab from anywhere: navigation.navigate('Home', { tab: 'assess', ts: Date.now() })
 */
export default function MainTabsScreen({ navigation, route }) {
  const [tab, setTab] = useState('home');

  useEffect(() => {
    const requested = route?.params?.tab;
    if (requested && TABS.some((t) => t.key === requested)) setTab(requested);
  }, [route?.params?.tab, route?.params?.ts]);

  return (
    <View style={styles.root}>
      <View style={styles.body}>
        {TABS.map(({ key, Screen }) => (
          <View key={key} style={[styles.fill, tab !== key && styles.hidden]}>
            <Screen navigation={navigation} onSwitchTab={setTab} />
          </View>
        ))}
      </View>
      <TabBar tabs={TABS} active={tab} onChange={setTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1 },
  fill: { flex: 1 },
  hidden: { display: 'none' },
});
