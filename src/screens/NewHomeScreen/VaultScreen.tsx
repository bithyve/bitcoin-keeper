import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import ScreenWrapper from 'src/components/ScreenWrapper';
import HeaderDetails from './components/HeaderDetails';

const VaultScreen = () => {
  return (
    <ScreenWrapper>
      <HeaderDetails />
      <Text>Vaults Screen</Text>
    </ScreenWrapper>
  );
};

export default VaultScreen;

const styles = StyleSheet.create({});
