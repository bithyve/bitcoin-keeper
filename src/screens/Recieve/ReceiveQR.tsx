import React from 'react';
import { Box, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import { hp, wp } from 'src/constants/responsive';
import KeeperQRCode from 'src/components/KeeperQRCode';

type Props = {
  qrValue: string;
  qrSize?: number;
};

function ReceiveQR({ qrValue, qrSize }: Props) {
  const { colorMode } = useColorMode();

  return (
    <Box
      testID="view_recieveAddressQR"
      style={styles.qrWrapper}
      background={`${colorMode}.receiveQrBackground`}
      borderColor={`${colorMode}.receiveQrBackground`}
    >
      {/* Passing 'address' is needed since passing empty string will throw error in QRCode component */}
      <KeeperQRCode
        qrData={qrValue || 'address'}
        logoBackgroundColor="transparent"
        size={qrSize || wp(205)}
        showLogo
      />
    </Box>
  );
}

const styles = StyleSheet.create({
  qrWrapper: {
    marginTop: hp(20),
    alignItems: 'center',
    alignSelf: 'center',
  },
});

export default ReceiveQR;
