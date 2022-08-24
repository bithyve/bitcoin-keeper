import { Alert, Platform, StyleSheet, TextInput } from 'react-native';
import { Box, Text } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { EntityKind, NetworkType, SignerType, VaultType } from 'src/core/wallets/enums';
import React, { useCallback } from 'react';
import { ScrollView, TapGestureHandler } from 'react-native-gesture-handler';
import { VaultScheme, VaultSigner } from 'src/core/wallets/interfaces/vault';
import config, { APP_STAGE } from 'src/core/config';

import Buttons from 'src/components/Buttons';
import { CKTapCard } from 'cktap-protocol-react-native';
import DeleteIcon from 'src/assets/images/delete.svg';
import HeaderTitle from 'src/components/HeaderTitle';
import KeyPadView from 'src/components/AppNumPad/KeyPadView';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import { SafeAreaView } from 'react-native-safe-area-context';
import WalletUtilities from 'src/core/wallets/operations/utils';
import { addNewVault } from 'src/store/sagaActions/wallets';
import { generateMockExtendedKey } from 'src/core/wallets/factories/WalletFactory';
import { newVaultInfo } from 'src/store/sagas/wallets';
import { useDispatch } from 'react-redux';
import { wp } from 'src/common/data/responsiveness/responsive';

const SetupTapsigner = () => {
  const [cvc, setCvc] = React.useState('');
  const [nfcVisible, setNfcVisible] = React.useState(false);
  const navigation = useNavigation();
  const card = React.useRef(new CKTapCard()).current;

  const withModal = (callback) => {
    return Platform.select({
      android: async () => {
        setNfcVisible(true);
        const resp = await card.nfcWrapper(callback);
        setNfcVisible(false);
        return resp;
      },
      ios: async () => card.nfcWrapper(callback),
    });
  };

  const onPressHandler = (digit) => {
    let temp = cvc;
    if (digit != 'x') {
      temp += digit;
      setCvc(temp);
    }
    if (cvc && digit == 'x') {
      setCvc(cvc.slice(0, -1));
    }
  };
  const dispatch = useDispatch();

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

  const integrateTapsigner = React.useCallback(() => {
    withModal(async () => {
      const status = await card.first_look();
      console.log(status);
      const isLegit = await card.certificate_check();
      console.log(isLegit);
      if (isLegit) {
        if (status.path) {
          console.log(status.path);
          const xpub = await card.get_xpub(cvc);
          const xfp = await card.get_xfp(cvc);
          console.log(xpub);
          return { xpub, status, xfp };
        } else {
          await card.setup(cvc);
          const newCard = await card.first_look();
          const xpub = await card.get_xpub(cvc);
          const xfp = await card.get_xfp(cvc);
          return { xpub, status: newCard, xfp };
        }
      }
    })()
      .then((resp) => {
        console.log(resp);
        const { xpub, status, xfp } = resp;
        const networkType =
          config.APP_STAGE === APP_STAGE.DEVELOPMENT ? NetworkType.TESTNET : NetworkType.MAINNET;
        const network = WalletUtilities.getNetworkByType(networkType);

        const signer: VaultSigner = {
          signerId: WalletUtilities.getFingerprintFromExtendedKey(xpub, network),
          type: SignerType.TAPSIGNER,
          signerName: 'Tapsigner',
          xpub,
          xpubInfo: {
            derivationPath: status.path,
            xfp,
          },
          lastHealthCheck: new Date(),
        };

        const scheme: VaultScheme = { m: 1, n: 1 };
        const isVaultCreated = createVault([signer], scheme);
        if (isVaultCreated) navigation.dispatch(CommonActions.navigate('NewHome'));
      })
      .catch(Alert.alert);
  }, [cvc]);

  const MockVaultCreation = () => {
    if (config.APP_STAGE === APP_STAGE.DEVELOPMENT) {
      const networkType = NetworkType.TESTNET;
      const network = WalletUtilities.getNetworkByType(networkType);

      const { xpub, xpriv, derivationPath, masterFingerprint } = generateMockExtendedKey(
        EntityKind.VAULT
      );
      const mockTapSigner: VaultSigner = {
        signerId: WalletUtilities.getFingerprintFromExtendedKey(xpub, network),
        type: SignerType.TAPSIGNER,
        signerName: 'Tapsigner',
        xpub: xpub,
        xpriv,
        xpubInfo: {
          derivationPath,
          xfp: masterFingerprint,
        },
        lastHealthCheck: new Date(),
      };

      const scheme: VaultScheme = { m: 1, n: 1 };
      const isVaultCreated = createVault([mockTapSigner], scheme);
      if (isVaultCreated) navigation.dispatch(CommonActions.navigate('NewHome'));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Box flex={1}>
        <Box style={styles.header}>
          <HeaderTitle
            title="Setting up Tapsigner"
            subtitle="Enter the 6-digit code printed on back of your TAPSIGNER"
            onPressHandler={() => navigation.goBack()}
          />
        </Box>
        <TapGestureHandler numberOfTaps={3} onActivated={MockVaultCreation}>
          <ScrollView>
            <TextInput
              style={styles.input}
              value={cvc}
              onChangeText={setCvc}
              secureTextEntry={true}
              showSoftInputOnFocus={false}
            />
            <Text padding={5}>Lorem ipsum dolor sit amet, consectetur eiusmod tempor</Text>
            <Box flex={1} justifyContent={'flex-end'} flexDirection={'row'} mr={wp(15)}>
              <Buttons primaryText="Proceed" primaryCallback={integrateTapsigner} />
            </Box>
          </ScrollView>
        </TapGestureHandler>
        <KeyPadView
          onPressNumber={onPressHandler}
          keyColor={'#041513'}
          ClearIcon={<DeleteIcon />}
        />
        <NfcPrompt visible={nfcVisible} />
      </Box>
    </SafeAreaView>
  );
};

export default SetupTapsigner;

const styles = StyleSheet.create({
  container: {
    height: '100%',
    backgroundColor: '#F7F2EC',
    flex: 1,
    padding: 10,
  },
  header: {
    flex: 1,
    padding: '5%',
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: '4%',
    marginHorizontal: '4%',
  },
  stepBodyContainer: {
    width: '80%',
  },
  circle: {
    margin: '5%',
    marginTop: 0,
    width: 25,
    height: 25,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneCircle: {
    backgroundColor: '#055146',
  },
  activeCircle: {
    backgroundColor: '#FAC48B',
  },
  inactiveCircle: {
    backgroundColor: '#E3E3E3',
  },
  input: {
    paddingHorizontal: 20,
    margin: '5%',
    width: '100%',
    height: 50,
    borderRadius: 10,
    backgroundColor: '#f0e7dd',
    letterSpacing: 5,
  },
  inputContainer: {
    alignItems: 'flex-end',
  },
});
