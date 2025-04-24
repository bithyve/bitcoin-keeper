import { Box, useColorMode } from 'native-base';
import React from 'react';
import CircleIconWrapper from 'src/components/CircleIconWrapper';
import Text from 'src/components/KeeperText';
import AirDropIcon from 'src/assets/images/airdrop-circle-icon.svg';
import NFCIcon from 'src/assets/images/nfc-circle-icon.svg';
import QR_Icon from 'src/assets/images/qr-scan-icon.svg';
import MagicLinkIcon from 'src/assets/images/magic-link-icon.svg';
import { Platform, StyleSheet } from 'react-native';
import { hp, wp } from 'src/constants/responsive';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { captureError } from 'src/services/sentry';
import { exportFile } from 'src/services/fs';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { RKInteractionMode } from 'src/services/wallets/enums';

function ShareKeyModalContent({
  vaultId,
  navigation,
  isPSBTSharing = false,
  vaultKey,
  fileName,
  signer,
  navigateToCosignerDetails,
  setShareKeyModal,
  xfp = '',
  isSignedPSBT = false,
  data,
  navigateToQrSigning,
  openmodal,
  shareWithNFC,
  navigateToShowPSBT,
}) {
  const { colorMode } = useColorMode();
  const { showToast } = useToastMessage();

  const isIos = Platform.OS === 'ios';

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
      id: 2,
      label: 'Show QR',
      icon: <QR_Icon />,
      onPress: () => {
        setShareKeyModal(false);
        openmodal && openmodal(true);
        navigateToShowPSBT && navigateToShowPSBT(data);
        if (navigateToQrSigning && typeof navigateToQrSigning === 'function') {
          navigateToQrSigning(vaultKey);
        } else if (navigateToCosignerDetails && typeof navigateToCosignerDetails === 'function') {
          navigateToCosignerDetails();
        }
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
          <Box
            style={styles.container}
            backgroundColor={`${colorMode}.textInputBackground`}
            borderColor={`${colorMode}.separator`}
            borderWidth={1}
          >
            <CircleIconWrapper
              width={40}
              icon={option.icon}
              backgroundColor={`${colorMode}.pantoneGreen`}
            />
            <Text>{option.label}</Text>
          </Box>
        </TouchableOpacity>
      ))}
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
