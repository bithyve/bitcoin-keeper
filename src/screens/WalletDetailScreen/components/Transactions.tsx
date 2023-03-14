import { FlatList, RefreshControl } from 'react-native';
import React from 'react';
import { useDispatch } from 'react-redux';
import { refreshWallets } from 'src/store/sagaActions/wallets';
import EmptyStateView from 'src/components/EmptyView/EmptyStateView';
import NoTransactionIcon from 'src/assets/images/noTransaction.svg';
import TransactionElement from 'src/components/TransactionElement';
import { CommonActions, useNavigation } from '@react-navigation/native';

function TransactionItem({ item, navigation }) {
  return (
    <TransactionElement
      transaction={item}
      onPress={() => {
        navigation.dispatch(
          CommonActions.navigate('TransactionDetails', {
            transaction: item,
          })
        );
      }}
    />
  );
}

function Transactions({ transections, setPullRefresh, pullRefresh, currentWallet }) {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const pullDownRefresh = () => {
    setPullRefresh(true);
    dispatch(refreshWallets([currentWallet], { hardRefresh: true }));
    setPullRefresh(false);
  };
  return (
    <FlatList
      refreshControl={<RefreshControl onRefresh={pullDownRefresh} refreshing={pullRefresh} />}
      data={transections}
      renderItem={({ item }) => <TransactionItem item={item} navigation={navigation} />}
      keyExtractor={(item) => item}
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
