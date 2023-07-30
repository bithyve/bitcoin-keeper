import React from 'react';
import OptionCTA from 'src/components/OptionCTA';
import NFCIcon from 'src/assets/images/nfc.svg';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import { captureError } from 'src/core/services/sentry';
import useToastMessage from 'src/hooks/useToastMessage';
import nfcManager, { NfcTech } from 'react-native-nfc-manager';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import NFC from 'src/core/services/nfc';
import { SignerType } from 'src/core/wallets/enums';

function NFCOption({ nfcVisible, closeNfc, withNfcModal, setData, signerType }) {
  const { showToast } = useToastMessage();
  const readFromNFC = async () => {
    try {
      await withNfcModal(async () => {
        const records = await NFC.read([NfcTech.Ndef]);
        try {
          const cosigner = records[0].data;
          setData(cosigner);
        } catch (err) {
          captureError(err);
          showToast('Please scan a valid cosigner tag', <ToastErrorIcon />);
        }
      });
    } catch (err) {
      if (err.toString() === 'Error') {
        console.log('NFC interaction cancelled');
        return;
      }
      captureError(err);
      showToast('Something went wrong.', <ToastErrorIcon />);
    } finally {
      await nfcManager.cancelTechnologyRequest();
    }
  };
  if (signerType !== SignerType.KEEPER) {
    return null;
  }
  return (
    <>
      <OptionCTA
        icon={<NFCIcon />}
        title="or Setup via NFC"
        subtitle="Bring device close to use NFC"
        callback={readFromNFC}
      />
      <NfcPrompt visible={nfcVisible} close={closeNfc} />
    </>
  );
}

export default NFCOption;
