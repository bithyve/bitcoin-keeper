import { StyleSheet } from 'react-native';
import React from 'react';
import useBalance from 'src/hooks/useBalance';
import { Box, useColorMode } from 'native-base';
import { useAppSelector } from 'src/store/hooks';
import { hp } from 'src/constants/responsive';
import BTC from 'src/assets/images/btc_wallet.svg';
import Text from 'src/components/KeeperText';

function WalletInfo({ wallets }) {
  const { colorMode } = useColorMode();
  const netBalance = useAppSelector((state) => state.wallet.netBalance) || 0;
  const { getSatUnit, getBalance, getCurrencyIcon } = useBalance();

  return (
    <Box style={styles.headerContainer}>
      <Text color={`${colorMode}.textWallet`} style={styles.headerTitle}>
        {wallets?.length} Linked Wallets
      </Text>
      <Box style={styles.headerBalanceContainer}>
        <Box style={styles.headerBTCIcon}>{getCurrencyIcon(BTC, 'dark')}</Box>
        <Text color={`${colorMode}.textWallet`} fontSize={hp(30)} style={styles.headerBalance}>
          {getBalance(netBalance)}
          <Text color={`${colorMode}.textColorDark`} style={styles.balanceUnit}>
            {getSatUnit()}
          </Text>
        </Text>
      </Box>
    </Box>
  );
}

export default WalletInfo;

const styles = StyleSheet.create({
  headerTitle: {
    letterSpacing: 0.96,
    fontSize: 16,
    marginTop: hp(10),
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: hp(-20),
  },
  headerBalanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: hp(35),
  },
  headerBTCIcon: {
    marginRight: 3,
    marginBottom: -hp(10),
  },
  headerBalance: {
    letterSpacing: 1.5,
  },
  balanceUnit: {
    letterSpacing: 0.6,
    fontSize: 12,
  },
});
