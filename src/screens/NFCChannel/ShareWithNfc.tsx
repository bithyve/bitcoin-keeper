import { Platform, StyleSheet, Vibration } from 'react-native';
import React, { useContext, useEffect } from 'react';
import OptionCTA from 'src/components/OptionCTA';
import NFCIcon from 'src/assets/images/nfc-circle-icon.svg';
import AirDropIcon from 'src/assets/images/airdrop-circle-icon.svg';
import RemoteShareIcon from 'src/assets/images/remote-share-circle-icon.svg';
import NFC from 'src/services/nfc';
import { NfcTech } from 'react-native-nfc-manager';
import { HCESession, HCESessionContext } from 'react-native-hce';
import { captureError } from 'src/services/sentry';
import useToastMessage from 'src/hooks/useToastMessage';
import TickIcon from 'src/assets/images/icon_tick.svg';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import { Box } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { RKInteractionMode } from 'src/services/wallets/enums';
import { Signer, VaultSigner } from 'src/services/wallets/interfaces/vault';
import { SendConfirmationRouteParams, tnxDetailsProps } from '../Send/SendConfirmation';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { exportFile } from 'src/services/fs';

function ShareWithNfc({
  data,
  remoteShare = true,
  signer,
  isPSBTSharing = false,
  psbt,
  vaultKey,
  vaultId,
  serializedPSBTEnvelop,
  sendConfirmationRouteParams,
  tnxDetails,
  fileName,
}: {
  data: string;
  signer?: Signer;
  remoteShare?: boolean;
  isPSBTSharing?: boolean;
  psbt?: string;
  vaultKey?: VaultSigner;
  vaultId?: string;
  serializedPSBTEnvelop?: any;
  sendConfirmationRouteParams?: SendConfirmationRouteParams;
  tnxDetails?: tnxDetailsProps;
  fileName?: string;
}) {
  const { session } = useContext(HCESessionContext);
  const navigation = useNavigation<any>();
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
    const shareFileName = fileName
      ? fileName
      : isPSBTSharing
      ? `${vaultId}-${vaultKey?.xfp}-${Date.now()}.psbt`
      : `cosigner-${signer?.masterFingerprint}.txt`;
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
  return (
    <Box style={styles.container}>
      <OptionCTA icon={<NFCIcon />} title="NFC on Tap" callback={shareWithNFC} />
      <OptionCTA
        icon={<AirDropIcon />}
        title={`${isIos ? 'Airdrop / ' : ''}File export`}
        callback={shareWithAirdrop}
      />
      {/* // ! Hide Remote Key */}
      {/* {remoteShare && ( */}
      {false && (
        <OptionCTA
          icon={<RemoteShareIcon />}
          title={!isPSBTSharing ? 'Remote share' : 'Share PSBT Link'}
          callback={() =>
            navigation.navigate('RemoteSharing', {
              isPSBTSharing,
              signer,
              psbt,
              mode: isPSBTSharing
                ? RKInteractionMode.SHARE_PSBT
                : RKInteractionMode.SHARE_REMOTE_KEY,
              vaultKey,
              vaultId,
              serializedPSBTEnvelop,
              sendConfirmationRouteParams,
              tnxDetails,
            })
          }
        />
      )}
      <NfcPrompt visible={visible} close={cleanUp} ctaText="Done" />
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    flex: 1,
    margin: 20,
    gap: 20,
  },
});

export default ShareWithNfc;
