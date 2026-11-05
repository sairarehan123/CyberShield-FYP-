import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenBackground from '../components/ScreenBackground';
import CustomButton from '../components/CustomButton';
import CircleButton from '../components/CircleButton';
import PageDots from '../components/PageDots';
import OnboardingPage from '../components/OnboardingPage';
import { ONBOARDING_CTA, ONBOARDING_PAGES } from '../config/appConfig';
import { colors, spacing, typography } from '../theme';

const LAST = ONBOARDING_PAGES.length - 1;
const CIRCLE = 54;

export default function OnboardingScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const listRef = useRef(null);
  const indexRef = useRef(0);
  const [index, setIndex] = useState(0);

  // Animated values are created once.
  const [scrollX] = useState(() => new Animated.Value(0));
  const [intro] = useState(() => ({
    art: new Animated.Value(0),
    title: new Animated.Value(0),
    desc: new Animated.Value(0),
    controls: new Animated.Value(0),
  }));

  // One-off entrance timeline: art 0-400, title 150-500, description 250-600, controls 350-700 ms.
  useEffect(() => {
    const t = (value, delay, duration) =>
      Animated.timing(value, {
        toValue: 1,
        delay,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      });
    const anim = Animated.parallel([
      t(intro.art, 0, 400),
      t(intro.title, 150, 350),
      t(intro.desc, 250, 350),
      t(intro.controls, 350, 350),
    ]);
    anim.start();
    return () => anim.stop();
  }, [intro]);

  // Scroll position drives animations on the native thread; React state only changes per page.
  const onScroll = useMemo(
    () =>
      Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
        useNativeDriver: true,
        listener: (e) => {
          const i = Math.round(e.nativeEvent.contentOffset.x / width);
          if (i !== indexRef.current && i >= 0 && i <= LAST) {
            indexRef.current = i;
            setIndex(i);
          }
        },
      }),
    [scrollX, width]
  );

  const goTo = useCallback(
    (i) => {
      if (i < 0 || i > LAST) return;
      listRef.current?.scrollToOffset({ offset: i * width, animated: true });
    },
    [width]
  );
  const finish = useCallback(() => navigation.navigate('Login'), [navigation]);

  // Illustration scales with the screen; CTA never grows wider than the space next to the back button.
  const artSize = Math.min(width * 0.9, height * 0.38, 340);
  const ctaWidth = Math.min(276, width - spacing.xl * 2 - CIRCLE - spacing.md);

  const ui = useMemo(
    () => ({
      backOpacity: scrollX.interpolate({
        inputRange: [0, width * 0.5],
        outputRange: [0, 1],
        extrapolate: 'clamp',
      }),
      nextOpacity: scrollX.interpolate({
        inputRange: [(LAST - 1) * width, (LAST - 0.5) * width],
        outputRange: [1, 0],
        extrapolate: 'clamp',
      }),
      startOpacity: scrollX.interpolate({
        inputRange: [(LAST - 0.5) * width, LAST * width],
        outputRange: [0, 1],
        extrapolate: 'clamp',
      }),
      controlsY: intro.controls.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }),
    }),
    [scrollX, width, intro]
  );

  const renderItem = useCallback(
    ({ item, index: i }) => (
      <OnboardingPage
        item={item}
        index={i}
        width={width}
        artSize={artSize}
        scrollX={scrollX}
        intro={intro}
      />
    ),
    [width, artSize, scrollX, intro]
  );

  const onLast = index === LAST;

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe}>
        {/* TOP */}
        <Animated.View style={[styles.top, { opacity: intro.controls }]}>
          <Pressable
            onPress={finish}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Skip onboarding"
            style={({ pressed }) => [styles.skip, pressed && { opacity: 0.5 }]}
          >
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </Animated.View>

        {/* CENTER: illustration + text */}
        <Animated.FlatList
          ref={listRef}
          data={ONBOARDING_PAGES}
          keyExtractor={(p) => p.key}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          bounces={false}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={onScroll}
          getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
          initialNumToRender={ONBOARDING_PAGES.length}
          removeClippedSubviews={false}
          style={styles.list}
        />

        {/* BOTTOM: dots + controls */}
        <Animated.View
          style={[styles.bottom, { opacity: intro.controls, transform: [{ translateY: ui.controlsY }] }]}
        >
          <PageDots count={ONBOARDING_PAGES.length} activeIndex={index} />

          <View style={styles.buttons}>
            <Animated.View
              style={{ opacity: ui.backOpacity }}
              pointerEvents={index === 0 ? 'none' : 'auto'}
              accessibilityElementsHidden={index === 0}
              importantForAccessibility={index === 0 ? 'no-hide-descendants' : 'auto'}
            >
              <CircleButton
                variant="light"
                icon="arrow-back"
                label="Previous page"
                onPress={() => goTo(index - 1)}
              />
            </Animated.View>

            <View style={[styles.rightSlot, { width: ctaWidth }]}>
              <Animated.View
                style={[styles.abs, { opacity: ui.nextOpacity }]}
                pointerEvents={onLast ? 'none' : 'auto'}
              >
                <CircleButton icon="arrow-forward" label="Next page" onPress={() => goTo(index + 1)} />
              </Animated.View>
              <Animated.View
                style={[styles.abs, { opacity: ui.startOpacity }]}
                pointerEvents={onLast ? 'auto' : 'none'}
              >
                <CustomButton
                  title={ONBOARDING_CTA}
                  iconRight="arrow-forward"
                  onPress={finish}
                  style={{ width: ctaWidth }}
                />
              </Animated.View>
            </View>
          </View>
        </Animated.View>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  top: { height: 48, justifyContent: 'center', alignItems: 'flex-end', paddingHorizontal: spacing.xl },
  skip: { paddingVertical: spacing.sm },
  skipText: { ...typography.bodyStrong, color: colors.textSecondary },
  list: { flex: 1 },
  bottom: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xl },
  buttons: {
    marginTop: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rightSlot: { height: CIRCLE },
  abs: { position: 'absolute', right: 0, top: 0 },
});