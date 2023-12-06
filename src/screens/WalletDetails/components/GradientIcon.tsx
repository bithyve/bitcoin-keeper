import { StyleSheet } from 'react-native';
import React from 'react';
import { Box, useColorMode } from 'native-base';

function GradientIcon({ height, Icon, gradient = ['#9BB4AF', '#9BB4AF'] }: any) {
  const { colorMode } = useColorMode();
  return (
    <Box
      style={{
        height: height,
        width: height,
        borderRadius: height,
        ...styles.center,
      }}
      backgroundColor={`${colorMode}.greenButtonBackground`}>
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
