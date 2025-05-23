import { FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import React, { useContext, useState } from 'react';
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
import { LocalizationContext } from 'src/context/Localization/LocContext';

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
  const { translations } = useContext(LocalizationContext);
  const { home } = translations;
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
            {home.Transactions}
          </Text>
          {transactions.length ? (
            <TouchableOpacity>
              <HStack alignItems="center">
                <TouchableOpacity
                  onPress={() => {
                    navigation.dispatch(
                      CommonActions.navigate('AllTransactions', {
                        title: home.vaultTransactions,
                        subtitle: home.incommingAndOutgoing,
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
                    {home.viewAll}
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
              title={home.securityTip}
              subTitle={home.securityTipDesc}
            />
          }
        />
      </Box>
    </>
  );
}
export default TransactionsAndUTXOs;
