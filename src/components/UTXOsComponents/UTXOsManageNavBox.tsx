import { StyleSheet } from 'react-native';
import React from 'react';
import { Box, Pressable } from 'native-base';
import ArrowIcon from 'src/assets/images/arrow.svg';
import { windowHeight } from 'src/common/data/responsiveness/responsive';
import Text from '../KeeperText';

function UTXOsManageNavBox({ onClick }: any) {
  return (
    <Pressable
      style={styles.manageUTXOsWrapper}
      backgroundColor="light.lightAccent"
      onPress={onClick}
    >
      <Box style={styles.titleViewWrapper}>
        <Text style={styles.titleText}>Manage UTXO’s</Text>
        <Text style={styles.subTitleText}>Modify Label and choose UTXOs</Text>
      </Box>
      <Box>
        <ArrowIcon />
      </Box>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  manageUTXOsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: 10,
    borderRadius: 5,
    marginBottom: windowHeight > 800 ? 15 : 5,
    marginTop: windowHeight > 800 ? 0 : 10,
  },
  titleViewWrapper: {
    width: '80%',
  },
  titleText: {
    color: '#725436',
    fontSize: 14,
  },
  subTitleText: {
    color: '#725436',
    fontSize: 12,
  },
});
export default UTXOsManageNavBox;
