import { StatusBar, StatusBarStyle } from 'react-native';

import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import { Box } from 'native-base';

function ScreenWrapper({
  children,
  barStyle,
  backgroundcolor,
}: {
  children: any;
  barStyle?: StatusBarStyle;
  backgroundcolor?: any;
}) {
  return (
    <Box backgroundColor={backgroundcolor} style={styles.warpper}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle={barStyle || 'dark-content'} backgroundColor={backgroundcolor} />
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
  }
});
