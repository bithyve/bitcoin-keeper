import React, { useEffect, useState } from 'react';

import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { View, Box, Text } from 'native-base';
import { RFValue } from 'react-native-responsive-fontsize';
import { ScaledSheet } from 'react-native-size-matters';
import { Image, TouchableOpacity, Clipboard } from 'react-native';
import { useNavigation } from '@react-navigation/native';
// import { useDispatch } from 'react-redux';

import HeaderTitle from 'src/components/HeaderTitle';
import StatusBarComponent from 'src/components/StatusBarComponent';
import InfoBox from '../../components/InfoBox';

import WalletUtilities from 'src/core/wallets/WalletUtilities';
import { Wallet } from 'src/core/wallets/interfaces/interface';
import { getNextFreeAddress } from 'src/store/sagas/send_and_receive';

import QrCode from 'src/assets/images/qrcode.png';
import CopyIcon from 'src/assets/images/svgs/icon_copy.svg';
import ArrowIcon from 'src/assets/images/svgs/icon_arrow.svg';
import BtcGreen from 'src/assets/images/svgs/btc_round_green.svg';
import QRCode from 'react-native-qrcode-svg';

const ReceiveScreen = ({ route }: { route }) => {
  const navigtaion = useNavigation();
  // const dispatch = useDispatch();

  const wallet: Wallet = route?.params?.wallet;
  const amount = route?.params?.amount;
  const [receivingAddress, setReceivingAddress] = useState(null);
  const [paymentURI, setPaymentURI] = useState(null);

  useEffect(() => {
    const receivingAddress = getNextFreeAddress(wallet);
    setReceivingAddress(receivingAddress);
  }, []);

  useEffect(() => {
    if (amount) {
      const newPaymentURI = WalletUtilities.generatePaymentURI(receivingAddress, {
        amount: parseInt(amount) / 10e8,
      }).paymentURI;
      setPaymentURI(newPaymentURI);
    } else if (paymentURI) setPaymentURI(null);
  }, [amount]);

  return (
    <View style={styles.Container} background={'light.ReceiveBackground'}>
      <StatusBarComponent padding={50} />
      <HeaderTitle
        title="Receive"
        subtitle="Lorem ipsum dolor sit amet, consectetur"
        onPressHandler={() => navigtaion.goBack()}
        color={'light.ReceiveBackground'}
      />
      <Box marginTop={hp(10)} alignItems={'center'} alignSelf={'center'} width={204}>
        <QRCode
          value={paymentURI || receivingAddress || 'address'}
          logoBackgroundColor="transparent"
          size={200}
        />
        <Box background={'light.QrCode'} height={6} width={'100%'} justifyContent={'center'}>
          <Text
            textAlign={'center'}
            color={'light.recieverAddress'}
            fontFamily={'body'}
            fontWeight={300}
            fontSize={12}
            letterSpacing={1.08}
            width={'100%'}
            noOfLines={1}
          >
            {paymentURI || receivingAddress}
          </Text>
        </Box>
      </Box>
      {/* {Input Field} */}
      <Box alignItems={'center'} borderBottomLeftRadius={10} borderTopLeftRadius={10}>
        <Box
          flexDirection={'row'}
          marginY={hp(3)}
          width={'80%'}
          alignItems={'center'}
          justifyContent={'space-between'}
          backgroundColor={'light.textInputBackground'}
        >
          <Text width={'80%'} marginLeft={4} noOfLines={1}>
            {paymentURI || receivingAddress}
          </Text>
          <TouchableOpacity
            activeOpacity={0.4}
            onPress={() => {
              Clipboard.setString(paymentURI || receivingAddress);
            }}
          >
            <Box
              backgroundColor={'light.copyBackground'}
              padding={3}
              borderTopRightRadius={10}
              borderBottomRightRadius={10}
            >
              <CopyIcon />
            </Box>
          </TouchableOpacity>
        </Box>
      </Box>
      {/* {Add amount component} */}
      <TouchableOpacity
        activeOpacity={0.5}
        style={{ marginTop: '7%' }}
        onPress={() => {
          navigtaion.navigate('AddAmount', { wallet });
        }}
      >
        <Box
          flexDirection={'row'}
          height={70}
          borderRadius={10}
          justifyContent={'space-between'}
          alignItems={'center'}
          paddingX={3}
          marginX={3}
          backgroundColor={'light.lightYellow'}
        >
          <Box flexDirection={'row'}>
            <BtcGreen />
            <Box flexDirection={'column'} marginLeft={5}>
              <Text
                color={'light.lightBlack'}
                fontWeight={200}
                fontFamily={'body'}
                fontSize={14}
                letterSpacing={1.12}
              >
                Add amount
              </Text>
              <Text
                color={'light.GreyText'}
                fontWeight={200}
                fontFamily={'body'}
                fontSize={12}
                letterSpacing={0.6}
              >
                Lorem ipsum dolor sit amet, con
              </Text>
            </Box>
          </Box>
          <ArrowIcon />
        </Box>
      </TouchableOpacity>
      {/* {Bottom note} */}
      <Box position={'absolute'} bottom={10} marginX={5}>
        <InfoBox
          title="Add amount"
          desciption="It would take some time for the sats to reflect in your account based on the network condition desciption"
          width="65%"
        />
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
  title: {
    fontSize: RFValue(12),
    letterSpacing: '0.24@s',
  },
  subtitle: {
    fontSize: RFValue(10),
    letterSpacing: '0.20@s',
  },
  textBox: {
    width: '80%',
    // backgroundColor: Colors?.textInputBackground,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    padding: 20,
  },
});
export default ReceiveScreen;
