import { Box, useColorMode } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import CircleIconWrapper from 'src/components/CircleIconWrapper';
import Text from 'src/components/KeeperText';
import DownloadPDF from 'src/assets/images/export-pdf-icon.svg';
import ShowQR from 'src/assets/images/qr-scan-icon.svg';
import AirDropIcon from 'src/assets/images/airdrop-circle-icon.svg';
import NFCIcon from 'src/assets/images/nfc-circle-icon.svg';
import { Platform, StyleSheet, Vibration } from 'react-native';
import { hp, wp } from 'src/constants/responsive';
import { TouchableOpacity } from 'react-native-gesture-handler';
import GenerateSingleVaultFilePDF from 'src/utils/GenerateSingleVaultFilePDF';
import { generateOutputDescriptors } from 'src/utils/service-utilities/utils';
import { CommonActions } from '@react-navigation/native';
import NFC from 'src/services/nfc';
import { NfcTech } from 'react-native-nfc-manager';
import { captureError } from 'src/services/sentry';
import { HCESessionContext } from 'react-native-hce';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import { sanitizeFileName } from 'src/utils/utilities';
import { exportFile } from 'src/services/fs';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { LocalizationContext } from 'src/context/Localization/LocContext';

function WalletConfiguration({
  vaultId,
  isMiniscriptVault,
  navigation,
  vault,
  setWalletConfigModal,
  useNdef = false,
  isPSBTSharing = false,
  vaultKey,
  signer,
  xfp = '',
}) {
  const { colorMode } = useColorMode();
  const vaultDescriptorString = generateOutputDescriptors(vault);
  const { session } = useContext(HCESessionContext);
  const [fingerPrint, setFingerPrint] = useState(null);
  const [visible, setVisible] = useState(false);
  const { showToast } = useToastMessage();
  const { translations } = useContext(LocalizationContext);
  const { vault: vaultText } = translations;

  const isIos = Platform.OS === 'ios';
  const isAndroid = Platform.OS === 'android';

  useEffect(() => {
    if (vault) {
      const vaultData = { name: vault.presentationData.name, file: vaultDescriptorString };
      setFingerPrint(vaultData);
    }
  }, []);

  const cleanUp = () => {
    setVisible(false);
    Vibration.cancel();
    if (isAndroid && !useNdef) {
      NFC.stopTagSession(session);
    }
  };

  const shareWithNFC = async () => {
    setWalletConfigModal(false);
    try {
      if (isIos || useNdef) {
        if (!isIos) {
          setVisible(true);
        }
        Vibration.vibrate([700, 50, 100, 50], true);
        const enc = NFC.encodeTextRecord(vaultDescriptorString);
        await NFC.send([NfcTech.Ndef], enc);
        cleanUp();
      } else {
        setVisible(true);
        await NFC.startTagSession({ session, content: vaultDescriptorString });
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
  const fileName = `${sanitizeFileName(vault.presentationData.name)}.txt`;
  const shareWithAirdrop = async () => {
    setWalletConfigModal(false);

    const shareFileName =
      fileName ||
      (isPSBTSharing
        ? `${vaultId}-${vaultKey?.xfp}-${Date.now()}.psbt`
        : `cosigner-${signer?.masterFingerprint}.txt`);
    try {
      await exportFile(
        vaultDescriptorString,
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
      label: vaultText.exportPDF,
      icon: <DownloadPDF />,
      onPress: () => {
        GenerateSingleVaultFilePDF(fingerPrint).then((res) => {
          if (res) {
            navigation.navigate('PreviewPDF', { source: res });
            setWalletConfigModal(false);
          }
        });
      },
    },
    {
      id: 2,
      label: `${isIos ? 'Airdrop / ' : ''}File Export`,
      icon: <AirDropIcon />,
      onPress: () => {
        shareWithAirdrop();
      },
    },
    {
      id: 3,
      label: 'Show QR',
      icon: <ShowQR />,
      onPress: () => {
        navigation.dispatch(
          CommonActions.navigate('GenerateVaultDescriptor', {
            vaultId,
            isMiniscriptVault,
          })
        );
        setWalletConfigModal(false);
      },
    },
    {
      id: 4,
      label: 'NFC',
      icon: <NFCIcon />,
      onPress: () => {
        shareWithNFC();
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

export default WalletConfiguration;

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
