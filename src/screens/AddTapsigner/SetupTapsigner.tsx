import { Alert, StyleSheet, TextInput } from 'react-native';
import { Box, Text } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { NetworkType, SignerStorage, SignerType } from 'src/core/wallets/enums';
import { ScrollView, TapGestureHandler } from 'react-native-gesture-handler';
import { getMockTapsignerDetails, getTapsignerDetails } from 'src/hardware/tapsigner';

import Buttons from 'src/components/Buttons';
import { CKTapCard } from 'cktap-protocol-react-native';
import DeleteIcon from 'src/assets/images/delete.svg';
import HeaderTitle from 'src/components/HeaderTitle';
import KeyPadView from 'src/components/AppNumPad/KeyPadView';
import NFC from 'src/core/services/nfc';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import WalletUtilities from 'src/core/wallets/operations/utils';
import { addSigningDevice } from 'src/store/sagaActions/vaults';
import config, { APP_STAGE } from 'src/core/config';
import { generateSignerFromMetaData } from 'src/hardware';
import { useDispatch } from 'react-redux';
import useTapsignerModal from 'src/hooks/useTapsignerModal';
import useToastMessage from 'src/hooks/useToastMessage';
import TickIcon from 'src/assets/images/icon_tick.svg';
import { windowHeight, wp } from 'src/common/data/responsiveness/responsive';
import { checkSigningDevice } from '../Vault/AddSigningDevice';

function SetupTapsigner() {
  const [cvc, setCvc] = React.useState('');
  const navigation = useNavigation();
  const card = React.useRef(new CKTapCard()).current;
  const { withModal, nfcVisible, closeNfc } = useTapsignerModal(card);

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
  const dispatch = useDispatch();
  const { showToast } = useToastMessage();

  const onDeletePressed = () => {
    setCvc(cvc.slice(0, cvc.length - 1));
  };

  const isAMF = config.NETWORK_TYPE === NetworkType.TESTNET;

  const addTapsigner = React.useCallback(async () => {
    try {
      const { xpub, derivationPath, xfp } = await withModal(async () =>
        getTapsignerDetails(card, cvc)
      )();
      // AMF flow
      if (isAMF) {
        const network = WalletUtilities.getNetworkByType(NetworkType.MAINNET);
        const signerId = WalletUtilities.getFingerprintFromExtendedKey(xpub, network);
        const tapsigner = getMockTapsignerDetails({ signerId, xpub });
        dispatch(addSigningDevice(tapsigner));
        navigation.dispatch(CommonActions.navigate('AddSigningDevice'));
        showToast(`${tapsigner.signerName} added successfully`, <TickIcon />);
        return;
      }
      const tapsigner = generateSignerFromMetaData({
        xpub,
        derivationPath,
        xfp,
        signerType: SignerType.TAPSIGNER,
        storageType: SignerStorage.COLD,
      });
      dispatch(addSigningDevice(tapsigner));
      navigation.dispatch(CommonActions.navigate('AddSigningDevice'));
      showToast(`${tapsigner.signerName} added successfully`, <TickIcon />);
      const exsists = await checkSigningDevice(tapsigner.signerId);
      if (exsists) Alert.alert('Warning: Vault with this signer already exisits');
    } catch (err) {
      let message: string;
      if (err.toString().includes('401')) {
        message = 'Please check the cvc entered and try again!';
      } else if (err.toString().includes('429')) {
        message = 'You have exceed the cvc retry limit. Please unlock the card and try again!';
      } else if (err.toString().includes('205')) {
        message = 'Something went wrong, please try again!';
      } else {
        message = err.toString();
      }
      NFC.showiOSMessage(message);
      showToast(message, null, 2000, true);
      closeNfc();
      card.endNfcSession();
    }
  }, [cvc]);

  const addMockTapsigner = React.useCallback(async () => {
    try {
      if (config.ENVIRONMENT === APP_STAGE.DEVELOPMENT) {
        const mockTapsigner = getMockTapsignerDetails();
        dispatch(addSigningDevice(mockTapsigner));
        navigation.dispatch(CommonActions.navigate('AddSigningDevice'));
        showToast(`${mockTapsigner.signerName} added successfully`, <TickIcon />);
      }
    } catch (err) {
      Alert.alert(err.toString());
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Box flex={1}>
        <Box style={styles.header}>
          <HeaderTitle
            title="Setting up TAPSIGNER"
            subtitle="Enter the 6-32 digit code printed on back of your TAPSIGNER"
            onPressHandler={() => navigation.goBack()}
          />
        </Box>
        <TapGestureHandler numberOfTaps={3} onActivated={addMockTapsigner}>
          <ScrollView>
            <TextInput
              style={styles.input}
              value={cvc}
              onChangeText={setCvc}
              secureTextEntry
              showSoftInputOnFocus={false}
            />
            <Text
              padding={5}
              fontWeight={200}
              width={wp(250)}
              fontSize={13}
              letterSpacing={0.65}
              color="light.modalText"
            >
              You will be scanning the TAPSIGNER after this step
            </Text>
            <Box flex={1} justifyContent="flex-end" flexDirection="row" mr={wp(15)}>
              <Buttons primaryText="Proceed" primaryCallback={addTapsigner} />
            </Box>
          </ScrollView>
        </TapGestureHandler>
        <KeyPadView
          onPressNumber={onPressHandler}
          keyColor="#041513"
          ClearIcon={<DeleteIcon />}
          onDeletePressed={onDeletePressed}
        />
        <NfcPrompt visible={nfcVisible} />
      </Box>
    </SafeAreaView>
  );
}

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
    paddingHorizontal: '5%',
    marginBottom: windowHeight > 850 ? 0 : '25%',
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
