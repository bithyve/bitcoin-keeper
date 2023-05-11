import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import HeaderBar from './components/HeaderBar';
import CurrentPlanView from './components/CurrentPlanView';
import UAIView from './components/UAIView';

const HeaderDetails = () => {
  return (
    <View>
      <HeaderBar />
      <CurrentPlanView />
      <UAIView />
    </View>
  );
};

export default HeaderDetails;

const styles = StyleSheet.create({});
