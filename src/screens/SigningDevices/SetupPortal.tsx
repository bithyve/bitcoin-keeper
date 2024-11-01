import { Platform, StyleSheet, TextInput } from 'react-native';
import { Box, useColorMode } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';

import Text from 'src/components/KeeperText';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import {
  EntityKind,
  NetworkType,
  SignerStorage,
  SignerType,
  XpubTypes,
} from 'src/services/wallets/enums';
import DeleteDarkIcon from 'src/assets/images/delete.svg';
import DeleteIcon from 'src/assets/images/deleteLight.svg';
import Buttons from 'src/components/Buttons';

import KeeperHeader from 'src/components/KeeperHeader';
import KeyPadView from 'src/components/AppNumPad/KeyPadView';
import NFC from 'src/services/nfc';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import React, { useEffect } from 'react';
import { addSigningDevice } from 'src/store/sagaActions/vaults';
import { generateSignerFromMetaData } from 'src/hardware';
import { useDispatch } from 'react-redux';
import useToastMessage, { IToastCategory } from 'src/hooks/useToastMessage';
import { windowHeight, windowWidth, wp } from 'src/constants/responsive';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { isTestnet } from 'src/constants/Bitcoin';
import { generateMockExtendedKeyForSigner } from 'src/services/wallets/factories/VaultFactory';
import config from 'src/utils/service-utilities/config';
import { Signer, VaultSigner, XpubDetailsType } from 'src/services/wallets/interfaces/vault';
import NfcManager from 'react-native-nfc-manager';
import DeviceInfo from 'react-native-device-info';
import MockWrapper from 'src/screens/Vault/MockWrapper';
import { setSigningDevices } from 'src/store/reducers/bhr';
import { InteracationMode } from '../Vault/HardwareModalMap';
import * as PORTAL from 'src/hardware/portal';
import useNfcModal from 'src/hooks/useNfcModal';
import { CardStatus, MnemonicWords, Network } from 'modules/libportal-react-native/src';
import useVault from 'src/hooks/useVault';
import { genrateOutputDescriptors } from 'src/utils/service-utilities/utils';

const isTestNet = config.NETWORK_TYPE === NetworkType.TESTNET;

