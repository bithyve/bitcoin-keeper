import { Alert, Platform, StyleSheet, TextInput } from 'react-native';
import { Box, useColorMode } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import { CKTapCard } from 'cktap-protocol-react-native';

import Text from 'src/components/KeeperText';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { EntityKind, SignerStorage, SignerType, XpubTypes } from 'src/services/wallets/enums';
import { getTapsignerDetails, getTapsignerErrorMessage } from 'src/hardware/tapsigner';
import DeleteDarkIcon from 'src/assets/images/delete.svg';
import DeleteIcon from 'src/assets/images/deleteLight.svg';
import Buttons from 'src/components/Buttons';

import KeeperHeader from 'src/components/KeeperHeader';
import KeyPadView from 'src/components/AppNumPad/KeyPadView';
import NFC from 'src/services/nfc';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import React from 'react';
import { addSigningDevice } from 'src/store/sagaActions/vaults';
import { generateSignerFromMetaData } from 'src/hardware';
import { useDispatch } from 'react-redux';
import useTapsignerModal from 'src/hooks/useTapsignerModal';
import useToastMessage, { IToastCategory } from 'src/hooks/useToastMessage';
import TickIcon from 'src/assets/images/icon_tick.svg';
import { windowHeight, windowWidth, wp } from 'src/constants/responsive';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { isTestnet } from 'src/constants/Bitcoin';
import { generateMockExtendedKeyForSigner } from 'src/services/wallets/factories/VaultFactory';
import config from 'src/utils/service-utilities/config';
import { Signer, VaultSigner, XpubDetailsType } from 'src/services/wallets/interfaces/vault';
import useAsync from 'src/hooks/useAsync';
import NfcManager from 'react-native-nfc-manager';
import DeviceInfo from 'react-native-device-info';
import { healthCheckSigner, healthCheckStatusUpdate } from 'src/store/sagaActions/bhr';
import MockWrapper from 'src/screens/Vault/MockWrapper';
import { setSigningDevices } from 'src/store/reducers/bhr';
import useUnkownSigners from 'src/hooks/useUnkownSigners';
import { InteracationMode } from '../Vault/HardwareModalMap';
import { hcStatusType } from 'src/models/interfaces/HeathCheckTypes';

