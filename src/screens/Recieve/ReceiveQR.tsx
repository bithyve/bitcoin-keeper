import React, { useContext } from 'react';
import { Box, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { hp, wp } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';
import QRCode from 'react-native-qrcode-svg';

type Props = {
  qrValue: string;
};

function ReceiveQR({ qrValue }: Props) {
  const { colorMode } = useColorMode();

  const { translations } = useContext(LocalizationContext);
  const { wallet: walletTranslation } = translations;

  return (
    <Box
      testID="view_recieveAddressQR"
      style={styles.qrWrapper}
      borderColor={`${colorMode}.qrBorderColor`}
    >
      {/* Passing 'address' is needed since passing empty string will throw error in QRCode component */}
      <QRCode value={qrValue || 'address'} logoBackgroundColor="transparent" size={hp(175)} />
      <Box background={`${colorMode}.QrCode`} style={styles.receiveAddressWrapper}>
        <Text
          bold
          style={styles.receiveAddressText}
          color={`${colorMode}.recieverAddress`}
          numberOfLines={1}
        >
          {walletTranslation.receiveAddress}
        </Text>
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  qrWrapper: {
    marginTop: 0,
    alignItems: 'center',
    alignSelf: 'center',
    width: wp(225),
    borderWidth: 30,
    borderBottomWidth: 15,
  },
  receiveAddressWrapper: {
    height: hp(28),
    width: '100%',
    justifyContent: 'center',
  },
  receiveAddressText: {
    textAlign: 'center',
    fontSize: 12,
    letterSpacing: 1.08,
    width: '100%',
  },
});

export default ReceiveQR;
