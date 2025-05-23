import { Box, useColorMode } from 'native-base';
import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp, windowWidth } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import KeeperQRCode from 'src/components/KeeperQRCode';
import WalletHeader from 'src/components/WalletHeader';

function ShareQR({ route }) {
  const { details } = route.params;
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { vault: vaultText } = translations;

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <WalletHeader title={vaultText.shareQRTitle} subTitle={vaultText.shareQRSubtitle} />
      <Box style={styles.container}>
        <Box>{details && <KeeperQRCode qrData={details} size={windowWidth * 0.6} showLogo />}</Box>
      </Box>
    </ScreenWrapper>
  );
}

export default ShareQR;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    marginTop: hp(47),
  },
});
