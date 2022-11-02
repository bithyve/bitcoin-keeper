import { Alert, SafeAreaView, StyleSheet } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { EntityKind, SignerStorage, SignerType } from 'src/core/wallets/enums';
import config, { APP_STAGE } from 'src/core/config';
import { getCCGenericJSON, getCCxPubForMultisig } from 'src/hardware/coldcard';

import { Box } from 'native-base';
import Buttons from 'src/components/Buttons';
import HeaderTitle from 'src/components/HeaderTitle';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import React from 'react';
import { TapGestureHandler } from 'react-native-gesture-handler';
import { VaultSigner } from 'src/core/wallets/interfaces/vault';
import WalletUtilities from 'src/core/wallets/operations/utils';
import { addSigningDevice } from 'src/store/sagaActions/vaults';
import { checkSigningDevice } from '../Vault/AddSigningDevice';
import { generateMockExtendedKeyForSigner } from 'src/core/wallets/factories/VaultFactory';
import { useDispatch } from 'react-redux';
import usePlan from 'src/hooks/usePlan';

const SetupColdCard = () => {
  const [nfcVisible, setNfcVisible] = React.useState(false);
  const { subscriptionScheme } = usePlan();
  const isMultisig = subscriptionScheme.n !== 1;
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const getColdCardDetails = async () => {
    setNfcVisible(true);
    try {
      if (isMultisig) {
        const { xpub, path: derivationPath, xfp } = await getCCxPubForMultisig();
        setNfcVisible(false);
        return { xpub, derivationPath, xfp };
      } else {
        const { xpub, xfp, deriv: derivationPath } = await getCCGenericJSON();
        setNfcVisible(false);
        return { xpub, derivationPath, xfp };
      }
    } catch (err) {
      console.log(err);
      setNfcVisible(false);
    }
  };

  const saveColdCard = async (coldCardData) => {
    let { xpub, derivationPath, xfp } = coldCardData;
    const networkType = config.NETWORK_TYPE;
    const network = WalletUtilities.getNetworkByType(networkType);
    xpub = WalletUtilities.generateXpubFromYpub(xpub, network);
    const signer: VaultSigner = {
      signerId: WalletUtilities.getFingerprintFromExtendedKey(xpub, network),
      type: SignerType.COLDCARD,
      signerName: 'Mk4',
      xpub,
      xpubInfo: {
        derivationPath,
        xfp,
      },
      lastHealthCheck: new Date(),
      addedOn: new Date(),
      storageType: SignerStorage.COLD,
    };
    const exsists = await checkSigningDevice(signer.signerId);
    if (exsists) Alert.alert('Warning: Vault with this signer already exisits');
    dispatch(addSigningDevice(signer));
  };

  const addColdCard = async () => {
    try {
      const colcard = await getColdCardDetails();
      saveColdCard(colcard);
      navigation.dispatch(CommonActions.navigate('AddSigningDevice'));
    } catch (err) {
      console.log(err);
    }
  };

  const addMockColdCard = () => {
    try {
      if (config.ENVIRONMENT === APP_STAGE.DEVELOPMENT) {
        const networkType = config.NETWORK_TYPE;
        const network = WalletUtilities.getNetworkByType(networkType);
        const { xpub, xpriv, derivationPath, masterFingerprint } = generateMockExtendedKeyForSigner(
          EntityKind.VAULT,
          SignerType.COLDCARD,
          networkType
        );
        const cc: VaultSigner = {
          signerId: WalletUtilities.getFingerprintFromExtendedKey(xpub, network),
          type: SignerType.COLDCARD,
          isMock: true,
          signerName: 'Mk4**',
          xpub,
          xpriv,
          xpubInfo: {
            derivationPath,
            xfp: masterFingerprint,
          },
          lastHealthCheck: new Date(),
          addedOn: new Date(),
          storageType: SignerStorage.COLD,
        };
        dispatch(addSigningDevice(cc));
        navigation.dispatch(CommonActions.navigate('AddSigningDevice'));
      }
    } catch (err) {
      console.log(err);
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
