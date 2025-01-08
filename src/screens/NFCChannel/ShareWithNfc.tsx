import { Platform, StyleSheet, Vibration } from 'react-native';
import React, { useContext, useEffect } from 'react';
import OptionCTA from 'src/components/OptionCTA';
import NFCIcon from 'src/assets/images/nfc-no-bg-light.svg';
import AirDropIcon from 'src/assets/images/airdrop-no-bg-light.svg';
import RemoteShareIcon from 'src/assets/images/remote-share-no-bg-light.svg';
import NFC from 'src/services/nfc';
import { NfcTech } from 'react-native-nfc-manager';
import { HCESession, HCESessionContext } from 'react-native-hce';
import { captureError } from 'src/services/sentry';
import useToastMessage from 'src/hooks/useToastMessage';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import { Box, useColorMode } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { RKInteractionMode } from 'src/services/wallets/enums';
import { Signer, VaultSigner } from 'src/services/wallets/interfaces/vault';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { exportFile } from 'src/services/fs';
import { SendConfirmationRouteParams, tnxDetailsProps } from '../Send/SendConfirmation';
import CircleIconWrapper from 'src/components/CircleIconWrapper';
import { wp } from 'src/constants/responsive';

function ShareWithNfc({
  data,
  remoteShare = false,
  signer,
  isPSBTSharing = false,
  vaultKey,
  vaultId,
  fileName,
  useNdef = false,
  xfp = '',
  isSignedPSBT = false,
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
  useNdef?: boolean; // For hardware wallets interactions
  xfp?: string;
  isSignedPSBT?: boolean;
}) {
  const { session } = useContext(HCESessionContext);
  const navigation = useNavigation<any>();
  const { colorMode } = useColorMode();
  const [visible, setVisible] = React.useState(false);

  const { showToast } = useToastMessage();

  const cleanUp = () => {
    setVisible(false);
    Vibration.cancel();
    if (isAndroid && !useNdef) {
      NFC.stopTagSession(session);
    }
  };
  useEffect(() => {
    const unsubDisconnect = session.on(HCESession.Events.HCE_STATE_DISCONNECTED, () => {
      cleanUp();
    });
    const unsubRead = session.on(HCESession.Events.HCE_STATE_READ, () => {});
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
      if (isIos || useNdef) {
        if (!isIos) {
          setVisible(true);
        }
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
  return (
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
        callback={shareWithNFC}
      />
      <OptionCTA
        icon={
          <CircleIconWrapper
            width={wp(38)}
            backgroundColor={`${colorMode}.pantoneGreen`}
            icon={<AirDropIcon />}
          />
        }
        title={`${isIos ? 'Airdrop / ' : ''}File \nExport`}
        callback={shareWithAirdrop}
      />
      {remoteShare && (
        <OptionCTA
          icon={
            <CircleIconWrapper
              width={wp(38)}
              backgroundColor={`${colorMode}.pantoneGreen`}
              icon={<RemoteShareIcon />}
            />
          }
          title={!isPSBTSharing ? 'Remote share' : 'Remote \ntransaction link'}
          callback={() =>
            navigation.navigate('RemoteSharing', {
              psbt: data,
              mode: isPSBTSharing
                ? isSignedPSBT
                  ? RKInteractionMode.SHARE_SIGNED_PSBT
                  : RKInteractionMode.SHARE_PSBT
                : RKInteractionMode.SHARE_REMOTE_KEY,
              signer,
              xfp,
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
    gap: 20,
  },
});

export default ShareWithNfc;
