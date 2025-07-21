import { Box, useColorMode } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import CircleIconWrapper from 'src/components/CircleIconWrapper';
import Text from 'src/components/KeeperText';
import AirDropIcon from 'src/assets/images/airdrop-circle-icon.svg';
import NFCIcon from 'src/assets/images/nfc-circle-icon.svg';
import QR_Icon from 'src/assets/images/qr-scan-icon.svg';
import { Platform, StyleSheet, Vibration } from 'react-native';
import { hp, wp } from 'src/constants/responsive';
import { TouchableOpacity } from 'react-native-gesture-handler';
import useToastMessage from 'src/hooks/useToastMessage';
import ExportFile from 'src/assets/images/exportFile.svg';
import { exportFile } from 'src/services/fs';
import { captureError } from 'src/services/sentry';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { RKInteractionMode } from 'src/services/wallets/enums';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import NFC from 'src/services/nfc';
import nfcManager, { NfcTech } from 'react-native-nfc-manager';
import { HCESession, HCESessionContext } from 'react-native-hce';

function ContactModalData({ isShareContact = false, setContactModalVisible, navigation, data }) {
  const { colorMode } = useColorMode();
  const [nfcVisible, setNfcVisible] = useState(false);
  const { showToast } = useToastMessage();
  const { session } = useContext(HCESessionContext);

  const isIos = Platform.OS === 'ios';
  const isAndroid = Platform.OS === 'android';

  const cleanUp = () => {
    setNfcVisible(false);
    Vibration.cancel();
    if (isAndroid) {
      NFC.stopTagSession(session);
    }
  };

  useEffect(() => {
    const unsubDisconnect = session.on(HCESession.Events.HCE_STATE_DISCONNECTED, () => {
      cleanUp();
    });
    return () => {
      cleanUp();
      unsubDisconnect();
    };
  }, [session]);

  useEffect(() => {
    if (isAndroid) {
      if (nfcVisible) {
      } else {
        NFC.stopTagSession(session);
      }
    }
    return () => {
      nfcManager.cancelTechnologyRequest();
    };
  }, [nfcVisible]);

  const shareWithNFC = async () => {
    try {
      if (isIos) {
        if (!isIos) {
          setNfcVisible(true);
        }
        Vibration.vibrate([700, 50, 100, 50], true);
        const enc = NFC.encodeTextRecord(data);
        await NFC.send([NfcTech.Ndef], enc);
        cleanUp();
      } else {
        setNfcVisible(true);
        await NFC.startTagSession({ session, content: data });
        Vibration.vibrate([700, 50, 100, 50], true);
      }
    } catch (err) {
      cleanUp();
      if (err.toString() === 'Error: Not even registered') {
        console.log('NFC interaction cancelled.');
        return;
      }
      console.log('Error ', err);
    }
  };

  const shareWithAirdrop = async () => {
    const shareFileName = `contact-${Date.now()}.txt`;

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

  const ContactOptions = [
    {
      id: 1,
      label: 'Show QR',
      icon: <QR_Icon />,
      onPress: () => {
        setContactModalVisible(false);
        navigation.navigate('ContactShareQr', { data });
      },
    },
    {
      id: 2,
      label: `${isIos ? 'Airdrop / ' : ''}File `,
      icon: <ExportFile />,
      onPress: () => {
        setContactModalVisible(false);
        shareWithAirdrop();
      },
    },

    {
      id: 3,
      label: 'NFC',
      icon: <NFCIcon />,
      onPress: () => {
        setContactModalVisible(false);
        shareWithNFC();
      },
    },
    ...(isShareContact
      ? [
          {
            id: 4,
            label: 'Share Link',
            icon: <AirDropIcon />,
            onPress: () => {
              setContactModalVisible(false);
              navigation.navigate('RemoteSharing', {
                psbt: data,
                mode: RKInteractionMode.SHARE_REMOTE_KEY,
              });
            },
          },
        ]
      : []),
  ];

  return (
    <Box>
      {ContactOptions.map((option) => (
        <TouchableOpacity key={option.id} onPress={option.onPress}>
          <Box
            style={styles.container}
            backgroundColor={`${colorMode}.boxSecondaryBackground`}
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
      <NfcPrompt visible={nfcVisible} close={cleanUp} ctaText="Done" />
    </Box>
  );
}

export default ContactModalData;

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
