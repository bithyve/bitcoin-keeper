import React from 'react';
import { Box, useColorMode } from 'native-base';
import Text from 'src/components/KeeperText';
import { StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import Fonts from 'src/constants/Fonts';

function CurrentPlanView({ plan }) {
  const navigation = useNavigation();
  const { colorMode } = useColorMode();

  return (
    <Box style={styles.wrapper}>
      <TouchableOpacity onPress={() => navigation.navigate('ChoosePlan')} testID="btn_choosePlan">
        <Text
          testID="text_home_current_plan"
          style={styles.currentPlanText}
          color={`${colorMode}.white`}
        >
          {plan}
        </Text>
      </TouchableOpacity>
    </Box>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: 10,
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
