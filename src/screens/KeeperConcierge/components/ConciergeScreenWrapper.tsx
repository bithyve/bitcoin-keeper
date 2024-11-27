import React from 'react';
import { StatusBarStyle, StyleSheet } from 'react-native';
import { Box, StatusBar, useColorMode } from 'native-base';

function ConciergeScreenWrapper({
  children,
  backgroundcolor,
  paddingHorizontal = 0,
  barStyle,
}: {
  children: any;
  barStyle?: StatusBarStyle;
  backgroundcolor?: any;
  paddingHorizontal?: number;
}) {
  const { colorMode } = useColorMode();
  const computedBarStyle = barStyle ?? (colorMode === 'light' ? 'dark-content' : 'light-content');

  return (
    <Box
      safeAreaTop
      background={backgroundcolor}
      backgroundColor={backgroundcolor}
      style={[styles.wrapper, { paddingHorizontal: paddingHorizontal }]}
    >
      <StatusBar barStyle={computedBarStyle} backgroundColor="transparent" />
      {children}
    </Box>
  );
}

export default ConciergeScreenWrapper;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
});
