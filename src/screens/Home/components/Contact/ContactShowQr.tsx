import { Box, useColorMode } from 'native-base';
import { authenticator } from 'otplib';
import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';
import KeeperQRCode from 'src/components/KeeperQRCode';
import ScreenWrapper from 'src/components/ScreenWrapper';
import WalletHeader from 'src/components/WalletHeader';
import { windowWidth } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';

const ContactShareQr = ({ route }) => {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { vault: vaultText, settings } = translations;
  const { data } = route.params;

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <WalletHeader title={vaultText.shareQR} subTitle={settings.scanQRSubtitle} />

      <Box style={styles.qrContainer}>
        <KeeperQRCode
          qrData={data}
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
