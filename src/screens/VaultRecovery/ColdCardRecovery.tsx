import { Alert, SafeAreaView, StyleSheet } from 'react-native';
import { EntityKind, SignerType } from 'src/core/wallets/enums';
import config, { APP_STAGE } from 'src/core/config';

import { Box } from 'native-base';
import Buttons from 'src/components/Buttons';
import HeaderTitle from 'src/components/HeaderTitle';
import NFC from 'src/core/services/nfc';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import { NfcTech } from 'react-native-nfc-manager';
import React from 'react';
import { SigningDeviceRecovery } from 'src/common/data/enums/BHR';
import { TapGestureHandler } from 'react-native-gesture-handler';
import WalletUtilities from 'src/core/wallets/operations/utils';
import { generateMockExtendedKeyForSigner } from 'src/core/wallets/factories/VaultFactory';
import { setSigningDevices } from 'src/store/reducers/bhr';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import useNfcModal from 'src/hooks/useNfcModal';
import { getColdcardDetails } from 'src/hardware/coldcard';

function ColdCardReocvery() {
  const { nfcVisible, withNfcModal, closeNfc } = useNfcModal();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const getColdCardDetails = async () => {
    const { xpub, path: derivationPath, xfp } = await withNfcModal(getColdcardDetails);
    return { xpub, derivationPath, xfp };
  };

  const verifyColdCard = async () => {
    try {
      const coldcard = await getColdCardDetails();
      const networkType = config.NETWORK_TYPE;
      const network = WalletUtilities.getNetworkByType(networkType);
      const xpub = WalletUtilities.generateXpubFromYpub(coldcard.xpub, network);
      const sigingDeivceDetails: SigningDeviceRecovery = {
        signerId: WalletUtilities.getFingerprintFromExtendedKey(xpub, network),
        xpub,
        type: SignerType.COLDCARD,
      };
      dispatch(setSigningDevices(sigingDeivceDetails));
      navigation.navigate('LoginStack', { screen: 'VaultRecoveryAddSigner' });
    } catch (err) {
      console.log(err);
    }
  };

  const getMockColdCardDetails = () => {
    const networkType = config.NETWORK_TYPE;
    const network = WalletUtilities.getNetworkByType(networkType);
    const { xpub } = generateMockExtendedKeyForSigner(
      EntityKind.VAULT,
      SignerType.COLDCARD,
      networkType
    );
    const signerId = WalletUtilities.getFingerprintFromExtendedKey(xpub, network);
    const cc: SigningDeviceRecovery = {
      signerId,
      type: SignerType.COLDCARD,
      xpub,
    };
    return cc;
  };

  const addMockColdCard = React.useCallback(async () => {
    try {
      if (config.ENVIRONMENT === APP_STAGE.DEVELOPMENT) {
        const mockColdCard: SigningDeviceRecovery = getMockColdCardDetails();
        dispatch(setSigningDevices(mockColdCard));
        navigation.navigate('LoginStack', { screen: 'VaultRecoveryAddSigner' });
      }
    } catch (err) {
      Alert.alert(err.toString());
    }
  }, []);

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
              <Buttons primaryText="Verify" primaryCallback={verifyColdCard} />
            </Box>
          </Box>
          <NfcPrompt visible={nfcVisible} close={closeNfc} />
        </Box>
      </TapGestureHandler>
    </SafeAreaView>
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
});

export default ColdCardReocvery;
