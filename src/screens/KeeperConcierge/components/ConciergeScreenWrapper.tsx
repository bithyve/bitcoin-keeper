import React from 'react';
import { ActivityIndicator, StatusBarStyle, StyleSheet } from 'react-native';
import { Box, StatusBar, useColorMode } from 'native-base';

function ConciergeScreenWrapper({
  children,
  backgroundcolor,
  paddingHorizontal = 0,
  barStyle,
  loading = false,
}: {
  children: any;
  barStyle?: StatusBarStyle;
  backgroundcolor?: any;
  paddingHorizontal?: number;
  loading?: boolean;
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
      {loading && (
        <Box
          position={'absolute'}
          top={0}
          left={0}
          right={0}
          bottom={0}
          alignItems={'center'}
          justifyContent={'center'}
          bgColor={'#000'}
          opacity={0.7}
        >
          <ActivityIndicator size="large" animating color="#00836A" />
        </Box>
      )}
    </Box>
  );
}

export default ConciergeScreenWrapper;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
});
