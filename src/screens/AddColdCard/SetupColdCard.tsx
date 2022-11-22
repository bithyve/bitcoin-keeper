import { Alert, SafeAreaView, StyleSheet } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { SignerStorage, SignerType } from 'src/core/wallets/enums';
import { getColdcardDetails, getMockColdcardDetails } from 'src/hardware/coldcard';

import { Box } from 'native-base';
import Buttons from 'src/components/Buttons';
import HeaderTitle from 'src/components/HeaderTitle';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import React from 'react';
import { TapGestureHandler } from 'react-native-gesture-handler';
import WalletUtilities from 'src/core/wallets/operations/utils';
import { addSigningDevice } from 'src/store/sagaActions/vaults';
import { captureError } from 'src/core/services/sentry';
import { checkSigningDevice } from '../Vault/AddSigningDevice';
import config from 'src/core/config';
import { generateSignerFromMetaData } from 'src/hardware';
import { useDispatch } from 'react-redux';
import useNfcModal from 'src/hooks/useNfcModal';

const SetupColdCard = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const { nfcVisible, withNfcModal } = useNfcModal();

  const addColdCard = async () => {
    try {
      const { xpub, derivationPath, xfp } = await withNfcModal(getColdcardDetails);
      const coldcard = generateSignerFromMetaData({
        xpub,
        derivationPath,
        xfp,
        signerType: SignerType.TAPSIGNER,
        storageType: SignerStorage.COLD,
      });
      const network = WalletUtilities.getNetworkByType(config.NETWORK_TYPE);
      coldcard.xpub = WalletUtilities.generateXpubFromYpub(xpub, network);
      const exsists = await checkSigningDevice(coldcard.signerId);
      if (exsists) Alert.alert('Warning: Vault with this signer already exisits');
      dispatch(addSigningDevice(coldcard));
      navigation.dispatch(CommonActions.navigate('AddSigningDevice'));
    } catch (error) {
      captureError(error);
    }
  };

  const addMockColdCard = () => {
    try {
      const cc = getMockColdcardDetails();
      dispatch(addSigningDevice(cc));
      navigation.dispatch(CommonActions.navigate('AddSigningDevice'));
    } catch (error) {
      captureError(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TapGestureHandler numberOfTaps={3} onActivated={addMockColdCard}>
        <Box flex={1}>
          <Box style={styles.header}>
            <HeaderTitle
              title="Setting up Coldcard"
              subtitle="Go to Settings > Multisig wallets > Export xPub on your Coldcard"
              onPressHandler={() => navigation.goBack()}
            />
            <Box style={{ padding: 30 }}>
              <Buttons primaryText="Proceed" primaryCallback={addColdCard} />
            </Box>
          </Box>
          <NfcPrompt visible={nfcVisible} />
        </Box>
      </TapGestureHandler>
    </SafeAreaView>
  );
};

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
});

export default SetupColdCard;
