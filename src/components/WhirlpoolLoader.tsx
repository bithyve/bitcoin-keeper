import React from 'react';
import { Box } from 'native-base';
import { Animated, Easing, StyleSheet } from 'react-native';
import Background from 'src/assets/images/whirlpool_background.svg';
import Gear0 from 'src/assets/images/whirlpooll_loader_setting_inside.svg';
import Gear1 from 'src/assets/images/whirlpooll_loader_setting.svg';
import Gear2 from 'src/assets/images/gear 2.svg';
import Gear3 from 'src/assets/images/gear 3.svg';
import { windowWidth } from 'src/common/data/responsiveness/responsive';

function WhirlpoolLoader() {
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
        <Background />
        <Animated.View style={styles.leftGear}>
          <Gear2 />
        </Animated.View>
        <Animated.View style={styles.mainGear}>
          <Animated.View style={{ position: 'absolute', transform: [{ rotate: antiClock }] }}>
            <Gear1 />
          </Animated.View>
          <Animated.View style={{ position: 'absolute', transform: [{ rotate: clock }] }}>
            <Gear0 />
          </Animated.View>
        </Animated.View>
        <Animated.View style={styles.rightGear}>
          <Gear3 />
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
      left: '81%',
      transform: [{ rotate: clock }],
    },
    leftGear: {
      position: 'absolute',
      top: '14%',
      left: '15%',
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
