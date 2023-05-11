import { StyleSheet } from 'react-native';
import React from 'react';
import BTC from 'src/assets/images/btc.svg';
import Hidden from 'src/assets/images/hidden.svg';
import { Box, HStack } from 'native-base';
import useBalance from 'src/hooks/useBalance';
import Text from 'src/components/KeeperText';

interface ICurrencyInfo {
  hideAmounts: boolean;
  amount: number;
  fontSize: number;
}
function CurrencyInfo({ hideAmounts, amount, fontSize }: ICurrencyInfo) {
  const { getSatUnit, getBalance, getCurrencyIcon } = useBalance();
  return (
    <HStack style={styles.vaultBalanceContainer}>
      {getCurrencyIcon(BTC, 'grey')}
      {hideAmounts ? (
        <Box style={styles.rowCenter}>
          <Text color="light.white" style={{ fontSize }}>
            {`${getSatUnit()} ${getBalance(amount)}`}
          </Text>
        </Box>
      ) : (
        <Box style={[styles.rowCenter, styles.hiddenContainer, { height: fontSize + 1 }]}>
          <Hidden />
        </Box>
      )}
    </HStack>
  );
}

export default CurrencyInfo;

const styles = StyleSheet.create({
  vaultBalanceContainer: {
    alignItems: 'center',
  },
  rowCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hiddenContainer: {
    marginLeft: 3,
  },
});
