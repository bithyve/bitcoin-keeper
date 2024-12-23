import { Box, useColorMode } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp, windowWidth } from 'src/constants/responsive';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { getKeyExpression } from 'src/utils/service-utilities/utils';
import idx from 'idx';
import { captureError } from 'src/services/sentry';
import useToastMessage from 'src/hooks/useToastMessage';
import { XpubTypes } from 'src/services/wallets/enums';
import { Signer } from 'src/services/wallets/interfaces/vault';
import useSignerMap from 'src/hooks/useSignerMap';
import { getKeyUID } from 'src/utils/utilities';
import KeeperQRCode from 'src/components/KeeperQRCode';

function ShareQR({ route }) {
  const { signerData }: { signerData: Signer } = route.params;
  const { signerMap } = useSignerMap();
  const { colorMode } = useColorMode();
  const { showToast } = useToastMessage();
  const { translations } = useContext(LocalizationContext);
  const { vault: vaultText } = translations;
  const [details, setDetails] = useState(null);
  const signer = signerMap[getKeyUID(signerData)];

  const fetchKeyExpression = (type: XpubTypes) => {
    try {
      if (signer.masterFingerprint && signer.signerXpubs[type] && signer.signerXpubs[type]?.[0]) {
        const keyDescriptor = getKeyExpression(
          signer.masterFingerprint,
          idx(signer, (_) => _.signerXpubs[type][0].derivationPath.replaceAll('h', "'")),
          idx(signer, (_) => _.signerXpubs[type][0].xpub),
          false
        );
        return keyDescriptor;
      } else {
        throw new Error(`Missing key details for ${type} type.`);
      }
    } catch (error) {
      throw new Error(`Missing key details for ${type} type.`);
    }
  };

  useEffect(() => {
    if (!details) {
      setTimeout(() => {
        try {
          const keyDescriptor = fetchKeyExpression(XpubTypes.P2WSH);
          setDetails(keyDescriptor);
        } catch (error) {
          captureError(error);
          try {
            const keyDescriptor = fetchKeyExpression(XpubTypes.P2WPKH);
            setDetails(keyDescriptor);
          } catch (error) {
            showToast(
              "We're sorry, but we have trouble retrieving the key information",
              <ToastErrorIcon />
            );
          }
        }
      }, 200);
    }
  }, []);
  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader title={`Share QR`} subtitle={'Please show your QR to contact'} />
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
