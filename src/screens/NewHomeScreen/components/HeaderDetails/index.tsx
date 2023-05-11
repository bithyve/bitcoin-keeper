import { StyleSheet } from 'react-native';
import React from 'react';
import { Box } from 'native-base';
import HeaderBar from './components/HeaderBar';
import CurrentPlanView from './components/CurrentPlanView';
import UAIView from './components/UAIView';


function HeaderDetails() {
  return (
    <Box backgroundColor='light.white' style={styles.warpper}>
      <HeaderBar />
      <CurrentPlanView />
      <UAIView />
    </Box>
  );
}

export default HeaderDetails;

const styles = StyleSheet.create({
  warpper: {
    paddingHorizontal: 30,
    paddingVertical: 30,
    borderBottomEndRadius: 10,
    borderBottomStartRadius: 10,
    marginHorizontal: 20
  }
});
