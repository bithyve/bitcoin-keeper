import { FlatList, RefreshControl } from 'react-native';
import React, { useState } from 'react';
import KeeperHeader from 'src/components/KeeperHeader';
import { RealmSchema } from 'src/storage/realm/enum';
import TransactionElement from 'src/components/TransactionElement';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { refreshWallets } from 'src/store/sagaActions/wallets';
import { useDispatch } from 'react-redux';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import useVault from 'src/hooks/useVault';
import { useQuery } from '@realm/react';
import { EntityKind } from 'src/core/wallets/enums';
import { Transaction } from 'src/core/wallets/interfaces';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { useColorMode } from 'native-base';

function AllTransactions({ route }) {
  const { colorMode } = useColorMode();
  const dispatch = useDispatch();
  const { title, entityKind, subtitle, vaultId = '' } = route?.params;
  const { activeVault: vault } = useVault({ vaultId });

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
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
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