function SetupTapsigner({ route }) {
  const { colorMode } = useColorMode();
  const [cvc, setCvc] = React.useState('');
  const navigation = useNavigation();
  const card = React.useRef(new CKTapCard()).current;
  const { withModal, nfcVisible, closeNfc } = useTapsignerModal(card);
  const {
    mode,
    signer,
    isMultisig,
    addSignerFlow = false,
  }: {
    mode: InteracationMode;
    signer: Signer;
    isMultisig: boolean;
    addSignerFlow?: boolean;
  } = route.params;
  const { mapUnknownSigner } = useUnkownSigners();
  const isConfigRecovery = mode === InteracationMode.CONFIG_RECOVERY;
  const isHealthcheck = mode === InteracationMode.HEALTH_CHECK;

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
  const { inProgress, start } = useAsync();

  const addTapsignerWithProgress = async () => {
    NfcManager.isSupported().then(async (supported) => {
      if (supported) {
        if (isHealthcheck) verifyTapsginer();
        await start(addTapsigner);
      } else if (!DeviceInfo.isEmulator()) {
        showToast('NFC not supported on this device', <ToastErrorIcon />);
      }
    });
  };

  const addTapsigner = React.useCallback(async () => {
    try {
      const { xpub, derivationPath, masterFingerprint, xpubDetails } = await withModal(async () =>
        getTapsignerDetails(card, cvc, isMultisig)
      )();
      let tapsigner: Signer;
      let vaultKey: VaultSigner;
      if (isAMF) {
        // fetched multi-sig key
        const {
          xpub: multiSigXpub,
          xpriv: multiSigXpriv,
          derivationPath: multiSigPath,
          masterFingerprint,
        } = generateMockExtendedKeyForSigner(
          EntityKind.VAULT,
          SignerType.TAPSIGNER,
          config.NETWORK_TYPE
        );
        // fetched single-sig key
        const {
          xpub: singleSigXpub,
          xpriv: singleSigXpriv,
          derivationPath: singleSigPath,
        } = generateMockExtendedKeyForSigner(
          EntityKind.WALLET,
          SignerType.TAPSIGNER,
          config.NETWORK_TYPE
        );

        const xpubDetails: XpubDetailsType = {};

        xpubDetails[XpubTypes.P2WPKH] = {
          xpub: singleSigXpub,
          xpriv: singleSigXpriv,
          derivationPath: singleSigPath,
        };

        xpubDetails[XpubTypes.P2WSH] = {
          xpub: multiSigXpub,
          xpriv: multiSigXpriv,
          derivationPath: multiSigPath,
        };

        xpubDetails[XpubTypes.AMF] = {
          xpub: multiSigXpub,
          xpriv: multiSigXpriv,
          derivationPath: multiSigPath,
        };

        const { signer, key } = generateSignerFromMetaData({
          xpub: multiSigXpub,
          derivationPath: multiSigPath,
          masterFingerprint,
          signerType: SignerType.TAPSIGNER,
          storageType: SignerStorage.COLD,
          isMultisig,
          xpriv: multiSigXpriv,
          isMock: false,
          xpubDetails,
        });
        tapsigner = signer;
        vaultKey = key;
      } else {
        const { signer, key } = generateSignerFromMetaData({
          xpub,
          derivationPath,
          masterFingerprint,
          signerType: SignerType.TAPSIGNER,
          storageType: SignerStorage.COLD,
          isMultisig,
          xpubDetails,
        });
        tapsigner = signer;
        vaultKey = key;
      }
      if (mode === InteracationMode.RECOVERY) {
        dispatch(setSigningDevices(tapsigner));
        navigation.dispatch(
          CommonActions.navigate('LoginStack', { screen: 'VaultRecoveryAddSigner' })
        );
      } else {
        dispatch(addSigningDevice([tapsigner]));
        const navigationState = addSignerFlow
          ? {
              name: 'ManageSigners',
              params: { addedSigner: tapsigner, addSignerFlow, showModal: true },
            }
          : {
              name: 'AddSigningDevice',
              merge: true,
              params: { addedSigner: tapsigner, addSignerFlow, showModal: true },
            };
        navigation.dispatch(CommonActions.navigate(navigationState));
      }
    } catch (error) {
      const errorMessage = getTapsignerErrorMessage(error);
      if (errorMessage.includes('cvc retry')) {
        navigation.dispatch(CommonActions.navigate('UnlockTapsigner'));
        return;
      }
      if (errorMessage) {
        if (Platform.OS === 'ios') NFC.showiOSMessage(errorMessage);
        showToast(errorMessage);
      } else if (error.toString() === 'Error') {
        // do nothing when nfc is dismissed by the user
      } else {
        showToast('Something went wrong, please try again!', null);
      }
      closeNfc();
      card.endNfcSession();
    }
  }, [cvc]);

  const verifyTapsginer = React.useCallback(async () => {
    try {
      const { masterFingerprint } = await withModal(async () =>
        getTapsignerDetails(card, cvc, isMultisig)
      )();
      const handleSuccess = () => {
        dispatch(
          healthCheckStatusUpdate([
            {
              signerId: signer.masterFingerprint,
              status: hcStatusType.HEALTH_CHECK_SUCCESSFULL,
            },
          ])
        );
        navigation.dispatch(CommonActions.goBack());
        showToast('Tapsigner verified successfully', <TickIcon />);
      };

      const handleFailure = () => {
        showToast('Something went wrong, please try again!');
      };

      if (mode === InteracationMode.IDENTIFICATION) {
        const mapped = mapUnknownSigner({ masterFingerprint, type: SignerType.COLDCARD });
        if (mapped) {
          handleSuccess();
        } else {
          handleFailure();
        }
      } else {
        if (masterFingerprint === signer.masterFingerprint) {
          handleSuccess();
        } else {
          handleFailure();
        }
      }
    } catch (error) {
      const errorMessage = getTapsignerErrorMessage(error);
      if (errorMessage.includes('cvc retry')) {
        navigation.dispatch(CommonActions.navigate('UnlockTapsigner'));
        return;
      }
      if (errorMessage) {
        if (Platform.OS === 'ios') NFC.showiOSMessage(errorMessage);
        showToast(errorMessage);
      } else if (error.toString() === 'Error') {
        // do nothing when nfc is dismissed by the user
      } else {
        showToast('Something went wrong, please try again!');
      }
      closeNfc();
      card.endNfcSession();
    }
  }, [cvc]);

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title={isHealthcheck ? 'Verify TAPSIGNER' : 'Setting up TAPSIGNER'}
        subtitle="Enter the 6-32 digit pin (default one is printed on the back)"
      />
      <MockWrapper
        signerType={SignerType.TAPSIGNER}
        addSignerFlow={addSignerFlow}
        mode={mode}
        signerXfp={signer?.masterFingerprint}
      >
        <ScrollView>
          <Box style={styles.input} backgroundColor={`${colorMode}.seashellWhite`}>
            <TextInput
              value={cvc}
              onChangeText={setCvc}
              secureTextEntry
              showSoftInputOnFocus={false}
            />
          </Box>
          <Text style={styles.heading} color={`${colorMode}.greenText`}>
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
        onDeletePressed={onDeletePressed}
        keyColor={colorMode === 'light' ? '#041513' : '#FFF'}
        ClearIcon={colorMode === 'dark' ? <DeleteIcon /> : <DeleteDarkIcon />}
      />
      <NfcPrompt visible={nfcVisible} close={closeNfc} />
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
    letterSpacing: 5,
    justifyContent: 'center',
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
