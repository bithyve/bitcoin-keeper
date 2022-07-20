import { CommonActions, useNavigation } from '@react-navigation/native';
import { NetworkType, SignerType, VaultType } from 'src/core/wallets/enums';
import React, { useCallback, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { VaultScheme, VaultSigner } from 'src/core/wallets/interfaces/vault';
import config, { APP_STAGE } from 'src/core/config';

import NFC from 'src/core/services/nfc';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import { NfcTech } from 'react-native-nfc-manager';
import WalletUtilities from 'src/core/wallets/operations/utils';
import { addNewVault } from 'src/store/sagaActions/wallets';
import crypto from 'crypto';
import { newVaultInfo } from 'src/store/sagas/wallets';
import { useDispatch } from 'react-redux';

const SetupColdCard = () => {
  const [nfcVisible, setNfcVisible] = React.useState(false);

  const dispatch = useDispatch();
  const navigation = useNavigation();

  const scanMK4 = async () => {
    setNfcVisible(true);
    try {
      const { data: xpub, path } = await NFC.read(NfcTech.NfcV);
      setNfcVisible(false);
      return { xpub, path };
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
    const { xpub, path: derivationPath } = await scanMK4();
    const networkType =
      config.APP_STAGE === APP_STAGE.DEVELOPMENT ? NetworkType.TESTNET : NetworkType.MAINNET;
    const network = WalletUtilities.getNetworkByType(networkType);
    const signer: VaultSigner = {
      signerId: WalletUtilities.getFingerprintFromExtendedKey(xpub, network),
      type: SignerType.COLDCARD,
      signerName: 'MK4',
      xpub,
      xpubInfo: {
        derivationPath,
      },
    };
    const scheme: VaultScheme = { m: 1, n: 1 };
    return { signers: [signer], scheme };
  };

  const createVaultWithCC = async () => {
    try {
      const { signers, scheme } = await getColdCardDetails();
      createVault(signers, scheme);
      navigation.dispatch(CommonActions.navigate('NewHome'));
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    createVaultWithCC();
  }, []);

  return (
    <View>
      <Text>SetupColdCard</Text>
      <NfcPrompt visible={nfcVisible} />
    </View>
  );
};

export default SetupColdCard;
