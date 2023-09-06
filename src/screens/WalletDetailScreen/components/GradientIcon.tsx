import { StyleSheet } from 'react-native';
import React from 'react';
import { Box } from 'native-base';

function GradientIcon({ height, Icon, gradient = ['#9BB4AF'] }: any) {
  return (
    <Box
      style={{
        height: height,
        width: height,
        borderRadius: height,
        backgroundColor: gradient[0],
        ...styles.center,
      }}
    >
      <Icon />
    </Box>
  );
}

export default GradientIcon;

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
