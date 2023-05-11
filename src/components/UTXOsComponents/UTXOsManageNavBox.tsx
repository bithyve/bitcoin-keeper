import { StyleSheet } from 'react-native';
import React from 'react';
import { Box, Pressable } from 'native-base';
import ArrowIcon from 'src/assets/images/arrow.svg';
import { windowHeight } from 'src/common/data/responsiveness/responsive';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { Vault } from 'src/core/wallets/interfaces/vault';
import useBalance from 'src/hooks/useBalance';
import Text from '../KeeperText';
import useWhirlpoolWallets, {
  whirlpoolWalletAccountMapInterface,
} from 'src/hooks/useWhirlpoolWallets';

const getTotalBalanceWhirlpoolAccount = (
  currentWallet: Wallet,
  whirlpoolWalletAccountMap: whirlpoolWalletAccountMapInterface
) => {
  return (
    currentWallet.specs.balances.confirmed +
      currentWallet.specs.balances.unconfirmed +
      whirlpoolWalletAccountMap.premixWallet.specs.balances.confirmed +
      whirlpoolWalletAccountMap.premixWallet.specs.balances.unconfirmed +
      whirlpoolWalletAccountMap.postmixWallet.specs.balances.confirmed +
      whirlpoolWalletAccountMap.postmixWallet.specs.balances.unconfirmed +
      whirlpoolWalletAccountMap.badbankWallet.specs.balances.confirmed +
      whirlpoolWalletAccountMap.badbankWallet.specs.balances.unconfirmed || 0
  );
};

function UTXOsManageNavBox({
  onClick,
  isWhirlpoolWallet,
  currentWallet,
}: {
  onClick: any;
  isWhirlpoolWallet: boolean;
  currentWallet: Wallet | Vault;
}) {
  const { getSatUnit, getBalance } = useBalance();

  const whirlpoolWalletAccountMap = useWhirlpoolWallets({
    wallets: [currentWallet],
  })?.[currentWallet.id];

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
            {getBalance(getTotalBalanceWhirlpoolAccount(currentWallet, whirlpoolWalletAccountMap))}
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
