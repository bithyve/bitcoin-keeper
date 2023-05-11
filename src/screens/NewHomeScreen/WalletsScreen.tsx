import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { ScaledSheet } from 'react-native-size-matters';
import HomeScreenWrapper from './components/HomeScreenWrapper';

function WalletsScreen() {
  return (
    <HomeScreenWrapper>
      <Text>Wallets Screen</Text>
    </HomeScreenWrapper>
  );
}

export default WalletsScreen;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F2EC',
    paddingVertical: '15@s',
    paddingHorizontal: '20@s',
    position: 'relative',
  },
});
