import { StyleSheet } from 'react-native';
import React from 'react';
import { Box, Pressable } from 'native-base';
import ArrowIcon from 'src/assets/images/arrow.svg';
import { windowHeight } from 'src/common/data/responsiveness/responsive';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { Vault } from 'src/core/wallets/interfaces/vault';
import idx from 'idx';
import Text from '../KeeperText';
import { getAmt, getUnit } from 'src/common/constants/Bitcoin';
import useExchangeRates from 'src/hooks/useExchangeRates';
import useCurrencyCode from 'src/store/hooks/state-selectors/useCurrencyCode';
import { useAppSelector } from 'src/store/hooks';

const getTotalBalanceWhirlpoolAccount = (currentWallet) =>
  idx(currentWallet, (_) => _.specs.balances.unconfirmed) +
    idx(currentWallet, (_) => _.specs.balances.confirmed) +
    idx(currentWallet, (_) => _.whirlpoolConfig.premixWallet.specs.balances.unconfirmed) +
    idx(currentWallet, (_) => _.whirlpoolConfig.premixWallet.specs.balances.confirmed) +
    idx(currentWallet, (_) => _.whirlpoolConfig.postmixWallet.specs.balances.unconfirmed) +
    idx(currentWallet, (_) => _.whirlpoolConfig.postmixWallet.specs.balances.confirmed) +
    idx(currentWallet, (_) => _.whirlpoolConfig.badbankWallet.specs.balances.unconfirmed) +
    idx(currentWallet, (_) => _.whirlpoolConfig.badbankWallet.specs.balances.confirmed) || 0;

function UTXOsManageNavBox({
  onClick,
  isWhirlpoolWallet,
  currentWallet,
}: {
  onClick: any;
  isWhirlpoolWallet: boolean;
  currentWallet: Wallet | Vault;
}) {
  const exchangeRates = useExchangeRates();
  const currencyCode = useCurrencyCode();
  const currentCurrency = useAppSelector((state) => state.settings.currencyKind);
  const { satsEnabled } = useAppSelector((state) => state.settings);

  return (
    <Pressable
      style={styles.manageUTXOsWrapper}
      backgroundColor="light.lightAccent"
      onPress={onClick}
    >
      {isWhirlpoolWallet ? (
        <Box style={styles.titleViewWrapper}>
          <Text style={styles.titleText}>Manage UTXO’s/Whirlpool Accounts</Text>
          <Text style={styles.subTitleText}>
            Total Balance:
            {getAmt(
              getTotalBalanceWhirlpoolAccount(currentWallet),
              exchangeRates,
              currencyCode,
              currentCurrency,
              satsEnabled
            )}
            {getUnit(currentCurrency, satsEnabled)}
          </Text>
        </Box>
      ) : (
        <Box style={styles.titleViewWrapper}>
          <Text style={styles.titleText}>Manage UTXO’s</Text>
          <Text style={styles.subTitleText}>Modify Label and choose UTXOs</Text>
        </Box>
      )}
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
