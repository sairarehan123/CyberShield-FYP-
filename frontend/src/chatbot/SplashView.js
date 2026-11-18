import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Background, AppButton, Icon } from './ui';
import Mascot from './Mascot';
import { spacing, typography, appColors, glass, appShadow } from './theme';
import { ASSISTANT_NAME, ASSISTANT_TAGLINE } from './config';

/** First screen of the chatbot: the assistant introduces itself. */
export default function SplashView({ onStart }) {
  return (
    <Background>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.brand}>
          <Icon name="sparkles" size={18} color={appColors.primary} />
          <Text style={styles.brandText}>{ASSISTANT_NAME}</Text>
        </View>

        <View style={styles.hero}>
          <View>
            <Mascot size={230} />
            <View style={styles.speech}>
              {[0, 1, 2].map((i) => <View key={i} style={styles.speechDot} />)}
            </View>
          </View>
        </View>

        <View style={styles.bottom}>
          <Text style={styles.title}>
            <Text style={{ color: appColors.primary }}>Hi, I'm {ASSISTANT_NAME}.</Text>
            {'\n'}Always here.{'\n'}Always on your side.
          </Text>
          <Text style={styles.sub}>{ASSISTANT_TAGLINE}</Text>
          <AppButton title="Get started" iconRight="arrow-forward" onPress={onStart} style={{ marginTop: spacing.xl, alignSelf: 'stretch' }} />
        </View>
      </SafeAreaView>
    </Background>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: spacing.xl },
  brand: { flexDirection: 'row', alignItems: 'center', paddingTop: spacing.lg },
  brandText: { ...typography.h3, color: appColors.text, marginLeft: 6 },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  speech: { position: 'absolute', top: 0, right: -30, flexDirection: 'row', backgroundColor: glass.bgStrong, borderWidth: 1, borderColor: glass.border, borderRadius: 24, borderBottomLeftRadius: 6, paddingHorizontal: 16, paddingVertical: 14, ...appShadow.card },
  speechDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: appColors.primary, marginHorizontal: 3 },
  bottom: { paddingBottom: spacing.xl },
  title: { ...typography.h1, color: appColors.text, textAlign: 'center' },
  sub: { ...typography.body, color: appColors.textSecondary, textAlign: 'center', marginTop: spacing.sm },
});
