import React, { useContext, useEffect, useState } from 'react';
import OptionCTA from 'src/components/OptionCTA';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import { captureError } from 'src/services/sentry';
import useToastMessage from 'src/hooks/useToastMessage';
import nfcManager, { NfcTech } from 'react-native-nfc-manager';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import NFC from 'src/services/nfc';
import { SignerType } from 'src/services/wallets/enums';
import { HCESession, HCESessionContext } from 'react-native-hce';
import { Platform, StyleSheet } from 'react-native';
import idx from 'idx';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import NFCIcon from 'src/assets/images/nfc-no-bg-light.svg';
import AirDropIcon from 'src/assets/images/airdrop-no-bg-light.svg';
import RemoteShareIcon from 'src/assets/images/remote-share-no-bg-light.svg';
import RemoteShareIllustraion from 'src/assets/images/remote-share-illustration.svg';
import { Box, useColorMode } from 'native-base';
import KeeperModal from 'src/components/KeeperModal';
import { hp, wp } from 'src/constants/responsive';
import CircleIconWrapper from 'src/components/CircleIconWrapper';

function NFCOption({ nfcVisible, closeNfc, withNfcModal, setData, signerType, isPSBT }) {
  const { showToast } = useToastMessage();
  const { colorMode } = useColorMode();
  const [remoteShareModal, setRemoteShareModal] = useState(false);
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

  const { session } = useContext(HCESessionContext);
  const isAndroid = Platform.OS === 'android';
  const isIos = Platform.OS === 'ios';

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

  return (
    <>
      <Box style={styles.container}>
        <OptionCTA
          icon={
            <CircleIconWrapper
              width={wp(38)}
              backgroundColor={`${colorMode}.pantoneGreen`}
              icon={<NFCIcon />}
            />
          }
          title="NFC on Tap"
          callback={readFromNFC}
        />
        <OptionCTA
          icon={
            <CircleIconWrapper
              width={wp(38)}
              backgroundColor={`${colorMode}.pantoneGreen`}
              icon={<AirDropIcon />}
            />
          }
          title={`Airdrop/ \nFile export`}
          callback={selectFile}
        />
        <NfcPrompt visible={nfcVisible} close={closeNfc} />
        {/* // ! Hide Remote Key */}
        {/* <OptionCTA
          icon={
          <CircleIconWrapper
              width={wp(38)}
              backgroundColor={`${colorMode}.pantoneGreen`}
              icon={<RemoteShareIcon />}
            />
            }
          title={isPSBT ? 'Share\ntransaction link' : 'Remote Share'}
          callback={() => setRemoteShareModal(true)}
        /> */}
      </Box>
      <KeeperModal
        close={() => setRemoteShareModal(false)}
        showCloseIcon={false}
        visible={remoteShareModal}
        title={isPSBT ? 'Share Transaction Link' : 'Remote Key Sharing'}
        subTitle={
          isPSBT
            ? 'Please ask the sender to send you transaction signing link so you can sign the transaction using it'
            : 'Ask the key holder to send a link from the Key Details sections of the settings of the key to be shared. Clicking on the link will allow you to add the key on this app.'
        }
        buttonText="Close"
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.modalHeaderTitle`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        buttonBackground={`${colorMode}.greenButtonBackground`}
        buttonCallback={() => setRemoteShareModal(false)}
        subTitleWidth={wp(280)}
        Content={() => (
          <Box style={styles.illustrationContainer}>
            <RemoteShareIllustraion />
          </Box>
        )}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 20,
  },
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(20),
  },
});

export default NFCOption;
