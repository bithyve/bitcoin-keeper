import React from 'react';
import { ActivityIndicator, StatusBarStyle, StyleSheet } from 'react-native';
import { Box, StatusBar, useColorMode } from 'native-base';
import { hp, wp } from 'src/constants/responsive';

function ConciergeScreenWrapper({
  children,
  backgroundcolor,
  paddingHorizontal = 0,
  barStyle,
  loading = false,
  wrapperStyle = {},
}: {
  children: any;
  barStyle?: StatusBarStyle;
  backgroundcolor?: any;
  paddingHorizontal?: number;
  loading?: boolean;
  wrapperStyle?: any;
}) {
  const { colorMode } = useColorMode();
  const computedBarStyle = barStyle ?? (colorMode === 'light' ? 'dark-content' : 'light-content');
  return (
    <Box
      safeAreaTop
      background={backgroundcolor}
      backgroundColor={backgroundcolor}
      style={[styles.wrapper, { paddingHorizontal: paddingHorizontal }, wrapperStyle]}
    >
      <StatusBar barStyle={computedBarStyle} backgroundColor="transparent" />
      {children}
      {loading && (
        <Box
          position={'absolute'}
          top={hp(-22)}
          left={wp(-2)}
          right={wp(-2)}
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
