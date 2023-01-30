import React from 'react';
import { View } from 'native-base';
import { StyleSheet, ActivityIndicator } from 'react-native';
import { windowHeight, windowWidth } from 'src/common/data/responsiveness/responsive';

function ActivityIndicatorView({ visible }: any) {
  if (visible) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" animating color="#00836A" style={styles.spinner} />
      </View>
    );
  }
  return null;
}

export default ActivityIndicatorView;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: -windowWidth,
    right: -windowWidth,
    top: -windowHeight,
    bottom: -windowHeight,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  spinner: {
    top: windowHeight / 2,
    bottom: windowHeight / 2,
  },
});
