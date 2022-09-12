import { CommonActions, useNavigation } from '@react-navigation/native';
import { SafeAreaView, StyleSheet } from 'react-native';

import { Box } from 'native-base';
import Buttons from 'src/components/Buttons';
import HeaderTitle from 'src/components/HeaderTitle';
import NFC from 'src/core/services/nfc';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import { NfcTech } from 'react-native-nfc-manager';
import React from 'react';
import { TapGestureHandler } from 'react-native-gesture-handler';
import config, { APP_STAGE } from 'src/core/config';
import { NetworkType, SignerType } from 'src/core/wallets/enums';
import WalletUtilities from 'src/core/wallets/operations/utils';
import { SigningDeviceRecovery } from 'src/common/data/enums/BHR';
import { useDispatch } from 'react-redux';
import { setSigningDevices } from 'src/store/reducers/bhr';

const ColdCardReocvery = () => {
  const [nfcVisible, setNfcVisible] = React.useState(false);
  const navigation = useNavigation();
  const dispatch = useDispatch();

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

  const verifyColdCard = async () => {
    try {
      const coldcard = await getColdCardDetails();

      const networkType =
        config.APP_STAGE === APP_STAGE.DEVELOPMENT ? NetworkType.TESTNET : NetworkType.MAINNET;
      const network = WalletUtilities.getNetworkByType(networkType);
      const xpub = WalletUtilities.generateXpubFromYpub(coldcard.xpub, network);
      const sigingDeivceDetails: SigningDeviceRecovery = {
        signerId: WalletUtilities.getFingerprintFromExtendedKey(xpub, network),
        xpub: xpub,
        type: SignerType.COLDCARD,
      };
      dispatch(setSigningDevices(sigingDeivceDetails));
      navigation.navigate('LoginStack', { screen: 'VaultRecoveryAddSigner' });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TapGestureHandler>
        <Box flex={1}>
          <Box style={styles.header}>
            <HeaderTitle
              title="Setting up ColdCard"
              subtitle="Go to Settings > Multisig wallets > Export xPub on your ColdCard"
              onPressHandler={() => navigation.goBack()}
            />
            <Box style={{ padding: 30 }}>
              <Buttons primaryText="Verify" primaryCallback={verifyColdCard} />
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

export default ColdCardReocvery;
