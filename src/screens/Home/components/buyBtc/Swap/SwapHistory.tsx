import { CommonActions } from '@react-navigation/native';
import { useQuery } from '@realm/react';
import { Box, Pressable, useColorMode } from 'native-base';
import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { CoinLogo } from './Swaps';
import { wp } from 'src/constants/responsive';
import moment from 'moment';

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

export const SwapHistory = ({ navigation }) => {
  const history = useQuery(RealmSchema.SwapHistory).map(getJSONFromRealmObject);
  const reversedHistory = history.slice().reverse();
  const { colorMode } = useColorMode();

  return (
    <Box style={styles.container}>
      {/* Header */}
      <Box style={styles.headerContainer}>
        <Text>History</Text>
        <Pressable onPress={() => {}}>
          <Text>View All</Text>
        </Pressable>
      </Box>

      {/* Content */}
      {reversedHistory.length === 0 ? (
        <Box style={styles.emptyContainer}>
          <Text color={`${colorMode}.primaryText`}>You have no transactions yet</Text>
        </Box>
      ) : (
        <FlatList
          data={reversedHistory}
          keyExtractor={(item) => item.id}
          renderItem={({ item }: { item: SwapHistoryObject }) => (
            <Pressable
              style={styles.listItem}
              onPress={() =>
                navigation.dispatch(
                  CommonActions.navigate('SwapHistoryDetail', {
                    tnxId: item.id,
                    createdAt: moment(item.created_at).format('DD MMM YY  .  HH:mm A'),
                  })
                )
              }
            >
              <Box flexDirection="row">
                {/* Details */}
                <Box flex={0.5}>
                  <Text>{item.id}</Text>
                  <Text>{moment(item.created_at).format('DD MMM YY  .  HH:mm A')}</Text>
                </Box>

                {/* Tnx Icons */}
                <Box flexDirection="row" justifyContent="space-between" flex={0.5}>
                  <Box style={styles.coinBox}>
                    <CoinLogo
                      code={item.coin_from}
                      logoWidth={wp(7.5)}
                      logoHeight={wp(9.5)}
                      CircleWidth={wp(15)}
                    />
                    <Text>{item.deposit_amount}</Text>
                  </Box>
                  <Box>
                    <CoinLogo
                      code={item.coin_to}
                      logoWidth={wp(7.5)}
                      logoHeight={wp(9.5)}
                      CircleWidth={wp(15)}
                    />
                    <Text>{item.withdrawal_amount}</Text>
                  </Box>
                </Box>
              </Box>
            </Pressable>
          )}
        />
      )}
    </Box>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: wp(20),
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
