import React, { useEffect } from 'react';
import { Box } from 'native-base';
import { Animated, Easing, StyleSheet } from 'react-native';

import Device from 'src/assets/images/device.svg';
import DirectionIndicator from 'src/assets/images/direction.svg';
import Background from 'src/assets/images/deviceBackground.svg';

function ShakingAssetsAnimation() {
  const shakeAnimation = new Animated.Value(0);
  const startShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start();
  };
  useEffect(() => {
    setInterval(() => {
      startShake();
    }, 2000);
  }, []);
  return (
    <Box style={{ alignItems: 'center' }}>
      <Background />
      <Animated.View
        style={{
          transform: [{ translateX: shakeAnimation }],
          marginVertical: 10,
          position: 'absolute',
        }}
      >
        <Box>
          <Device />
        </Box>
      </Animated.View>
      <Box style={{ alignItems: 'center', top: -100 }}>
        <DirectionIndicator />
      </Box>
    </Box>
  );
}

export default ShakingAssetsAnimation;
