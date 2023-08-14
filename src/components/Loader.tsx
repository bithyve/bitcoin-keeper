import React from 'react';
import { Box } from 'native-base';
import { Animated, Easing, StyleSheet } from 'react-native';

import Background from 'src/assets/images/background elements.svg';
import Gear1 from 'src/assets/images/gear1.svg';
import Gear2 from 'src/assets/images/gear 2.svg';
import Gear3 from 'src/assets/images/gear 3.svg';
import { windowWidth } from 'src/common/data/responsiveness/responsive';

function LoadingAnimation() {
  const spinValue = new Animated.Value(0);
  Animated.loop(
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 3000,
      easing: Easing.linear,
      useNativeDriver: true,
    })
  ).start();
  const clock = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const antiClock = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });
  const styles = getStyles(clock, antiClock);
  return (
    <Box style={{ position: 'relative', alignItems: 'center' }}>
      <Box style={{ width: windowWidth > 400 ? windowWidth * 0.6 : windowWidth * 0.65, alignItems: 'flex-start', }}>
        <Background />
        <Animated.View style={styles.gear2}>
          <Gear2 />
        </Animated.View>
        <Animated.View style={styles.gear1}>
          <Gear1 />
        </Animated.View>
        <Animated.View style={styles.gear3}>
          <Gear3 />
        </Animated.View>
      </Box>
    </Box>
  );
}

export default LoadingAnimation;

const getStyles = (clock, antiClock) =>
  StyleSheet.create({
    gear3: {
      position: 'absolute',
      bottom: '20%',
      left: '72%',
      transform: [{ rotate: clock }],
    },
    gear2: {
      position: 'absolute',
      top: '14%',
      left: '4%',
      transform: [{ rotate: clock }],
    },
    gear1: {
      position: 'absolute',
      right: '36%',
      top: '10%',
      transform: [{ rotate: clock }],
    },
  });
