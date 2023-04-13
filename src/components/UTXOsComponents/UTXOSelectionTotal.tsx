import { StyleSheet } from 'react-native';
import React from 'react';
import { Box, useColorMode } from 'native-base';
import Text from 'src/components/KeeperText';
import { hp } from 'src/common/data/responsiveness/responsive';
import BtcBlack from 'src/assets/images/btc_black.svg';
import useBalance from 'src/hooks/useBalance';

function UTXOSelectionTotal(props: any) {
  const { selectionTotal, selectedUTXOs } = props;
  const { colorMode } = useColorMode();
  const { getSatUnit, getBalance, getCurrencyIcon } = useBalance();

  return (
    <Box style={styles.tabWrapper} testID="view_UTXOSelectTotal">
      <Box style={styles.selectionWrapper}>
        <Text style={styles.selectionText}>{`${selectedUTXOs.length} UTXO Selected`}</Text>
      </Box>
      <Box style={styles.totalWrapper}>
        <Text style={styles.selectionTotalText}>Total</Text>
        <Box>{getCurrencyIcon(BtcBlack, 'dark')}</Box>
        <Text style={styles.selectionText}>
          {getBalance(selectionTotal)}
          <Text color={`${colorMode}.dateText`} style={styles.selectionText}>
            {getSatUnit()}
          </Text>
        </Text>
      </Box>
    </Box>
  );
}
const styles = StyleSheet.create({
  tabWrapper: {
    flexDirection: 'row',
    padding: 12,
    marginTop: hp(20),
    width: '100%',
  },
  selectionWrapper: {
    width: '48%',
  },
  totalWrapper: {
    flexDirection: 'row',
    width: '48%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  totalView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectionText: {
    fontSize: 16,
    fontWeight: '400',
    paddingLeft: 5,
  },
  selectionTotalText: {
    fontSize: 16,
    marginRight: 10,
    fontWeight: '400',
  },
});
export default UTXOSelectionTotal;
