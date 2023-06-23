import { StyleSheet } from 'react-native';
import React from 'react';
import BTC from 'src/assets/images/btc.svg';
import Hidden from 'src/assets/images/hidden.svg';
import { Box, HStack } from 'native-base';
import useBalance from 'src/hooks/useBalance';
import Text from 'src/components/KeeperText';
import Colors from 'src/theme/Colors';

interface ICurrencyInfo {
  hideAmounts: boolean;
  amount: number;
  fontSize: number;
  color: string;
  variation: 'light' | 'green' | 'dark' | 'grey';
}
function CurrencyInfo({
  hideAmounts,
  amount,
  fontSize,
  color = Colors.White,
  variation = 'grey',
}: ICurrencyInfo) {
  const { getSatUnit, getBalance, getCurrencyIcon } = useBalance();

  return (
    <HStack style={styles.vaultBalanceContainer} testID='view_currencyView'>
      {getCurrencyIcon(BTC, variation)}
      {!hideAmounts ? (
        <Box style={styles.rowCenter}>
          <Text color={color} style={{ fontSize }}>
            {` ${getBalance(amount)} ${getSatUnit()}`}
          </Text>
        </Box>
      ) : (
        <Box style={[styles.rowCenter, styles.hiddenContainer, { height: fontSize + 1 }]} testID='view_hideCurrencyView'>
          <Hidden style={{ color }} />
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
