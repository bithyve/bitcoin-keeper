import { CommonActions, useNavigation } from '@react-navigation/native';
import { EntityKind, NetworkType, SignerType, VaultType } from 'src/core/wallets/enums';
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
    };

    return { signer: cc };
  };

  const generateMockColdCard = () => {
    const networkType =
      config.APP_STAGE === APP_STAGE.DEVELOPMENT ? NetworkType.TESTNET : NetworkType.MAINNET;
    const network = WalletUtilities.getNetworkByType(networkType);
    const {
      xpub,
      masterFingerprint: xfp,
      derivationPath,
    } = generateMockExtendedKey(EntityKind.VAULT);
    // console.log(xpub, derivationPath);
    // const xpub =
    // 'tpubDFAUqbtRiCbeKgCG3rSjDPVPwbb41hk2DSHvrnejZF9WDyCieGejSRBxNepzJscga2Lr8yPMMhUhJMWHnhBMjJ8VptpZyC1xXBK73ZxYBFf';
    // const xfp = '73DC8582';
    // bip48/testnet/account/script/
    // const derivationPath = `m/48'/1'/966713'/1'`;
    const cc: VaultSigner = {
      signerId: WalletUtilities.getFingerprintFromExtendedKey(xpub, network),
      type: SignerType.COLDCARD,
      signerName: 'MK4 (mock)',
      xpub,
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
      const scheme: VaultScheme = { m: 1, n: 2 };
      createVault([signer, signer2], scheme);
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
