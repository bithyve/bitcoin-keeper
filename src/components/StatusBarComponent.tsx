import React from 'react';
import { Platform, View, StatusBar } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import DeviceInfo from 'react-native-device-info';

const StatusBarComponent = ({ padding = 0, color = null }) => {

  const getPadding = () => {
    if (DeviceInfo.hasNotch() || Platform.OS === 'android') {
      return padding
    } else if (Platform.OS === 'ios') {
      return 20
    }
  }
  return (
    <View style={{ paddingTop: getPadding(), backgroundColor: color }}>
      <StatusBar barStyle={'dark-content'} />
    </View>
  );
};

export default StatusBarComponent;
