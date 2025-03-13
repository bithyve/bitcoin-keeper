import { FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { CommonActions, useNavigation } from '@react-navigation/native';
import TransactionElement from 'src/components/TransactionElement';
import { Vault } from 'src/services/wallets/interfaces/vault';
import { Box, HStack, VStack } from 'native-base';
import { refreshWallets } from 'src/store/sagaActions/wallets';
import EmptyStateView from 'src/components/EmptyView/EmptyStateView';
import NoVaultTransactionIcon from 'src/assets/images/emptystate.svg';
import IconArrowBlack from 'src/assets/images/icon_arrow_black.svg';
import { useDispatch } from 'react-redux';
import Text from 'src/components/KeeperText';
import { windowHeight, wp } from 'src/constants/responsive';
import { EntityKind } from 'src/services/wallets/enums';

function TransactionsAndUTXOs({
  transactions,
  vault,
  autoRefresh,
}: {
  vault: Vault;
  transactions: any[];
  autoRefresh: boolean;
}) {
  const { colorMode } = useColorMode();
  const [pullRefresh, setPullRefresh] = useState(false);
  const dispatch = useDispatch();
  const syncVault = () => {
    setPullRefresh(true);
    dispatch(refreshWallets([vault], { hardRefresh: true }));
    setPullRefresh(false);
  };

  const navigation = useNavigation();
  const renderTransactionElement = ({ item }) => (
    <TransactionElement
      transaction={item}
      wallet={vault}
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
          <Text
            color={`${colorMode}.textBlack`}
            marginLeft={wp(3)}
            fontSize={16}
            letterSpacing={1.28}
          >
            Transactions
          </Text>
          {transactions.length ? (
            <TouchableOpacity>
              <HStack alignItems="center">
                <TouchableOpacity
                  onPress={() => {
                    navigation.dispatch(
                      CommonActions.navigate('AllTransactions', {
                        title: 'Vault Transactions',
                        subtitle: 'All incoming and outgoing transactions',
                        entityKind: EntityKind.VAULT,
                      })
                    );
                  }}
                >
                  <Text
                    color={`${colorMode}.primaryGreen`}
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
          ) : null}
        </HStack>
      </VStack>
      <Box>
        <FlatList
          style={{
            height: windowHeight > 670 ? '52%' : '31%',
          }}
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
        />
      </Box>
    </>
  );
}
export default TransactionsAndUTXOs;
