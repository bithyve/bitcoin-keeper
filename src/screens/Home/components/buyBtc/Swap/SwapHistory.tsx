import { CommonActions } from '@react-navigation/native';
import { useQuery } from '@realm/react';
import { Box, useColorMode } from 'native-base';
import React from 'react';
import { FlatList, Pressable, StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import ScreenWrapper from 'src/components/ScreenWrapper';
import WalletHeader from 'src/components/WalletHeader';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';

export const SwapHistory = ({ navigation }) => {
  const { colorMode } = useColorMode();

  const history = useQuery(RealmSchema.SwapHistory).map(getJSONFromRealmObject);

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.primaryBackground`}>
      <WalletHeader title={'Swap History'} />
      <FlatList
        data={history}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              navigation.dispatch(
                CommonActions.navigate('SwapHistoryDetail', { tnxId: item.transaction_id })
              )
            }
          >
            <Box mb={10} p={2} bgColor={'white'}>
              <Text>{`Created : ${getCreatedAt(item.created_at)}`}</Text>
              <Box flexDirection={'row'} justifyContent={'space-between'}>
                <Text>{`Transaction Id ${item.transaction_id}`}</Text>
                <Text>{` ${item.status}`}</Text>
              </Box>
              <Box flexDirection={'row'} justifyContent={'space-between'}>
                <Box>
                  <Text>{`${item.coin_from} ${item.coin_from_name}`} </Text>
                  <Text>{`Network ${item.coin_from_network}`}</Text>
                  <Text>{`Amount ${item.deposit_amount}`}</Text>
                </Box>
                <Box>
                  <Text>{`${item.coin_to} ${item.coin_to_name}`}</Text>
                  <Text>{`Network ${item.coin_to_network}`}</Text>
                  <Text>{`Amount ${parseFloat(item.withdrawal_amount).toFixed(3)}`}</Text>
                </Box>
              </Box>
              <Box flexDirection={'row'} justifyContent={'space-between'}>
                <Text>{item.is_float ? 'Floating' : 'Fixed'}</Text>
                <Text>{`Expires: ${new Date(item.expired_at * 1000).toLocaleString()}`}</Text>
              </Box>
            </Box>
          </Pressable>
        )}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const getCreatedAt = (date) => {
  try {
    return new Date(date).toLocaleString();
  } catch (error) {
    console.log('🚀 ~ getCreatedAt ~ error:', error);
  }
};
