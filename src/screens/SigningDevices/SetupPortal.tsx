import { Platform, StyleSheet } from 'react-native';
import { Box, useColorMode } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';

import Text from 'src/components/KeeperText';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { NetworkType, SignerStorage, SignerType } from 'src/services/wallets/enums';
import DeleteDarkIcon from 'src/assets/images/delete.svg';
import DeleteIcon from 'src/assets/images/deleteLight.svg';
import Buttons from 'src/components/Buttons';
import TickIcon from 'src/assets/images/icon_tick.svg';

import KeeperHeader from 'src/components/KeeperHeader';
import KeyPadView from 'src/components/AppNumPad/KeyPadView';
import NFC from 'src/services/nfc';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import React, { useEffect, useState } from 'react';
import { addSigningDevice } from 'src/store/sagaActions/vaults';
import { generateSignerFromMetaData } from 'src/hardware';
import { useDispatch } from 'react-redux';
import useToastMessage, { IToastCategory } from 'src/hooks/useToastMessage';
import { windowHeight, windowWidth, wp } from 'src/constants/responsive';
import ScreenWrapper from 'src/components/ScreenWrapper';
import config from 'src/utils/service-utilities/config';
import { Signer } from 'src/services/wallets/interfaces/vault';
import NfcManager from 'react-native-nfc-manager';
import DeviceInfo from 'react-native-device-info';
import MockWrapper from 'src/screens/Vault/MockWrapper';
import { setSigningDevices } from 'src/store/reducers/bhr';
import { InteracationMode } from '../Vault/HardwareModalMap';
import * as PORTAL from 'src/hardware/portal';
import { PORTAL_ERRORS } from 'src/hardware/portal';
import useNfcModal from 'src/hooks/useNfcModal';
import { CardStatus, MnemonicWords, Network } from 'libportal-react-native';
import useVault from 'src/hooks/useVault';
import {
  generateOutputDescriptors,
  generateVaultAddressDescriptors,
} from 'src/utils/service-utilities/utils';
import { KeeperPasswordInput } from 'src/components/KeeperPasswordInput';
import { healthCheckStatusUpdate } from 'src/store/sagaActions/bhr';
import { hcStatusType } from 'src/models/interfaces/HeathCheckTypes';

const isTestNet = config.NETWORK_TYPE === NetworkType.TESTNET;
const INPUTS = {
  CVC: 'CVC',
  CONFIRM_CVC: 'CONFIRM_CVC',
};

