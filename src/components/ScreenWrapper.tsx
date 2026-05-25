import React from 'react';
import { StatusBarStyle, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Box, StatusBar, useColorMode } from '@gluestack-ui/themed-native-base';
import { hp } from 'src/constants/responsive';

function ScreenWrapper({
  children,
  barStyle,
  backgroundcolor,
  paddingHorizontal = 20,
}: {
  children: any;
  barStyle?: StatusBarStyle;
  backgroundcolor?: any;
  paddingHorizontal?: number;
}) {
  const { colorMode } = useColorMode();
  const computedBarStyle = barStyle ?? (colorMode === 'light' ? 'dark-content' : 'light-content');

  return (
    <Box backgroundColor={backgroundcolor} style={styles.wrapper}>
      <SafeAreaView
        edges={['top', 'left', 'right', 'bottom']}
        style={[styles.container, { paddingHorizontal }]}
      >
        <StatusBar barStyle={computedBarStyle} backgroundColor="transparent" />
        {children}
      </SafeAreaView>
    </Box>
  );
}

export default ScreenWrapper;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: hp(15),
    paddingBottom: hp(5),
    paddingHorizontal: 20,
    position: 'relative',
  },
  wrapper: {
    flex: 1,
  },
});
