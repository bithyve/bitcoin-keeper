import { FlatList, RefreshControl } from 'react-native';
import React, { useState } from 'react';
import { useColorMode } from 'native-base';
import { useQuery } from '@realm/react';
import { useDispatch } from 'react-redux';

import { RealmSchema } from 'src/storage/realm/enum';
import TransactionElement from 'src/components/TransactionElement';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { refreshWallets } from 'src/store/sagaActions/wallets';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import useVault from 'src/hooks/useVault';
import { EntityKind } from 'src/services/wallets/enums';
import { Transaction } from 'src/services/wallets/interfaces';
import ScreenWrapper from 'src/components/ScreenWrapper';
import WalletHeader from 'src/components/WalletHeader';

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
  const renderTransactionElement = ({ item }) => (
    <TransactionElement transaction={item} wallet={wallet} />
  );

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
      <WalletHeader title={title} subTitle={subtitle} />
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
