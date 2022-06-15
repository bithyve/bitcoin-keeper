import React, { useState, useContext } from 'react';
import { StyleSheet, ImageBackground, TouchableOpacity, RefreshControl } from 'react-native';
import { Box, Text, Pressable } from 'native-base';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
// icons, images and functions
import IconArrowBlack from 'src/assets/images/svgs/icon_arrow_black.svg';
import IconArrowGrey from 'src/assets/images/svgs/icon_arrow_grey.svg';
import IconRecieve from 'src/assets/images/svgs/transaction_income.svg';
// import IconSent from 'src/assets/images/svgs/transaction_sent.svg';
import Recieve from 'src/assets/images/svgs/recieve.svg';
import Send from 'src/assets/images/svgs/send.svg';
import More from 'src/assets/images/svgs/more.svg';

import BackIcon from 'src/assets/images/svgs/back_white.svg';
import SettingIcon from 'src/assets/images/svgs/settings.svg';
import Icon from 'src/assets/images/svgs/seedsigner.svg';
import Btc from 'src/assets/images/svgs/btc.svg';
import WalletIcon from 'src/assets/images/svgs/wallet.svg';

import BtcBlack from 'src/assets/images/svgs/btc_black.svg';
import BtcSmall from 'src/assets/images/svgs/btc_small.svg';
import {
  getAccountCardHeight,
  getTransactionPadding,
  windowHeight,
} from 'src/common/data/responsiveness/responsive';
import BaseCardWallet from 'src/assets/images/basecard_wallet.png';
import { Transaction, Wallet } from 'src/core/wallets/interfaces/interface';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { refreshWallets } from 'src/store/sagaActions/wallets';
import { FlatList } from 'react-native-gesture-handler';
import { RealmContext } from 'src/storage/realm/RealmProvider';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { LocalizationContext } from 'src/common/content/LocContext';

const TransactionElement = ({ transaction }: { transaction: Transaction }) => {
  return (
    <Box
      flexDirection={'row'}
      height={getTransactionPadding()}
      borderRadius={10}
      justifyContent={'space-between'}
      alignItems={'center'}
      marginY={windowHeight >= 850 ? '3%' : '2.4%'}
    >
      <Box flexDirection={'row'} alignItems={'center'} justifyContent={'center'}>
        <IconRecieve />
        <Box flexDirection={'column'} marginLeft={1.5}>
          <Text
            color={'light.GreyText'}
            marginX={1}
            fontSize={13}
            fontWeight={200}
            letterSpacing={0.6}
          >
            {transaction.txid}
          </Text>
          <Text
            color={'light.dateText'}
            marginX={1}
            fontSize={11}
            fontWeight={100}
            letterSpacing={0.5}
            opacity={0.82}
            marginY={windowHeight >= 850 ? '3%' : '2.4%'}
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
          <IconArrowGrey />
        </Box>
      </Box>
    </Box>
  );
};

