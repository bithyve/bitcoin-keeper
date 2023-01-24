import React from 'react';
import { Box } from 'native-base';
import { StyleSheet, ActivityIndicator } from 'react-native';

function ActivityIndicatorView({ visible }) {
  return (
    <>
      {visible && (
        <Box style={styles.container}>
          <ActivityIndicator size="large" animating={visible} color="#00836A" />
        </Box>
      )}
    </>
  );
}

export default ActivityIndicatorView;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    position: 'absolute',
    flex: 1,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
