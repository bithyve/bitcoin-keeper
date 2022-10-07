import { FlatList, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';
import { Box, Pressable, Text } from 'native-base';
import React, { useContext, useRef, useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import Carousel from 'react-native-snap-carousel';
import { RFValue } from 'react-native-responsive-fontsize';
import { Shadow } from 'react-native-shadow-2';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
// icons and images
import AddSCardIcon from 'src/assets/images/svgs/card_add.svg';
import AddWalletIcon from 'src/assets/images/svgs/addWallet_illustration.svg';
import WalletInsideGreen from 'src/assets/images/svgs/Wallet_inside_green.svg';
import Arrow from 'src/assets/images/svgs/arrow_brown.svg';
import BTC from 'src/assets/images/svgs/btc_wallet.svg';
import BtcWallet from 'src/assets/images/svgs/btc_walletCard.svg';
import BackIcon from 'src/assets/images/svgs/back.svg';
import BtcBlack from 'src/assets/images/svgs/btc_black.svg';
import Buy from 'src/assets/images/svgs/icon_buy.svg';
import IconArrowBlack from 'src/assets/images/svgs/icon_arrow_black.svg';
import IconArrowGrey from 'src/assets/images/svgs/icon_arrow_grey.svg';
import IconRecieve from 'src/assets/images/svgs/icon_received.svg';
import IconSent from 'src/assets/images/svgs/icon_sent.svg';
import IconSettings from 'src/assets/images/svgs/icon_settings.svg';
import Send from 'src/assets/images/svgs/send.svg';
import Recieve from 'src/assets/images/svgs/receive.svg';
// data
import { LocalizationContext } from 'src/common/content/LocContext';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import {
  getTransactionPadding,
  hp,
  windowWidth,
  wp,
} from 'src/common/data/responsiveness/responsive';
//components and interfaces and hooks
import StatusBarComponent from 'src/components/StatusBarComponent';
import { Transaction } from 'src/core/wallets/interfaces';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { refreshWallets } from 'src/store/sagaActions/wallets';
import { useAppSelector } from 'src/store/hooks';
import { getAmount } from 'src/common/constants/Bitcoin';

const WalletDetails = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const carasualRef = useRef<Carousel<FlatList>>(null);
  const { useQuery } = useContext(RealmWrapperContext);
  const wallets: Wallet[] = useQuery(RealmSchema.Wallet).map(getJSONFromRealmObject);

  const netBalance = useAppSelector((state) => state.wallet.netBalance);
  const { translations } = useContext(LocalizationContext);
  const wallet = translations['wallet'];

  const [walletIndex, setWalletIndex] = useState<number>(0);
  const [pullRefresh, setPullRefresh] = useState(false);
  const currentWallet = wallets[walletIndex];
  const transections = wallets[walletIndex]?.specs?.transactions || [];

  const _onSnapToItem = (index: number) => {
    setWalletIndex(index);
  };

  const _renderItem = ({ item, index }: { item, index }) => {
    const walletName = item?.presentationData?.name;
    const walletDescription = item?.presentationData?.description;
    const balances = item?.specs?.balances;
    const walletBalance = balances?.confirmed + balances?.unconfirmed;
    const isActive = index === walletIndex

    return (
      <Shadow
        distance={9}
        startColor={'#e4e4e4'}
        offset={[0, 14]}
        viewStyle={{
          height: hp(140),
        }}
      >
        <LinearGradient
          colors={isActive ? ['#00836A', '#073E39'] : ['#06423C', '#06423C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: hp(10),
            width: wp(170),
            height: hp(150),
            position: 'relative',
            marginLeft: 0,
          }}
        >
          {!(item?.presentationData && item?.specs) ? (
            <TouchableOpacity
              style={styles.addWalletContainer}
              onPress={() => navigation.navigate('EnterWalletDetail', wallets.length)}
            >
              <GradientIcon
                Icon={AddSCardIcon}
                height={40}
                gradient={isActive ? ['#FFFFFF', '#80A8A1'] : ['#9BB4AF', '#9BB4AF']}
              />

              <Text
                color={'light.white'}
                fontFamily={'body'}
                fontWeight={'200'}
                fontSize={RFValue(14)}
                marginTop={hp(10)}
              >
                {wallet.AddNewWallet}
              </Text>
            </TouchableOpacity>
          ) : (

            <Box
              marginTop={hp(20)}
              style={{
                marginLeft: wp(20),
              }}
            >
              <GradientIcon
                Icon={WalletInsideGreen}
                height={40}
                gradient={isActive ? ['#FFFFFF', '#80A8A1'] : ['#9BB4AF', '#9BB4AF']}
              />
              <Box>
                <Text
                  marginTop={hp(16)}
                  color={'light.white'}
                  letterSpacing={0.2}
                  fontSize={RFValue(10)}
                  fontWeight={100}
                >
                  {walletDescription}
                </Text>
                <Text
                  color={'light.white'}
                  letterSpacing={0.24}
                  fontSize={RFValue(12)}
                  fontWeight={200}
                >
                  {walletName}
                </Text>
              </Box>
              <Box flexDirection={'row'} alignItems={'center'}>
                <Box marginRight={1}>
                  <BtcWallet />
                </Box>
                <Text
                  color={'light.white'}
                  letterSpacing={1.2}
                  fontSize={hp(24)}
                  fontWeight={200}
                >
                  {getAmount(walletBalance)}
                </Text>
              </Box>
            </Box>
          )}
        </LinearGradient>
      </Shadow>
    );
  };

  const pullDownRefresh = () => {
    setPullRefresh(true);
    dispatch(refreshWallets([currentWallet], { hardRefresh: true }));
    setPullRefresh(false);
  };

  const renderTransactionElement = ({ item }) => {
    return <TransactionElement transaction={item} />;
  };

  const TransactionElement = ({ transaction }: { transaction: Transaction }) => {
    return (
      <Box
        flexDirection={'row'}
        height={getTransactionPadding()}
        borderRadius={10}
        justifyContent={'space-between'}
        alignItems={'center'}
        marginTop={hp(20)}
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
            {getAmount(transaction.amount)}
          </Text>
          <Box>
            <IconArrowGrey />
          </Box>
        </Box>
      </Box>
    );
  };

  const GradientIcon = ({ height, Icon, gradient = ['#9BB4AF', '#9BB4AF'] }) => {
    return (
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          height: hp(height),
          width: hp(height),
          borderRadius: height,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Icon />
      </LinearGradient>
    );
  };

  return (
    <Box
      backgroundColor={'light.lightYellow'}
      flex={1}
      paddingLeft={wp(28)}
      paddingRight={wp(27)}
      paddingTop={hp(30)}
    >
      <StatusBarComponent padding={50} />

      <Pressable
        zIndex={999}
        onPress={() => navigation.goBack()}
        width={5}
        padding={2}
        alignItems={'center'}
      >
        <BackIcon />
      </Pressable>

      <Box
        alignItems={'center'}
      >
        <Text
          color={'light.textWallet'}
          letterSpacing={0.96}
          fontSize={RFValue(16)}
          fontWeight={200}
          marginTop={hp(10)}
        >
          {wallets?.length} Linked Wallets
        </Text>

        <Box flexDirection={'row'} alignItems={'center'} height={10}>
          <Box marginRight={1} marginBottom={-2}>
            <BTC />
          </Box>
          <Text color={'light.textWallet'} letterSpacing={1.5} fontSize={hp(30)} fontWeight={200}>
            {getAmount(netBalance)}
          </Text>
        </Box>
      </Box>

      <Box
        marginTop={18}
        height={hp(180)}
        width={'100%'}
      >
        <Carousel
          onSnapToItem={_onSnapToItem}
          ref={carasualRef}
          data={[...wallets, { isEnd: true }]}
          renderItem={_renderItem}
          sliderWidth={windowWidth}
          itemWidth={wp(170)}
          itemHeight={hp(160)}
          layout={'default'}
          activeSlideAlignment='start'

          inactiveSlideOpacity={1}
        />
      </Box>

      {walletIndex !== wallets.length ? (
        <>
          {/* {Transfer pollicy} */}
          <Box
            height={hp(50)}
            width={'100%'}
            borderRadius={hp(10)}
            backgroundColor={'light.transactionPolicyCard'}
            flexDirection={'row'}
            justifyContent={'space-between'}
            alignItems={'center'}
            style={{ paddingHorizontal: wp(10) }}
          >
            <Box style={{ paddingLeft: wp(10) }}>
              <Text
                color={'light.brownborder'}
                letterSpacing={0.6}
                fontSize={RFValue(12)}
                fontWeight={200}
              >
                Transfer Policy is set at{'  '}<Text fontWeight={'bold'}>0.0001฿</Text>
              </Text>
            </Box>

            <Pressable
              onPress={() => navigation.navigate('SendConfirmation', { isVaultTransfer: true })}
            >
              <Arrow />
            </Pressable>
          </Box>

          {/* {Transactions} */}

          <Box
            flexDirection={'row'}
            justifyContent={'space-between'}
            marginTop={hp(24)}
            width={'100%'}
          >
            <Text
              color={'light.textBlack'}
              marginLeft={wp(3)}
              fontSize={16}
              fontWeight={200}
              letterSpacing={1.28}
            >
              Transactions
            </Text>
            <Box flexDirection={'row'} alignItems={'center'} marginRight={wp(2)}>
              <Text
                color={'light.light'}
                marginRight={1}
                fontSize={11}
                fontWeight={300}
                letterSpacing={0.6}
              >
                View All
              </Text>
              <IconArrowBlack />
            </Box>
          </Box>

          <Box
            marginTop={hp(10)}
            height={hp(250)}
            position={'relative'}
          >
            <FlatList
              refreshControl={
                <RefreshControl onRefresh={pullDownRefresh} refreshing={pullRefresh} />
              }
              data={transections}
              renderItem={renderTransactionElement}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
            />
          </Box>
          <Box
            position={'absolute'}
            bottom={0}
            width={wp(375)}
            paddingX={5}
          >
            <Box
              borderWidth={0.5}
              borderColor={'light.GreyText'}
              borderRadius={20}
              opacity={0.2}
            />
            <Box
              flexDirection={'row'}
              marginTop={4}
              marginBottom={hp(2)}
              justifyContent={'space-between'}
              marginX={10}
            >
              <TouchableOpacity
                style={styles.IconText}
                onPress={() => {
                  navigation.navigate('Send', { wallet: currentWallet });
                }}
              >
                <Send />
                <Text color={'light.lightBlack'} fontSize={12} letterSpacing={0.84} marginY={2.5}>
                  Send
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.IconText}
                onPress={() => {
                  navigation.navigate('Receive', { wallet: currentWallet });
                }}
              >
                <Recieve />
                <Text color={'light.lightBlack'} fontSize={12} letterSpacing={0.84} marginY={2.5}>
                  Recieve
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.IconText}>
                <Buy />
                <Text color={'light.lightBlack'} fontSize={12} letterSpacing={0.84} marginY={2.5}>
                  Buy
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.IconText}
                onPress={() => {
                  navigation.navigate('WalletSettings', { wallet: currentWallet });
                  // navigation.navigate('ExportSeed', {
                  //   seed: currentWallet?.derivationDetails?.mnemonic,
                  // });
                }}
              >
                <IconSettings />
                <Text color={'light.lightBlack'} fontSize={12} letterSpacing={0.84} marginY={2.5}>
                  Settings
                </Text>
              </TouchableOpacity>
            </Box>
          </Box>
        </>
      ) : (
        <Box justifyContent={'center'} alignItems={'center'} flex={1}>
          <AddWalletIcon />
          <Text
            color={'light.lightBlack'}
            fontSize={12}
            letterSpacing={0.6}
            marginY={5}
            marginX={8}
            opacity={0.85}
            noOfLines={2}
            fontWeight={100}
          >
            Add a new wallet or import one
          </Text>
        </Box>
      )}
    </Box>
  );
};

const styles = StyleSheet.create({
  IconText: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  addWalletContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
});
export default WalletDetails;
