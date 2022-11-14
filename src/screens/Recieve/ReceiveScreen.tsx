import { Box, Text } from 'native-base';
import { Clipboard, TouchableOpacity } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';

import ArrowIcon from 'src/assets/images/svgs/icon_arrow.svg';
import BtcGreen from 'src/assets/images/svgs/btc_round_green.svg';
import CopyIcon from 'src/assets/images/svgs/icon_copy.svg';
import HeaderTitle from 'src/components/HeaderTitle';
import InfoBox from '../../components/InfoBox';
import { LocalizationContext } from 'src/common/content/LocContext';
import QRCode from 'react-native-qrcode-svg';
import ScreenWrapper from 'src/components/ScreenWrapper';
import TickIcon from 'src/assets/images/icon_tick.svg';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import WalletUtilities from 'src/core/wallets/operations/utils';
import { getNextFreeAddress } from 'src/store/sagas/send_and_receive';
import { hp } from 'src/common/data/responsiveness/responsive';
import { useNavigation } from '@react-navigation/native';
import useToastMessage from 'src/hooks/useToastMessage';

const ReceiveScreen = ({ route }: { route }) => {
  const navigtaion = useNavigation();

  const wallet: Wallet = route?.params?.wallet;
  const amount = route?.params?.amount;
  const [receivingAddress, setReceivingAddress] = useState(null);
  const [paymentURI, setPaymentURI] = useState(null);

  const { translations } = useContext(LocalizationContext);
  const common = translations['common'];
  const home = translations['home'];

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

  const { showToast } = useToastMessage();

  return (
    <ScreenWrapper>
      <HeaderTitle
        title={common.receive}
        subtitle={'Native segwit address'}
        onPressHandler={() => navigtaion.goBack()}
        headerTitleColor={'light.textBlack'}
        paddingTop={hp(6)}
      />
      <Box marginTop={hp(80)} alignItems={'center'} alignSelf={'center'} width={hp(200)}>
        <QRCode
          value={paymentURI || receivingAddress || 'address'}
          logoBackgroundColor="transparent"
          size={hp(200)}
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
            {'Recieve Address'}
          </Text>
        </Box>
      </Box>
      {/* {Input Field} */}
      <Box
        alignItems={'center'}
        borderBottomLeftRadius={10}
        borderTopLeftRadius={10}
        marginTop={hp(20)}
      >
        <Box
          flexDirection={'row'}
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
              showToast('Address Copied Successfully', <TickIcon />);
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
        style={{ marginTop: hp(50) }}
        onPress={() => {
          navigtaion.navigate('AddAmount', { wallet });
        }}
      >
        <Box
          flexDirection={'row'}
          height={hp(70)}
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
                {home.AddAmount}
              </Text>
              <Text
                color={'light.GreyText'}
                fontWeight={200}
                fontFamily={'body'}
                fontSize={12}
                letterSpacing={0.6}
              >
                Add a specific invoice amount
              </Text>
            </Box>
          </Box>
          <ArrowIcon />
        </Box>
      </TouchableOpacity>
      {/* {Bottom note} */}
      <Box position={'absolute'} bottom={hp(45)} marginX={5}>
        <InfoBox title={home.AddAmount} desciption={home.reflectSats} width={300} />
      </Box>
    </ScreenWrapper>
  );
};

export default ReceiveScreen;
