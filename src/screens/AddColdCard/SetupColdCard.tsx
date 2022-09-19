import { Alert, SafeAreaView, StyleSheet } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { EntityKind, NetworkType, SignerType } from 'src/core/wallets/enums';
import config, { APP_STAGE } from 'src/core/config';

import { Box } from 'native-base';
import Buttons from 'src/components/Buttons';
import HeaderTitle from 'src/components/HeaderTitle';
import NFC from 'src/core/services/nfc';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import { NfcTech } from 'react-native-nfc-manager';
import React from 'react';
import { TapGestureHandler } from 'react-native-gesture-handler';
import { VaultSigner } from 'src/core/wallets/interfaces/vault';
import WalletUtilities from 'src/core/wallets/operations/utils';
import { addSigningDevice } from 'src/store/sagaActions/vaults';
import { checkSigningDevice } from '../Vault/AddSigningDevice';
import { generateMockExtendedKey } from 'src/core/wallets/factories/VaultFactory';
import { useDispatch } from 'react-redux';

const SetupColdCard = () => {
  const [nfcVisible, setNfcVisible] = React.useState(false);

  const dispatch = useDispatch();
  const navigation = useNavigation();

  const scanMK4 = async () => {
    setNfcVisible(true);
    try {
      const { data, rtdName } = (await NFC.read(NfcTech.NfcV))[0];
      const xpub = rtdName === 'URI' ? data : rtdName === 'TEXT' ? data : data.p2sh_p2wsh;
      const path = data?.p2sh_p2wsh_deriv ?? '';
      const xfp = data?.xfp ?? '';
      setNfcVisible(false);
      return { xpub, path, xfp };
    } catch (err) {
      console.log(err);
      setNfcVisible(false);
    }
  };

  const getColdCardDetails = async () => {
    const { xpub, path: derivationPath, xfp } = await scanMK4();
    return { xpub, derivationPath, xfp };
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
        const networkType = NetworkType.TESTNET;
        const network = WalletUtilities.getNetworkByType(networkType);
        const { xpub, xpriv, derivationPath, masterFingerprint } = generateMockExtendedKey(
          EntityKind.VAULT
        );
        // const xpub =
        //   'tpubDFVWQv8KEuYKsVZ5ZAGjjdRbWkfXq2qt1mGRAEmAWPM8T4ssZoamRJ2bAR3a2EcWZfguebFt6s7qcBPcsUUxXYJcRhaGGD7cexiGyiMmVF2';
        // const xpriv =
        //   'tprv8ioUGW656Xrez2XHfWc9LDmUwj9bfheySTfdsiis67Yjcad6wQmBEoQizGaW68XnAQsxRdhG3oRvnN4Thb5PxqH9SppW8iGKLxnMnCwE64i';
        // const masterFingerprint = '129D089F';
        // const derivationPath = "m/48'/1'/746975'/1'"; // bip48/testnet/account/script/
        const cc: VaultSigner = {
          signerId: WalletUtilities.getFingerprintFromExtendedKey(xpub, network),
          type: SignerType.COLDCARD,
          isMock: true,
          signerName: 'Mk4 (Mock)',
          xpub,
          xpriv,
          xpubInfo: {
            derivationPath,
            xfp: masterFingerprint,
          },
          lastHealthCheck: new Date(),
          addedOn: new Date(),
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
              title="Setting up ColdCard"
              subtitle="Go to Settings > Multisig wallets > Export xPub on your ColdCard"
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
