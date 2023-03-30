import React from 'react';
import { Box } from 'native-base';
import { Animated, Easing, StyleSheet } from 'react-native';
import Background from 'src/assets/images/background elements.svg';
import Gear1 from 'src/assets/images/gear1.svg';
import Gear2 from 'src/assets/images/gear 2.svg';
import Gear3 from 'src/assets/images/gear 3.svg';
import { windowWidth } from 'src/common/data/responsiveness/responsive';

function WhirlpoolLoader() {
  const spinValue = new Animated.Value(0);
  Animated.loop(
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 10000,
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
    <Box style={{ alignItems: 'center' }}>
      <Box style={{ width: windowWidth * 0.5 }}>
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

export default WhirlpoolLoader;

const getStyles = (clock, antiClock) =>
  StyleSheet.create({
    gear3: {
      position: 'absolute',
      bottom: '17%',
      right: 0,
      transform: [{ rotate: antiClock }],
    },
    gear2: {
      position: 'absolute',
      top: '10%',
      left: '10%',
      transform: [{ rotate: antiClock }],
    },
    gear1: {
      position: 'absolute',
      right: '23%',
      top: '10%',
      transform: [{ rotate: clock }],
    },
  });
