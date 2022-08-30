import { StatusBar, StatusBarStyle } from 'react-native';

import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';

const ScreenWrapper = ({ children, barStyle }: { children: any; barStyle?: StatusBarStyle }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={barStyle || 'dark-content'} />
      {children}
    </SafeAreaView>
  );
};

export default ScreenWrapper;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F2EC',
    padding: '20@s',
  },
});
