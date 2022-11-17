import { Box } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import {
  FlatList,
  RefreshControl,
} from 'react-native';
import React, { useContext, useState } from 'react';
import { hp } from 'src/common/data/responsiveness/responsive';

import HeaderTitle from 'src/components/HeaderTitle';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { ScaledSheet } from 'react-native-size-matters';
import StatusBarComponent from 'src/components/StatusBarComponent';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { refreshWallets } from 'src/store/sagaActions/wallets';
import { useDispatch } from 'react-redux';
import TransactionElement from 'src/components/TransactionElement';

const ViewAllTransactions = ({ route }) => {
  const dispatch = useDispatch();
  const navigtaion = useNavigation();
  const { useQuery } = useContext(RealmWrapperContext);
  const [pullRefresh, setPullRefresh] = useState(false);
  const vault: Vault = useQuery(RealmSchema.Vault)
    .map(getJSONFromRealmObject)
    .filter((vault) => !vault.archived)[0];
  const transactions = vault?.specs?.transactions || [];
  const title = route?.params?.title;
  const subtitle = route?.params?.subtitle;

  const pullDownRefresh = () => {
    setPullRefresh(true);
    refreshVault();
    setPullRefresh(false);
  };

  const refreshVault = () => {
    dispatch(refreshWallets([vault], { hardRefresh: true }));
  };

  const renderTransactionElement = ({ item }) => {
    return (
      <TransactionElement
        transaction={item}
        onPress={() => {
          navigtaion.navigate('TransactionDetails', {
            transaction: item,
          });
        }} />
    )
  };

  return (
    <Box style={styles.Container} background={'light.ReceiveBackground'}>
      <StatusBarComponent padding={50} />
      <Box>
        <HeaderTitle
          onPressHandler={() => navigtaion.goBack()}
          headerTitleColor={'light.headerText'}
          titleFontSize={16}
          paddingTop={hp(5)}
          title={title}
          subtitle={subtitle}
        />
      </Box>
      <FlatList
        style={{ height: '75%' }}
        refreshControl={<RefreshControl onRefresh={pullDownRefresh} refreshing={pullRefresh} />}
        data={transactions}
        renderItem={renderTransactionElement}
        keyExtractor={(item) => item}
        showsVerticalScrollIndicator={false}
      />
    </Box>
  );
};

const styles = ScaledSheet.create({
  Container: {
    flex: 1,
    padding: '20@s',
    position: 'relative',
  },
});
export default ViewAllTransactions;
