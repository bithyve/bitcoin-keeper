import React from 'react';
import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Box } from 'native-base';
import AddCard from 'src/components/AddCard';
import { EntityKind, VaultType, WalletType } from 'src/core/wallets/enums';
import { Vault } from 'src/core/wallets/interfaces/vault';
import CollaborativeIcon from 'src/assets/images/collaborative_vault_white.svg';
import WalletIcon from 'src/assets/images/daily_wallet.svg';
import VaultIcon from 'src/assets/images/vault_icon.svg';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import idx from 'idx';
import { hp, wp } from 'src/constants/responsive';
import WalletInfoCard from './WalletInfoCard';
import BalanceComponent from './BalanceComponent';
import WalletInfoEmptyState from './WalletInfoEmptyState';

export function WalletsList({
  allWallets,
  navigation,
  totalBalance,
  isShowAmount,
  setIsShowAmount,
}) {
  return (
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
        ListEmptyComponent={<WalletInfoEmptyState />}
        ListFooterComponent={() => (
          <AddCard
            name={'Add\nWallet'}
            cardStyles={{ height: hp(260), width: wp(130) }}
            callback={() => navigation.navigate('AddWallet')}
          />
        )}
      />
    </Box>
  );
}

const handleWalletPress = (wallet, navigation) => {
  if (wallet.entityKind === EntityKind.VAULT) {
    navigation.navigate('VaultDetails', { vaultId: wallet.id });
  } else {
    navigation.navigate('WalletDetails', { walletId: wallet.id });
  }
};

const getWalletTags = (wallet) => {
  if (wallet.entityKind === EntityKind.VAULT) {
    return [
      `${wallet.type === VaultType.COLLABORATIVE ? 'COLLABORATIVE' : 'VAULT'}`,
      `${(wallet as Vault).scheme.m} of ${(wallet as Vault).scheme.n}`,
    ];
  } else {
    let walletKind;
    if (wallet.type === WalletType.DEFAULT) walletKind = 'HOT WALLET';
    else if (wallet.type === WalletType.IMPORTED) {
      const isWatchOnly = !idx(wallet as Wallet, (_) => _.specs.xpriv);
      if (isWatchOnly) walletKind = 'WATCH ONLY';
      else walletKind = 'IMPORTED WALLET';
    }

    return ['SINGLE-KEY', walletKind];
  }
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
