import React, { useEffect, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenBackground from '../components/ScreenBackground';
import { APP_NAME, APP_TAGLINE } from '../config/appConfig';
import { colors, spacing, typography } from '../theme';

const SPLASH_TOTAL = 3000; // ms before moving on to onboarding

export default function SplashScreen({ navigation }) {
  const [v] = useState(() => ({
    bg: new Animated.Value(0),
    logo: new Animated.Value(0),
    name: new Animated.Value(0),
    tag: new Animated.Value(0),
    float: new Animated.Value(0),
    progress: new Animated.Value(0),
  }));

  useEffect(() => {
    const out = Easing.out(Easing.cubic);
    const timing = (value, duration, delay = 0, easing = out) =>
      Animated.timing(value, { toValue: 1, duration, delay, easing, useNativeDriver: true });

    // 1. background  2-3. logo fade + scale  5. name  6. tagline
    const entrance = Animated.parallel([
      timing(v.bg, 400),
      timing(v.logo, 250, 0),
      timing(v.name, 450, 650),
      timing(v.tag, 450, 900),
      timing(v.progress, SPLASH_TOTAL, 0, Easing.inOut(Easing.quad)),
    ]);

    // 4. very subtle float / pulse once the logo has landed
    const floatLoop = Animated.sequence([
      Animated.delay(900),
      Animated.loop(
        Animated.sequence([
          Animated.timing(v.float, {
            toValue: 1,
            duration: 1400,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(v.float, {
            toValue: 0,
            duration: 1400,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ),
    ]);

    entrance.start();
    floatLoop.start();
    const timer = setTimeout(() => navigation.replace('Onboarding'), SPLASH_TOTAL);

    return () => {
      clearTimeout(timer);
      entrance.stop();
      floatLoop.stop();
    };
  }, [navigation, v]);

  const logoScale = v.logo.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] });
  const floatScale = v.float.interpolate({ inputRange: [0, 1], outputRange: [1, 1.015] });
  const floatY = v.float.interpolate({ inputRange: [0, 1], outputRange: [0, -4] });
  const slideUp = (val) => val.interpolate({ inputRange: [0, 1], outputRange: [12, 0] });

  return (
    <Animated.View style={[styles.flex, { opacity: v.bg }]}>
      <ScreenBackground>
        <SafeAreaView style={styles.safe}>
          <View style={styles.center}>
            <Animated.View style={{ opacity: v.logo, transform: [{ scale: logoScale }] }}>
              <Animated.View style={{ transform: [{ translateY: floatY }, { scale: floatScale }] }}>
                <Image
                  source={require('../../assets/logo.png')}
                  style={styles.logo}
                  resizeMode="contain"
                  accessibilityLabel={`${APP_NAME} logo`}
                />
              </Animated.View>
            </Animated.View>

            <Animated.Text
              style={[styles.name, { opacity: v.name, transform: [{ translateY: slideUp(v.name) }] }]}
            >
              {APP_NAME}
            </Animated.Text>
            <Animated.Text style={[styles.tagline, { opacity: v.tag }]}>{APP_TAGLINE}</Animated.Text>
          </View>

          <View style={styles.track} accessibilityLabel="Loading">
            <Animated.View style={[styles.fill, { transform: [{ scaleX: v.progress }] }]} />
          </View>
        </SafeAreaView>
      </ScreenBackground>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.white },
  safe: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  center: { alignItems: 'center', paddingHorizontal: spacing.xl },
  logo: { width: 280, height: 280 },
  name: { ...typography.h1, fontSize: 34, fontWeight: '700', color: colors.primary, marginTop: spacing.sm },
  tagline: { ...typography.body, color: colors.textSecondary, marginTop: spacing.sm },
  track: {
    position: 'absolute',
    bottom: 56,
    width: 96,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.lilac,
    overflow: 'hidden',
  },
  fill: { flex: 1, backgroundColor: colors.primaryLight, borderRadius: 2 },
});