import React from 'react';
import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Box } from 'native-base';
import AddCard from 'src/components/AddCard';
import BalanceComponent from './BalanceComponent';
import WalletInfoCard from './WalletInfoCard';
import { EntityKind, VaultType } from 'src/core/wallets/enums';
import { Vault } from 'src/core/wallets/interfaces/vault';
import CollaborativeIcon from 'src/assets/images/collaborative_vault_white.svg';
import WalletIcon from 'src/assets/images/daily_wallet.svg';
import VaultIcon from 'src/assets/images/vault_icon.svg';
export const WalletsList = ({ allWallets, navigation, totalBalance }) => (
  <Box style={styles.valueWrapper}>
    <BalanceComponent count={allWallets.length} balance={totalBalance} />
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
    switch (wallet.type) {
      case VaultType.COLLABORATIVE:
        navigation.navigate('VaultDetails', {
          collaborativeWalletId: (wallet as Vault).collaborativeWalletId,
        });
        return;
      case VaultType.DEFAULT:
      default:
        navigation.navigate('VaultDetails', { vaultId: wallet.id });
    }
  } else {
    navigation.navigate('WalletDetails', { walletId: wallet.id });
  }
};

const getWalletTags = (wallet) => {
  return wallet.entityKind === EntityKind.VAULT
    ? [
        `${(wallet as Vault).scheme.m} of ${(wallet as Vault).scheme.n}`,
        `${wallet.type === VaultType.COLLABORATIVE ? 'COLLABORATIVE' : 'VAULT'}`,
      ]
    : ['SINGLE SIG', wallet.type];
};

const getWalletIcon = (wallet) => {
  return wallet.entityKind === EntityKind.VAULT ? (
    wallet.type === VaultType.COLLABORATIVE ? (
      <CollaborativeIcon />
    ) : (
      <VaultIcon />
    )
  ) : (
    <WalletIcon />
  );
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
