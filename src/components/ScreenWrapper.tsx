import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import { Box, StatusBar, useColorMode } from 'native-base';
import { StatusBarStyle } from 'react-native';

function ScreenWrapper({
  children,
  barStyle,
  backgroundcolor,
}: {
  children: any;
  barStyle?: StatusBarStyle;
  backgroundcolor?: any;
}) {
  const { colorMode } = useColorMode();
  return (
    <Box backgroundColor={backgroundcolor} style={styles.warpper}>
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle={colorMode === 'light' ? 'dark-content' : 'light-content'}
          backgroundColor={'transparent'}
        />
        {children}
      </SafeAreaView>
    </Box>
  );
}

export default ScreenWrapper;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    paddingVertical: '15@s',
    paddingHorizontal: '20@s',
    position: 'relative',
  },
  warpper: {
    flex: 1,
  },
});
