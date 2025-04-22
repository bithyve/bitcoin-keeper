import React from 'react';
import { Box, useColorMode } from 'native-base';
import { Animated, Easing, StyleSheet } from 'react-native';

import Background from 'src/assets/images/background elements.svg';
import PrivateBackground from 'src/assets/privateImages/background-elements.svg';
import Gear1 from 'src/assets/images/gear1.svg';
import Gear1Dark from 'src/assets/images/mediumGearDark.svg';
import Gear2 from 'src/assets/images/gear 2.svg';
import Gear2Dark from 'src/assets/images/smallGearDark.svg';
import Gear3 from 'src/assets/images/gear 3.svg';
import PrivateGear1 from 'src/assets/privateImages/gear1 .svg';
import PrivateGear2 from 'src/assets/privateImages/gear 2.svg';
import PrivateGear3 from 'src/assets/privateImages/gear 3.svg';
import { windowWidth } from 'src/constants/responsive';
import { useSelector } from 'react-redux';

function LoadingAnimation() {
  const { colorMode } = useColorMode();
  const spinValue = new Animated.Value(0);
  const themeMode = useSelector((state: any) => state?.settings?.themeMode);
  const isOnL4 = themeMode === 'PRIVATE';
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
      <Box
        style={{
          width: windowWidth > 400 ? windowWidth * 0.6 : windowWidth * 0.65,
          alignItems: 'flex-start',
        }}
      >
        {/* TODO fix position of background  */}
        {/* {isOnL4 ? <PrivateBackground /> : <Background />} */}
        <Background />
        <Animated.View style={styles.gear2}>
          {isOnL4 ? <PrivateGear2 /> : colorMode === 'light' ? <Gear2 /> : <Gear2Dark />}
        </Animated.View>
        <Animated.View style={colorMode === 'light' ? styles.gear1 : styles.gear1Dark}>
          {isOnL4 ? <PrivateGear1 /> : colorMode === 'light' ? <Gear1 /> : <Gear1Dark />}
        </Animated.View>
        <Animated.View style={colorMode === 'light' ? styles.gear3 : styles.gear3Dark}>
          {isOnL4 ? <PrivateGear3 /> : colorMode === 'light' ? <Gear3 /> : <Gear2Dark />}
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
    gear3Dark: {
      position: 'absolute',
      bottom: '20%',
      left: '80%',
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
    gear1Dark: {
      position: 'absolute',
      right: '30%',
      top: '7%',
      transform: [{ rotate: clock }],
    },
  });
