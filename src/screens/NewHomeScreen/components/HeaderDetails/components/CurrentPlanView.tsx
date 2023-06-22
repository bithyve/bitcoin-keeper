import React from 'react';
import { Box } from 'native-base';
import Text from 'src/components/KeeperText';
import { StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';

function CurrentPlanView({ plan }) {
  const navigation = useNavigation();

  return (
    <Box style={styles.wrapper} borderBottomColor="light.lightAccent">
      <Text style={styles.titleTxet} color="light.secondaryText">
        You are at
      </Text>
      <TouchableOpacity onPress={() => navigation.navigate('ChoosePlan')} testID="btn_choosePlan">
        <Text style={styles.currentPlanText} color="light.greenText2">
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
    fontWeight: '600',
  },
});
export default CurrentPlanView;
