import { APP_STAGE, config } from 'src/core/config';
import { Alert, Platform, StyleSheet, TextInput } from 'react-native';
import { Box, Text } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { EntityKind, NetworkType, SignerType } from 'src/core/wallets/enums';
import { ScrollView, TapGestureHandler } from 'react-native-gesture-handler';

import Buttons from 'src/components/Buttons';
import { CKTapCard } from 'cktap-protocol-react-native';
import DeleteIcon from 'src/assets/images/delete.svg';
import HeaderTitle from 'src/components/HeaderTitle';
import KeyPadView from 'src/components/AppNumPad/KeyPadView';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VaultSigner } from 'src/core/wallets/interfaces/vault';
import WalletUtilities from 'src/core/wallets/operations/utils';
import { addSigningDevice } from 'src/store/sagaActions/vaults';
import { checkSigningDevice } from '../Vault/AddSigningDevice';
import { generateMockExtendedKey } from 'src/core/wallets/factories/VaultFactory';
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
        await card.endNfcSession();
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

  const onDeletePressed = () => {
    setCvc(cvc.slice(0, cvc.length - 1));
  };

  const getTapsignerDetails = async () => {
    const signerDetails = await withModal(async () => {
      const status = await card.first_look();
      const isLegit = await card.certificate_check();
      if (isLegit) {
        if (status.path) {
          const xpub = await card.get_xpub(cvc);
          const xfp = await card.get_xfp(cvc);
          return { xpub, status, xfp: xfp.toString('hex') };
        } else {
          await card.setup(cvc);
          const newCard = await card.first_look();
          const xpub = await card.get_xpub(cvc);
          const xfp = await card.get_xfp(cvc);
          return { xpub, derivationPath: newCard.path, xfp: xfp.toString('hex') };
        }
      }
    })();
    return signerDetails;
  };

  const saveTapsigner = async (tapsignerData) => {
    const { xpub, derivationPath, xfp } = tapsignerData;
    const networkType =
      config().APP_STAGE === APP_STAGE.DEVELOPMENT ? NetworkType.TESTNET : NetworkType.MAINNET;
    const network = WalletUtilities.getNetworkByType(networkType);
    const signer: VaultSigner = {
      signerId: WalletUtilities.getFingerprintFromExtendedKey(xpub, network),
      type: SignerType.TAPSIGNER,
      signerName: 'Tapsigner',
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

  const addTapsigner = React.useCallback(async () => {
    try {
      const tapsigner = await getTapsignerDetails();
      saveTapsigner(tapsigner);
      navigation.dispatch(CommonActions.navigate('AddSigningDevice'));
    } catch (err) {
      Alert.alert(err.toString());
    }
  }, [cvc]);

  const addMockTapsigner = React.useCallback(async () => {
    try {
      if (config().APP_STAGE === APP_STAGE.DEVELOPMENT) {
        const networkType = NetworkType.TESTNET;
        const network = WalletUtilities.getNetworkByType(networkType);
        const { xpub, xpriv, derivationPath, masterFingerprint } = generateMockExtendedKey(
          EntityKind.VAULT
        );
        // const xpub =
        //   'tpubDF6L55YJ8AkuwkWwpdY87eJyUUHNu2PGHkXCNj7BuJQWcj2toFBDhAZJTU248AXMcMgi7fACLidVt9j35SfsANLensD5uUdQuPxjZvGDNWZ';
        // const xpriv =
        //   'tprv8iQHvfW3yo5F4HV9vysXiEeruSmSjhCMiSvR6D4tV2c7nEn8ArMdWfwSHJTiZNqH2TqgzJmj8EhJJf3BQwPhHs4qSuieY63Vc2QxRnmbu2d';
        // const masterFingerprint = '7A5C570E';
        // const derivationPath = "m/48'/1'/800859'/1'"; // bip48/testnet/account/script/
        const tapsigner: VaultSigner = {
          signerId: WalletUtilities.getFingerprintFromExtendedKey(xpub, network),
          type: SignerType.TAPSIGNER,
          signerName: 'Tapsigner (Mock)',
          isMock: true,
          xpub,
          xpriv,
          xpubInfo: {
            derivationPath,
            xfp: masterFingerprint,
          },
          lastHealthCheck: new Date(),
          addedOn: new Date(),
        };
        dispatch(addSigningDevice(tapsigner));
        navigation.dispatch(CommonActions.navigate('AddSigningDevice'));
      }
    } catch (err) {
      Alert.alert(err.toString());
    }
  }, [cvc]);

  return (
    <SafeAreaView style={styles.container}>
      <TapGestureHandler numberOfTaps={3} onActivated={addMockTapsigner}>
        <Box flex={1}>
          <Box style={styles.header}>
            <HeaderTitle
              title="Setting up Tapsigner"
              subtitle="Enter the 6-digit code printed on back of your TAPSIGNER"
              onPressHandler={() => navigation.goBack()}
            />
          </Box>
          <ScrollView>
            <TextInput
              style={styles.input}
              value={cvc}
              onChangeText={setCvc}
              secureTextEntry={true}
              showSoftInputOnFocus={false}
            />
            <Text
              padding={5}
              fontWeight={200}
              width={wp(250)}
              fontSize={13}
              letterSpacing={0.65}
              color={'light.modalText'}
            >
              Lorem ipsum dolor sit amet, consectetur eiusmod tempor
            </Text>
            <Box flex={1} justifyContent={'flex-end'} flexDirection={'row'} mr={wp(15)}>
              <Buttons primaryText="Proceed" primaryCallback={addTapsigner} />
            </Box>
          </ScrollView>
          <KeyPadView
            onPressNumber={onPressHandler}
            keyColor={'#041513'}
            ClearIcon={<DeleteIcon />}
            onDeletePressed={onDeletePressed}
          />
          <NfcPrompt visible={nfcVisible} />
        </Box>
      </TapGestureHandler>
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
    width: wp(305),
    height: 50,
    borderRadius: 10,
    backgroundColor: '#f0e7dd',
    letterSpacing: 5,
  },
  inputContainer: {
    alignItems: 'flex-end',
  },
});
