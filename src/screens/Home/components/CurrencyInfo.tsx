import { StyleSheet } from 'react-native';
import React from 'react';
import BTC from 'src/assets/images/btc.svg';
import Hidden from 'src/assets/images/hidden.svg';
import { Box, HStack } from 'native-base';
import useBalance from 'src/hooks/useBalance';
import Text from 'src/components/KeeperText';
import Colors from 'src/theme/Colors';
import { hp, wp } from 'src/constants/responsive';
import { EntityKind } from 'src/services/wallets/enums';

interface ICurrencyInfo {
  hideAmounts: boolean;
  amount: number;
  fontSize: number;
  satsFontSize?: number;
  bold?: boolean;
  color?: string;
  balanceMaxWidth?: number;
  wallet?: any;
  variation?: 'light' | 'green' | 'dark' | 'grey' | 'slateGreen' | 'richBlack';
}
function CurrencyInfo({
  hideAmounts,
  amount,
  fontSize,
  satsFontSize = fontSize,
  bold,
  color = Colors.headerWhite,
  balanceMaxWidth,
  wallet,
  variation = 'grey',
}: ICurrencyInfo) {
  const { getSatUnit, getBalance, getCurrencyIcon } = useBalance();
  return (
    <HStack style={styles.vaultBalanceContainer} testID="view_currencyView">
      <Box style={styles.rowCenter}>
        {!hideAmounts ? (
          <>
            {wallet.entityKind === EntityKind.USDT_WALLET
              ? null
              : !getSatUnit() && getCurrencyIcon(BTC, variation)}
            <Box style={styles.rowCenter}>
              <Text
                color={color}
                style={{ fontSize, paddingVertical: 5, maxWidth: balanceMaxWidth || null }}
                bold={bold}
                numberOfLines={1}
                testID="text_balance"
              >
                {` ${getBalance(amount)} ${
                  wallet.entityKind === EntityKind.USDT_WALLET ? 'USDT' : getSatUnit()
                }`}
              </Text>
            </Box>
          </>
        ) : (
          <Box
            style={[styles.rowCenter, styles.hiddenContainer, { height: fontSize + 1 }]}
            testID="view_hideCurrencyView"
          >
            <Hidden height={hp(45)} width={wp(45)} color={color} />
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
    marginRight: wp(2),
  },
});
