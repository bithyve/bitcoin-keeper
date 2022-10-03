import { Alert, Platform, StyleSheet, TextInput } from 'react-native';
import { Box, Text } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { EntityKind, NetworkType, SignerStorage, SignerType } from 'src/core/wallets/enums';
import { ScrollView, TapGestureHandler } from 'react-native-gesture-handler';
import config, { APP_STAGE } from 'src/core/config';
import {
  generateMockExtendedKey,
  generateMockExtendedKeyForSigner,
} from 'src/core/wallets/factories/VaultFactory';

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
    const { xpub, derivationPath, xfp } = await withModal(async () => {
      const status = await card.first_look();
      const isLegit = await card.certificate_check();
      if (isLegit) {
        if (status.path) {
          const xpub = await card.get_xpub(cvc);
          const xfp = await card.get_xfp(cvc);
          return { xpub, xfp: xfp.toString('hex'), derivationPath: status.path };
        } else {
          await card.setup(cvc);
          const newCard = await card.first_look();
          const xpub = await card.get_xpub(cvc);
          const xfp = await card.get_xfp(cvc);
          return { xpub, derivationPath: newCard.path, xfp: xfp.toString('hex') };
        }
      }
    })();
    const network = WalletUtilities.getNetworkByType(config.NETWORK_TYPE);
    if (config.NETWORK_TYPE === NetworkType.TESTNET) {
      // AMF flow
      const network = WalletUtilities.getNetworkByType(NetworkType.MAINNET);
      const signerId = WalletUtilities.getFingerprintFromExtendedKey(xpub, network);
      return getMockTapsignerDetails({ signerId, xpub });
    }
    const signerId = WalletUtilities.getFingerprintFromExtendedKey(xpub, network);
    const signer: VaultSigner = {
      signerId,
      type: SignerType.TAPSIGNER,
      signerName: 'Tapsigner',
      xpub,
      xpubInfo: {
        derivationPath,
        xfp,
      },
      lastHealthCheck: new Date(),
      addedOn: new Date(),
      storageType: SignerStorage.COLD,
    };

    return signer;
  };

  const addTapsigner = React.useCallback(async () => {
    try {
      const tapsigner = await getTapsignerDetails();
      const exsists = await checkSigningDevice(tapsigner.signerId);
      if (exsists) Alert.alert('Warning: Vault with this signer already exisits');
      dispatch(addSigningDevice(tapsigner));
      navigation.dispatch(CommonActions.navigate('AddSigningDevice'));
    } catch (err) {
      Alert.alert(err.toString());
    }
  }, [cvc]);

  const getMockTapsignerDetails = (amfData = null) => {
    const networkType = config.NETWORK_TYPE;
    const network = WalletUtilities.getNetworkByType(networkType);
    const { xpub, xpriv, derivationPath, masterFingerprint } = generateMockExtendedKeyForSigner(
      EntityKind.VAULT,
      SignerType.TAPSIGNER,
      networkType
    );
    const signerId = WalletUtilities.getFingerprintFromExtendedKey(xpub, network);
    const tapsigner: VaultSigner = {
      signerId,
      type: SignerType.TAPSIGNER,
      signerName: 'Tapsigner**',
      isMock: true,
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
    if (amfData) {
      tapsigner.amfData = amfData;
      tapsigner.signerName = 'Tapsigner*';
    }
    return tapsigner;
  };

  const addMockTapsigner = React.useCallback(async () => {
    try {
      if (config.ENVIRONMENT === APP_STAGE.DEVELOPMENT) {
        const mockTapsigner = getMockTapsignerDetails();
        dispatch(addSigningDevice(mockTapsigner));
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
