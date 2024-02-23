import React from 'react';
import { Box, useColorMode } from 'native-base';
import { Animated, Easing, StyleSheet } from 'react-native';
import Background from 'src/assets/images/whirlpool_background.svg';
import BackgroundDark from 'src/assets/images/backgroundElementsDark.svg';
import Gear0 from 'src/assets/images/whirlpooll_loader_setting_inside.svg';
import WhirlpoolLoaderDark from 'src/assets/images/WhirlpoolLoaderDark.svg'
import Gear1 from 'src/assets/images/whirlpooll_loader_setting.svg';
import Gear2 from 'src/assets/images/gear 2.svg';
import Gear3 from 'src/assets/images/gear 3.svg';
import Gear1Dark from 'src/assets/images/mediumGearDark.svg';
import Gear2Dark from 'src/assets/images/smallGearDark.svg'
import { windowWidth, windowHeight } from 'src/constants/responsive';

function WhirlpoolLoader() {
  const { colorMode } = useColorMode();
  const spinValue = new Animated.Value(0);
  Animated.loop(
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 5000,
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
  const styles = getStyles(clock);
  return (
    <Box style={{ alignItems: 'center' }}>
      <Box style={{ width: windowWidth * 0.8, alignItems: 'center', justifyContent: 'center' }}>
        {colorMode === 'light' ? <Background /> : <BackgroundDark />}
        <Animated.View style={styles.leftGear}>
          {colorMode === 'light' ? <Gear2 /> : <Gear2Dark />}
        </Animated.View>
        <Animated.View style={styles.mainGear}>
          <Animated.View style={{ position: 'absolute', transform: [{ rotate: antiClock }] }}>
            {colorMode === 'light' ? <Gear1 /> : <Gear1Dark />}
          </Animated.View>
          <Animated.View style={{ position: 'absolute', transform: [{ rotate: clock }] }}>
            {colorMode === 'light' ? <Gear0 /> : <WhirlpoolLoaderDark />}
          </Animated.View>
        </Animated.View>
        <Animated.View style={styles.rightGear}>
          {colorMode === 'light' ? <Gear3 /> : <Gear2Dark />}
        </Animated.View>
      </Box>
    </Box>
  );
}

export default WhirlpoolLoader;

const getStyles = (clock) =>
  StyleSheet.create({
    rightGear: {
      position: 'absolute',
      bottom: '24%',
      left: windowHeight > 800 ? '76%' : '81%',
      transform: [{ rotate: clock }],
    },
    leftGear: {
      position: 'absolute',
      top: '14%',
      left: windowHeight > 800 ? '20%' : '15%',
      transform: [{ rotate: clock }],
    },
    gear1: {
      position: 'absolute',
      right: '30%',
      top: '10%',
    },
    gear0: {
      position: 'absolute',
      top: '31%',
      left: '41.5%',
      transform: [{ rotate: clock }],
    },
    mainGear: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
      right: windowWidth * 0.37,
      top: '45%',
    },
  });
