import Text from 'src/components/KeeperText';
import { Box, useColorMode } from 'native-base';
import { FlatList, RefreshControl } from 'react-native';
import React, { useState } from 'react';
import { hp } from 'src/constants/responsive';
import KeeperHeader from 'src/components/KeeperHeader';
import { RealmSchema } from 'src/storage/realm/enum';
import TransactionElement from 'src/components/TransactionElement';
import VaultIcon from 'src/assets/images/icon_vault_brown.svg';
import LinkedWallet from 'src/assets/images/walletUtxos.svg';
import CollaborativeIcon from 'src/assets/images/icon_collaborative.svg';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { refreshWallets } from 'src/store/sagaActions/wallets';
import { useDispatch } from 'react-redux';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import useVault from 'src/hooks/useVault';
import { useQuery } from '@realm/react';
import { EntityKind } from 'src/core/wallets/enums';
import { Transaction } from 'src/core/wallets/interfaces';
import ScreenWrapper from 'src/components/ScreenWrapper';

function AllTransactions({ route }) {
  const { colorMode } = useColorMode();
  const dispatch = useDispatch();
  const title = route?.params?.title;
  const entityKind = route?.params?.entityKind;
  const subtitle = route?.params?.subtitle;
  const collaborativeWalletId = route?.params?.collaborativeWalletId;
  const { activeVault: vault } = useVault(collaborativeWalletId);

  const wallet: Wallet = useQuery(RealmSchema.Wallet)
    .map(getJSONFromRealmObject)
    .filter((wallet) => !wallet.archived)[0];

  const [pullRefresh, setPullRefresh] = useState(false);

  const vaultTrans: Transaction[] = vault?.specs?.transactions || [];
  const walletTrans: Transaction[] = wallet?.specs.transactions || [];
  const renderTransactionElement = ({ item }) => <TransactionElement transaction={item} />;

  const pullDownRefresh = () => {
    setPullRefresh(true);
    refreshVault();
    setPullRefresh(false);
  };

  const refreshVault = () => {
    dispatch(refreshWallets([vault], { hardRefresh: true }));
  };

  return (
    <ScreenWrapper>
      <KeeperHeader title={title} subtitle={subtitle} />
      <FlatList
        data={entityKind === EntityKind.WALLET ? walletTrans : vaultTrans}
        refreshControl={<RefreshControl onRefresh={pullDownRefresh} refreshing={pullRefresh} />}
        renderItem={renderTransactionElement}
        keyExtractor={(item: Transaction) => item.txid}
        showsVerticalScrollIndicator={false}
      />
    </ScreenWrapper>
  );
}

export default AllTransactions;
