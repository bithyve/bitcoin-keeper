import { Platform, StyleSheet, TextInput } from 'react-native';
import { Box } from 'native-base';
import Text from 'src/components/KeeperText';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';

import { CommonActions, useNavigation } from '@react-navigation/native';
import { EntityKind, SignerStorage, SignerType, XpubTypes } from 'src/core/wallets/enums';
import { ScrollView } from 'react-native-gesture-handler';
import { getTapsignerDetails, getTapsignerErrorMessage } from 'src/hardware/tapsigner';

import Buttons from 'src/components/Buttons';
import { CKTapCard } from 'cktap-protocol-react-native';
import HeaderTitle from 'src/components/HeaderTitle';
import KeyPadView from 'src/components/AppNumPad/KeyPadView';
import NFC from 'src/core/services/nfc';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import React from 'react';
import { addSigningDevice } from 'src/store/sagaActions/vaults';
import { generateSignerFromMetaData, isSignerAMF } from 'src/hardware';
import { useDispatch } from 'react-redux';
import useTapsignerModal from 'src/hooks/useTapsignerModal';
import useToastMessage from 'src/hooks/useToastMessage';
import TickIcon from 'src/assets/images/icon_tick.svg';
import { windowHeight, windowWidth, wp } from 'src/common/data/responsiveness/responsive';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { isTestnet } from 'src/common/constants/Bitcoin';
import usePlan from 'src/hooks/usePlan';
import { generateMockExtendedKeyForSigner } from 'src/core/wallets/factories/VaultFactory';
import config from 'src/core/config';
import { VaultSigner } from 'src/core/wallets/interfaces/vault';
import useAsync from 'src/hooks/useAsync';
import NfcManager from 'react-native-nfc-manager';
import DeviceInfo from 'react-native-device-info';
import { checkSigningDevice } from '../Vault/AddSigningDevice';
import MockWrapper from '../Vault/MockWrapper';
import { healthCheckSigner } from 'src/store/sagaActions/bhr';

function SetupTapsigner({ route }) {
  const [cvc, setCvc] = React.useState('');
  const navigation = useNavigation();
  const card = React.useRef(new CKTapCard()).current;
  const { withModal, nfcVisible, closeNfc } = useTapsignerModal(card);
  const { isHealthcheck = false, signer } = route.params;
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
  const { subscriptionScheme } = usePlan();
  const isMultisig = subscriptionScheme.n !== 1;
  const { inProgress, start } = useAsync();

  const addTapsignerWithProgress = async () => {
    NfcManager.isSupported().then(async (supported) => {
      if (supported) {
        if (isHealthcheck) verifyTapsginer();
        await start(addTapsigner);
      } else if (!DeviceInfo.isEmulator()) {
        showToast('NFC not supported on this device', <ToastErrorIcon />, 3000);
      }
    });
  };

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
      dispatch(addSigningDevice(tapsigner));
      navigation.dispatch(CommonActions.navigate('AddSigningDevice'));
      showToast(`${tapsigner.signerName} added successfully`, <TickIcon />);
      if (!isSignerAMF(tapsigner)) {
        const exsists = await checkSigningDevice(tapsigner.signerId);
        if (exsists)
          showToast('Warning: Vault with this signer already exisits', <ToastErrorIcon />, 3000);
      }
    } catch (error) {
      const errorMessage = getTapsignerErrorMessage(error);
      if (errorMessage) {
        if (Platform.OS === 'ios') NFC.showiOSMessage(errorMessage);
        showToast(errorMessage, null, 2000, true);
      } else if (error.toString() === 'Error') {
        // do nothing when nfc is dismissed by the user
      } else {
        showToast('Something went wrong, please try again!', null, 2000, true);
      }
      closeNfc();
      card.endNfcSession();
    }
  }, [cvc]);

  const verifyTapsginer = React.useCallback(async () => {
    try {
      const { xpub } = await withModal(async () => getTapsignerDetails(card, cvc, isMultisig))();
      if (xpub === signer.xpub) {
        dispatch(healthCheckSigner([signer]));
        navigation.dispatch(CommonActions.goBack());
        showToast(`Tapsigner verified successfully`, <TickIcon />);
      } else {
        showToast('Something went wrong, please try again!', null, 2000, true);
      }
    } catch (error) {
      const errorMessage = getTapsignerErrorMessage(error);
      if (errorMessage) {
        if (Platform.OS === 'ios') NFC.showiOSMessage(errorMessage);
        showToast(errorMessage, null, 2000, true);
      } else if (error.toString() === 'Error') {
        // do nothing when nfc is dismissed by the user
      } else {
        showToast('Something went wrong, please try again!', null, 2000, true);
      }
      closeNfc();
      card.endNfcSession();
    }
  }, [cvc]);

  return (
    <ScreenWrapper>
      <Box flex={1}>
        <HeaderTitle
          title={isHealthcheck ? 'Verify TAPSIGNER' : 'Setting up TAPSIGNER'}
          subtitle="Enter the 6-32 digit code printed on back of your TAPSIGNER"
          onPressHandler={() => navigation.goBack()}
        />
        <MockWrapper signerType={SignerType.TAPSIGNER}>
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
              <Buttons
                primaryText="Proceed"
                primaryCallback={isHealthcheck ? verifyTapsginer : addTapsignerWithProgress}
                primaryDisable={cvc.length < 6}
                primaryLoading={inProgress}
              />
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

export default SetupTapsigner;

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
    margin: 15,
  },
});
