import { CommonActions } from '@react-navigation/native';
import { useQuery } from '@realm/react';
import { Box } from 'native-base';
import React from 'react';
import { FlatList, Pressable } from 'react-native';
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
  return (
    <FlatList
      data={history.reverse()}
      renderItem={({ item }: { item: SwapHistoryObject }) => (
        <Pressable
          style={{
            paddingHorizontal: 4,
            paddingVertical: 7,
          }}
          onPress={() =>
            navigation.dispatch(
              CommonActions.navigate('SwapHistoryDetail', {
                tnxId: item.id,
                createdAt: moment(item.created_at)?.format('DD MMM YY  .  HH:mm A'),
              })
            )
          }
        >
          <Box flexDirection={'row'} gap={wp(4)}>
            {/* Details */}
            <Box flex={0.5}>
              <Text>{item.id}</Text>
              <Text>{moment(item.created_at)?.format('DD MMM YY  .  HH:mm A')}</Text>
            </Box>
            {/* Tnx Icons */}
            <Box flexDirection={'row'} justifyContent={'space-between'} flex={0.5}>
              <Box mr={2}>
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
  );
};
