import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated } from 'react-native';
import { Box } from 'native-base';

function BounceLoader() {
  useEffect(() => {
    onStartAnimation();
  }, []);

  const animations = {
    first: useRef(new Animated.Value(0)).current,
    second: useRef(new Animated.Value(0)).current,
    third: useRef(new Animated.Value(0)).current,
    fourth: useRef(new Animated.Value(0)).current,
  };
  const onAnimate = (animation, nextAnimation) => {
    Animated.sequence([
      Animated.timing(animation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(animation, {
        toValue: 2,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    setTimeout(() => {
      nextAnimation();
    }, 300);
  };
  const onSecondAnimation = () => {
    onAnimate(animations.second, onThirdAnimation);
  };
  const onThirdAnimation = () => {
    onAnimate(animations.third, onFourthAnimation);
  };
  const onFourthAnimation = () => {
    onAnimate(animations.fourth, onStartAnimation);
  };
  const onStartAnimation = () => {
    onAnimate(animations.first, onSecondAnimation);
  };

  return (
    <Box style={styles.container}>
      <Animated.View
        style={[
          styles.ball,
          {
            transform: [
              {
                scale: animations.first,
              },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.ball,
          {
            transform: [
              {
                scale: animations.second,
              },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.ball,
          {
            transform: [
              {
                scale: animations.third,
              },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.ball,
          {
            transform: [
              {
                scale: animations.fourth,
              },
            ],
          },
        ]}
      />
    </Box>
  );
}
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  ball: {
    width: 6,
    height: 6,
    borderRadius: 10,
    backgroundColor: '#6B9B92',
    marginHorizontal: 5,
  },
});
export default BounceLoader;
