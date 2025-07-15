import { CommonActions } from '@react-navigation/native';
import { useQuery } from '@realm/react';
import { Box, useColorMode } from 'native-base';
import React from 'react';
import { FlatList, Pressable } from 'react-native';
import Text from 'src/components/KeeperText';
import ScreenWrapper from 'src/components/ScreenWrapper';
import WalletHeader from 'src/components/WalletHeader';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { CoinLogo } from './Swaps';
import { wp } from 'src/constants/responsive';
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
  const { colorMode } = useColorMode();

  const history = useQuery(RealmSchema.SwapHistory).map(getJSONFromRealmObject);

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.primaryBackground`}>
      <WalletHeader title={'Swap History'} />
      <FlatList
        data={history}
        renderItem={({ item }: { item: SwapHistoryObject }) => (
          <Pressable
            onPress={() =>
              navigation.dispatch(CommonActions.navigate('SwapHistoryDetail', { tnxId: item.id }))
            }
          >
            <Box flexDirection={'row'} gap={wp(4)}>
              {/* Details */}
              <Box flex={0.5}>
                <Text>{item.id}</Text>
                <Text>{getCreatedAt(item.created_at)}</Text>
              </Box>
              {/* Tnx Icons */}
              <Box flexDirection={'row'} justifyContent={'space-between'} flex={0.5}>
                <Box mr={2}>
                  <CoinLogo code={item.coin_from} isLarge={false} />
                  <Text>{item.deposit_amount}</Text>
                </Box>
                <Box>
                  <CoinLogo code={item.coin_to} isLarge={false} />
                  <Text>{item.withdrawal_amount}</Text>
                </Box>
              </Box>
            </Box>
          </Pressable>
        )}
      />
    </ScreenWrapper>
  );
};

const getCreatedAt = (date) => {
  try {
    const d = new Date(date);

    const day = d.getDate();
    const month = d.toLocaleString('default', { month: 'long' });
    const year = String(d.getFullYear()).slice(-2);

    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'

    return `${day} ${month} ${year} . ${hours}:${minutes} ${ampm}`;
  } catch (error) {
    console.log('🚀 ~ getCreatedAt ~ error:', error);
    return '';
  }
};