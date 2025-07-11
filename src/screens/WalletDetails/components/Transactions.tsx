import { FlatList, RefreshControl } from 'react-native';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { refreshWallets } from 'src/store/sagaActions/wallets';
import EmptyStateView from 'src/components/EmptyView/EmptyStateView';
import NoTransactionIcon from 'src/assets/images/noTransaction.svg';
import TransactionElement from 'src/components/TransactionElement';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { Transaction } from 'src/services/wallets/interfaces';
import { useAppSelector } from 'src/store/hooks';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { EntityKind } from 'src/services/wallets/enums';
import { useUSDTWallets } from 'src/hooks/useUSDTWallets';
import { captureError } from 'src/services/sentry';
import { USDTTransaction } from 'src/services/wallets/operations/dollars/USDT';

function TransactionItem({ item, wallet, navigation, index }) {
  return (
    <TransactionElement
      transaction={item}
      wallet={wallet}
      index={index}
      isCached={item?.isCached}
      onPress={
        wallet?.entityKind === EntityKind.USDT_WALLET
          ? () => {
              navigation.dispatch(
                CommonActions.navigate('usdtTransactionDetail', {
                  transaction: item,
                  wallet,
                })
              );
            }
          : !item?.isCached
          ? () => {
              navigation.dispatch(
                CommonActions.navigate('TransactionDetails', {
                  transaction: item,
                  wallet,
                })
              );
            }
          : () => {}
      }
    />
  );
}

function Transactions({
  transactions,
  setPullRefresh,
  pullRefresh,
  currentWallet,
  setInitialLoading,
}) {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const { syncWallet } = useUSDTWallets();
  const sortedTransactions = useMemo(
    () =>
      [...transactions]
        .sort((a, b) => {
          // Sort unconfirmed transactions first
          if (a.confirmations === 0 && b.confirmations !== 0) return -1;
          if (a.confirmations !== 0 && b.confirmations === 0) return 1;

          // Then sort by date
          if (!a.date && !b.date) return 0;
          if (!a.date) return -1;
          if (!b.date) return 1;
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        })
        .slice(0, 5) || [],
    [transactions]
  );

  const pullDownRefresh = async () => {
    setInitialLoading(true);
    try {
      if (currentWallet.entityKind === EntityKind.USDT_WALLET) {
        await syncWallet(currentWallet);
      } else dispatch(refreshWallets([currentWallet], { hardRefresh: true }));
    } catch (error) {
      captureError(error);
    } finally {
      setPullRefresh(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    if (currentWallet.entityKind === EntityKind.USDT_WALLET) {
      pullDownRefresh(); // Bitcoin wallets/vaults have a prop-based `autoRefresh` sync mechanism; however USDT wallets do not, so we need to manually trigger a sync when the component mounts
    }
  }, []);

  const { walletSyncing } = useAppSelector((state) => state.wallet);
  const syncing = walletSyncing && currentWallet ? !!walletSyncing[currentWallet.id] : false;

  return (
    <FlatList
      testID="list_transactions"
      refreshControl={<RefreshControl onRefresh={pullDownRefresh} refreshing={pullRefresh} />}
      data={sortedTransactions}
      renderItem={({ item, index }) => {
        return (
          <TransactionItem
            item={item}
            navigation={navigation}
            wallet={currentWallet}
            index={index}
          />
        );
      }}
      refreshing={syncing}
      keyExtractor={(item: Transaction | USDTTransaction) => {
        if ((item as USDTTransaction).txId || (item as USDTTransaction).traceId) {
          return `${(item as USDTTransaction).txId || (item as USDTTransaction).traceId}`;
        } else return `${(item as Transaction).txid}${(item as Transaction).transactionType}`;
      }}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyStateView IllustartionImage={NoTransactionIcon} title={common.noTransYet} />
      }
    />
  );
}

export default Transactions;
