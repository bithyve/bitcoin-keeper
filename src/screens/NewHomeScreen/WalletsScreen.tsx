import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import ScreenWrapper from 'src/components/ScreenWrapper';
import HeaderDetails from './components/HeaderDetails';

const WalletsScreen = () => {
  return (
    <ScreenWrapper>
      <HeaderDetails />
      <Text>Vaults Screen</Text>
    </ScreenWrapper>
  );
};

export default WalletsScreen;

const styles = StyleSheet.create({});
