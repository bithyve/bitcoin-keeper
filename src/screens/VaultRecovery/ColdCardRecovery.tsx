import { StyleSheet } from 'react-native';
import { SignerStorage, SignerType } from 'src/core/wallets/enums';
import { Box } from 'native-base';
import Buttons from 'src/components/Buttons';
import HeaderTitle from 'src/components/HeaderTitle';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import React from 'react';
import { setSigningDevices } from 'src/store/reducers/bhr';
import { useDispatch } from 'react-redux';
import { CommonActions, useNavigation } from '@react-navigation/native';
import useNfcModal from 'src/hooks/useNfcModal';
import { getColdcardDetails } from 'src/hardware/coldcard';
import useToastMessage from 'src/hooks/useToastMessage';
import { generateSignerFromMetaData } from 'src/hardware';
import { captureError } from 'src/core/services/sentry';
import ScreenWrapper from 'src/components/ScreenWrapper';
import HWError from 'src/hardware/HWErrorState';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import TickIcon from 'src/assets/images/icon_tick.svg';
import { useAppSelector } from 'src/store/hooks';
import MockWrapper from '../Vault/MockWrapper';
import NFC from 'src/core/services/nfc';
import { NfcTech } from 'react-native-nfc-manager';

function ColdCardReocvery({ route }) {
  const { isConfigRecovery = false, initateRecovery } = route.params || {};
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { signingDevices } = useAppSelector((state) => state.bhr);
  const isMultisig = signingDevices.length >= 1;
  const { nfcVisible, withNfcModal, closeNfc } = useNfcModal();
  const { showToast } = useToastMessage();

  const getConfigDetails = async () => {
    const { data } = (await NFC.read(NfcTech.NfcV))[0];
    return data;
  };

  const recoverConfigCC = async () => {
    const config = await withNfcModal(async () => getConfigDetails());
    initateRecovery(config);
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
      dispatch(setSigningDevices(coldcard));
      navigation.dispatch(
        CommonActions.navigate('LoginStack', { screen: 'VaultRecoveryAddSigner' })
      );
      showToast(`${coldcard.signerName} added successfully`, <TickIcon />);
    } catch (error) {
      if (error instanceof HWError) {
        showToast(error.message, <ToastErrorIcon />, 3000);
      } else {
        captureError(error);
      }
    }
  };

  const instructions = isConfigRecovery
    ? 'Export the vault config by going to Setting > Multisig > Then select the wallet > Export  '
    : 'Export the xPub by going to Advanced/Tools > Export wallet > Generic JSON. From here choose the account number and transfer over NFC. Make sure you remember the account you had chosen (This is important for recovering your vault).';
  return (
    <ScreenWrapper>
      <MockWrapper signerType={SignerType.COLDCARD} isRecovery>
        <Box flex={1}>
          <Box style={styles.header}>
            <HeaderTitle
              title={isConfigRecovery ? 'Recover from ColdCard' : 'Setting up Coldcard'}
              subtitle={instructions}
              onPressHandler={() => navigation.goBack()}
            />
            <Box style={styles.buttonContainer}>
              <Buttons
                activeOpacity={0.7}
                primaryText="Proceed"
                primaryCallback={isConfigRecovery ? recoverConfigCC : addColdCard}
              />
            </Box>
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

export default ColdCardReocvery;
