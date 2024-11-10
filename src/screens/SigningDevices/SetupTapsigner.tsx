import { Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { Box, Input, useColorMode } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import { CKTapCard } from 'cktap-protocol-react-native';

import Text from 'src/components/KeeperText';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { EntityKind, SignerStorage, SignerType, XpubTypes } from 'src/services/wallets/enums';
import {
  downloadBackup,
  getCardInfo,
  getTapsignerDetails,
  handleTapsignerError,
} from 'src/hardware/tapsigner';
import DeleteDarkIcon from 'src/assets/images/delete.svg';
import DeleteIcon from 'src/assets/images/deleteLight.svg';
import Buttons from 'src/components/Buttons';

import KeeperHeader from 'src/components/KeeperHeader';
import KeyPadView from 'src/components/AppNumPad/KeyPadView';
import NFC from 'src/services/nfc';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import { useCallback, useContext, useRef, useState } from 'react';
import { addSigningDevice } from 'src/store/sagaActions/vaults';
import { generateSignerFromMetaData } from 'src/hardware';
import { useDispatch } from 'react-redux';
import useTapsignerModal from 'src/hooks/useTapsignerModal';
import useToastMessage, { IToastCategory } from 'src/hooks/useToastMessage';
import TickIcon from 'src/assets/images/icon_tick.svg';
import { hp, windowHeight, windowWidth, wp } from 'src/constants/responsive';
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
import KeeperModal from 'src/components/KeeperModal';
import ErrorIcon from 'src/assets/images/error.svg';
import ErrorDarkIcon from 'src/assets/images/error-dark.svg';
import HexagonIcon from 'src/components/HexagonIcon';
import TAPSIGNERICONLIGHT from 'src/assets/images/tapsigner_light.svg';
import NFCIcon from 'src/assets/images/nfc_lines.svg';
import NFCIconWhite from 'src/assets/images/nfc_lines_white.svg';
import Colors from 'src/theme/Colors';
import { LocalizationContext } from 'src/context/Localization/LocContext';

function SetupTapsigner({ route }) {
  const { colorMode } = useColorMode();
  const [cvc, setCvc] = useState('');
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { signer: signerTranslations, common } = translations;
  const card = useRef(new CKTapCard()).current;
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
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [tapsignerDerivationPath, setTapsignerDerivationPath] = useState(null);
  const [tapsignerBackupsCount, setTapsignerBackupsCount] = useState(null);

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
        if (mode === InteracationMode.HEALTH_CHECK) verifyTapsginer();
        await start(addTapsigner);
      } else if (!(await DeviceInfo.isEmulator())) {
        showToast('NFC not supported on this device', <ToastErrorIcon />);
      }
    });
  };

  const addTapsigner = useCallback(async () => {
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

  const verifyTapsginer = useCallback(async () => {
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

  const signWithTapsigner = useCallback(async () => {
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

  const downloadTapsignerBackup = useCallback(async () => {
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

  const checkTapsignerSetupStatus = useCallback(async () => {
    try {
      const { cardId, path, backupsCount } = await withModal(async () => getCardInfo(card))();

      if (cardId) {
        if (Platform.OS === 'ios') NFC.showiOSMessage(`TAPSIGNER information retrieved`);
        closeNfc();
        card.endNfcSession();

        if (path) {
          setTapsignerDerivationPath(path);
          setTapsignerBackupsCount(backupsCount);
        } else {
          setTapsignerDerivationPath(null);
          setTapsignerBackupsCount(null);
        }
        setStatusModalVisible(true);
      } else {
        if (Platform.OS === 'ios')
          NFC.showiOSErrorMessage(`Error while checking TAPSIGNER information. Please try again`);
        else showToast(`Error while checking TAPSIGNER information. Please try again`);
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
  }, []);

  function StatusModalContent() {
    return (
      <Box>
        <Box
          padding={hp(20)}
          borderRadius={7}
          backgroundColor={`${colorMode}.secondaryBackground`}
          flexDirection="row"
        >
          <HexagonIcon
            width={wp(43)}
            height={hp(38)}
            backgroundColor={colorMode === 'light' ? Colors.pantoneGreen : Colors.NewBadgeGreenDark}
            icon={<TAPSIGNERICONLIGHT />}
          />
          <Box marginLeft={wp(12)}>
            <Text color={`${colorMode}.greenText`} fontSize={15}>
              TAPSIGNER
            </Text>
            <Text fontSize={13}>{`${common.status}: ${
              tapsignerDerivationPath
                ? signerTranslations.AlreadyInitialized
                : signerTranslations.Uninitialized
            }`}</Text>
          </Box>
        </Box>
        <Box marginTop={hp(10)} marginBottom={hp(40)}>
          {tapsignerDerivationPath ? (
            // TODO: Move warning to component
            <Box
              style={styles.warningContainer}
              backgroundColor={`${colorMode}.errorToastBackground`}
              borderColor={`${colorMode}.alertRed`}
            >
              <Box style={styles.warningIcon}>
                {colorMode === 'light' ? <ErrorIcon /> : <ErrorDarkIcon />}
              </Box>
              <Text style={styles.warningText}>
                {`This TAPSIGNER has already been set up ${
                  tapsignerBackupsCount ? 'and backed up ' : ''
                }before. Proceed only if you trust its source.`}
              </Text>
            </Box>
          ) : (
            <Text style={styles.statusText}>{signerTranslations.NotBeenInitializedBottomText}</Text>
          )}
        </Box>
        <Buttons
          fullWidth
          primaryText={common.Okay}
          primaryCallback={() => {
            setStatusModalVisible(false);
          }}
        />
      </Box>
    );
  }

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title={(() => {
          switch (mode) {
            case InteracationMode.HEALTH_CHECK:
              return signerTranslations.VerifyTapsigner;
            case InteracationMode.SIGN_TRANSACTION:
              return signerTranslations.SignWithTapsigner;
            case InteracationMode.BACKUP_SIGNER:
              return signerTranslations.SaveTapsignerBackup;
            default:
              return signerTranslations.SettingUpTapsigner;
          }
        })()}
        subtitle={signerTranslations.EnterTapsignerPinSubtitle}
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
      {(mode === InteracationMode.APP_ADDITION || mode === InteracationMode.VAULT_ADDITION) && (
        <TouchableOpacity
          onPress={() => {
            checkTapsignerSetupStatus();
          }}
        >
          <Box flexDirection="row">
            <Text color={`${colorMode}.textGreen`} style={styles.checkInitialStatus} medium>
              Check Initial Setup Status
            </Text>
            <Box paddingTop={hp(1)}>{colorMode === 'light' ? <NFCIcon /> : <NFCIconWhite />}</Box>
          </Box>
        </TouchableOpacity>
      )}
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
      <KeeperModal
        visible={statusModalVisible}
        close={() => setStatusModalVisible(false)}
        title={signerTranslations.TapsignerSetupStatus}
        subTitle={signerTranslations.TapsignerSetupStatusSubtitle}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        Content={StatusModalContent}
      />
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
  checkInitialStatus: {
    fontSize: 13,
    textAlign: 'left',
    marginBottom: hp(30),
    marginLeft: hp(15),
    marginRight: wp(7),
  },
  warningContainer: {
    width: '97%',
    alignSelf: 'center',
    marginTop: hp(20),
    paddingVertical: hp(17),
    paddingHorizontal: hp(9),
    borderWidth: 0.5,
    borderRadius: 10,
    flexDirection: 'row',
  },
  warningText: {
    fontSize: 13,
    textAlign: 'left',
    width: '80%',
    marginLeft: wp(10),
  },
  warningIcon: {
    width: wp(30),
    height: hp(30),
    marginTop: hp(5),
    marginHorizontal: hp(2),
  },
  statusText: {
    fontSize: 14,
    textAlign: 'left',
    marginLeft: wp(10),
    marginTop: wp(15),
  },
});
