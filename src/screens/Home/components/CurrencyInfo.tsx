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
  satsFontSize?: number;
  bold?: boolean;
  color?: string;
  balanceMaxWidth?: number;
  variation?: 'light' | 'green' | 'dark' | 'grey' | 'slateGreen' | 'richBlack';
}
function CurrencyInfo({
  hideAmounts,
  amount,
  fontSize,
  satsFontSize = fontSize,
  bold,
  color = Colors.White,
  balanceMaxWidth,
  variation = 'grey',
}: ICurrencyInfo) {
  const { getSatUnit, getBalance, getCurrencyIcon } = useBalance();
  return (
    <HStack style={styles.vaultBalanceContainer} testID="view_currencyView">
      <Box style={styles.rowCenter}>
        {getCurrencyIcon(BTC, variation)}
        {!hideAmounts ? (
          <Box style={styles.rowCenter}>
            <Text
              color={color}
              style={{ fontSize, paddingVertical: 5, maxWidth: balanceMaxWidth || null }}
              bold={bold}
              numberOfLines={1}
              testID="text_balance"
            >
              {` ${getBalance(amount)} ${getSatUnit()}`}
            </Text>
          </Box>
        ) : (
          <Box
            style={[styles.rowCenter, styles.hiddenContainer, { height: fontSize + 1 }]}
            testID="view_hideCurrencyView"
          >
            <Hidden color={color} />
          </Box>
        )}
      </Box>
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