function SetupPortal({ route }) {
  const { colorMode } = useColorMode();
  const [cvc, setCvc] = React.useState('');
  const navigation = useNavigation();
  const { withNfcModal, nfcVisible, closeNfc } = useNfcModal();
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
    signTransaction?: (options: { tapsignerCVC?: string }) => {};
    addSignerFlow?: boolean;
    vaultId?: string;
  } = route.params;

  const isHealthcheck = mode === InteracationMode.HEALTH_CHECK;
  const isManualRegister = mode === InteracationMode.IDENTIFICATION;
  let vaultDescriptor = '';
  if (isManualRegister) {
    const { activeVault } = useVault({ includeArchived: true, vaultId });
    vaultDescriptor = genrateOutputDescriptors(activeVault);
    vaultDescriptor = vaultDescriptor.replaceAll('/**', '/*');
    vaultDescriptor = vaultDescriptor.replace('No path restrictions', '/0/*,/1/*');
    vaultDescriptor = vaultDescriptor.replace('\n', ' ');
  }

  useEffect(() => {
    actionDirectly();
  }, []);

  useEffect(() => {
    nfcVisible === false && PORTAL.stopReading();
  }, [nfcVisible]);

  const actionDirectly = async () => {
    switch (mode) {
      case InteracationMode.SIGN_TRANSACTION:
        return signWithPortal();
      case InteracationMode.IDENTIFICATION:
        return startRegisterVault();
      case InteracationMode.HEALTH_CHECK:
        showToast('Health Check not supported on this device', <ToastErrorIcon />);
        navigation.goBack();
        break;
      default:
        return addPortal();
    }
  };

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

  const continueWithPortal = async () => {
    NfcManager.isSupported().then(async (supported) => {
      if (supported) {
        if (isHealthcheck) await addPortal();

        switch (mode) {
          case InteracationMode.SIGN_TRANSACTION:
            return signWithPortal();
          case InteracationMode.IDENTIFICATION:
            return startRegisterVault();
          case InteracationMode.HEALTH_CHECK:
            showToast('Health Check not supported on this device', <ToastErrorIcon />);
            break;
          default:
            addPortal();
        }
      } else if (!(await DeviceInfo.isEmulator())) {
        showToast('NFC not supported on this device', <ToastErrorIcon />);
      }
    });
  };

  const registerVault = async () => {
    try {
      await PORTAL.startReading();
      const status: CardStatus = await PORTAL.getStatus();
      if (!status.initialized) {
        throw 'Portal not initialized';
      }
      const updatedDescriptor = vaultDescriptor.trim();
      const res = await PORTAL.registerVault(updatedDescriptor);
      console.log('🚀', { res });
      return res;
    } catch (error) {
      console.log('🚀 ~ registerVault ~ error:', error);
      showToast('Something went wrong. Please try again', <ToastErrorIcon />);
    }
  };

  const startRegisterVault = async () => {
    const res = await withNfcModal(async () => registerVault());
    console.log('🚀 ~ registerVault ~ res:', res);
    showToast('Vault Registered Successfully');
    // navigation.goBack();
  };

  const getPortalDetails = async () => {
    try {
      await PORTAL.startReading();
      const status: CardStatus = await PORTAL.getStatus();
      if (!status.initialized) {
        await PORTAL.initializePortal(
          MnemonicWords[0],
          isTestNet ? Network.Testnet : Network.Bitcoin
        );
      }
      const derivationPath = 'm/48h/1h/0h/2h'; // for single sig
      // const derivationPath = 'm/84h/1h/0h';
      const descriptor = await PORTAL.getXpub(derivationPath);
      // const descriptor = await PORTAL.publicDescriptors();
      const signer = PORTAL.getPortalDetailsFromDescriptor(descriptor.xpub);
      return signer;
    } catch (error) {
      console.log('🚀 ~ getPortalDetails ~ error:', error);
      showToast('Something went wrong. Please try again', <ToastErrorIcon />);
    }
  };

  const addPortal = React.useCallback(async () => {
    try {
      const portalDetails = await withNfcModal(async () => getPortalDetails());
      console.log('portalDetails ', portalDetails);
      const { xpub, derivationPath, masterFingerprint, xpubDetails } = portalDetails;

      let portalSigner: Signer;
      let vaultKey: VaultSigner;
      if (false && isTestnet() && (await DeviceInfo.isEmulator())) {
        // fetched multi-sig key
        const {
          xpub: multiSigXpub,
          xpriv: multiSigXpriv,
          derivationPath: multiSigPath,
          masterFingerprint,
        } = generateMockExtendedKeyForSigner(
          EntityKind.VAULT,
          SignerType.PORTAL,
          config.NETWORK_TYPE
        );
        // fetched single-sig key
        const {
          xpub: singleSigXpub,
          xpriv: singleSigXpriv,
          derivationPath: singleSigPath,
        } = generateMockExtendedKeyForSigner(
          EntityKind.WALLET,
          SignerType.PORTAL,
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
          signerType: SignerType.PORTAL,
          storageType: SignerStorage.COLD,
          isMultisig,
          xpriv: multiSigXpriv,
          isMock: false,
          xpubDetails,
        });
        portalSigner = signer;
        vaultKey = key;
      } else {
        const { signer, key } = generateSignerFromMetaData({
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
        vaultKey = key;
      }
      if (mode === InteracationMode.RECOVERY) {
        if (Platform.OS === 'ios') NFC.showiOSMessage(`Portal health check verified!`);
        dispatch(setSigningDevices(portalSigner));
        navigation.dispatch(
          CommonActions.navigate('LoginStack', { screen: 'VaultRecoveryAddSigner' })
        );
      } else {
        if (Platform.OS === 'ios') NFC.showiOSMessage(`Portal added successfully!`);
        console.log('Adding');
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
      console.log('🚀 ~ addPortal ~ error:', error);
      showToast('Something went wrong. Please try again', <ToastErrorIcon />);
    }
  }, [cvc]);

  const signWithPortal = React.useCallback(async () => {
    try {
      // TODO: cvc flow need to check

      await signTransaction({ portalCVC: cvc });
      if (Platform.OS === 'ios') NFC.showiOSMessage(`Portal signed successfully!`);
      navigation.goBack();
    } catch (error) {
      showToast(
        'Something went wrong. Please try again',
        <ToastErrorIcon />,
        IToastCategory.DEFAULT,
        3000,
        true
      );
    } finally {
    }
  }, [cvc]);

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
        subtitle=""
      />
      <MockWrapper
        signerType={SignerType.PORTAL}
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
            You will be scanning the Portal after this step
          </Text>
          <Box style={styles.btnContainer}>
            <Buttons
              primaryText={(() => {
                switch (mode) {
                  case InteracationMode.SIGN_TRANSACTION:
                    return 'Sign';
                  case InteracationMode.BACKUP_SIGNER:
                    return 'Save Backup';
                  case InteracationMode.IDENTIFICATION:
                    return 'Register';
                  default:
                    return 'Proceed';
                }
              })()}
              primaryCallback={continueWithPortal}
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

export default SetupPortal;

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
