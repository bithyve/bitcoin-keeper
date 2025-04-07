import { Box, useColorMode } from 'native-base';
import React, { useContext, useEffect } from 'react';
import CircleIconWrapper from 'src/components/CircleIconWrapper';
import Text from 'src/components/KeeperText';
import ShowQR from 'src/assets/images/qr-scan-icon.svg';
import AirDropIcon from 'src/assets/images/airdrop-circle-icon.svg';
import NFCIcon from 'src/assets/images/nfc-circle-icon.svg';
import { Platform, StyleSheet } from 'react-native';
import { hp, wp } from 'src/constants/responsive';
import { TouchableOpacity } from 'react-native-gesture-handler';
import NFC from 'src/services/nfc';
import { NfcTech } from 'react-native-nfc-manager';
import { captureError } from 'src/services/sentry';
import { HCESession, HCESessionContext } from 'react-native-hce';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import useNfcModal from 'src/hooks/useNfcModal';
import nfcManager from 'react-native-nfc-manager';
import idx from 'idx';

function OtherSignerOptionModal({ setOptionModal, navigatetoQR, setData }) {
  const { colorMode } = useColorMode();
  const { showToast } = useToastMessage();
  const { nfcVisible, closeNfc, withNfcModal } = useNfcModal();

  const isIos = Platform.OS === 'ios';
  const isAndroid = Platform.OS === 'android';

  const selectFile = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });
      try {
        const filePath = result[0].uri.split('%20').join(' ');
        const cosigner = await RNFS.readFile(filePath);
        setData(cosigner);
      } catch (err) {
        captureError(err);
        showToast('Please pick a valid co-signer file', <ToastErrorIcon />);
      }
    } catch (err) {
      if (err.toString().includes('user canceled')) {
        // user cancelled
        return;
      }
      captureError(err);
      showToast('Something went wrong.', <ToastErrorIcon />);
    }
  };
  const readFromNFC = async () => {
    try {
      await withNfcModal(async () => {
        const records = await NFC.read([NfcTech.Ndef]);
        try {
          const cosigner = records[0].data;
          setData(cosigner);
        } catch (err) {
          captureError(err);
          showToast('Please scan a valid co-signer tag', <ToastErrorIcon />);
        }
      });
    } catch (err) {
      if (err.toString() === 'Error') {
        console.log('NFC interaction cancelled');
        return;
      }
      captureError(err);
      showToast('Something went wrong.', <ToastErrorIcon />);
    }
  };

  const { session } = useContext(HCESessionContext);

  useEffect(() => {
    if (isAndroid) {
      if (nfcVisible) {
        NFC.startTagSession({ session, content: '', writable: true });
      } else {
        NFC.stopTagSession(session);
      }
    }
    return () => {
      nfcManager.cancelTechnologyRequest();
    };
  }, [nfcVisible]);

  useEffect(() => {
    const unsubConnect = session.on(HCESession.Events.HCE_STATE_WRITE_FULL, () => {
      try {
        // content written from iOS to android
        const data = idx(session, (_) => _.application.content.content);
        if (!data) {
          showToast('Please scan a valid co-signer', <ToastErrorIcon />);
          return;
        }
        setData(data);
      } catch (err) {
        captureError(err);
        showToast('Something went wrong.', <ToastErrorIcon />);
      } finally {
        closeNfc();
      }
    });
    const unsubDisconnect = session.on(HCESession.Events.HCE_STATE_DISCONNECTED, () => {
      closeNfc();
    });
    return () => {
      unsubConnect();
      unsubDisconnect();
      NFC.stopTagSession(session);
    };
  }, [session]);

  const walletOptions = [
    {
      id: 1,
      label: 'Scan QR',
      icon: <ShowQR />,
      onPress: () => {
        navigatetoQR();
        setOptionModal(false);
      },
    },

    {
      id: 2,
      label: `${isIos ? 'Airdrop / ' : ''}File Export`,
      icon: <AirDropIcon />,
      onPress: () => {
        selectFile();
        setOptionModal(false);
      },
    },

    {
      id: 4,
      label: 'NFC',
      icon: <NFCIcon />,
      onPress: () => {
        setOptionModal(false);
        readFromNFC();
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
    </Box>
  );
}

export default OtherSignerOptionModal;

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
