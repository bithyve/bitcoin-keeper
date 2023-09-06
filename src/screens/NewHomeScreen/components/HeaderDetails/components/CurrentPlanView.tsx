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
    <Box style={styles.wrapper} borderBottomColor="light.lightAccent">
      <Text style={styles.titleTxet} color={`${colorMode}.secondaryText`}>
        You are at
      </Text>
      <TouchableOpacity onPress={() => navigation.navigate('ChoosePlan')} testID="btn_choosePlan">
        <Text style={styles.currentPlanText} color={`${colorMode}.greenText2`}>
          {plan}
        </Text>
      </TouchableOpacity>
    </Box>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    borderBottomWidth: 0.8,
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
