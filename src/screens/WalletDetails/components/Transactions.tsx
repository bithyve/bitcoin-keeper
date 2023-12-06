import { FlatList, RefreshControl } from 'react-native';
import React from 'react';
import { useDispatch } from 'react-redux';
import { refreshWallets } from 'src/store/sagaActions/wallets';
import EmptyStateView from 'src/components/EmptyView/EmptyStateView';
import NoTransactionIcon from 'src/assets/images/noTransaction.svg';
import TransactionElement from 'src/components/TransactionElement';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { Transaction } from 'src/core/wallets/interfaces';
import { useAppSelector } from 'src/store/hooks';

function TransactionItem({ item, wallet, navigation, index }) {
  return (
    <TransactionElement
      transaction={item}
      index={index}
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

function Transactions({ transactions, setPullRefresh, pullRefresh, currentWallet }) {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const pullDownRefresh = () => {
    setPullRefresh(true);
    dispatch(refreshWallets([currentWallet], { hardRefresh: true }));
    setPullRefresh(false);
  };

  const { walletSyncing } = useAppSelector((state) => state.wallet);
  const syncing = walletSyncing && currentWallet ? !!walletSyncing[currentWallet.id] : false;
  return (
    <FlatList
      testID="list_transactions"
      refreshControl={<RefreshControl onRefresh={pullDownRefresh} refreshing={pullRefresh} />}
      data={transactions}
      renderItem={({ item, index }) => (
        <TransactionItem item={item} navigation={navigation} wallet={currentWallet} index={index} />
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
