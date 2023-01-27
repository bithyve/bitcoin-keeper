import { Platform, StyleSheet, TextInput } from 'react-native';
import Text from 'src/components/KeeperText';

import { useNavigation } from '@react-navigation/native';

import { EntityKind, SignerStorage, SignerType, XpubTypes } from 'src/core/wallets/enums';
import { ScrollView } from 'react-native-gesture-handler';
import { windowHeight, windowWidth } from 'src/common/data/responsiveness/responsive';
import Buttons from 'src/components/Buttons';
import { CKTapCard } from 'cktap-protocol-react-native';
import HeaderTitle from 'src/components/HeaderTitle';
import KeyPadView from 'src/components/AppNumPad/KeyPadView';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import React from 'react';
import { setSigningDevices } from 'src/store/reducers/bhr';
import { useDispatch } from 'react-redux';
import { wp } from 'src/common/data/responsiveness/responsive';
import useToastMessage from 'src/hooks/useToastMessage';
import useTapsignerModal from 'src/hooks/useTapsignerModal';
import { isTestnet } from 'src/common/constants/Bitcoin';
import { getTapsignerDetails } from 'src/hardware/tapsigner';
import { generateSignerFromMetaData } from 'src/hardware';
import NFC from 'src/core/services/nfc';
import ScreenWrapper from 'src/components/ScreenWrapper';
import MockWrapper from '../Vault/MockWrapper';
import { Box } from 'native-base';
import { useAppSelector } from 'src/store/hooks';
import { VaultSigner } from 'src/core/wallets/interfaces/vault';
import config from 'src/core/config';
import { generateMockExtendedKeyForSigner } from 'src/core/wallets/factories/VaultFactory';
import TickIcon from 'src/assets/images/icon_tick.svg';

function TapSignerRecovery() {
  const [cvc, setCvc] = React.useState('');
  const navigation = useNavigation();
  const card = React.useRef(new CKTapCard()).current;
  const { signingDevices } = useAppSelector((state) => state.bhr);
  const isMultisig = signingDevices.length >= 1 ? true : false;
  console.log({ isMultisig });

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

  const isAMF = isTestnet();

  const addTapsigner = React.useCallback(async () => {
    try {
      const { xpub, derivationPath, xfp, xpubDetails } = await withModal(async () =>
        getTapsignerDetails(card, cvc, isMultisig)
      )();
      let tapsigner: VaultSigner;
      if (isAMF) {
        const { xpub, xpriv, derivationPath, masterFingerprint } = generateMockExtendedKeyForSigner(
          EntityKind.VAULT,
          SignerType.TAPSIGNER,
          config.NETWORK_TYPE
        );
        tapsigner = generateSignerFromMetaData({
          xpub,
          derivationPath,
          xfp: masterFingerprint,
          signerType: SignerType.TAPSIGNER,
          storageType: SignerStorage.COLD,
          isMultisig,
          xpriv,
          isMock: false,
          xpubDetails: { [XpubTypes.AMF]: { xpub, derivationPath } },
        });
      } else {
        tapsigner = generateSignerFromMetaData({
          xpub,
          derivationPath,
          xfp,
          signerType: SignerType.TAPSIGNER,
          storageType: SignerStorage.COLD,
          isMultisig,
          xpubDetails,
        });
      }
      dispatch(setSigningDevices(tapsigner));

      showToast(`${tapsigner.signerName} added successfully`, <TickIcon />);
      navigation.navigate('LoginStack', { screen: 'VaultRecoveryAddSigner' });
      return;
    } catch (err) {
      let message: string;
      console.log({ err });
      if (err.toString().includes('401')) {
        message = 'Please check the cvc entered and try again!';
      } else if (err.toString().includes('429')) {
        message = 'You have exceed the cvc retry limit. Please unlock the card and try again!';
      } else if (err.toString().includes('205')) {
        message = 'Something went wrong, please try again!';
      } else if (err.toString() === 'Error') {
        // do nothing when nfc is dismissed
        return;
      } else {
        message = err.toString();
      }
      if (Platform.OS === 'ios') NFC.showiOSMessage(message);
      showToast(message, null, 2000, true);
      closeNfc();
      card.endNfcSession();
    }
  }, [cvc]);

  return (
    <ScreenWrapper>
      <Box flex={1}>
        <HeaderTitle
          title="Setting up TAPSIGNER"
          subtitle="Enter the 6-32 digit code printed on back of your TAPSIGNER"
          onPressHandler={() => navigation.goBack()}
        />
        <MockWrapper signerType={SignerType.TAPSIGNER} isRecovery={true}>
          <ScrollView>
            <TextInput
              style={styles.input}
              value={cvc}
              onChangeText={setCvc}
              secureTextEntry
              showSoftInputOnFocus={false}
            />
            <Text style={styles.heading} color="light.greenText">
              You will be scanning the TAPSIGNER after this step
            </Text>
            <Box style={styles.btnContainer}>
              <Buttons primaryText="Proceed" primaryCallback={addTapsigner} />
            </Box>
          </ScrollView>
        </MockWrapper>
        <KeyPadView
          onPressNumber={onPressHandler}
          keyColor="#041513"
          onDeletePressed={onDeletePressed}
        />
        <NfcPrompt visible={nfcVisible} close={closeNfc} />
      </Box>
    </ScreenWrapper>
  );
}

export default TapSignerRecovery;

const styles = StyleSheet.create({
  header: {
    flex: 1,
    paddingHorizontal: '5%',
    marginBottom: windowHeight > 850 ? 0 : '25%',
  },
  input: {
    margin: '5%',
    paddingHorizontal: 15,
    width: wp(305),
    height: 50,
    borderRadius: 10,
    backgroundColor: '#f0e7dd',
    letterSpacing: 5,
  },
  inputContainer: {
    alignItems: 'flex-end',
  },
  heading: {
    margin: '5%',
    padding: 5,
    width: windowWidth * 0.8,
    fontSize: 13,
    letterSpacing: 0.65,
  },
  btnContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    flexDirection: 'row',
    marginRight: wp(15),
  },
});
