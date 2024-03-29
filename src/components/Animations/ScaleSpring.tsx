import React from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

function ScaleSpring({ children }) {
  const initialScale = 1;
  const scale = useSharedValue(initialScale);
  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    flex: 1,
    justifyContent: 'center',
  }));

  const tap = Gesture.Tap()
    .onTouchesDown(() => {
      scale.value = withSpring(0.6);
    })
    .onTouchesUp(() => {
      scale.value = withSpring(1);
    });

  return (
    <GestureDetector gesture={tap}>
      <Animated.View style={animatedStyles}>{children}</Animated.View>
    </GestureDetector>
  );
}

export default ScaleSpring;
