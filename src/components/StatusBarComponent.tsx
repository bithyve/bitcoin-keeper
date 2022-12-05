import { Platform, StatusBar, View } from 'react-native';

import DeviceInfo from 'react-native-device-info';
import React from 'react';

function StatusBarComponent({ padding = 0, color = null, extraPadding = 0 }) {
  const getPadding = () => {
    if (DeviceInfo.hasNotch() || Platform.OS === 'android') {
      return padding;
    } if (Platform.OS === 'ios') {
      return 20 + extraPadding;
    }
  };
  return (
    <View style={{ paddingTop: getPadding(), backgroundColor: color }}>
      <StatusBar barStyle="dark-content" />
    </View>
  );
}

export default StatusBarComponent;
