import { Alert, StyleSheet } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { SignerStorage, SignerType } from 'src/core/wallets/enums';
import { getColdcardDetails } from 'src/hardware/coldcard';

import { Box } from 'native-base';
import Buttons from 'src/components/Buttons';
import HeaderTitle from 'src/components/HeaderTitle';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import React from 'react';
import { addSigningDevice } from 'src/store/sagaActions/vaults';
import { captureError } from 'src/core/services/sentry';
import { generateSignerFromMetaData } from 'src/hardware';
import { useDispatch } from 'react-redux';
import usePlan from 'src/hooks/usePlan';
import useNfcModal from 'src/hooks/useNfcModal';
import ScreenWrapper from 'src/components/ScreenWrapper';
import useToastMessage from 'src/hooks/useToastMessage';
import TickIcon from 'src/assets/images/icon_tick.svg';
import HWError from 'src/hardware/HWErrorState';
import { checkSigningDevice } from '../Vault/AddSigningDevice';
import MockWrapper from '../Vault/MockWrapper';

function SetupColdCard() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { subscriptionScheme } = usePlan();
  const isMultisig = subscriptionScheme.n !== 1;

  const { nfcVisible, withNfcModal, closeNfc } = useNfcModal();
  const { showToast } = useToastMessage();

  const addColdCard = async () => {
    try {
      const ccDetails = await withNfcModal(getColdcardDetails);
      const { xpub, derivationPath, xfp, forMultiSig, forSingleSig } = ccDetails;
      if ((isMultisig && forMultiSig) || (!isMultisig && forSingleSig)) {
        const coldcard = generateSignerFromMetaData({
          xpub,
          derivationPath,
          xfp,
          signerType: SignerType.COLDCARD,
          storageType: SignerStorage.COLD,
        });
        dispatch(addSigningDevice(coldcard));
        navigation.dispatch(CommonActions.navigate('AddSigningDevice'));
        showToast(`${coldcard.signerName} added successfully`, <TickIcon />);
        const exsists = await checkSigningDevice(coldcard.signerId);
        if (exsists) Alert.alert('Warning: Vault with this signer already exisits');
      } else {
        showToast(`Looks like you are scanning from the wrong section`, null, 3000, true);
      }
    } catch (error) {
      if (error instanceof HWError) {
        showToast(error.message, null, 3000, true);
      } else if (error.toString() === 'Error') {
        // do nothing when nfc is dismissed
      } else {
        captureError(error);
      }
    }
  };

  const instructions = isMultisig
    ? 'Go to Settings > Multisig wallets > Export xPub on your Coldcard'
    : 'Go to Advanced/Tools > Export wallet > Generic Wallet > export with NFC';
  return (
    <ScreenWrapper>
      <MockWrapper signerType={SignerType.COLDCARD}>
        <Box flex={1}>
          <Box style={styles.header}>
            <HeaderTitle
              title="Setting up Coldcard"
              subtitle={instructions}
              onPressHandler={() => navigation.goBack()}
            />
            <Box style={styles.buttonContainer}>
              <Buttons activeOpacity={0.7} primaryText="Proceed" primaryCallback={addColdCard} />
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

export default SetupColdCard;
