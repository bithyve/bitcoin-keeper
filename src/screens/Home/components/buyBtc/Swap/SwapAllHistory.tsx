import { CommonActions } from '@react-navigation/native';
import { useQuery } from '@realm/react';
import { Box, useColorMode } from 'native-base';
import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import moment from 'moment';
import SwapTransactionCard from './component/SwapTransactionCard';
import { getStatus } from './component/Constant';
import WalletHeader from 'src/components/WalletHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';

export interface SwapHistoryObject {
  coin_from: string;
  coin_from_name: string;
  coin_from_network: string;
  coin_to: string;
  coin_to_name: string;
  coin_to_network: string;
  created_at: number;
  deposit_amount: string;
  expired_at: number;
  is_float: boolean;
  status: string;
  id: string;
  withdrawal_amount: string;
}

export const SwapAllHistory = ({ navigation }) => {
  const history = useQuery(RealmSchema.SwapHistory).map(getJSONFromRealmObject);
  const reversedHistory = history.slice().reverse();
  const { colorMode } = useColorMode();

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.primaryBackground`}>
      <Box style={styles.container}>
        <WalletHeader title="Swap History" />
        {reversedHistory.length === 0 ? (
          <Box style={styles.emptyContainer}>
            <Text color={`${colorMode}.primaryText`}>You have no transactions yet</Text>
          </Box>
        ) : (
          <FlatList
            data={reversedHistory}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }: { item: SwapHistoryObject }) => (
              <>
                <SwapTransactionCard
                  history={item}
                  status={getStatus(item.status)}
                  onPress={() =>
                    navigation.dispatch(
                      CommonActions.navigate('SwapHistoryDetail', {
                        tnxId: item.id,
                        createdAt: moment(item.created_at).format('DD MMM YY  .  HH:mm A'),
                      })
                    )
                  }
                />
              </>
            )}
          />
        )}
      </Box>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 150,
  },
  listItem: {
    paddingVertical: 7,
  },
  coinBox: {
    marginRight: 8,
  },
});
