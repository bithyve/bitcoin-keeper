import React from 'react';
import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Box } from 'native-base';
import AddCard from 'src/components/AddCard';
import BalanceComponent from './BalanceComponent';
import WalletInfoCard from './WalletInfoCard';
import { EntityKind, VaultType, WalletType } from 'src/core/wallets/enums';
import { Vault } from 'src/core/wallets/interfaces/vault';
import CollaborativeIcon from 'src/assets/images/collaborative_vault_white.svg';
import WalletIcon from 'src/assets/images/daily_wallet.svg';
import VaultIcon from 'src/assets/images/vault_icon.svg';
export const WalletsList = ({
  allWallets,
  navigation,
  totalBalance,
  isShowAmount,
  setIsShowAmount,
}) => (
  <Box style={styles.valueWrapper}>
    <BalanceComponent
      setIsShowAmount={setIsShowAmount}
      isShowAmount={isShowAmount}
      count={allWallets.length}
      balance={totalBalance}
    />
    <FlatList
      contentContainerStyle={styles.walletDetailWrapper}
      horizontal
      data={allWallets}
      keyExtractor={(item) => item.id}
      renderItem={({ item: wallet }) => (
        <TouchableOpacity
          style={styles.walletCardWrapper}
          onPress={() => handleWalletPress(wallet, navigation)}
        >
          <WalletInfoCard
            isShowAmount={isShowAmount}
            setIsShowAmount={setIsShowAmount}
            tags={getWalletTags(wallet)}
            walletName={wallet.presentationData.name}
            walletDescription={wallet.presentationData.description}
            icon={getWalletIcon(wallet)}
            amount={calculateWalletBalance(wallet)}
          />
        </TouchableOpacity>
      )}
      ListFooterComponent={() => (
        <AddCard
          name="Add"
          cardStyles={{ height: 260, width: 130 }}
          callback={() => navigation.navigate('AddWallet')}
        />
      )}
    />
  </Box>
);

const handleWalletPress = (wallet, navigation) => {
  if (wallet.entityKind === EntityKind.VAULT) {
    navigation.navigate('VaultDetails', { vaultId: wallet.id });
  } else {
    navigation.navigate('WalletDetails', { walletId: wallet.id });
  }
};

const getWalletTags = (wallet) => {
  return wallet.entityKind === EntityKind.VAULT
    ? [
        `${wallet.type === VaultType.COLLABORATIVE ? 'COLLABORATIVE' : 'VAULT'}`,
        `${(wallet as Vault).scheme.m} of ${(wallet as Vault).scheme.n}`,
      ]
    : ['SINGLE SIG', `${wallet.type === WalletType.DEFAULT ? 'HOT WALLET' : 'WATCH ONLY'}`];
};

const getWalletIcon = (wallet) => {
  if (wallet.entityKind === EntityKind.VAULT) {
    return wallet.type === VaultType.COLLABORATIVE ? <CollaborativeIcon /> : <VaultIcon />;
  } else {
    return <WalletIcon />;
  }
};

const calculateWalletBalance = (wallet) => {
  const { confirmed, unconfirmed } = wallet.specs.balances;
  return confirmed + unconfirmed;
};

const styles = StyleSheet.create({
  valueWrapper: {
    flex: 0.65,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '35%',
    gap: 10,
    height: '100%',
  },
  walletDetailWrapper: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  walletCardWrapper: {
    marginRight: 10,
  },
});
