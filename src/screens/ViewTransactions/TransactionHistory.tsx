import { FlatList, RefreshControl, StatusBar, StyleSheet } from 'react-native';
import { Box, useColorMode } from 'native-base';
import React, { useContext, useMemo, useState } from 'react';
import { hp, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';

import { Wallet } from 'src/services/wallets/interfaces/wallet';
import { CommonActions, useNavigation } from '@react-navigation/native';
import TransactionElement from 'src/components/TransactionElement';
import EmptyStateView from 'src/components/EmptyView/EmptyStateView';
import NoTransactionIcon from 'src/assets/images/noTransaction.svg';
import { refreshWallets } from 'src/store/sagaActions/wallets';
import { useDispatch } from 'react-redux';
import { setStateFromSnapshot } from 'src/store/reducers/send_and_receive';
import CurrencyTypeSwitch from 'src/components/Switch/CurrencyTypeSwitch';
import WalletHeader from 'src/components/WalletHeader';

function TransactionHistory({ route }) {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { common, transactions: transactionsText } = translations;
  const { wallet }: { wallet: Wallet } = route.params;
  const [pullRefresh, setPullRefresh] = useState(false);
  const dispatch = useDispatch();
  const transactions = useMemo(
    () =>
      [...(wallet?.specs?.transactions || [])].sort((a, b) => {
        // Sort unconfirmed transactions first
        if (a.confirmations === 0 && b.confirmations !== 0) return -1;
        if (a.confirmations !== 0 && b.confirmations === 0) return 1;

        // Then sort by date
        if (!a.date && !b.date) return 0;
        if (!a.date) return -1;
        if (!b.date) return 1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }),
    [wallet?.specs?.transactions]
  );

  const renderTransactionElement = ({ item }) => (
    <TransactionElement
      transaction={item}
      wallet={wallet}
      isCached={item?.isCached}
      onPress={() => {
        if (item?.isCached) {
          dispatch(setStateFromSnapshot(item.snapshot.state));
          navigation.dispatch(
            CommonActions.navigate('SendConfirmation', {
              ...item.snapshot.routeParams,
            })
          );
        } else {
          navigation.dispatch(
            CommonActions.navigate('TransactionDetails', {
              transaction: item,
              wallet: wallet,
            })
          );
        }
      }}
    />
  );

  const pullDownRefresh = () => {
    setPullRefresh(true);
    dispatch(refreshWallets([wallet], { hardRefresh: true }));
    setPullRefresh(false);
  };

  return (
    <Box safeAreaTop backgroundColor={`${colorMode}.primaryBackground`} style={styles.wrapper}>
      <StatusBar
        barStyle={colorMode === 'light' ? 'dark-content' : 'light-content'}
        backgroundColor="transparent"
      />
      <Box style={styles.topSection}>
        <WalletHeader
          title={transactionsText.transactionHistory}
          rightComponent={<CurrencyTypeSwitch />}
        />
      </Box>
      <Box style={styles.bottomSection} backgroundColor={`${colorMode}.boxSecondaryBackground`}>
        <Box style={styles.transactionList}>
          <FlatList
            testID="view_TransactionList"
            refreshControl={<RefreshControl onRefresh={pullDownRefresh} refreshing={pullRefresh} />}
            data={transactions}
            renderItem={renderTransactionElement}
            keyExtractor={(item) => item.txid}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainerStyle}
            ListEmptyComponent={
              <EmptyStateView IllustartionImage={NoTransactionIcon} title={common.noTransYet} />
            }
          />
        </Box>
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  topSection: {
    paddingTop: hp(20),
    paddingHorizontal: wp(20),
    paddingBottom: hp(30),
  },
  bottomSection: {
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    flex: 1,
    paddingTop: hp(10),
  },
  transactionList: {
    paddingLeft: wp(22),
    paddingRight: wp(26),
  },
  contentContainerStyle: {
    paddingBottom: hp(100),
  },
});
export default TransactionHistory;
