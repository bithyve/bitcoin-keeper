import React from 'react';
import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Box } from 'native-base';
import AddCard from 'src/components/AddCard';
import { DerivationPurpose, EntityKind, VaultType, WalletType } from 'src/services/wallets/enums';
import { Vault } from 'src/services/wallets/interfaces/vault';
import CollaborativeIcon from 'src/assets/images/collaborative_vault_white.svg';
import WalletIcon from 'src/assets/images/daily_wallet.svg';
import VaultIcon from 'src/assets/images/vault_icon.svg';
import AssistedIcon from 'src/assets/images/assisted-vault-white-icon.svg';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import idx from 'idx';
import { hp, wp } from 'src/constants/responsive';
import { uaiType } from 'src/models/interfaces/Uai';
import WalletUtilities from 'src/services/wallets/operations/utils';
import WalletInfoCard from './WalletInfoCard';
import BalanceComponent from './BalanceComponent';
import WalletInfoEmptyState from './WalletInfoEmptyState';

export function WalletsList({
  allWallets,
  navigation,
  totalBalance,
  isShowAmount,
  setIsShowAmount,
  typeBasedIndicator,
}) {
  return (
    <Box style={styles.valueWrapper} testID="wallet_list">
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
        renderItem={({ item: wallet, index }) => (
          <TouchableOpacity
            testID={`view_wallet_${index}`}
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
              showDot={typeBasedIndicator?.[uaiType.VAULT_TRANSFER]?.[wallet.id]}
            />
          </TouchableOpacity>
        )}
        ListEmptyComponent={<WalletInfoEmptyState />}
        ListFooterComponent={() => (
          <AddCard
            name={'Add\nWallet'}
            cardStyles={{ height: hp(260), width: wp(130) }}
            callback={() => navigation.navigate('AddWallet')}
            isAddWallet
          />
        )}
      />
    </Box>
  );
}

const handleWalletPress = (wallet, navigation) => {
  if (wallet.entityKind === EntityKind.VAULT) {
    navigation.navigate('VaultDetails', { vaultId: wallet.id, autoRefresh: true });
  } else {
    navigation.navigate('WalletDetails', { walletId: wallet.id, autoRefresh: true });
  }
};

const getWalletTags = (wallet) => {
  if (wallet.entityKind === EntityKind.VAULT) {
    if (wallet.type === VaultType.SINGE_SIG) {
      return ['Single Key', 'Cold'];
    } else if (wallet.type === VaultType.COLLABORATIVE) {
      return ['Collaborative', `${(wallet as Vault).scheme.m} of ${(wallet as Vault).scheme.n}`];
    } else if (wallet.type === VaultType.ASSISTED) {
      return ['Assisted', `${(wallet as Vault).scheme.m} of ${(wallet as Vault).scheme.n}`];
    } else if (wallet.type === VaultType.TIMELOCKED) {
      return ['Timelocked', `${(wallet as Vault).scheme.m} of ${(wallet as Vault).scheme.n}`];
    } else if (wallet.type === VaultType.INHERITANCE) {
      return ['Inheritance Key', `${(wallet as Vault).scheme.m} of ${(wallet as Vault).scheme.n}`];
    } else {
      return ['Vault', `${(wallet as Vault).scheme.m} of ${(wallet as Vault).scheme.n}`];
    }
  } else {
    let walletKind;
    if (wallet.type === WalletType.DEFAULT) walletKind = 'Hot Wallet';
    else if (wallet.type === WalletType.IMPORTED) {
      const isWatchOnly = !idx(wallet as Wallet, (_) => _.specs.xpriv);
      if (isWatchOnly) walletKind = 'Watch Only';
      else walletKind = 'Imported Wallet';
    }
    let isTaprootWallet = false;
    const derivationPath = idx(wallet, (_) => _.derivationDetails.xDerivationPath);
    if (derivationPath && WalletUtilities.getPurpose(derivationPath) === DerivationPurpose.BIP86) {
      isTaprootWallet = true;
    }
    if (isTaprootWallet) return ['Taproot', walletKind];
    else return ['Single Key', walletKind];
  }
};

const getWalletIcon = (wallet) => {
  if (wallet.entityKind === EntityKind.VAULT) {
    if (wallet.type === VaultType.SINGE_SIG) {
      return <WalletIcon />;
    } else if (wallet.type === VaultType.COLLABORATIVE) {
      return <CollaborativeIcon />;
    } else if (wallet.type === VaultType.ASSISTED) {
      return <AssistedIcon />;
    } else {
      return <VaultIcon />;
    }
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
  emptyCardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
});
