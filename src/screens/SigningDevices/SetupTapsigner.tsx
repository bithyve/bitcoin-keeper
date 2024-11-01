import { Platform, StyleSheet } from 'react-native';
import { Box, Input, useColorMode } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import { CKTapCard } from 'cktap-protocol-react-native';

import Text from 'src/components/KeeperText';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { EntityKind, SignerStorage, SignerType, XpubTypes } from 'src/services/wallets/enums';
import { downloadBackup, getTapsignerDetails, handleTapsignerError } from 'src/hardware/tapsigner';
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
import { healthCheckStatusUpdate } from 'src/store/sagaActions/bhr';
import MockWrapper from 'src/screens/Vault/MockWrapper';
import { setSigningDevices } from 'src/store/reducers/bhr';
import useUnkownSigners from 'src/hooks/useUnkownSigners';
import { InteracationMode } from '../Vault/HardwareModalMap';
import { hcStatusType } from 'src/models/interfaces/HeathCheckTypes';
import { exportFile } from 'src/services/fs';

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
    signTransaction,
    addSignerFlow = false,
  }: {
    mode: InteracationMode;
    signer: Signer;
    isMultisig: boolean;
    signTransaction?: (options: { tapsignerCVC?: string }) => {};
    addSignerFlow?: boolean;
  } = route.params;
  const { mapUnknownSigner } = useUnkownSigners();
  const isHealthcheck = mode === InteracationMode.HEALTH_CHECK;
  const isSigning = mode === InteracationMode.SIGN_TRANSACTION;
  const isBackup = mode === InteracationMode.BACKUP_SIGNER;

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

  const { inProgress, start } = useAsync();

  const addTapsignerWithProgress = async () => {
    NfcManager.isSupported().then(async (supported) => {
      if (supported) {
        if (isHealthcheck) verifyTapsginer();
        await start(addTapsigner);
      } else if (!(await DeviceInfo.isEmulator())) {
        showToast('NFC not supported on this device', <ToastErrorIcon />);
      }
    });
  };

  const addTapsigner = React.useCallback(async () => {
    try {
      const { xpub, derivationPath, masterFingerprint, xpubDetails } = await withModal(async () =>
        getTapsignerDetails(card, cvc, isTestnet(), isMultisig)
      )();
      let tapsigner: Signer;
      let vaultKey: VaultSigner;
      if (isTestnet() && (await DeviceInfo.isEmulator())) {
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
          isAmf: false,
        });
        tapsigner = signer;
        vaultKey = key;
      }
      if (mode === InteracationMode.RECOVERY) {
        if (Platform.OS === 'ios') NFC.showiOSMessage(`TAPSIGNER health check verified!`);
        dispatch(setSigningDevices(tapsigner));
        navigation.dispatch(
          CommonActions.navigate('LoginStack', { screen: 'VaultRecoveryAddSigner' })
        );
      } else {
        if (Platform.OS === 'ios') NFC.showiOSMessage(`TAPSIGNER added successfully!`);
        dispatch(addSigningDevice([tapsigner]));
        const navigationState = addSignerFlow
          ? {
              name: 'ManageSigners',
              params: { addedSigner: tapsigner },
            }
          : {
              name: 'AddSigningDevice',
              merge: true,
              params: { addedSigner: tapsigner },
            };
        navigation.dispatch(CommonActions.navigate(navigationState));
      }
    } catch (error) {
      const errorMessage = handleTapsignerError(error, navigation);
      if (errorMessage) {
        showToast(errorMessage, <ToastErrorIcon />, IToastCategory.DEFAULT, 3000, true);
      }
    } finally {
      closeNfc();
      card.endNfcSession();
    }
  }, [cvc]);

  const verifyTapsginer = React.useCallback(async () => {
    try {
      const { masterFingerprint } = await withModal(async () =>
        getTapsignerDetails(card, cvc, isTestnet(), isMultisig)
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
        if (Platform.OS === 'ios') NFC.showiOSMessage(`TAPSIGNER verified successfully!`);
        showToast('TAPSIGNER verified successfully', <TickIcon />);
      };

      const handleFailure = () => {
        const errorMessage = 'Something went wrong, please try again!';
        if (Platform.OS === 'ios') NFC.showiOSErrorMessage(errorMessage);
        else showToast(errorMessage);
      };

      if (mode === InteracationMode.IDENTIFICATION) {
        const mapped = mapUnknownSigner({ masterFingerprint, type: SignerType.TAPSIGNER });
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
      const errorMessage = handleTapsignerError(error, navigation);
      if (errorMessage) {
        showToast(errorMessage, <ToastErrorIcon />, IToastCategory.DEFAULT, 3000, true);
      }
    } finally {
      closeNfc();
      card.endNfcSession();
    }
  }, [cvc]);

  const signWithTapsigner = React.useCallback(async () => {
    try {
      await signTransaction({ tapsignerCVC: cvc });
      if (Platform.OS === 'ios') NFC.showiOSMessage(`TAPSIGNER signed successfully!`);
      navigation.goBack();
    } catch (error) {
      const errorMessage = handleTapsignerError(error, navigation);
      if (errorMessage) {
        showToast(errorMessage, <ToastErrorIcon />, IToastCategory.DEFAULT, 3000, true);
      }
    } finally {
      closeNfc();
      card.endNfcSession();
    }
  }, [cvc]);

  const downloadTapsignerBackup = React.useCallback(async () => {
    try {
      const { backup, cardId } = await withModal(async () => downloadBackup(card, cvc))();
      if (backup) {
        if (Platform.OS === 'ios') NFC.showiOSMessage(`Backup retrieved successfully!`);
        closeNfc();
        card.endNfcSession();

        const now = new Date();
        const timestamp = now.toISOString().slice(0, 16).replace(/[-:]/g, '');
        const fileName = `backup-${cardId.split('-')[0]}-${timestamp}.aes`;

        await exportFile(
          backup,
          fileName,
          (error) => showToast(error.message, <ToastErrorIcon />),
          'base64'
        );
        navigation.dispatch(CommonActions.goBack());
        showToast('TAPSIGNER backup saved successfully', <TickIcon />);
      } else {
        if (Platform.OS === 'ios')
          NFC.showiOSErrorMessage(`Error while downloading TAPSIGNER backup. Please try again`);
        else showToast(`Error while downloading TAPSIGNER backup. Please try again`);
      }
    } catch (error) {
      const errorMessage = handleTapsignerError(error, navigation);
      if (errorMessage) {
        showToast(errorMessage, <ToastErrorIcon />, IToastCategory.DEFAULT, 3000, true);
      }
    } finally {
      closeNfc();
      card.endNfcSession();
    }
  }, [cvc]);

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title={(() => {
          switch (mode) {
            case InteracationMode.HEALTH_CHECK:
              return 'Verify TAPSIGNER';
            case InteracationMode.SIGN_TRANSACTION:
              return 'Sign with TAPSIGNER';
            case InteracationMode.BACKUP_SIGNER:
              return 'Save TAPSIGNER Backup';
            default:
              return 'Setting up TAPSIGNER';
          }
        })()}
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
            <Input
              borderWidth={0}
              value={cvc}
              onChangeText={setCvc}
              secureTextEntry
              showSoftInputOnFocus={false}
            />
          </Box>
          <Text style={styles.heading} color={`${colorMode}.greenText`}>
            You will be scanning the TAPSIGNER after this step
          </Text>
        </ScrollView>
      </MockWrapper>
      <KeyPadView
        onPressNumber={onPressHandler}
        onDeletePressed={onDeletePressed}
        keyColor={colorMode === 'light' ? '#041513' : '#FFF'}
        ClearIcon={colorMode === 'dark' ? <DeleteIcon /> : <DeleteDarkIcon />}
      />
      <Box style={styles.btnContainer}>
        <Buttons
          fullWidth
          primaryText={(() => {
            switch (mode) {
              case InteracationMode.SIGN_TRANSACTION:
                return 'Sign';
              case InteracationMode.BACKUP_SIGNER:
                return 'Save Backup';
              default:
                return 'Proceed';
            }
          })()}
          primaryCallback={() => {
            switch (mode) {
              case InteracationMode.HEALTH_CHECK:
                return verifyTapsginer();
              case InteracationMode.SIGN_TRANSACTION:
                return signWithTapsigner();
              case InteracationMode.BACKUP_SIGNER:
                return downloadTapsignerBackup();
              default:
                return addTapsignerWithProgress();
            }
          }}
          primaryDisable={cvc.length < 6}
          primaryLoading={inProgress}
        />
      </Box>
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
    marginVertical: '5%',
    marginHorizontal: '3%',
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
    justifyContent: 'flex-end',
    flexDirection: 'row',
    paddingHorizontal: '3%',
    paddingTop: '5%',
  },
});
