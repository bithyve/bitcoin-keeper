import React, { useRef, useContext, useCallback, useState } from 'react';
import { TextInput } from 'react-native';
// libraries
import { View, Box } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { ScaledSheet } from 'react-native-size-matters';
import { RFValue } from 'react-native-responsive-fontsize';
import { RNCamera } from 'react-native-camera';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
// components
import StatusBarComponent from 'src/components/StatusBarComponent';
import HeaderTitle from 'src/components/HeaderTitle';
// Colors, Images, svgs
import Colors from 'src/theme/Colors';
import InfoBox from 'src/components/InfoBox';

import { LocalizationContext } from 'src/common/content/LocContext';
import WalletUtilities from 'src/core/wallets/WalletUtilities';
import { PaymentInfoKind } from 'src/core/wallets/interfaces/enum';
import { Wallet } from 'src/core/wallets/interfaces/interface';

const SendScreen = ({ route }) => {
  const cameraRef = useRef<RNCamera>();
  const navigation = useNavigation();
  const wallet: Wallet = route.params.wallet;
  const { translations } = useContext(LocalizationContext);
  const common = translations['common'];
  const home = translations['home'];
  const [paymentInfo, setPaymentInfo] = useState('');
  const network = WalletUtilities.getNetworkByType(wallet.derivationDetails.networkType);

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
    <View style={styles.Container} background={'light.ReceiveBackground'}>
      <StatusBarComponent padding={50} />
      <HeaderTitle
        title={common.send}
        subtitle={common.smalldesc}
        onPressHandler={() => navigation.goBack()}
        color={'light.ReceiveBackground'}
      />
      {/* {QR Scanner} */}
      <Box style={styles.qrcontainer} marginY={hp(5)}>
        <RNCamera ref={cameraRef} style={styles.cameraView} captureAudio={false} />
      </Box>
      {/* {Input Field} */}
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

      {/* {Bottom note} */}
      <Box position={'absolute'} bottom={10} marginX={5}>
        <InfoBox title={common.note} desciption={home.reflectSats} width={'65%'} />
      </Box>
    </View>
  );
};

const styles = ScaledSheet.create({
  Container: {
    flex: 1,
    padding: '20@s',
    position: 'relative',
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
    marginVertical: 30,
  },
  textInput: {
    width: '90%',
    backgroundColor: Colors?.textInputBackground,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    padding: 25,
  },
  cameraView: {
    aspectRatio: 1,
  },
  qrcontainer: {
    overflow: 'hidden',
    borderRadius: 10,
  },
});
export default SendScreen;
