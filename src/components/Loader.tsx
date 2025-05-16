import React from 'react';
import { Box, useColorMode } from 'native-base';
import { Animated, Easing, StyleSheet } from 'react-native';
import { windowWidth } from 'src/constants/responsive';
import ThemedSvg from './ThemedSvg.tsx/ThemedSvg';
import { useSelector } from 'react-redux';

function LoadingAnimation() {
  const { colorMode } = useColorMode();
  const spinValue = new Animated.Value(0);
  const themeMode = useSelector((state: any) => state?.settings?.themeMode);
  const privateTheme = themeMode === 'PRIVATE';

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
        <ThemedSvg name={'loader_background'} style={privateTheme ? styles.background : null} />
        <Animated.View style={styles.gear2}>
          <ThemedSvg name={'loader_gear_2'} />
        </Animated.View>
        <Animated.View style={colorMode === 'light' ? styles.gear1 : styles.gear1Dark}>
          <ThemedSvg name={'loader_gear_1'} />
        </Animated.View>
        <Animated.View style={colorMode === 'light' ? styles.gear3 : styles.gear3Dark}>
          <ThemedSvg name={'loader_gear_3'} />
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
    background: {
      left: '8%',
    },
  });
