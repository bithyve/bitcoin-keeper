import { StyleSheet } from 'react-native';
import React from 'react';
import { Box, Pressable } from 'native-base';
import ArrowIcon from 'src/assets/images/arrow.svg';
import { windowHeight } from 'src/common/data/responsiveness/responsive';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { Vault } from 'src/core/wallets/interfaces/vault';
import useBalance from 'src/hooks/useBalance';
import useWhirlpoolWallets, {
  whirlpoolWalletAccountMapInterface,
} from 'src/hooks/useWhirlpoolWallets';
import idx from 'idx';
import Text from 'src/components/KeeperText';

const getTotalBalanceWhirlpoolAccount = (
  currentWallet: Wallet,
  whirlpoolWalletAccountMap: whirlpoolWalletAccountMapInterface
) =>
  idx(currentWallet, (_) => _.specs.balances.unconfirmed) +
    idx(currentWallet, (_) => _.specs.balances.unconfirmed) +
    idx(whirlpoolWalletAccountMap, (_) => _.premixWallet.specs.balances.confirmed) +
    idx(whirlpoolWalletAccountMap, (_) => _.premixWallet.specs.balances.unconfirmed) +
    idx(whirlpoolWalletAccountMap, (_) => _.postmixWallet.specs.balances.confirmed) +
    idx(whirlpoolWalletAccountMap, (_) => _.postmixWallet.specs.balances.unconfirmed) +
    idx(whirlpoolWalletAccountMap, (_) => _.badbankWallet.specs.balances.confirmed) +
    idx(whirlpoolWalletAccountMap, (_) => _.badbankWallet.specs.balances.unconfirmed) || 0;

function UTXOsManageNavBox({
  onClick,
  isWhirlpoolWallet,
  wallet,
}: {
  onClick: any;
  isWhirlpoolWallet: boolean;
  wallet: Wallet | Vault;
}) {
  const { getSatUnit, getBalance } = useBalance();

  const whirlpoolWalletAccountMap = useWhirlpoolWallets({
    wallets: [wallet],
  })?.[wallet.id];

  return (
    <Pressable
      style={styles.manageUTXOsWrapper}
      backgroundColor="light.lightAccent"
      onPress={onClick}
    >
      {isWhirlpoolWallet ? (
        <Box style={styles.titleViewWrapper}>
          <Text style={styles.titleText}>Manage UTXOs and Whirlpool</Text>
          <Text style={styles.subTitleText}>
            Total Balance:{' '}
            {getBalance(getTotalBalanceWhirlpoolAccount(wallet, whirlpoolWalletAccountMap))}
            {getSatUnit()}
          </Text>
        </Box>
      ) : (
        <Box style={styles.titleViewWrapper}>
          <Text style={styles.titleText}>Manage UTXOs and Whirlpool</Text>
          <Text style={styles.subTitleText}>Select Label and choose UTXOs</Text>
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
