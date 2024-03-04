import React from 'react';
import { Box, useColorMode } from 'native-base';
import Text from 'src/components/KeeperText';
import { StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import Fonts from 'src/constants/Fonts';
import PlebIcon from 'src/assets/images/pleb_white.svg';
import HodlerIcon from 'src/assets/images/hodler.svg';
import DiamondIcon from 'src/assets/images/diamond_hands.svg';
import SettingIcon from 'src/assets/images/settings.svg';

function CurrentPlanView({ plan }) {
  const navigation = useNavigation();
  const { colorMode } = useColorMode();
  return (
    <Box style={styles.wrapper}>
      <Box style={styles.planContianer}>
        <TouchableOpacity
          testID={`btn_choosePlan-${plan}`}
          style={styles.plan}
          onPress={() => navigation.navigate('ChoosePlan')}
        >
          {plan === 'Pleb'.toUpperCase() && <PlebIcon />}
          {plan === 'Hodler'.toUpperCase() && <HodlerIcon />}
          {plan === 'Diamond Hands'.toUpperCase() && <DiamondIcon />}
          <Text
            testID="text_home_current_plan"
            style={styles.currentPlanText}
            color={`${colorMode}.choosePlanHome`}
            bold
          >
            {plan}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ padding: 5 }}
          onPress={() => navigation.navigate('AppSettings')}
          testID="btn_choosePlan"
        >
          <SettingIcon />
        </TouchableOpacity>
      </Box>
    </Box>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: 10,
  },
  planContianer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  plan: {
    flexDirection: 'row',
    gap: 5,
  },
  titleTxet: {
    fontSize: 12,
  },
  currentPlanText: {
    fontSize: 20,
    letterSpacing: 0.2,
  },
});
export default CurrentPlanView;
