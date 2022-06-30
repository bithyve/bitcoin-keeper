import React, { useRef, useContext, useCallback, useState, useEffect } from 'react';
import { TextInput, ScrollView } from 'react-native';
// libraries
import { View, Box, Pressable, Text } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { ScaledSheet } from 'react-native-size-matters';
import { RFValue } from 'react-native-responsive-fontsize';
import { RNCamera } from 'react-native-camera';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
// components
import StatusBarComponent from 'src/components/StatusBarComponent';
import Header from 'src/components/Header';
// Colors, Images, svgs
import Colors from 'src/theme/Colors';
import InfoBox from 'src/components/InfoBox';
import IconWallet from 'src/assets/images/svgs/icon_wallet.svg';
import BlueWallet from 'src/assets/icons/bluewallet.svg';

import { LocalizationContext } from 'src/common/content/LocContext';
import WalletUtilities from 'src/core/wallets/WalletUtilities';
import { PaymentInfoKind } from 'src/core/wallets/interfaces/enum';
import { Wallet } from 'src/core/wallets/interfaces/interface';
import { useDispatch } from 'react-redux';
import { sendPhasesReset } from 'src/store/reducers/send_and_receive';
import { hp, wp } from 'src/common/data/responsiveness/responsive';

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

  useEffect(() => {
    // cleanup the reducer at beginning of a new send flow
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

  return (
    <ScrollView style={styles.Container} background={'light.ReceiveBackground'}>
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
      <Box style={styles.qrcontainer}>
        <RNCamera ref={cameraRef} style={styles.cameraView} captureAudio={false} />
      </Box>
      {/* send manually option */}
      <KeyboardAwareScrollView>
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
      </KeyboardAwareScrollView>
      {/* Send to Wallet options */}
      <Box marginTop={hp(10)}>
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
        <View flexDirection={'row'} style={styles.walletContainer}>
          <Box mt={'3'}>
            <Box>
              <View style={styles.buttonBackground}>
                <Pressable onPress={() => console.log('wallet')} style={styles.buttonPressable}>
                  <IconWallet />
                </Pressable>
              </View>
            </Box>
            <Box>
              <Text fontFamily={'body'} fontWeight={'100'} fontSize={12} mt={'1'}>
                Maldives
              </Text>
            </Box>
          </Box>
          <Box mt={'3'}>
            <Box>
              <View style={styles.buttonBackground}>
                <Pressable onPress={() => console.log('wallet')} style={styles.buttonPressable}>
                  <BlueWallet />
                </Pressable>
              </View>
            </Box>
            <Box>
              <Text fontFamily={'body'} fontWeight={'100'} fontSize={12} mt={'1'}>
                Alex's Wallet
              </Text>
            </Box>
          </Box>
          <Box mt={'3'}>
            <Box>
              <View style={styles.buttonBackground}>
                <Pressable onPress={() => console.log('wallet')} style={styles.buttonPressable}>
                  <IconWallet />
                </Pressable>
              </View>
            </Box>
            <Box>
              <Text fontFamily={'body'} fontWeight={'100'} fontSize={12} mt={'1'}>
                Retirement
              </Text>
            </Box>
          </Box>
        </View>
      </Box>

      {/* {Bottom note} */}
      <Box marginTop={hp(70)} marginX={2}>
        <InfoBox title={common.note} desciption={home.reflectSats} width={300} />
      </Box>
    </ScrollView>
  );
};

const styles = ScaledSheet.create({
  Container: {
    flex: 1,
    padding: 8,
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
    height: hp(300),
    width: wp(375),
  },
  qrcontainer: {
    overflow: 'hidden',
    borderRadius: 10,
    marginVertical: hp(25),
  },
  walletContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    height: hp(50),
    width: '100%',
    borderRadius: 12,
    marginHorizontal: wp(3),
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
