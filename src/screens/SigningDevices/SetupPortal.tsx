import { Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { Box, useColorMode } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';

import Text from 'src/components/KeeperText';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import {
  DerivationPurpose,
  NetworkType,
  SignerStorage,
  SignerType,
} from 'src/services/wallets/enums';
import Buttons from 'src/components/Buttons';
import TickIcon from 'src/assets/images/icon_tick.svg';
import NFC from 'src/services/nfc';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import React, { useEffect, useState } from 'react';
import { addSigningDevice } from 'src/store/sagaActions/vaults';
import { createXpubDetails, generateSignerFromMetaData } from 'src/hardware';
import { useDispatch } from 'react-redux';
import useToastMessage, { IToastCategory } from 'src/hooks/useToastMessage';
import { hp, windowHeight, wp } from 'src/constants/responsive';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { Signer } from 'src/services/wallets/interfaces/vault';
import NfcManager from 'react-native-nfc-manager';
import DeviceInfo from 'react-native-device-info';
import MockWrapper from 'src/screens/Vault/MockWrapper';
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
import { healthCheckStatusUpdate } from 'src/store/sagaActions/bhr';
import { hcStatusType } from 'src/models/interfaces/HeathCheckTypes';
import KeeperTextInput from 'src/components/KeeperTextInput';
import { SegmentedController } from 'src/components/SegmentController';
import { options, SuccessContainer } from '../AddSigner/AddMultipleXpub';
import InfoIconDark from 'src/assets/images/info-Dark-icon.svg';
import InfoIcon from 'src/assets/images/info_icon.svg';
import WalletHeader from 'src/components/WalletHeader';
import KeeperModal from 'src/components/KeeperModal';
import Instruction from 'src/components/Instruction';
import { useAppSelector } from 'src/store/hooks';

function SetupPortal({ route }) {
  const {
    mode,
    signer,
    isMultisig,
    accountNumber = 0,
    signTransaction,
    addSignerFlow = false,
    vaultId,
    isRemoteKey,
    receiveAddressIndex,
    Illustration,
    Instructions,
  }: {
    mode: InteracationMode;
    signer: Signer;
    isMultisig: boolean;
    accountNumber: number;
    signTransaction?: (options: { portalCVC?: string }) => {};
    addSignerFlow?: boolean;
    vaultId?: string;
    isRemoteKey?: boolean;
    receiveAddressIndex?: number;
    Illustration?: any;
    Instructions?: any;
  } = route.params;
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const [cvc, setCvc] = React.useState('');
  const [confirmCVC, setConfirmCVC] = React.useState('');
  const [portalStatus, setPortalStatus] = useState(null);
  const [isAddSignerMode, setIsAddSignerMode] = useState(false);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { showToast } = useToastMessage();
  const { withNfcModal, nfcVisible, closeNfc } = useNfcModal();
  const isManualRegister = mode === InteracationMode.VAULT_REGISTER;
  const isAddressVerification = mode === InteracationMode.ADDRESS_VERIFICATION;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [xpubs, setXpubs] = useState({});
  const [infoModal, setInfoModal] = useState(false);
  const { bitcoinNetworkType } = useAppSelector((state) => state.settings);

  let vaultDescriptor = '';
  let vault = null;
  if (isManualRegister || isAddressVerification) {
    const { activeVault } = useVault({ includeArchived: true, vaultId });
    vault = activeVault;
    vaultDescriptor = generateOutputDescriptors(activeVault, false, false);
    vaultDescriptor = vaultDescriptor.replaceAll('/<0;1>', '');
  }

  useEffect(() => {
    continueWithPortal();
  }, []);

  useEffect(() => {
    nfcVisible === false && PORTAL.stopReading();
  }, [nfcVisible]);

  const continueWithPortal = async () => {
    NfcManager.isSupported().then(async (supported) => {
      if (supported) {
        switch (mode) {
          case InteracationMode.SIGN_TRANSACTION:
            return signWithPortal();
          case InteracationMode.VAULT_REGISTER:
            return startRegisterVault();
          case InteracationMode.HEALTH_CHECK:
            return healthCheckPortal();
          case InteracationMode.ADDRESS_VERIFICATION:
            return verifyAddressPortal();
          default:
            setIsAddSignerMode(true);
        }
      } else {
        if (mode === InteracationMode.VAULT_ADDITION) setIsAddSignerMode(true);
        if (!(await DeviceInfo.isEmulator()))
          showToast('NFC not supported on this device', <ToastErrorIcon />);
      }
    });
  };

  const verifyAddressPortal = async () => {
    try {
      return await withNfcModal(async () => {
        await PORTAL.startReading();
        await checkAndUnlock(cvc, setPortalStatus);
        const { receivingAddress } = generateVaultAddressDescriptors(vault, receiveAddressIndex);
        const res = await PORTAL.verifyAddress(receiveAddressIndex);
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
      if (error?.message.includes(PORTAL_ERRORS.PORTAL_NOT_INITIALIZED)) navigation.goBack();
      showToast(
        error.message ? error.message : 'Something went wrong. Please try again',
        <ToastErrorIcon />
      );
      return false;
    }
  };

  const healthCheckPortal = async () => {
    try {
      return await withNfcModal(async () => {
        // call register then check the value of it
        await PORTAL.startReading();
        await checkAndUnlock(cvc, setPortalStatus);
        const res = await PORTAL.getXpub({ accountNumber, purpose: DerivationPurpose.BIP48 });
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
      if (error?.message.includes(PORTAL_ERRORS.PORTAL_NOT_INITIALIZED)) navigation.goBack();
      showToast(
        error.message ? error.message : 'Something went wrong. Please try again',
        <ToastErrorIcon />
      );

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

  const getPortalDetails = async (purpose) => {
    await PORTAL.startReading();
    await checkAndUnlock(cvc, setPortalStatus);
    const descriptor = await PORTAL.getXpub({ accountNumber, purpose });
    const signer = PORTAL.getPortalDetailsFromDescriptor(descriptor.xpub);
    return signer;
  };

  const addPortal = React.useCallback(
    async (purpose) => {
      try {
        const portalDetails = await withNfcModal(async () => getPortalDetails(purpose));
        setXpubs((xpubs) => {
          return { ...xpubs, [purpose]: portalDetails };
        });
      } catch (error) {
        showToast(
          error.message ? error.message : 'Something went wrong. Please try again',
          <ToastErrorIcon />
        );
      }
    },
    [cvc]
  );

  const createPortalSigner = () => {
    const { xpub, derivationPath, masterFingerprint, xpubDetails } = createXpubDetails(xpubs);
    const { signer: portalSigner } = generateSignerFromMetaData({
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
          name: 'Home',
          params: {
            selectedOption: 'Keys',
            addedSigner: portalSigner,
            addSignerFlow,
            showModal: true,
          },
        }
      : {
          name: 'AddSigningDevice',
          merge: true,
          params: { addedSigner: portalSigner, addSignerFlow, showModal: true },
        };
    navigation.dispatch(CommonActions.navigate(navigationState));
  };

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
      await withNfcModal(async () => {
        await PORTAL.startReading();
        try {
          // Throws error if portal is partially initialized already.
          await PORTAL.initializePortal(
            MnemonicWords[0],
            bitcoinNetworkType === NetworkType.TESTNET ? Network.Testnet : Network.Bitcoin,
            cvc.trim().length ? cvc : null
          );
        } catch (error) {
          if (error.message.includes(PORTAL_ERRORS.UNVERIFIED_MNEMONIC)) {
            await PORTAL.resumeMnemonicGeneration();
          }
        }

        setPortalStatus(null);
        if (addSignerFlow) setIsAddSignerMode(true);
        setCvc('');
        setConfirmCVC('');
      });
    } catch (error) {
      showToast(
        error.message ? error.message : 'Something went wrong. Please try again',
        <ToastErrorIcon />
      );
    }
  }, [cvc, confirmCVC, mode]);

  const wipePortal = async () => {
    try {
      await withNfcModal(async () => {
        await PORTAL.startReading();
        await PORTAL.wipePortal();
        return true;
      });
    } catch (error) {
      console.log('🚀 ~ wipePortal ~ error:', error);
    }
  };

  const renderContent = () => {
    const data = xpubs[options[selectedIndex].purpose];
    return data ? (
      <SuccessContainer type={options[selectedIndex].label} />
    ) : (
      <Box style={styles.contentContainer}>
        <Text
          style={styles.contentText}
        >{`Proceed with scanning portal for fetching ${options[selectedIndex].label} xpub details`}</Text>
        <Buttons
          fullWidth
          primaryText="Scan"
          primaryCallback={() => {
            addPortal(options[selectedIndex].purpose);
          }}
        />
      </Box>
    );
  };

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <WalletHeader
        title={(() => {
          switch (mode) {
            case InteracationMode.HEALTH_CHECK:
              return 'Verify Portal';
            case InteracationMode.SIGN_TRANSACTION:
              return 'Sign with Portal';
            case InteracationMode.BACKUP_SIGNER:
              return 'Save Portal Backup';
            case InteracationMode.VAULT_REGISTER:
              return 'Register Vault with Portal';
            default:
              return 'Add your Portal';
          }
        })()}
        subTitle={
          portalStatus?.initialized == false
            ? 'Initialize portal with 12 words seed'
            : 'Enter your device password'
        }
        rightComponent={
          InteracationMode.VAULT_ADDITION ? (
            <TouchableOpacity style={styles.infoIcon} onPress={() => setInfoModal(true)}>
              {isDarkMode ? <InfoIconDark /> : <InfoIcon />}
            </TouchableOpacity>
          ) : null
        }
      />
      <MockWrapper
        signerType={SignerType.PORTAL}
        addSignerFlow={addSignerFlow}
        mode={mode}
        signerXfp={signer?.masterFingerprint}
      >
        {isAddSignerMode && !portalStatus ? (
          <>
            <ScrollView>
              <PasswordField
                label={'Password'}
                placeholder="********"
                value={cvc}
                onChangeText={setCvc}
              />
              <SegmentedController
                options={options}
                selectedIndex={selectedIndex}
                setSelectedIndex={setSelectedIndex}
              />
              <Box marginTop={hp(30)}>{renderContent()}</Box>
            </ScrollView>
            {Object.values(xpubs).some((value) => value !== null) && (
              <Buttons fullWidth primaryText="Finish" primaryCallback={createPortalSigner} />
            )}
            <Buttons
              secondaryText={bitcoinNetworkType === NetworkType.TESTNET ? ' Wipe' : null}
              secondaryCallback={wipePortal}
            />
          </>
        ) : (
          <ScrollView>
            {!portalStatus && (
              <Box style={styles.inputWrapper}>
                <PasswordField
                  label={'Password'}
                  placeholder="********"
                  value={cvc}
                  onChangeText={setCvc}
                />
                <Box marginTop={5} marginBottom={9}>
                  <Buttons
                    primaryText={(() => {
                      switch (mode) {
                        case InteracationMode.SIGN_TRANSACTION:
                          return 'Sign';
                        case InteracationMode.VAULT_REGISTER:
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
                  onChangeText={setCvc}
                />
                <PasswordField
                  label={'Confirm password'}
                  placeholder="********"
                  value={confirmCVC}
                  onChangeText={setConfirmCVC}
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
        )}
      </MockWrapper>
      <NfcPrompt visible={nfcVisible} close={closeNfc} />
      <KeeperModal
        visible={infoModal}
        close={() => {
          setInfoModal(false);
        }}
        title={'Add your Portal'}
        subTitle={`Get your device ready before proceeding.`}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        Content={() => (
          <Box>
            <Box style={styles.illustrations}>{Illustration}</Box>

            {Instructions?.map((instruction) => (
              <Instruction text={instruction} key={instruction} />
            ))}
          </Box>
        )}
      />
    </ScreenWrapper>
  );
}

export const checkAndUnlock = async (cvc: string, setPortalStatus) => {
  let status: CardStatus = await PORTAL.getStatus();
  if (!status.initialized) {
    if (Platform.OS === 'android')
      // disabling initialization flow for ios, until issues is resolved
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

const PasswordField = ({ label, value, onChangeText, placeholder }) => {
  return (
    <Box marginTop={4}>
      <Text>{label}</Text>
      <KeeperTextInput
        value={value}
        placeholder={placeholder}
        onChangeText={onChangeText}
        isPassword
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
  inputWrapper: {
    marginHorizontal: 15,
    marginTop: 6,
  },
  infoIcon: {
    marginRight: wp(10),
  },
  illustrations: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(20),
  },
  contentContainer: { alignItems: 'center', gap: hp(20) },
  contentText: { textAlign: 'center', maxWidth: '80%' },
});
