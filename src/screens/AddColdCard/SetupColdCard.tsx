import { CommonActions, useNavigation } from '@react-navigation/native';
import { EntityKind, NetworkType, SignerType, VaultType } from 'src/core/wallets/enums';
import React, { useCallback } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { VaultScheme, VaultSigner } from 'src/core/wallets/interfaces/vault';
import config, { APP_STAGE } from 'src/core/config';

import { Box } from 'native-base';
import Buttons from 'src/components/Buttons';
import HeaderTitle from 'src/components/HeaderTitle';
import NFC from 'src/core/services/nfc';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import { NfcTech } from 'react-native-nfc-manager';
import { TapGestureHandler } from 'react-native-gesture-handler';
import WalletUtilities from 'src/core/wallets/operations/utils';
import { addNewVault } from 'src/store/sagaActions/wallets';
import crypto from 'crypto';
import { generateMockExtendedKey } from 'src/core/wallets/factories/WalletFactory';
import { newVaultInfo } from 'src/store/sagas/wallets';
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

  const createVault = useCallback((signers: VaultSigner[], scheme: VaultScheme) => {
    try {
      const newVaultInfo: newVaultInfo = {
        vaultType: VaultType.DEFAULT,
        vaultScheme: scheme,
        vaultSigners: signers,
        vaultDetails: {
          name: 'Vault',
          description: 'Secure your sats',
        },
      };
      dispatch(addNewVault(newVaultInfo));
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }, []);

  const getColdCardDetails = async () => {
    let { xpub, path: derivationPath, xfp } = await scanMK4();
    const networkType =
      config.APP_STAGE === APP_STAGE.DEVELOPMENT ? NetworkType.TESTNET : NetworkType.MAINNET;
    const network = WalletUtilities.getNetworkByType(networkType);
    xpub = WalletUtilities.generateXpubFromYpub(xpub, network);
    const cc: VaultSigner = {
      signerId: WalletUtilities.getFingerprintFromExtendedKey(xpub, network),
      type: SignerType.COLDCARD,
      signerName: 'MK4',
      xpub,
      xpubInfo: {
        derivationPath,
        xfp,
      },
      lastHealthCheck: new Date(),
    };

    return { signer: cc };
  };

  const generateMockColdCard = () => {
    const networkType =
      config.APP_STAGE === APP_STAGE.DEVELOPMENT ? NetworkType.TESTNET : NetworkType.MAINNET;
    const network = WalletUtilities.getNetworkByType(networkType);
    // const {
    //   xpub,
    //   xpriv,
    //   masterFingerprint: xfp,
    //   derivationPath,
    // } = generateMockExtendedKey(EntityKind.VAULT);
    // console.log({ xpub, xpriv, xfp, derivationPath });
    const xpub =
      'tpubDEz4E4PRhw6hjJqFGDG9GTVKzVd7QpMKz4BpY3V85qZKgwTvrLKR5k15fxDJGbfeoepEHuJGt8FovvrCdk2ZAYRSPE9ivfD9rMWRbiVwczM';
    const xpriv =
      'tprv8iJ25eMBZZR2qqoTNZbYs3qDRU7BFVARQkb3FXSpfZkvrTDADwVpuFPDVobsy8fHqVCtg5tvPEiQtSgZPvijDVgA6BTv73X8kqZXXDdvCcf';
    const xfp = '73DC8582';
    const derivationPath = "m/48'/1'/521304'/1'"; // bip48/testnet/account/script/
    const cc: VaultSigner = {
      signerId: WalletUtilities.getFingerprintFromExtendedKey(xpub, network),
      type: SignerType.COLDCARD,
      signerName: 'MK4 (mock)',
      xpub,
      xpriv,
      xpubInfo: {
        derivationPath,
        xfp,
      },
      lastHealthCheck: new Date(),
    };
    return { signer: cc };
  };

  const createVaultWithCC = async () => {
    try {
      const { signer } = await getColdCardDetails();
      const { signer: signer2 } = generateMockColdCard();
      const scheme: VaultScheme = { m: 2, n: 2 };
      createVault([signer, signer2], scheme);
      navigation.dispatch(CommonActions.navigate('NewHome'));
    } catch (err) {
      console.log(err);
    }
  };

  const MockVaultCreation = () => {
    if (config.APP_STAGE === APP_STAGE.DEVELOPMENT) {
      const networkType = NetworkType.TESTNET;
      const network = WalletUtilities.getNetworkByType(networkType);

      const { xpub, xpriv, derivationPath, masterFingerprint } = generateMockExtendedKey(
        EntityKind.VAULT
      );
      const mockColdCard: VaultSigner = {
        signerId: WalletUtilities.getFingerprintFromExtendedKey(xpub, network),
        type: SignerType.COLDCARD,
        signerName: 'ColdCard',
        xpub: xpub,
        xpriv,
        xpubInfo: {
          derivationPath,
          xfp: masterFingerprint,
        },
        lastHealthCheck: new Date(),
      };

      const scheme: VaultScheme = { m: 1, n: 1 };
      const isVaultCreated = createVault([mockColdCard], scheme);
      if (isVaultCreated) navigation.dispatch(CommonActions.navigate('NewHome'));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TapGestureHandler numberOfTaps={3} onActivated={MockVaultCreation}>
        <Box flex={1}>
          <Box style={styles.header}>
            <HeaderTitle
              title="Setting up ColdCard"
              subtitle="Go to Settings > Multisig wallets > Export xPub on your ColdCard"
              onPressHandler={() => navigation.goBack()}
            />
            <Box style={{ padding: 30 }}>
              <Buttons primaryText="Proceed" primaryCallback={createVaultWithCC} />
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
