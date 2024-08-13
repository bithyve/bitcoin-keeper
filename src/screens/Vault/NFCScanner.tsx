import { StyleSheet } from 'react-native';
import React from 'react';
import ScreenWrapper from 'src/components/ScreenWrapper';
import KeeperHeader from 'src/components/KeeperHeader';
import { Box, useColorMode } from 'native-base';
import Instruction from 'src/components/Instruction';
import Buttons from 'src/components/Buttons';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import useNfcModal from 'src/hooks/useNfcModal';
import NfcManager from 'react-native-nfc-manager';
import useToastMessage, { IToastCategory } from 'src/hooks/useToastMessage';
import deviceInfoModule from 'react-native-device-info';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { generateSignerFromMetaData } from 'src/hardware';
import { getColdcardDetails } from 'src/hardware/coldcard';
import { SignerStorage, SignerType } from 'src/services/wallets/enums';
import { useDispatch } from 'react-redux';
import { addSigningDevice } from 'src/store/sagaActions/vaults';
import { CommonActions, useNavigation } from '@react-navigation/native';
import HWError from 'src/hardware/HWErrorState';
import { captureError } from 'src/services/sentry';
import TickIcon from 'src/assets/images/icon_tick.svg';

function NFCScanner({ route }) {
  const { colorMode } = useColorMode();
  const { nfcVisible, withNfcModal, closeNfc } = useNfcModal();
  const { showToast } = useToastMessage();
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const { isMultisig, addSignerFlow = false }: { isMultisig: boolean; addSignerFlow?: boolean } =
    route.params;

  const addColdCard = async () => {
    try {
      const ccDetails = await withNfcModal(async () => getColdcardDetails(isMultisig));
      const { xpub, derivationPath, masterFingerprint, xpubDetails } = ccDetails;
      const { signer } = generateSignerFromMetaData({
        xpub,
        derivationPath,
        masterFingerprint,
        isMultisig,
        signerType: SignerType.COLDCARD,
        storageType: SignerStorage.COLD,
        xpubDetails,
      });

      dispatch(addSigningDevice([signer]));
      const navigationState = addSignerFlow
        ? {
            name: 'ManageSigners',
            params: { addedSigner: signer, addSignerFlow, showModal: true },
          }
        : {
            name: 'AddSigningDevice',
            merge: true,
            params: { addedSigner: signer, addSignerFlow, showModal: true },
          };
      navigation.dispatch(CommonActions.navigate(navigationState));
    } catch (error) {
      if (error instanceof HWError) {
        showToast(error.message, <ToastErrorIcon />);
      } else if (error.toString() !== 'Error') {
        captureError(error);
      }
    }
  };

  const interactWithNFC = () => {
    NfcManager.isSupported().then((supported) => {
      if (supported) {
        addColdCard();
      } else if (!deviceInfoModule.isEmulator()) {
        showToast('NFC not supported on this device', <ToastErrorIcon />);
      }
    });
  };

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader title="NFC Scanner" subtitle="Add any NFC based signing devvice" />
      <Box style={styles.container}>
        <Instruction text="Make sure your NFC device is turned on and unlocked" />
        <Instruction text="Place your NFC device on the back of your phone" />
        <Instruction text="Your NFC device will be automatically detected" />
      </Box>
      <Buttons primaryText="Scan" primaryCallback={interactWithNFC} />
      <NfcPrompt visible={nfcVisible} close={closeNfc} />
    </ScreenWrapper>
  );
}

export default NFCScanner;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 20,
  },
});
