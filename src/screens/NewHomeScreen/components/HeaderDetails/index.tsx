import { StyleSheet } from 'react-native';
import React from 'react';
import { Box } from 'native-base';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HeaderBar from './components/HeaderBar';
import CurrentPlanView from './components/CurrentPlanView';
import UAIView from './components/UAIView';

function HeaderDetails() {
  const { top } = useSafeAreaInsets();
  return (
    <Box backgroundColor="#FDF7F0" style={[styles.wrapper, { paddingTop: top }]}>
      <HeaderBar />
      <CurrentPlanView />
      <UAIView />
    </Box>
  );
}

export default HeaderDetails;

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 30,
    paddingVertical: 30,
    borderBottomEndRadius: 10,
    borderBottomStartRadius: 10,
  },
});
