// libraries
import { Box, Pressable, Text, View } from 'native-base';
import { FlatList, ScrollView, TextInput } from 'react-native';
import { KeyboardAvoidingView, Platform } from 'react-native';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { hp, wp } from 'src/common/data/responsiveness/responsive';

import BlueWallet from 'src/assets/icons/bluewallet.svg';
// Colors, Images, svgs
import Colors from 'src/theme/Colors';
import Header from 'src/components/Header';
import IconWallet from 'src/assets/images/svgs/icon_wallet.svg';
import InfoBox from 'src/components/InfoBox';
import { LocalizationContext } from 'src/common/content/LocContext';
import { PaymentInfoKind } from 'src/core/wallets/enums';
import { RFValue } from 'react-native-responsive-fontsize';
import { RNCamera } from 'react-native-camera';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { ScaledSheet } from 'react-native-size-matters';
// components
import StatusBarComponent from 'src/components/StatusBarComponent';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import WalletUtilities from 'src/core/wallets/operations/utils';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { getNextFreeAddress } from 'src/store/sagas/send_and_receive';
import { sendPhasesReset } from 'src/store/reducers/send_and_receive';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { widthPercentageToDP } from 'react-native-responsive-screen';

const SendScreen = ({ route }) => {
  const cameraRef = useRef<RNCamera>();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const wallet: Wallet = route.params.wallet;
  const { translations } = useContext(LocalizationContext);
  const common = translations['common'];
  const home = translations['home'];
  const [paymentInfo, setPaymentInfo] = useState('');
  const network = WalletUtilities.getNetworkByType(wallet.networkType);
  const { useQuery } = useContext(RealmWrapperContext);
  const wallets: Wallet[] = useQuery(RealmSchema.Wallet).map(getJSONFromRealmObject);

  useEffect(() => {
    dispatch(sendPhasesReset());
  }, []);

  const navigateToNext = (address: string, amount?: string) => {
    navigation.navigate('AddSendAmount', {
      wallet,
      address,
      amount,
    });
  };

  const handleTextChange = (info: string) => {
    info = info.trim();
    setPaymentInfo(info);
    const { type: paymentInfoKind, address, amount } = WalletUtilities.addressDiff(info, network);

    switch (paymentInfoKind) {
      case PaymentInfoKind.ADDRESS:
        navigateToNext(address);
        break;
      case PaymentInfoKind.PAYMENT_URI:
        navigateToNext(address, amount.toString());
        break;
      default:
        return;
    }
  };

  const renderWallets = ({ item }: { item: Wallet }) => {
    return (
      <Box
        justifyContent={'center'}
        alignItems={'center'}
        style={{ marginRight: wp(10) }}
        width={wp(60)}
      >
        <Box style={styles.buttonBackground}>
          <Pressable
            onPress={() => {
              navigation.navigate('AddSendAmount', {
                wallet,
                address: getNextFreeAddress(item),
              });
            }}
            style={styles.buttonPressable}
          >
            <IconWallet />
          </Pressable>
        </Box>
        <Box>
          <Text fontFamily={'body'} fontWeight={'100'} fontSize={12} mt={'1'} numberOfLines={1}>
            {item.presentationData.name}
          </Text>
        </Box>
      </Box>
    );
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      enabled
      keyboardVerticalOffset={Platform.select({ ios: 8, android: 500 })}
      style={styles.Container}
    >
      <StatusBarComponent padding={50} />
      <Box marginX={3}>
        <Header
          title={common.send}
          subtitle={common.smalldesc}
          onPressHandler={() => navigation.goBack()}
          headerTitleColor={'light.textBlack'}
        />
      </Box>
      {/* {QR Scanner} */}

      <ScrollView>
        <Box style={styles.qrcontainer}>
          <RNCamera ref={cameraRef} style={styles.cameraView} captureAudio={false} />
        </Box>
        {/* send manually option */}
        <Box
          flexDirection={'row'}
          marginY={hp(2)}
          width={'100%'}
          justifyContent={'center'}
          alignItems={'center'}
        >
          <TextInput
            placeholder="or enter address manually"
            style={styles.textInput}
            value={paymentInfo}
            onChangeText={handleTextChange}
          />
        </Box>

        {/* Send to Wallet options */}
        <Box marginTop={hp(40)}>
          <Text
            marginX={5}
            color={'light.GreyText'}
            fontWeight={200}
            fontFamily={'body'}
            fontSize={14}
            letterSpacing={0.6}
          >
            Send to Wallet
          </Text>
          <View>
            <View
              flexDirection={'row'}
              style={styles.walletContainer}
              backgroundColor={'light.textInputBackground'}
            >
              <FlatList
                data={wallets}
                renderItem={renderWallets}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
              />
            </View>
          </View>
        </Box>

        {/* {Bottom note} */}
        <Box marginTop={hp(40)} marginX={2}>
          <InfoBox title={common.note} desciption={home.reflectSats} width={300} />
        </Box>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = ScaledSheet.create({
  Container: {
    flex: 1,
    padding: 8,
    backgroundColor: 'light.ReceiveBackground',
  },
  linearGradient: {
    borderRadius: 6,
    marginTop: hp(3),
  },
  cardContainer: {
    flexDirection: 'row',
    paddingHorizontal: wp(5),
    paddingVertical: hp(3),
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: RFValue(12),
    letterSpacing: '0.24@s',
  },
  subtitle: {
    fontSize: RFValue(10),
    letterSpacing: '0.20@s',
  },
  qrContainer: {
    alignSelf: 'center',
    marginVertical: hp(40),
    flex: 1,
  },
  textInput: {
    width: '90%',
    backgroundColor: Colors?.textInputBackground,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    padding: 15,
  },
  cameraView: {
    height: hp(250),
    width: wp(375),
  },
  qrcontainer: {
    overflow: 'hidden',
    borderRadius: 10,
    marginVertical: hp(25),
  },
  walletContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: hp(100),
    width: wp(330),
    borderRadius: hp(10),
    marginHorizontal: wp(16),
    paddingHorizontal: wp(25),
    marginTop: hp(10),
  },
  buttonBackground: {
    backgroundColor: '#FAC48B',
    width: 40,
    height: 40,
    borderRadius: 50,
  },
  buttonPressable: {
    alignItems: 'center',
    marginVertical: 14,
  },
});
export default SendScreen;
