import { FlatList, RefreshControl } from 'react-native';
import React from 'react';
import { useDispatch } from 'react-redux';
import { refreshWallets } from 'src/store/sagaActions/wallets';
import EmptyStateView from 'src/components/EmptyView/EmptyStateView';
import NoTransactionIcon from 'src/assets/images/noTransaction.svg';
import TransactionElement from 'src/components/TransactionElement';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { Transaction } from 'src/core/wallets/interfaces';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';

function TransactionItem({ item, wallet, navigation }) {
  const { showToast } = useToastMessage();
  return (
    <TransactionElement
      transaction={item}
      onPress={() => {
        if (item.confirmations === 0) {
          showToast('Please wait for a confirmation to "Initiate Premix". For confirmation ETA, click on the transaction > Transaction ID', <ToastErrorIcon />);
        }
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
  return (
    <FlatList
      refreshControl={<RefreshControl onRefresh={pullDownRefresh} refreshing={pullRefresh} />}
      data={transactions}
      renderItem={({ item }) => (
        <TransactionItem item={item} navigation={navigation} wallet={currentWallet} />
      )}
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
