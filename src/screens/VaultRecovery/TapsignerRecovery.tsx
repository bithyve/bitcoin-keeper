import { Alert, Platform, StyleSheet, TextInput } from 'react-native';
import Text from 'src/components/KeeperText';
import { Box } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { EntityKind, NetworkType, SignerType } from 'src/core/wallets/enums';
import { ScrollView, TapGestureHandler } from 'react-native-gesture-handler';
import config, { APP_STAGE } from 'src/core/config';

import Buttons from 'src/components/Buttons';
import { CKTapCard } from 'cktap-protocol-react-native';
import HeaderTitle from 'src/components/HeaderTitle';
import KeyPadView from 'src/components/AppNumPad/KeyPadView';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SigningDeviceRecovery } from 'src/common/data/enums/BHR';
import WalletUtilities from 'src/core/wallets/operations/utils';
import { generateMockExtendedKeyForSigner } from 'src/core/wallets/factories/VaultFactory';
import { setSigningDevices } from 'src/store/reducers/bhr';
import { useDispatch } from 'react-redux';
import { wp } from 'src/common/data/responsiveness/responsive';

function TapSignerRecovery() {
  const [cvc, setCvc] = React.useState('');
  const [nfcVisible, setNfcVisible] = React.useState(false);
  const navigation = useNavigation();
  const card = React.useRef(new CKTapCard()).current;
  const dispatch = useDispatch();

  const withModal = (callback) =>
    Platform.select({
      android: async () => {
        setNfcVisible(true);
        const resp = await card.nfcWrapper(callback);
        setNfcVisible(false);
        await card.endNfcSession();
        return resp;
      },
      ios: async () => card.nfcWrapper(callback),
    });

  const onPressHandler = (digit) => {
    let temp = cvc;
    if (digit !== 'x') {
      temp += digit;
      setCvc(temp);
    }
    if (cvc && digit === 'x') {
      setCvc(cvc.slice(0, -1));
    }
  };

  const onDeletePressed = () => {
    setCvc(cvc.slice(0, cvc.length - 1));
  };
  const verifyTapsigner = React.useCallback(async () => {
    try {
      const tapsigner = await getTapsignerDetails();
      const network = WalletUtilities.getNetworkByType(NetworkType.MAINNET);
      const sigingDeivceDetails: SigningDeviceRecovery = {
        signerId: WalletUtilities.getFingerprintFromExtendedKey(tapsigner.xpub, network),
        xpub: tapsigner.xpub,
        type: SignerType.TAPSIGNER,
      };
      dispatch(setSigningDevices(sigingDeivceDetails));
      navigation.navigate('LoginStack', { screen: 'VaultRecoveryAddSigner' });
    } catch (err) {
      Alert.alert(err.toString());
    }
  }, [cvc]);

  const getTapsignerDetails = async () => {
    const signerDetails = await withModal(async () => {
      const status = await card.first_look();
      const isLegit = await card.certificate_check();
      if (isLegit) {
        if (status.path) {
          const xpub = await card.get_xpub(cvc);
          const xfp = await card.get_xfp(cvc);
          return { xpub, status, xfp: xfp.toString('hex') };
        }
        await card.setup(cvc);
        const newCard = await card.first_look();
        const xpub = await card.get_xpub(cvc);
        const xfp = await card.get_xfp(cvc);
        return { xpub, derivationPath: newCard.path, xfp: xfp.toString('hex') };
      }
    })();
    return signerDetails;
  };

  const getMockTapsignerDetails = () => {
    const networkType = config.NETWORK_TYPE;
    const network = WalletUtilities.getNetworkByType(networkType);
    const { xpub } = generateMockExtendedKeyForSigner(
      EntityKind.VAULT,
      SignerType.TAPSIGNER,
      networkType
    );
    const signerId = WalletUtilities.getFingerprintFromExtendedKey(xpub, network);
    const tapsigner: SigningDeviceRecovery = {
      signerId,
      type: SignerType.TAPSIGNER,
      xpub,
    };
    return tapsigner;
  };

  const addMockTapsigner = React.useCallback(async () => {
    try {
      if (config.ENVIRONMENT === APP_STAGE.DEVELOPMENT) {
        const mockTapsigner: SigningDeviceRecovery = getMockTapsignerDetails();
        dispatch(setSigningDevices(mockTapsigner));
        navigation.navigate('LoginStack', { screen: 'VaultRecoveryAddSigner' });
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
              title="Recover using Tapsigner"
              subtitle="Enter the 6-32 digit code printed on back of your TAPSIGNER"
              onPressHandler={() => navigation.goBack()}
            />
          </Box>
          <ScrollView>
            <TextInput
              style={styles.input}
              value={cvc}
              onChangeText={setCvc}
              secureTextEntry
              showSoftInputOnFocus={false}
            />
            <Text padding={5}>You will be scanning the TAPSIGNER after this step</Text>
            <Box flex={1} justifyContent="flex-end" flexDirection="row" mr={wp(15)}>
              <Buttons primaryText="Proceed" primaryCallback={verifyTapsigner} />
            </Box>
          </ScrollView>
          <KeyPadView
            onPressNumber={onPressHandler}
            keyColor="#041513"
            onDeletePressed={onDeletePressed}
          />
          <NfcPrompt visible={nfcVisible} />
        </Box>
      </TapGestureHandler>
    </SafeAreaView>
  );
}

export default TapSignerRecovery;

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
