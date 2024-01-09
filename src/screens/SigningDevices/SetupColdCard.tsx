import { StyleSheet } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { SignerStorage, SignerType } from 'src/core/wallets/enums';
import { getColdcardDetails } from 'src/hardware/coldcard';

import { Box, useColorMode } from 'native-base';
import KeeperHeader from 'src/components/KeeperHeader';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import React, { useEffect } from 'react';
import { addSigningDevice } from 'src/store/sagaActions/vaults';
import { captureError } from 'src/services/sentry';
import { generateSignerFromMetaData } from 'src/hardware';
import { useDispatch } from 'react-redux';
import useNfcModal from 'src/hooks/useNfcModal';
import ScreenWrapper from 'src/components/ScreenWrapper';
import useToastMessage from 'src/hooks/useToastMessage';
import TickIcon from 'src/assets/images/icon_tick.svg';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import HWError from 'src/hardware/HWErrorState';
import useAsync from 'src/hooks/useAsync';
import NfcManager from 'react-native-nfc-manager';
import DeviceInfo from 'react-native-device-info';
import { healthCheckSigner } from 'src/store/sagaActions/bhr';
import MockWrapper from 'src/screens/Vault/MockWrapper';
import { InteracationMode } from '../Vault/HardwareModalMap';
import { setSigningDevices } from 'src/store/reducers/bhr';
import { VaultSigner } from 'src/core/wallets/interfaces/vault';

function SetupColdCard({ route }) {
  const { colorMode } = useColorMode();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const {
    mode,
    signer,
    isMultisig,
    addSignerFlow = false,
  }: {
    mode: InteracationMode;
    signer: VaultSigner;
    isMultisig: boolean;
    addSignerFlow?: boolean;
  } = route.params;
  const { nfcVisible, withNfcModal, closeNfc } = useNfcModal();
  const { showToast } = useToastMessage();
  const { start } = useAsync();

  useEffect(() => {
    NfcManager.isSupported().then((supported) => {
      if (supported) {
        if (mode === InteracationMode.HEALTH_CHECK) verifyColdCardWithProgress();
        else {
          addColdCardWithProgress();
        }
      } else if (!DeviceInfo.isEmulator()) {
        showToast('NFC not supported on this device', <ToastErrorIcon />, 3000);
      }
    });
  }, []);

  const handleNFCError = (error) => {
    if (error instanceof HWError) {
      showToast(error.message, <ToastErrorIcon />, 3000);
    } else if (error.toString() !== 'Error') {
      captureError(error);
    }
  };

  const addColdCardWithProgress = async () => {
    await start(() => addColdCard(mode));
  };

  const verifyColdCardWithProgress = async () => {
    await start(verifyColdCard);
  };

  const addColdCard = async (mode) => {
    try {
      const ccDetails = await withNfcModal(async () => getColdcardDetails(isMultisig));
      const { xpub, derivationPath, masterFingerprint, xpubDetails } = ccDetails;
      const { signer: coldcard, key } = generateSignerFromMetaData({
        xpub,
        derivationPath,
        masterFingerprint,
        isMultisig,
        signerType: SignerType.COLDCARD,
        storageType: SignerStorage.COLD,
        xpubDetails,
      });

      if (mode === InteracationMode.RECOVERY) {
        dispatch(setSigningDevices(coldcard));
        navigation.dispatch(
          CommonActions.navigate('LoginStack', { screen: 'VaultRecoveryAddSigner' })
        );
      } else {
        dispatch(addSigningDevice([coldcard], [key], addSignerFlow));
        const navigationState = addSignerFlow
          ? { name: 'ManageSigners' }
          : { name: 'AddSigningDevice', merge: true, params: {} };
        navigation.dispatch(CommonActions.navigate(navigationState));
      }

      showToast(`${coldcard.signerName} added successfully`, <TickIcon />);
    } catch (error) {
      handleNFCError(error);
    }
  };

  const verifyColdCard = async () => {
    try {
      const ccDetails = await withNfcModal(async () => getColdcardDetails(isMultisig));
      const { xpub } = ccDetails;
      if (xpub === signer.xpub) {
        dispatch(healthCheckSigner([signer]));
        navigation.dispatch(CommonActions.goBack());
        showToast(`ColdCard verified successfully`, <TickIcon />);
      } else {
        showToast('Something went wrong!', <ToastErrorIcon />, 3000);
      }
    } catch (error) {
      if (error instanceof HWError) {
        showToast(error.message, <ToastErrorIcon />, 3000);
      } else if (error.toString() === 'Error') {
        // ignore if user cancels NFC interaction
      } else captureError(error);
    }
  };

  const instructions = `Export the xPub by going to Advanced/Tools > Export wallet > Generic JSON. From here choose the account number and transfer over NFC. Make sure you remember the account you had chosen (This is important for recovering your Vault).\n`;
  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <MockWrapper signerType={SignerType.COLDCARD} addSignerFlow={addSignerFlow}>
        <Box style={styles.header}>
          <KeeperHeader
            title={
              mode === InteracationMode.HEALTH_CHECK ? 'Verify Coldcard' : 'Setting up Coldcard'
            }
            subtitle={instructions}
          />
        </Box>
        <NfcPrompt visible={nfcVisible} close={closeNfc} />
      </MockWrapper>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    paddingTop: 30,
  },
  header: {
    flex: 1,
  },
  buttonContainer: {
    bottom: 0,
    position: 'absolute',
    right: 0,
  },
});

export default SetupColdCard;
