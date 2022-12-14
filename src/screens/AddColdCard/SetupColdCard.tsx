import { Alert, StyleSheet } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { SignerStorage, SignerType } from 'src/core/wallets/enums';
import {
  getCCGenericJSON,
  getColdcardDetails,
  getMockColdcardDetails,
} from 'src/hardware/coldcard';

import { Box } from 'native-base';
import Buttons from 'src/components/Buttons';
import HeaderTitle from 'src/components/HeaderTitle';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import React from 'react';
import { TapGestureHandler } from 'react-native-gesture-handler';
import WalletUtilities from 'src/core/wallets/operations/utils';
import { addSigningDevice } from 'src/store/sagaActions/vaults';
import { captureError } from 'src/core/services/sentry';
import config from 'src/core/config';
import { generateSignerFromMetaData } from 'src/hardware';
import { useDispatch } from 'react-redux';
import usePlan from 'src/hooks/usePlan';
import useNfcModal from 'src/hooks/useNfcModal';
import ScreenWrapper from 'src/components/ScreenWrapper';
import useToastMessage from 'src/hooks/useToastMessage';
import TickIcon from 'src/assets/images/icon_tick.svg';
import { checkSigningDevice } from '../Vault/AddSigningDevice';

function SetupColdCard() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { subscriptionScheme } = usePlan();
  const isMultisig = subscriptionScheme.n !== 1;

  const { nfcVisible, withNfcModal } = useNfcModal();
  const { showToast } = useToastMessage();

  const addColdCard = async () => {
    try {
      const ccDetails = await withNfcModal(isMultisig ? getColdcardDetails : getCCGenericJSON);
      let { xpub } = ccDetails;
      const { derivationPath, xfp } = ccDetails;
      const network = WalletUtilities.getNetworkByType(config.NETWORK_TYPE);
      xpub = WalletUtilities.generateXpubFromYpub(xpub, network);
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
    } catch (error) {
      captureError(error);
    }
  };

  const addMockColdCard = () => {
    try {
      const cc = getMockColdcardDetails();
      if (cc) {
        dispatch(addSigningDevice(cc));
        navigation.dispatch(CommonActions.navigate('AddSigningDevice'));
        showToast(`${cc.signerName} added successfully`, <TickIcon />);
      }
    } catch (error) {
      captureError(error);
    }
  };

  const instructions = isMultisig
    ? 'Go to Settings > Multisig wallets > Export xPub on your Coldcard'
    : 'Go to Advanced/Tools > Export wallet > Generic Wallet > export with NFC';
  return (
    <ScreenWrapper>
      <TapGestureHandler numberOfTaps={3} onActivated={addMockColdCard}>
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
          <NfcPrompt visible={nfcVisible} />
        </Box>
      </TapGestureHandler>
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
    padding: '5%',
  },
  buttonContainer: {
    bottom: 0,
    position: 'absolute',
    right: 0,
  },
});

export default SetupColdCard;
