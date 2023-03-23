import { FlatList, RefreshControl } from 'react-native';
import React, { useEffect, useState } from 'react';
import { CommonActions, useNavigation } from '@react-navigation/native';
import TransactionElement from 'src/components/TransactionElement';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { HStack, VStack } from 'native-base';
import { refreshWallets } from 'src/store/sagaActions/wallets';
import EmptyStateView from 'src/components/EmptyView/EmptyStateView';
import NoVaultTransactionIcon from 'src/assets/images/emptystate.svg';
import { useDispatch } from 'react-redux';
import UTXOList from 'src/components/UTXOsComponents/UTXOList';

function TransactionsAndUTXOs({
  tab,
  transactions,
  vault,
  autoRefresh,
  utxoState,
  selectedUTXOMap,
  setSelectedUTXOMap,
  selectionTotal,
  enableSelection,
  setSelectionTotal
}: {
  tab: string;
  vault: Vault;
  transactions: any[];
  autoRefresh: boolean;
  utxoState: any
  selectedUTXOMap: any;
  setSelectedUTXOMap: any;
  selectionTotal: any;
  enableSelection: boolean;
  setSelectionTotal: any;
}) {
  const [pullRefresh, setPullRefresh] = useState(false);
  const dispatch = useDispatch();
  const syncVault = () => {
    setPullRefresh(true);
    dispatch(refreshWallets([vault], { hardRefresh: true }));
    setPullRefresh(false);
  };

  useEffect(() => {
    if (autoRefresh) syncVault();
  }, [autoRefresh]);

  const navigation = useNavigation();
  const renderTransactionElement = ({ item }) => (
    <TransactionElement
      transaction={item}
      onPress={() => {
        navigation.dispatch(
          CommonActions.navigate('TransactionDetails', {
            transaction: item,
            wallet: vault,
          })
        );
      }}
    />
  );
  return (
    <>
      <VStack>
        <HStack justifyContent="space-between">
          {/* <Text color="light.textBlack" marginLeft={wp(3)} fontSize={16} letterSpacing={1.28}>
            Transactions
          </Text> */}
          {/* {transactions.length ? (
            <TouchableOpacity>
              <HStack alignItems="center">
                <TouchableOpacity
                  onPress={() => {
                    navigation.dispatch(
                      CommonActions.navigate('VaultTransactions', {
                        title: 'Vault Transactions',
                        subtitle: 'All incoming and outgoing transactions',
                      })
                    );
                  }}
                >
                  <Text
                    color="light.primaryGreen"
                    marginRight={2}
                    fontSize={11}
                    bold
                    letterSpacing={0.6}
                  >
                    View All
                  </Text>
                </TouchableOpacity>
                <IconArrowBlack />
              </HStack>
            </TouchableOpacity>
          ) : null} */}
        </HStack>
      </VStack>
      {tab === 'Transactions' ? (<FlatList
        refreshControl={<RefreshControl onRefresh={syncVault} refreshing={pullRefresh} />}
        data={transactions}
        renderItem={renderTransactionElement}
        keyExtractor={(item) => item}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyStateView
            IllustartionImage={NoVaultTransactionIcon}
            title="Security Tip"
            subTitle="Recreate the multisig on more coordinators. Receive a small amount and send a part of it. Check the balances are appropriately reflected across all the coordinators after each step."
          />
        }
      />) :
        <UTXOList
          utxoState={utxoState}
          enableSelection={enableSelection}
          setSelectionTotal={setSelectionTotal}
          selectedUTXOMap={selectedUTXOMap}
          setSelectedUTXOMap={setSelectedUTXOMap}
          currentWallet={vault}
          emptyIcon={NoVaultTransactionIcon}
        />}
    </>
  );
}
export default TransactionsAndUTXOs;
