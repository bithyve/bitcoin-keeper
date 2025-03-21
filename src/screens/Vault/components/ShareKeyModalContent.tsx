import { Box, useColorMode } from 'native-base';
import React, { useContext, useState } from 'react';
import CircleIconWrapper from 'src/components/CircleIconWrapper';
import Text from 'src/components/KeeperText';
import AirDropIcon from 'src/assets/images/airdrop-circle-icon.svg';
import NFCIcon from 'src/assets/images/nfc-circle-icon.svg';
import QR_Icon from 'src/assets/images/qr-scan-icon.svg';
import MagicLinkIcon from 'src/assets/images/magic-link-icon.svg';
import { Platform, StyleSheet, Vibration } from 'react-native';
import { hp, wp } from 'src/constants/responsive';
import { TouchableOpacity } from 'react-native-gesture-handler';
import NFC from 'src/services/nfc';
import { NfcTech } from 'react-native-nfc-manager';
import { captureError } from 'src/services/sentry';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import { exportFile } from 'src/services/fs';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { RKInteractionMode } from 'src/services/wallets/enums';
import { HCESessionContext } from 'react-native-hce';

function ShareKeyModalContent({
  vaultId,
  navigation,
  useNdef = false,
  isPSBTSharing = false,
  vaultKey,
  fileName,
  signer,
  navigateToCosignerDetails,
  setShareKeyModal,
  xfp = '',
  isSignedPSBT = false,
  data,
}) {
  const { colorMode } = useColorMode();
  const [visible, setVisible] = useState(false);
  const { showToast } = useToastMessage();
  const { session } = useContext(HCESessionContext);

  const isIos = Platform.OS === 'ios';
  const isAndroid = Platform.OS === 'android';

  const cleanUp = () => {
    setVisible(false);
    Vibration.cancel();
    if (isAndroid && !useNdef) {
      NFC.stopTagSession(session);
    }
  };

  const shareWithNFC = async () => {
    try {
      if (isIos || useNdef) {
        if (!isIos) {
          setVisible(true);
        }
        Vibration.vibrate([700, 50, 100, 50], true);
        const enc = NFC.encodeTextRecord(data);
        await NFC.send([NfcTech.Ndef], enc);
        cleanUp();
      } else {
        setVisible(true);
        await NFC.startTagSession({ session, content: data });
        Vibration.vibrate([700, 50, 100, 50], true);
      }
    } catch (err) {
      cleanUp();
      if (err.toString() === 'Error: Not even registered') {
        console.log('NFC interaction cancelled.');
        return;
      }
      captureError(err);
    }
  };
  const shareWithAirdrop = async () => {
    const shareFileName =
      fileName ||
      (isPSBTSharing
        ? `${vaultId}-${vaultKey?.xfp}-${Date.now()}.psbt`
        : `cosigner-${signer?.masterFingerprint}.txt`);
    try {
      await exportFile(
        data,
        shareFileName,
        (error) => showToast(error.message, <ToastErrorIcon />),
        'utf8',
        false
      );
    } catch (err) {
      console.log(err);
      captureError(err);
    }
  };

  const walletOptions = [
    {
      id: 1,
      label: 'Magic Link',
      icon: <MagicLinkIcon />,
      onPress: () => {
        setShareKeyModal(false);
        navigation.navigate('RemoteSharing', {
          psbt: data,
          mode: isPSBTSharing
            ? isSignedPSBT
              ? RKInteractionMode.SHARE_SIGNED_PSBT
              : RKInteractionMode.SHARE_PSBT
            : RKInteractionMode.SHARE_REMOTE_KEY,
          signer,
          xfp,
        });
      },
    },
    {
      id: 3,
      label: 'Show QR',
      icon: <QR_Icon />,
      onPress: () => {
        navigateToCosignerDetails();
        setShareKeyModal(false);
      },
    },
    {
      id: 3,
      label: `${isIos ? 'Airdrop / ' : ''}File Export`,
      icon: <AirDropIcon />,
      onPress: () => {
        shareWithAirdrop();
        setShareKeyModal(false);
      },
    },

    {
      id: 4,
      label: 'NFC',
      icon: <NFCIcon />,
      onPress: () => {
        shareWithNFC();
        setShareKeyModal(false);
      },
    },
  ];

  return (
    <Box>
      {walletOptions.map((option) => (
        <TouchableOpacity key={option.id} onPress={option.onPress}>
          <Box style={styles.container} backgroundColor={`${colorMode}.textInputBackground`}>
            <CircleIconWrapper
              width={40}
              icon={option.icon}
              backgroundColor={`${colorMode}.pantoneGreen`}
            />
            <Text>{option.label}</Text>
          </Box>
        </TouchableOpacity>
      ))}
      <NfcPrompt visible={visible} close={cleanUp} ctaText="Done" />
    </Box>
  );
}

export default ShareKeyModalContent;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(20),
    paddingHorizontal: wp(20),
    paddingVertical: hp(16),
    borderRadius: 10,
    marginBottom: hp(10),
  },
});
