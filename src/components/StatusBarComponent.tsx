import React from 'react';
import { Platform, View, StatusBar } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';

const StatusBarComponent = ({padding = 0, color = null}) => {
  
  return (
    <View style ={{ paddingTop: Platform.OS === 'ios' ? padding : 0, backgroundColor: color }}>
      <StatusBar barStyle={'light-content'} />
    </View>
  );
};

export default StatusBarComponent;
