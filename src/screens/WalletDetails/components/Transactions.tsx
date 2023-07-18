import { FlatList, RefreshControl } from 'react-native';
import React from 'react';
import EmptyStateView from 'src/components/EmptyView/EmptyStateView';
import NoTransactionIcon from 'src/assets/images/noTransaction.svg';
import TransactionElement from 'src/components/TransactionElement';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { Transaction } from 'src/core/wallets/interfaces';
import useSyncWallet from 'src/queries/syncWallet';

function TransactionItem({ item, wallet, navigation }) {
  return (
    <TransactionElement
      transaction={item}
      onPress={() => {
        navigation.dispatch(
          CommonActions.navigate('TransactionDetails', {
            transaction: item,
            wallet,
          })
        );
      }}
    />
  );
}

function Transactions({ transactions, currentWallet }) {
  const navigation = useNavigation();
  const { query } = useSyncWallet({ wallet: currentWallet });
  const syncing = query.isFetching;

  return (
    <FlatList
      refreshControl={<RefreshControl onRefresh={query.refetch} refreshing={syncing} />}
      data={transactions}
      renderItem={({ item }) => (
        <TransactionItem item={item} navigation={navigation} wallet={currentWallet} />
      )}
      refreshing={syncing}
      keyExtractor={(item: Transaction) => `${item.txid}${item.transactionType}`}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyStateView
          IllustartionImage={NoTransactionIcon}
          title="No transactions yet."
          subTitle="Pull down to refresh"
        />
      }
    />
  );
}

export default Transactions;
