import React, { useEffect } from 'react';
import { Box } from 'native-base';
import { Animated, Easing, StyleSheet } from 'react-native';

import Device from 'src/assets/images/device.svg';
import DirectionIndicator from 'src/assets/images/direction.svg';
import Background from 'src/assets/images/deviceBackground.svg';

function ShakingAssetsAnimation() {
  const shakeAnimation = new Animated.Value(0);

  const rotateData = shakeAnimation.interpolate({
    inputRange: [0, 1, 2, 3, 4, 5, 6],
    outputRange: ['0deg', '-15deg', '0deg', '15deg', '0deg', '0deg', '0deg'],
  });

  const startShake = () => {
    Animated.loop(
      Animated.timing(shakeAnimation, {
        toValue: 6,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start(() => startShake());
  };
  useEffect(() => {
    startShake();
  }, []);

  return (
    <Box style={styles.wrapper}>
      <Background />
      <Animated.View
        style={{
          transform: [{ rotate: rotateData }],
          marginVertical: 10,
          position: 'absolute',
        }}
      >
        <Box>
          <Device />
        </Box>
      </Animated.View>
      <Box style={styles.dirIndicatorWrapper}>
        <DirectionIndicator />
      </Box>
    </Box>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  dirIndicatorWrapper: {
    alignItems: 'center',
    top: -100,
  },
});

export default ShakingAssetsAnimation;
