import React, { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { colors } from '../theme';

function Dot({ active }) {
  const [v] = useState(() => new Animated.Value(active ? 1 : 0));

  useEffect(() => {
    const anim = Animated.timing(v, {
      toValue: active ? 1 : 0,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // width/color can't use the native driver
    });
    anim.start();
    return () => anim.stop();
  }, [active, v]);

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          width: v.interpolate({ inputRange: [0, 1], outputRange: [8, 24] }),
          backgroundColor: v.interpolate({
            inputRange: [0, 1],
            outputRange: [colors.dotInactive, colors.primary],
          }),
        },
      ]}
    />
  );
}

export default function PageDots({ count, activeIndex }) {
  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={`Page ${activeIndex + 1} of ${count}`}
    >
      {Array.from({ length: count }, (_, i) => (
        <Dot key={i} active={i === activeIndex} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  dot: { height: 8, borderRadius: 4, marginHorizontal: 4 },
});
