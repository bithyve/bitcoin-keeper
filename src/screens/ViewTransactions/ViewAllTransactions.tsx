import { Box, HStack, Text, VStack } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import {
  FlatList,
  InteractionManager,
  Platform,
  RefreshControl,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { getTransactionPadding, hp, wp } from 'src/common/data/responsiveness/responsive';

import BtcBlack from 'src/assets/images/svgs/btc_black.svg';
import HeaderTitle from 'src/components/HeaderTitle';
import IconArrowGrey from 'src/assets/images/svgs/icon_arrow_grey.svg';
import IconRecieve from 'src/assets/images/svgs/icon_received.svg';
import IconSent from 'src/assets/images/svgs/icon_sent.svg';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { ScaledSheet } from 'react-native-size-matters';
import StatusBarComponent from 'src/components/StatusBarComponent';
import { Transaction } from 'src/core/wallets/interfaces';
import { Vault } from 'src/core/wallets/interfaces/vault';
import VaultIcon from 'src/assets/images/icon_vault.svg';
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