function SetupPortal({ route }) {
  const {
    mode,
    signer,
    isMultisig,
    signTransaction,
    addSignerFlow = false,
    vaultId,
  }: {
    mode: InteracationMode;
    signer: Signer;
    isMultisig: boolean;
    signTransaction?: (options: { portalCVC?: string }) => {};
    addSignerFlow?: boolean;
    vaultId?: string;
  } = route.params;
  const { colorMode } = useColorMode();
  const [cvc, setCvc] = React.useState('');
  const [confirmCVC, setConfirmCVC] = React.useState('');
  const [portalStatus, setPortalStatus] = useState(null);
  const [activeInput, setActiveInput] = useState(INPUTS.CVC);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { showToast } = useToastMessage();
  const { withNfcModal, nfcVisible, closeNfc } = useNfcModal();
  const isManualRegister = mode === InteracationMode.IDENTIFICATION;
  const isAddressVerification = mode === InteracationMode.ADDRESS_VERIFICATION;

  let vaultDescriptor = '';
  let vault = null;
  if (isManualRegister || isAddressVerification) {
    const { activeVault } = useVault({ includeArchived: true, vaultId });
    vault = activeVault;
    vaultDescriptor = generateOutputDescriptors(activeVault, false);
    vaultDescriptor = vaultDescriptor.replaceAll('/<0;1>', '');
  }

  useEffect(() => {
    continueWithPortal();
  }, []);

  useEffect(() => {
    setActiveInput(INPUTS.CVC);
  }, [portalStatus]);

  useEffect(() => {
    nfcVisible === false && PORTAL.stopReading();
  }, [nfcVisible]);

  const onPressHandler = (digit) => {
    const temp = (activeInput === INPUTS.CVC ? cvc : confirmCVC) || '';
    const newTemp = digit === 'x' ? temp.slice(0, -1) : temp + digit;
    switch (activeInput) {
      case INPUTS.CVC:
        setCvc(newTemp);
        break;
      case INPUTS.CONFIRM_CVC:
        setConfirmCVC(newTemp);
        break;
      default:
        break;
    }
  };

  const onDeletePressed = () => {
    const currentInput = activeInput;
    if (currentInput) {
      const inputVal = currentInput === INPUTS.CVC ? cvc : confirmCVC;
      const newInputVal = inputVal.slice(0, inputVal.length - 1);
      if (currentInput === INPUTS.CVC) setCvc(newInputVal);
      else setConfirmCVC(newInputVal);
    }
  };

  const continueWithPortal = async () => {
    NfcManager.isSupported().then(async (supported) => {
      if (supported) {
        switch (mode) {
          case InteracationMode.SIGN_TRANSACTION:
            return signWithPortal();
          case InteracationMode.IDENTIFICATION:
            return startRegisterVault();
          case InteracationMode.HEALTH_CHECK:
            return healthCheckPortal();
          case InteracationMode.ADDRESS_VERIFICATION:
            return verifyAddressPortal();
          default:
            addPortal();
        }
      } else if (!(await DeviceInfo.isEmulator())) {
        showToast('NFC not supported on this device', <ToastErrorIcon />);
      }
    });
  };

  const verifyAddressPortal = async () => {
    try {
      return await withNfcModal(async () => {
        await PORTAL.startReading();
        await checkAndUnlock(cvc, setPortalStatus);
        const { receivingAddress } = generateVaultAddressDescriptors(vault);
        const { nextFreeAddressIndex } = vault.specs;
        const res = await PORTAL.verifyAddress(nextFreeAddressIndex);
        if (res == receivingAddress) {
          navigation.dispatch(CommonActions.goBack());
          if (Platform.OS === 'ios') NFC.showiOSMessage(`Address verified successfully!`);
          showToast('Address verified successfully', <TickIcon />);
          return true;
        } else {
          if (Platform.OS === 'ios') NFC.showiOSMessage(`Address verification failed!`);
          showToast('Address verification failed!');
          return false;
        }
      });
    } catch (error) {
      showToast(
        error.message ? error.message : 'Something went wrong. Please try again',
        <ToastErrorIcon />
      );
      if (error?.message.includes(PORTAL_ERRORS.PORTAL_NOT_INITIALIZED)) navigation.goBack();
      return false;
    }
  };

  const healthCheckPortal = async () => {
    try {
      return await withNfcModal(async () => {
        // call register then check the value of it
        await PORTAL.startReading();
        await checkAndUnlock(cvc, setPortalStatus);
        const res = await PORTAL.getXpub({ isMultisig: true });
        if (res) {
          dispatch(
            healthCheckStatusUpdate([
              {
                signerId: signer.masterFingerprint,
                status: hcStatusType.HEALTH_CHECK_SUCCESSFULL,
              },
            ])
          );
        }
        navigation.dispatch(CommonActions.goBack());
        if (Platform.OS === 'ios') NFC.showiOSMessage(`Portal verified successfully!`);
        showToast('Portal verified successfully', <TickIcon />);
        return true;
      });
    } catch (error) {
      showToast(
        error.message ? error.message : 'Something went wrong. Please try again',
        <ToastErrorIcon />
      );
      if (error?.message.includes(PORTAL_ERRORS.PORTAL_NOT_INITIALIZED)) navigation.goBack();
      return false;
    }
  };

  const registerVault = async () => {
    try {
      await PORTAL.startReading();
      await checkAndUnlock(cvc, setPortalStatus);
      const updatedDescriptor = vaultDescriptor.trim();
      await PORTAL.registerVault(updatedDescriptor);
      return true;
    } catch (error) {
      showToast(
        error.message ? error.message : 'Something went wrong. Please try again',
        <ToastErrorIcon />
      );
      if (error?.message.includes(PORTAL_ERRORS.PORTAL_NOT_INITIALIZED)) navigation.goBack();

      return false;
    }
  };

  const startRegisterVault = async () => {
    const res = await withNfcModal(async () => registerVault());
    if (res) {
      showToast('Vault Registered Successfully');
      navigation.goBack();
    }
  };

  const getPortalDetails = async () => {
    await PORTAL.startReading();
    await checkAndUnlock(cvc, setPortalStatus);
    const descriptor = await PORTAL.getXpub({ isMultisig: true });
    const signer = PORTAL.getPortalDetailsFromDescriptor(descriptor.xpub);
    return signer;
  };

  const addPortal = React.useCallback(async () => {
    try {
      const portalDetails = await withNfcModal(async () => getPortalDetails());
      const { xpub, derivationPath, masterFingerprint, xpubDetails } = portalDetails;
      let portalSigner: Signer;
      const { signer } = generateSignerFromMetaData({
        xpub,
        derivationPath,
        masterFingerprint,
        signerType: SignerType.PORTAL,
        storageType: SignerStorage.COLD,
        isMultisig,
        xpubDetails,
        isAmf: false,
      });
      portalSigner = signer;
      if (mode === InteracationMode.RECOVERY) {
        if (Platform.OS === 'ios') NFC.showiOSMessage(`Portal health check verified!`);
        dispatch(setSigningDevices(portalSigner));
        navigation.dispatch(
          CommonActions.navigate('LoginStack', { screen: 'VaultRecoveryAddSigner' })
        );
      } else {
        if (Platform.OS === 'ios') NFC.showiOSMessage(`Portal added successfully!`);
        dispatch(addSigningDevice([portalSigner]));
        const navigationState = addSignerFlow
          ? {
              name: 'ManageSigners',
              params: { addedSigner: portalSigner, addSignerFlow, showModal: true },
            }
          : {
              name: 'AddSigningDevice',
              merge: true,
              params: { addedSigner: portalSigner, addSignerFlow, showModal: true },
            };
        navigation.dispatch(CommonActions.navigate(navigationState));
      }
    } catch (error) {
      showToast(
        error.message ? error.message : 'Something went wrong. Please try again',
        <ToastErrorIcon />
      );
    }
  }, [cvc]);

  const signWithPortal = React.useCallback(async () => {
    try {
      await signTransaction({ portalCVC: cvc });
      if (Platform.OS === 'ios') NFC.showiOSMessage(`Portal signed successfully!`);
      navigation.goBack();
    } catch (error) {
      PORTAL.stopReading();
      showToast(
        error?.message ? error.message : 'Something went wrong. Please try again',
        <ToastErrorIcon />,
        IToastCategory.DEFAULT,
        3000,
        true
      );
      if (error?.message.includes(PORTAL_ERRORS.PORTAL_NOT_INITIALIZED)) navigation.goBack();
    }
  }, [cvc]);

  const validateAndInitializePortal = React.useCallback(async () => {
    function validateCVC() {
      if (cvc === '' && confirmCVC === '') return true;
      if (cvc !== '' && cvc === confirmCVC) return true;
      return false;
    }

    try {
      if (!validateCVC()) {
        showToast(PORTAL_ERRORS.CVC_MISMATCH, <ToastErrorIcon />);
        return;
      }
      const portalDetails = await withNfcModal(async () => {
        await PORTAL.startReading();
        try {
          // Throws error if portal is partially initialized already.
          await PORTAL.initializePortal(
            MnemonicWords[0],
            isTestNet ? Network.Testnet : Network.Bitcoin,
            cvc.trim().length ? cvc : null
          );
        } catch (error) {
          if (error.message.includes(PORTAL_ERRORS.UNVERIFIED_MNEMONIC)) {
            await PORTAL.resumeMnemonicGeneration();
          }
        }

        const portalDetails = await getPortalDetails();
        setPortalStatus(null);
        return portalDetails;
      });
      const { xpub, derivationPath, masterFingerprint, xpubDetails } = portalDetails;

      const { signer: portalSigner, key: vaultKey } = generateSignerFromMetaData({
        xpub,
        derivationPath,
        masterFingerprint,
        signerType: SignerType.PORTAL,
        storageType: SignerStorage.COLD,
        isMultisig,
        xpubDetails,
        isAmf: false,
      });
      if (Platform.OS === 'ios') NFC.showiOSMessage(`Portal added successfully!`);
      dispatch(addSigningDevice([portalSigner]));
      const navigationState = addSignerFlow
        ? {
            name: 'ManageSigners',
            params: { addedSigner: portalSigner, addSignerFlow, showModal: true },
          }
        : {
            name: 'AddSigningDevice',
            merge: true,
            params: { addedSigner: portalSigner, addSignerFlow, showModal: true },
          };
      navigation.dispatch(CommonActions.navigate(navigationState));
    } catch (error) {
      showToast(
        error.message ? error.message : 'Something went wrong. Please try again',
        <ToastErrorIcon />
      );
    }
  }, [cvc, confirmCVC, mode]);

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title={(() => {
          switch (mode) {
            case InteracationMode.HEALTH_CHECK:
              return 'Verify Portal';
            case InteracationMode.SIGN_TRANSACTION:
              return 'Sign with Portal';
            case InteracationMode.BACKUP_SIGNER:
              return 'Save Portal Backup';
            case InteracationMode.IDENTIFICATION:
              return 'Register Vault with Portal';
            default:
              return 'Setting up Portal';
          }
        })()}
        subtitle={
          portalStatus?.initialized == false
            ? 'Initialize portal with 12 words seed'
            : 'Enter your device password'
        }
      />
      <MockWrapper
        signerType={SignerType.PORTAL}
        addSignerFlow={addSignerFlow}
        mode={mode}
        signerXfp={signer?.masterFingerprint}
      >
        <ScrollView>
          {!portalStatus && (
            <Box style={styles.inputWrapper}>
              <PasswordField
                label={'Password'}
                placeholder="********"
                value={cvc}
                onPress={() => setActiveInput(INPUTS.CVC)}
                isActive={activeInput === INPUTS.CVC}
              />
              <Box marginTop={5} marginBottom={9}>
                <Buttons
                  primaryText={(() => {
                    switch (mode) {
                      case InteracationMode.SIGN_TRANSACTION:
                        return 'Sign';
                      case InteracationMode.IDENTIFICATION:
                        return 'Register';
                      case InteracationMode.HEALTH_CHECK:
                        return 'Verify';
                      default:
                        return 'Proceed';
                    }
                  })()}
                  primaryCallback={continueWithPortal}
                />
              </Box>
            </Box>
          )}

          {portalStatus && !portalStatus?.initialized && (
            <Box style={styles.inputWrapper}>
              <PasswordField
                label={'New password(optional)'}
                placeholder="********"
                value={cvc}
                onPress={() => setActiveInput(INPUTS.CVC)}
                isActive={activeInput === INPUTS.CVC}
              />
              <PasswordField
                label={'Confirm password'}
                placeholder="********"
                value={confirmCVC}
                onPress={() => setActiveInput(INPUTS.CONFIRM_CVC)}
                isActive={activeInput === INPUTS.CONFIRM_CVC}
              />
              <Box marginTop={5} marginBottom={9}>
                <Buttons
                  primaryText={'Initialize Portal'}
                  primaryCallback={validateAndInitializePortal}
                />
              </Box>
            </Box>
          )}
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

export const checkAndUnlock = async (cvc: string, setPortalStatus) => {
  let status: CardStatus = await PORTAL.getStatus();
  if (!status.initialized) {
    setPortalStatus(status);
    await PORTAL.stopReading();
    throw { message: PORTAL_ERRORS.PORTAL_NOT_INITIALIZED };
  }
  if (!status.unlocked) {
    // Unlocking portal with cvc
    if (!cvc) throw { message: PORTAL_ERRORS.PORTAL_LOCKED };
    await PORTAL.unlock(cvc);
    status = await PORTAL.getStatus();
    if (!status.unlocked) {
      if (!cvc) throw { message: PORTAL_ERRORS.INCORRECT_PIN };
    }
  }
  return status;
};

const PasswordField = ({ label, value, onPress, isActive, placeholder }) => {
  return (
    <Box marginTop={4}>
      <Text>{label}</Text>
      <KeeperPasswordInput
        value={value}
        onPress={onPress}
        isActive={isActive}
        placeholder={placeholder}
      />
    </Box>
  );
};

export default SetupPortal;

const styles = StyleSheet.create({
  header: {
    flex: 1,
    paddingHorizontal: '5%',
    marginBottom: windowHeight > 850 ? 0 : '25%',
  },
  input: {
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

  inputWrapper: {
    marginHorizontal: 15,
    marginTop: 6,
  },
  btnContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
});
