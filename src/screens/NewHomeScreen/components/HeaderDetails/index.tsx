import { StyleSheet } from 'react-native';
import React from 'react';
import { Box } from 'native-base';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HeaderBar from './components/HeaderBar';
import CurrentPlanView from './components/CurrentPlanView';

import UaiDisplay from 'src/screens/HomeScreen/UaiDisplay';
import useUaiStack from 'src/hooks/useUaiStack';
import usePlan from 'src/hooks/usePlan';

function HeaderDetails() {
  const { top } = useSafeAreaInsets();
  const { uaiStack } = useUaiStack();
  const { plan } = usePlan();

  return (
    <Box backgroundColor="#FDF7F0" style={[styles.wrapper, { paddingTop: top }]}>
      <HeaderBar />
      <CurrentPlanView plan={plan} />
      <UaiDisplay uaiStack={uaiStack} />
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
