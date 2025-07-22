import { CommonActions } from '@react-navigation/native';
import { useQuery } from '@realm/react';
import { Box, Pressable, useColorMode } from 'native-base';
import React from 'react';
import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import Text from 'src/components/KeeperText';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { wp } from 'src/constants/responsive';
import moment from 'moment';
import SwapTransactionCard from './component/SwapTransactionCard';
import { getStatus } from './component/Constant';

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
  const reversedHistory = history.slice().reverse().slice(0, 3);
  const { colorMode } = useColorMode();

  return (
    <Box style={styles.container}>
      <Box style={styles.headerContainer}>
        <Text>History</Text>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('SwapAllHistory');
          }}
        >
          <Text medium color={`${colorMode}.textGreen`}>
            View All
          </Text>
        </TouchableOpacity>
      </Box>

      {reversedHistory.length === 0 ? (
        <Box style={styles.emptyContainer}>
          <Text color={`${colorMode}.primaryText`}>You have no transactions yet</Text>
        </Box>
      ) : (
        <FlatList
          data={reversedHistory}
          keyExtractor={(item) => item.id}
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