const WalletDetailScreen = ({ route }) => {
  const { useObject } = RealmContext;
  const wallet: Wallet = getJSONFromRealmObject(
    useObject(RealmSchema.Wallet, route.params.walletId)
  );

  const { walletName, walletDescription } = wallet.presentationData;
  const { balances, transactions } = wallet.specs;
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [pullRefresh, setPullRefresh] = useState(false);
  
  const { translations } = useContext( LocalizationContext )
  const common = translations[ 'common' ]
  const home = translations [ 'home' ]

  const pullDownRefresh = () => {
    setPullRefresh(true);
    dispatch(refreshWallets([wallet], {}));
    setPullRefresh(false);
  };
  const renderTransactionElement = ({ item }) => {
    return <TransactionElement transaction={item} />;
  };

  return (
    <Box>
      <ImageBackground source={BaseCardWallet} style={styles.cardImageContainer}>
        <Box style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => {
              navigation.goBack();
            }}
          >
            <BackIcon />
          </TouchableOpacity>
          <TouchableOpacity>
            <SettingIcon />
          </TouchableOpacity>
        </Box>
        <Box
          flexDirection={'row'}
          height={70}
          borderRadius={10}
          justifyContent={'space-between'}
          alignItems={'center'}
          paddingX={2}
          marginX={5}
          marginTop={'4%'}
        >
          <Box flexDirection={'row'} alignItems={'center'}>
            <WalletIcon />
            <Box flexDirection={'column'} marginLeft={2}>
              <Text
                color={'light.textLight'}
                marginX={1}
                fontSize={16}
                fontWeight={200}
                letterSpacing={0.32}
              >
                {walletName}
              </Text>
              <Text
                color={'light.textLight'}
                marginX={1}
                fontSize={12}
                fontWeight={100}
                letterSpacing={0.24}
              >
                {walletDescription}
              </Text>
            </Box>
          </Box>
          <Pressable
            backgroundColor={'light.KnowMoreButton'}
            borderRadius={6}
            padding={1}
            borderColor={'light.textLight'}
            borderWidth={'.5'}
          >
            <Text
              color={'light.textLight'}
              marginX={1}
              fontSize={12}
              fontWeight={200}
              letterSpacing={0.6}
            >
             {common.knowMore}
            </Text>
          </Pressable>
        </Box>

        <Box
          flexDirection={'row'}
          height={70}
          borderRadius={10}
          justifyContent={'space-between'}
          alignItems={'center'}
          paddingX={3}
          marginX={5}
          marginTop={'2%'}
        >
          <Box flexDirection={'row'} alignItems={'center'}>
            <Text color={'light.textLight'} fontSize={26} fontWeight={200} letterSpacing={1.3}>
              <Box
                alignItems={'center'}
                justifyContent={'flex-end'}
                paddingBottom={1}
                marginRight={2}
              >
                <Btc />
              </Box>
              {balances.confirmed + balances.unconfirmed}
            </Text>
          </Box>

          <Box flexDirection={'column'} marginLeft={2} alignItems={'flex-end'}>
            <Text
              color={'light.textLight'}
              marginX={1}
              fontSize={12}
              fontWeight={200}
              letterSpacing={0.24}
            >
              {home.availableToSpend}
            </Text>
            <Text
              color={'light.textLight'}
              marginX={1}
              fontSize={14}
              fontWeight={200}
              letterSpacing={1.4}
            >
              <Box marginRight={1}>
                <BtcSmall />
              </Box>
              {balances.confirmed}
            </Text>
          </Box>
        </Box>
      </ImageBackground>

      <Box
        marginTop={getAccountCardHeight()}
        paddingX={7}
        height={'100%'}
        width={'100%'}
        backgroundColor={'light.ReceiveBackground'}
        borderRadius={20}
      >
        <Box flexDirection={'row'} justifyContent={'space-between'} marginTop={5}>
          <Text
            color={'light.textBlack'}
            marginX={1}
            fontSize={16}
            fontWeight={200}
            letterSpacing={1.28}
          >
            {home.Transactions}
          </Text>
          <Box flexDirection={'row'} alignItems={'center'} justifyContent={'space-between'}>
            <Text
              color={'light.light'}
              marginX={1}
              fontSize={11}
              fontWeight={300}
              letterSpacing={0.6}
            >
              {home.ViewAll}
            </Text>
            <IconArrowBlack />
          </Box>
        </Box>

        {/* <Box marginTop={5}>
          {transactions.forEach((tx) => (
            <TransactionElement transaction={tx} />
          ))}
        </Box> */}
        <Box
          flex={windowHeight >= 850 ? '0.45' : windowHeight >= 750 ? '0.4' : '0.42'}
          marginTop={13}
        >
          <FlatList
            refreshControl={<RefreshControl onRefresh={pullDownRefresh} refreshing={pullRefresh} />}
            data={transactions}
            renderItem={renderTransactionElement}
            keyExtractor={(item) => item}
            showsVerticalScrollIndicator={false}
          />
        </Box>
        <Box
          borderWidth={0.5}
          borderColor={'light.GreyText'}
          borderRadius={20}
          opacity={0.2}
          marginTop={2}
        />

        <Box flexDirection={'row'} marginTop={2} justifyContent={'space-between'} marginX={10}>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('Send', { wallet });
            }}
            style={styles.IconText}
          >
            <Send />
            <Text color={'light.lightBlack'} fontSize={12} letterSpacing={0.84} marginY={2.5}>
              {common.send}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('Receive', { wallet });
            }}
            style={styles.IconText}
          >
            <Recieve />
            <Text color={'light.lightBlack'} fontSize={12} letterSpacing={0.84} marginY={2.5}>
              {common.receive}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('Receive', { wallet });
            }}
            style={styles.IconText}
          >
            <More />
            <Text color={'light.lightBlack'} fontSize={12} letterSpacing={0.84} marginY={2.5}>
              {common.More}
            </Text>
          </TouchableOpacity>
        </Box>
      </Box>
    </Box>
  );
};

const styles = StyleSheet.create({
  cardImageContainer: {
    width: '100%',
    height: 450,
    marginTop: -70,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: hp(16),
    paddingHorizontal: wp(7),
  },
  IconText: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default WalletDetailScreen;
