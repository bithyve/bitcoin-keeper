import React from 'react';
import { Box, useColorMode } from 'native-base';
import Text from 'src/components/KeeperText';
import { StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import Fonts from 'src/constants/Fonts';

import Hat from 'src/assets/images/coinhat.svg';
import SettingIcon from 'src/assets/images/settings.svg';

function CurrentPlanView({ plan }) {
  const navigation = useNavigation();
  const { colorMode } = useColorMode();
  return (
    <Box style={styles.wrapper}>
      <Box style={styles.planContianer}>
        <Box style={styles.plan}>
          <Hat />
          <Text
            testID="text_home_current_plan"
            style={styles.currentPlanText}
            color={`${colorMode}.white`}
          >
            {plan}
          </Text>
        </Box>
        <TouchableOpacity
          style={{ padding: 5 }}
          onPress={() => navigation.navigate('ChoosePlan')}
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
    fontSize: 18,
    letterSpacing: 1.8,
    fontFamily: Fonts.FiraSansCondensedMedium,
  },
});
export default CurrentPlanView;
