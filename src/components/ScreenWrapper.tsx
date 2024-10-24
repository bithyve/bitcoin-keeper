import React from 'react';
import { StatusBarStyle, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Box, StatusBar, useColorMode } from 'native-base';
import { hp } from 'src/constants/responsive';

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
          backgroundColor="transparent"
        />
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
  warpper: {
    flex: 1,
  },
});
