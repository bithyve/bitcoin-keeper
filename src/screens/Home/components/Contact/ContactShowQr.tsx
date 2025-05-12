import { Box } from 'native-base';
import { authenticator } from 'otplib';
import React from 'react';
import { StyleSheet } from 'react-native';
import KeeperQRCode from 'src/components/KeeperQRCode';
import ScreenWrapper from 'src/components/ScreenWrapper';
import WalletHeader from 'src/components/WalletHeader';
import { windowWidth, wp } from 'src/constants/responsive';

const ContactShareQr = () => {
  const validationKey = 'Bitcoin Keeper';
  return (
    <ScreenWrapper>
      <WalletHeader
        title="Share QR"
        subTitle="Please scan until all the QR data has been retrieved "
      />

      <Box style={styles.qrContainer}>
        <KeeperQRCode
          qrData={authenticator.keyuri('bitcoinkeeper.app', 'Bitcoin Keeper', validationKey)}
          logoBackgroundColor="transparent"
          size={windowWidth * 0.8}
          showLogo
        />
      </Box>
    </ScreenWrapper>
  );
};

export default ContactShareQr;

const styles = StyleSheet.create({
  qrContainer: {
    alignItems: 'center',
    alignSelf: 'center',
    width: windowWidth * 0.8,
    borderRadius: 10,
    padding: 22,
  },
});
