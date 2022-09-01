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
import Header from 'src/components/Header';
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

const Title = (title, subtitle) => {
  console.log(JSON.stringify(title));
  return (
    <Box flexDirection={'row'} px={'2%'} py={'5%'}>
      <StatusBar barStyle={'light-content'} />
      <VaultIcon />
      <View style={{ flexDirection: 'column', marginLeft: 20 }}>
        <Text fontSize={16} color={'light.headerText'}>
          {title.title}
        </Text>
        <Text color={'light.GreyText'}>{title.subtitle}</Text>
      </View>
    </Box>
  );
};

const renderTransactionElement = ({ item }) => {
  return <TransactionElement transaction={item} />;
};

const TransactionElement = ({ transaction }: { transaction: Transaction }) => {
  const navigation = useNavigation();
  return (
    <Box
      flexDirection={'row'}
      height={getTransactionPadding()}
      borderRadius={10}
      justifyContent={'space-between'}
      alignItems={'center'}
      marginTop={hp(25)}
    >
      <Box flexDirection={'row'} alignItems={'center'} justifyContent={'center'}>
        {transaction.transactionType == 'Received' ? <IconRecieve /> : <IconSent />}
        <Box flexDirection={'column'} marginLeft={1.5}>
          <Text
            color={'light.GreyText'}
            marginX={1}
            fontSize={13}
            fontWeight={200}
            letterSpacing={0.6}
            numberOfLines={1}
            width={wp(125)}
          >
            {transaction?.txid}
          </Text>
          <Text
            color={'light.dateText'}
            marginX={1}
            fontSize={11}
            fontWeight={100}
            letterSpacing={0.5}
            opacity={0.82}
          >
            {transaction.date}
          </Text>
        </Box>
      </Box>
      <Box flexDirection={'row'} justifyContent={'center'} alignItems={'center'}>
        <Box>
          <BtcBlack />
        </Box>
        <Text
          color={'light.textBlack'}
          fontSize={19}
          fontWeight={200}
          letterSpacing={0.95}
          marginX={2}
          marginRight={3}
        >
          {transaction.amount}
        </Text>
        <Box>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('ViewTransactionDetails', {
                transaction: transaction,
              });
            }}
          >
            <IconArrowGrey />
          </TouchableOpacity>
        </Box>
      </Box>
    </Box>
  );
};

const ViewAllTransactions = ({ route }) => {
  const dispatch = useDispatch();
  const navigtaion = useNavigation();
  const { useQuery } = useContext(RealmWrapperContext);
  const [pullRefresh, setPullRefresh] = useState(false);
  const vault: Vault = useQuery(RealmSchema.Vault)
    .map(getJSONFromRealmObject)
    .filter((vault) => !vault.archived)[0];
  const transactions = vault?.specs?.transactions || [];
  const title = route.params.title;
  const subtitle = route.params.subtitle;

  const pullDownRefresh = () => {
    setPullRefresh(true);
    refreshVault();
    setPullRefresh(false);
  };

  const refreshVault = () => {
    dispatch(refreshWallets([vault], { hardRefresh: true }));
  };

  return (
    <Box style={styles.Container} background={'light.ReceiveBackground'}>
      <StatusBarComponent padding={50} />
      <Box>
        <Header
          onPressHandler={() => navigtaion.goBack()}
          headerTitleColor={'light.headerText'}
          fontSize={16}
        />
        <Title title={title} subtitle={subtitle} />
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
