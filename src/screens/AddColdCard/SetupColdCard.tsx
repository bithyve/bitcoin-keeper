import { StyleSheet } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { SignerStorage, SignerType } from 'src/core/wallets/enums';
import { getColdcardDetails } from 'src/hardware/coldcard';

import { Box } from 'native-base';
import HeaderTitle from 'src/components/HeaderTitle';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import React, { useEffect } from 'react';
import { addSigningDevice } from 'src/store/sagaActions/vaults';
import { captureError } from 'src/core/services/sentry';
import { generateSignerFromMetaData } from 'src/hardware';
import { useDispatch } from 'react-redux';
import usePlan from 'src/hooks/usePlan';
import useNfcModal from 'src/hooks/useNfcModal';
import ScreenWrapper from 'src/components/ScreenWrapper';
import useToastMessage from 'src/hooks/useToastMessage';
import TickIcon from 'src/assets/images/icon_tick.svg';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import HWError from 'src/hardware/HWErrorState';
import useAsync from 'src/hooks/useAsync';
import NfcManager from 'react-native-nfc-manager';
import DeviceInfo from 'react-native-device-info';
import { checkSigningDevice } from '../Vault/AddSigningDevice';
import MockWrapper from '../Vault/MockWrapper';
import { healthCheckSigner } from 'src/store/sagaActions/bhr';

function SetupColdCard({ route }) {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { subscriptionScheme } = usePlan();
  const isMultisig = subscriptionScheme.n !== 1;
  const { isHealthcheck = false, signer } = route.params;
  const { nfcVisible, withNfcModal, closeNfc } = useNfcModal();
  const { showToast } = useToastMessage();
  const { start } = useAsync();

  useEffect(() => {
    NfcManager.isSupported().then((supported) => {
      if (supported) {
        if (isHealthcheck) verifyColdCardWithProgress();
        else {
          addColdCardWithProgress();
        }
      } else if (!DeviceInfo.isEmulator()) {
        showToast('NFC not supported on this device', <ToastErrorIcon />, 3000);
      }
    });
  }, []);

  const addColdCardWithProgress = async () => {
    await start(addColdCard);
  };

  const verifyColdCardWithProgress = async () => {
    await start(verifyColdCard);
  };

  const addColdCard = async () => {
    try {
      const ccDetails = await withNfcModal(async () => getColdcardDetails(isMultisig));
      const { xpub, derivationPath, xfp, xpubDetails } = ccDetails;
      const coldcard = generateSignerFromMetaData({
        xpub,
        derivationPath,
        xfp,
        isMultisig,
        signerType: SignerType.COLDCARD,
        storageType: SignerStorage.COLD,
        xpubDetails,
      });
      dispatch(addSigningDevice(coldcard));
      navigation.dispatch(CommonActions.navigate('AddSigningDevice'));
      showToast(`${coldcard.signerName} added successfully`, <TickIcon />);
      const exsists = await checkSigningDevice(coldcard.signerId);
      if (exsists) showToast('Warning: Vault with this signer already exisits', <ToastErrorIcon />);
    } catch (error) {
      if (error instanceof HWError) {
        showToast(error.message, <ToastErrorIcon />, 3000);
      } else if (error.toString() === 'Error') {
        // ignore if user cancels NFC interaction
      } else captureError(error);
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
        showToast('Something went worng!', <ToastErrorIcon />, 3000);
      }
    } catch (error) {
      if (error instanceof HWError) {
        showToast(error.message, <ToastErrorIcon />, 3000);
      } else if (error.toString() === 'Error') {
        // ignore if user cancels NFC interaction
      } else captureError(error);
    }
  };

  const instructions = `Export the xPub by going to Advanced/Tools > Export wallet > Generic JSON. From here choose the account number and transfer over NFC. Make sure you remember the account you had chosen (This is important for recovering your vault).\n`;
  return (
    <ScreenWrapper>
      <MockWrapper signerType={SignerType.COLDCARD}>
        <Box flex={1}>
          <Box style={styles.header}>
            <HeaderTitle
              title={isHealthcheck ? 'Verify Coldcard' : 'Setting up Coldcard'}
              subtitle={instructions}
              onPressHandler={() => navigation.goBack()}
            />
          </Box>
          <NfcPrompt visible={nfcVisible} close={closeNfc} />
        </Box>
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
