import { Platform, Vibration } from 'react-native';
import React, { useContext, useEffect } from 'react';
import OptionCTA from 'src/components/OptionCTA';
import NFCIcon from 'src/assets/images/nfc.svg';
import AirDropIcon from 'src/assets/images/airdrop.svg';
import NFC from 'src/services/nfc';
import { NfcTech } from 'react-native-nfc-manager';
import { HCESession, HCESessionContext } from 'react-native-hce';
import { captureError } from 'src/services/sentry';
import useToastMessage from 'src/hooks/useToastMessage';
import TickIcon from 'src/assets/images/icon_tick.svg';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import { Box } from 'native-base';

function ShareWithNfc({ data }: { data: string }) {
  const { session } = useContext(HCESessionContext);
  const [visible, setVisible] = React.useState(false);

  const { showToast } = useToastMessage();

  const cleanUp = () => {
    setVisible(false);
    Vibration.cancel();
    if (isAndroid) {
      NFC.stopTagSession(session);
    }
  };
  useEffect(() => {
    const unsubDisconnect = session.on(HCESession.Events.HCE_STATE_DISCONNECTED, () => {
      cleanUp();
    });
    const unsubRead = session.on(HCESession.Events.HCE_STATE_READ, () => {
      showToast('Cosigner details shared successfully', <TickIcon />);
    });
    return () => {
      cleanUp();
      unsubRead();
      unsubDisconnect();
    };
  }, [session]);

  const isAndroid = Platform.OS === 'android';
  const isIos = Platform.OS === 'ios';

  const shareWithNFC = async () => {
    try {
      if (isIos) {
        Vibration.vibrate([700, 50, 100, 50], true);
        const enc = NFC.encodeTextRecord(data);
        await NFC.send([NfcTech.Ndef], enc);
        Vibration.cancel();
      } else {
        setVisible(true);
        await NFC.startTagSession({ session, content: data });
        Vibration.vibrate([700, 50, 100, 50], true);
      }
    } catch (err) {
      Vibration.cancel();
      if (err.toString() === 'Error: Not even registered') {
        console.log('NFC interaction cancelled.');
        return;
      }
      captureError(err);
    }
  };

  const shareWithAirdrop = async () => {
    try {
      const path = `${RNFS.CachesDirectoryPath}/cosigner.txt`;
      RNFS.writeFile(path, data, 'utf8')
        .then(() => {
          Share.open({
            message: '',
            title: '',
            url: path,
            excludedActivityTypes: [
              'copyToPasteBoard',
              'markupAsPDF',
              'addToReadingList',
              'assignToContact',
              'mail',
              'default',
              'message',
              'postToFacebook',
              'print',
              'saveToCameraRoll',
            ],
          });
        })
        .catch((err) => {
          console.log(err.message);
        });
    } catch (err) {
      console.log(err);
      captureError(err);
    }
  };
  return (
    <Box>
      {isIos && (
        <OptionCTA
          icon={<AirDropIcon />}
          title="or share via Airdrop"
          subtitle="If the other device is on iOS"
          callback={shareWithAirdrop}
        />
      )}
      <OptionCTA
        icon={<NFCIcon />}
        title={`or share on Tap${isIos ? ' to Anroid' : ''}`}
        subtitle="Bring devices close to use NFC"
        callback={shareWithNFC}
      />
      <NfcPrompt visible={visible} close={cleanUp} ctaText="Done" />
    </Box>
  );
}

export default ShareWithNfc;
