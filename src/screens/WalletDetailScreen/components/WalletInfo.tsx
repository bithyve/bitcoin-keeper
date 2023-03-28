import { StyleSheet } from 'react-native';
import React, { useContext } from 'react';
import { getAmt, getCurrencyImageByRegion, getUnit } from 'src/common/constants/Bitcoin';
import { Box } from 'native-base';
import useExchangeRates from 'src/hooks/useExchangeRates';
import useCurrencyCode from 'src/store/hooks/state-selectors/useCurrencyCode';
import { useAppSelector } from 'src/store/hooks';
import { hp } from 'src/common/data/responsiveness/responsive';
import BTC from 'src/assets/images/btc_wallet.svg';
import Text from 'src/components/KeeperText';

function WalletInfo({ wallets }) {
  const exchangeRates = useExchangeRates();
  const currencyCode = useCurrencyCode();
  const currentCurrency = useAppSelector((state) => state.settings.currencyKind);
  const { satsEnabled } = useAppSelector((state) => state.settings);
  const netBalance = useAppSelector((state) => state.wallet.netBalance) || 0;

  return (
    <Box style={styles.headerContainer}>
      <Text color="light.textWallet" style={styles.headerTitle}>
        {wallets?.length} Linked Wallets
      </Text>
      <Box style={styles.headerBalanceContainer}>
        <Box style={styles.headerBTCIcon}>
          {getCurrencyImageByRegion(currencyCode, 'dark', currentCurrency, BTC)}
        </Box>
        <Text color="light.textWallet" fontSize={hp(30)} style={styles.headerBalance}>
          {getAmt(netBalance, exchangeRates, currencyCode, currentCurrency, satsEnabled)}
          <Text color="light.textColorDark" style={styles.balanceUnit}>
            {getUnit(currentCurrency, satsEnabled)}
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
