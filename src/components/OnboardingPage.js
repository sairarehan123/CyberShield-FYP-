import React, { useMemo } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import OnboardingIllustration from './OnboardingIllustrations';
import { colors, spacing, typography } from '../theme';

/**
 * One onboarding page. All motion is driven by the shared `scrollX` value on the
 * native thread (no React re-renders while swiping) plus a one-off `intro`
 * timeline that plays when the screen first appears.
 */
function OnboardingPage({ item, index, width, artSize, scrollX, intro }) {
  const a = useMemo(() => {
    const W = width;
    const i = index;
    const clamp = 'clamp';
    const around = [(i - 1) * W, i * W, (i + 1) * W];

    // opacity is 1 only when this page is centred; `inner` sets how quickly it fades
    const window = (inner) =>
      scrollX.interpolate({
        inputRange: [(i - 1) * W, (i - inner) * W, i * W, (i + inner) * W, (i + 1) * W],
        outputRange: [0, 0, 1, 0, 0],
        extrapolate: clamp,
      });
    const slide = (near, far) =>
      scrollX.interpolate({ inputRange: around, outputRange: [near, 0, -far], extrapolate: clamp });
    const introMap = (val, from, to) =>
      val.interpolate({ inputRange: [0, 1], outputRange: [from, to] });

    return {
      artOpacity: Animated.multiply(window(0.75), intro.art),
      artScale: Animated.multiply(
        scrollX.interpolate({ inputRange: around, outputRange: [0.94, 1, 0.94], extrapolate: clamp }),
        introMap(intro.art, 0.94, 1)
      ),
      artY: Animated.add(slide(16, 8), introMap(intro.art, 16, 0)),
      artX: scrollX.interpolate({
        inputRange: around,
        outputRange: [W * 0.1, 0, -W * 0.1],
        extrapolate: clamp,
      }),
      titleOpacity: Animated.multiply(window(0.5), intro.title),
      titleY: Animated.add(slide(14, 10), introMap(intro.title, 12, 0)),
      descOpacity: Animated.multiply(window(0.4), intro.desc),
      descY: Animated.add(slide(18, 12), introMap(intro.desc, 12, 0)),
    };
  }, [scrollX, width, index, intro]);

  return (
    <View style={{ width }}>
      <View style={styles.artZone}>
        <Animated.View
          style={{
            opacity: a.artOpacity,
            transform: [{ translateX: a.artX }, { translateY: a.artY }, { scale: a.artScale }],
          }}
        >
          <OnboardingIllustration
            name={item.illustration}
            size={artSize}
            label={item.illustrationLabel}
          />
        </Animated.View>
      </View>

      <View style={styles.textZone}>
        <Animated.Text
          style={[styles.title, { opacity: a.titleOpacity, transform: [{ translateY: a.titleY }] }]}
          accessibilityRole="header"
        >
          {item.title}
        </Animated.Text>
        <Animated.Text
          style={[styles.desc, { opacity: a.descOpacity, transform: [{ translateY: a.descY }] }]}
        >
          {item.description}
        </Animated.Text>
      </View>
    </View>
  );
}

export default React.memo(OnboardingPage);

const styles = StyleSheet.create({
  artZone: { flex: 1.15, alignItems: 'center', justifyContent: 'center' },
  textZone: { flex: 0.85, alignItems: 'center', paddingHorizontal: spacing.xxl, paddingTop: spacing.md },
  title: {
    ...typography.h1,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    maxWidth: 320,
  },
  desc: {
    ...typography.body,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 320,
    marginTop: spacing.md,
  },
});