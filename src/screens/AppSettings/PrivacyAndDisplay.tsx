import React, { useContext, useEffect, useState } from 'react';
import { Box, ScrollView, useColorMode } from 'native-base';
import ReactNativeBiometrics from 'react-native-biometrics';
import ScreenWrapper from 'src/components/ScreenWrapper';
import OptionCard from 'src/components/OptionCard';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import Switch from 'src/components/Switch/Switch';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import LoginMethod from 'src/models/enums/LoginMethod';
import { changeAuthCred, changeLoginMethod } from 'src/store/sagaActions/login';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import useToastMessage from 'src/hooks/useToastMessage';
import { setThemeMode } from 'src/store/reducers/settings';
import ThemeMode from 'src/models/enums/ThemeMode';
import { Linking, StyleSheet, TouchableOpacity } from 'react-native';
import { hp, wp } from 'src/constants/responsive';
import Note from 'src/components/Note/Note';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import { useQuery } from '@realm/react';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import PasscodeVerifyModal from 'src/components/Modal/PasscodeVerify';
import KeeperModal from 'src/components/KeeperModal';
import ModalWrapper from 'src/components/Modal/ModalWrapper';
import HealthCheckComponent from 'src/components/Backup/HealthCheckComponent';
import { BackupType } from 'src/models/enums/BHR';
import { seedBackedConfirmed } from 'src/store/sagaActions/bhr';
import PinInputsView from 'src/components/AppPinInput/PinInputsView';
import KeyPadView from 'src/components/AppNumPad/KeyPadView';
import DeleteDarkIcon from 'src/assets/images/delete.svg';
import DeleteIcon from 'src/assets/images/deleteLight.svg';
import PasscodeLockIllustration from 'src/assets/images/passwordlock.svg';
import BackupModalContent from './BackupModal';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { PRIVACYANDDISPLAY } from 'src/navigation/contants';
import Text from 'src/components/KeeperText';
import { resetCredsChanged } from 'src/store/reducers/login';
import Buttons from 'src/components/Buttons';
import WalletHeader from 'src/components/WalletHeader';
import usePlan from 'src/hooks/usePlan';

const RNBiometrics = new ReactNativeBiometrics();

function ConfirmPasscode({ oldPassword, setConfirmPasscodeModal, onCredsChange }) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);

  const { login, common } = translations;
  const dispatch = useAppDispatch();
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [passcodeFlag, setPasscodeFlag] = useState(true);
  const [confirmPasscodeFlag, setConfirmPasscodeFlag] = useState(0);
  const { credsChanged } = useAppSelector((state) => state.login);

  useEffect(() => {
    if (credsChanged === 'changed') {
      onCredsChange();
      setConfirmPasscodeModal(false);
    }
  }, [credsChanged]);

  function onPressNumber(text) {
    let tmpPasscode = passcode;
    let tmpConfirmPasscode = confirmPasscode;
    if (passcodeFlag) {
      if (passcode.length < 4) {
        if (text !== 'x') {
          tmpPasscode += text;
          setPasscode(tmpPasscode);
        }
      } else if (passcode.length === 4 && passcodeFlag) {
        setPasscodeFlag(false);
        setConfirmPasscodeFlag(1);
        setPasscode(passcode);
      }
      if (passcode && text === 'x') {
        const passcodeTemp = passcode.slice(0, -1);
        setPasscode(passcodeTemp);
        if (passcodeTemp.length === 0) {
          setConfirmPasscodeFlag(0);
        }
      }
    } else if (confirmPasscodeFlag) {
      if (confirmPasscode.length < 4) {
        if (text !== 'x') {
          tmpConfirmPasscode += text;
          setConfirmPasscode(tmpConfirmPasscode);
        }
      }
      if (confirmPasscode && text === 'x') {
        setConfirmPasscode(confirmPasscode.slice(0, -1));
      } else if (!confirmPasscode && text === 'x') {
        setPasscodeFlag(true);
        setConfirmPasscodeFlag(0);
        setConfirmPasscode(confirmPasscode);
      }
    }
  }
  const onDeletePressed = (text) => {
    if (passcodeFlag) {
      setPasscode(passcode.slice(0, -1));
    } else {
      setConfirmPasscode(confirmPasscode.slice(0, confirmPasscode.length - 1));
    }
  };

  useEffect(() => {
    if (confirmPasscode.length <= 4 && confirmPasscode.length > 0 && passcode.length === 4) {
      setPasscodeFlag(false);
      setConfirmPasscodeFlag(2);
    } else if (passcode.length === 4 && confirmPasscodeFlag !== 2) {
      setPasscodeFlag(false);
      setConfirmPasscodeFlag(1);
    } else if (
      !confirmPasscode &&
      passcode.length > 0 &&
      passcode.length <= 4 &&
      confirmPasscodeFlag === 2
    ) {
      setPasscodeFlag(true);
      setConfirmPasscodeFlag(0);
    } else if (!confirmPasscode && passcode.length > 0 && passcode.length <= 4) {
      setPasscodeFlag(true);
      setConfirmPasscodeFlag(0);
    }
  }, [passcode, confirmPasscode]);

  return (
    <Box>
      <Box>
        {login.newPasscode}
        <PinInputsView passCode={passcode} passcodeFlag={passcodeFlag} borderColor="transparent" />
      </Box>
      {passcode.length === 4 && (
        <>
          <Box>
            {login.confirmNewPasscode}
            <PinInputsView
              passCode={confirmPasscode}
              passcodeFlag={!(confirmPasscodeFlag === 0 && confirmPasscodeFlag === 2)}
              borderColor="transparent"
            />
            <Box>
              {passcode !== confirmPasscode && confirmPasscode.length === 4 && (
                <Text style={[styles.errorText, { color: 'light.CongoPink' }]}>
                  {login.MismatchPasscode}
                </Text>
              )}
            </Box>
          </Box>

          <Box mb={hp(5)}>
            {passcode.length === 4 && passcode === confirmPasscode && (
              <Buttons
                primaryText={common.confirm}
                primaryCallback={() => {
                  dispatch(changeAuthCred(oldPassword, passcode));
                }}
                fullWidth
              />
            )}
          </Box>
        </>
      )}
      <KeyPadView
        disabled={false}
        onDeletePressed={onDeletePressed}
        onPressNumber={onPressNumber}
        ClearIcon={colorMode === 'dark' ? <DeleteIcon /> : <DeleteDarkIcon />}
        keyColor={`${colorMode}.primaryText`}
      />
    </Box>
  );
}

function PrivacyAndDisplay({ route }) {
  const { colorMode } = useColorMode();
  const dispatch = useAppDispatch();
  const { showToast } = useToastMessage();
  const navigation = useNavigation();
  const {
    RKBackedUp = false,
    oldPasscode,
  }: {
    RKBackedUp?: boolean;
    oldPasscode?: string;
  } = route?.params || {};

  const [sensorType, setSensorType] = useState(null);
  const [sensorAvailable, setSensorAvailable] = useState(false);
  const [visiblePasscode, setVisiblePassCode] = useState(false);
  const [showConfirmSeedModal, setShowConfirmSeedModal] = useState(false);
  const [confirmPasscode, setConfirmPasscode] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [backupModalVisible, setBackupModalVisible] = useState(false);
  const [RKHealthCheckModal, setRKHealthCheckModal] = useState(false);
  const [passcodeHCModal, setPasscodeHCModal] = useState(false);

  const { translations, formatString } = useContext(LocalizationContext);
  const { settings, common } = translations;
  const { backupMethod, seedConfirmed } = useAppSelector((state) => state.bhr);
  const { primaryMnemonic, backup }: KeeperApp = useQuery(RealmSchema.KeeperApp).map(
    getJSONFromRealmObject
  )[0];
  const { loginMethod }: { loginMethod: LoginMethod } = useAppSelector((state) => state.settings);
  const data = useQuery(RealmSchema.BackupHistory);
  const app: KeeperApp = useQuery(RealmSchema.KeeperApp).map(getJSONFromRealmObject)[0];
  const [credsChanged, setCredsChanged] = useState('');
  const { isOnL4 } = usePlan();
  const { allAccounts } = useAppSelector((state) => state.account);

  useEffect(() => {
    if (credsChanged === 'changed') {
      showToast('Passcode updated successfully');
      dispatch(resetCredsChanged());
      setCredsChanged('');
    }
  }, [credsChanged]);

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (RKBackedUp) {
      setConfirmPasscode(true);
      setOldPassword(oldPasscode);
    }
  }, [route?.params]);

  useEffect(() => {
    if (isOnL4) {
      if (colorMode === 'dark') {
        dispatch(setThemeMode(ThemeMode.PRIVATE));
      } else {
        dispatch(setThemeMode(ThemeMode.PRIVATE_LIGHT));
      }
    } else {
      if (colorMode === 'dark') {
        dispatch(setThemeMode(ThemeMode.DARK));
      } else {
        dispatch(setThemeMode(ThemeMode.LIGHT));
      }
    }
  }, [colorMode, isOnL4]);

  const init = async () => {
    try {
      const { available, biometryType } = await RNBiometrics.isSensorAvailable();
      if (available) {
        setSensorAvailable(available);
        const type =
          biometryType === 'TouchID'
            ? 'Touch ID'
            : biometryType === 'FaceID'
            ? 'Face ID'
            : biometryType;
        setSensorType(type);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const requestPermission = () => {
    Linking.openSettings();
  };

  const onChangeLoginMethod = async () => {
    if (allAccounts.length > 1) return;
    try {
      const { available } = await RNBiometrics.isSensorAvailable();
      if (available) {
        if (loginMethod === LoginMethod.PIN) {
          const { keysExist } = await RNBiometrics.biometricKeysExist();
          if (keysExist) {
            await RNBiometrics.deleteKeys();
          }
          const { success } = await RNBiometrics.simplePrompt({
            promptMessage: 'Confirm your identity',
          });
          if (success) {
            const { publicKey } = await RNBiometrics.createKeys();
            dispatch(changeLoginMethod(LoginMethod.BIOMETRIC, publicKey));
          }
        } else {
          dispatch(changeLoginMethod(LoginMethod.PIN));
        }
      } else {
        setSensorAvailable(false);
        showToast(
          'Biometrics not enabled.\nPlease go to setting and enable it',
          <ToastErrorIcon />
        );
      }
    } catch (error) {
      console.log(error);
      setSensorAvailable(false);
    }
  };

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <WalletHeader title={settings.SecurityAndLogin} subTitle={settings.AppLevelSettings} />
      <ScrollView>
        <Box style={styles.wrapper}>
          <Box>
            <OptionCard
              title={sensorType || 'Biometrics'}
              description={
                sensorType
                  ? formatString(settings.UseBiometricSubTitle, sensorType)
                  : settings.NoBiometricSubTitle
              }
              callback={() => onChangeLoginMethod()}
              disabled={!sensorType || allAccounts.length > 1}
              Icon={
                sensorAvailable || !sensorType ? (
                  <Switch
                    onValueChange={onChangeLoginMethod}
                    value={loginMethod === LoginMethod.BIOMETRIC}
                    testID="switch_biometrics"
                    loading={!sensorType}
                  />
                ) : (
                  <TouchableOpacity onPress={requestPermission} testID="btn_biometricSettings">
                    <Box
                      style={styles.settingsCTA}
                      backgroundColor={`${colorMode}.coffeeBackground`}
                    >
                      <Text style={styles.settingsCTAText} bold color={`${colorMode}.textColor`}>
                        Enable {sensorType}
                      </Text>
                    </Box>
                  </TouchableOpacity>
                )
              }
            />
          </Box>

          <OptionCard
            title={settings.changePasscode}
            description={settings.changePasscodeDescription}
            callback={() => {
              setVisiblePassCode(true);
            }}
          />
        </Box>
      </ScrollView>
      <Box style={styles.note}>
        <Note
          title={common.note}
          subtitle="These settings are not carried over when the app is restored using the Recovery Phrase"
          subtitleColor="GreyText"
        />
      </Box>
      <KeeperModal
        visible={visiblePasscode}
        closeOnOverlayClick={false}
        close={() => setVisiblePassCode(false)}
        title={settings.changePasscode}
        subTitleWidth={wp(240)}
        subTitle="Enter your existing passcode"
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        Content={() => (
          <PasscodeVerifyModal
            primaryText="Confirm"
            close={() => {
              setVisiblePassCode(false);
            }}
            onSuccess={(password) => {
              if (data.length === 0) {
                setRKHealthCheckModal(true);
                setOldPassword(password);
              } else {
                setOldPassword(password);
                setPasscodeHCModal(true);
              }
            }}
          />
        )}
      />
      <KeeperModal
        visible={passcodeHCModal}
        close={() => setPasscodeHCModal(false)}
        title={settings.passcodeHCModalTitle}
        subTitle={settings.passcodeHCModalSubTitle}
        buttonText={common.continue}
        buttonCallback={() => {
          setPasscodeHCModal(false);
          setShowConfirmSeedModal(true);
        }}
        secondaryButtonText={common.cancel}
        secondaryCallback={() => setPasscodeHCModal(false)}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        Content={() => (
          <Box style={styles.PasscodeHCModal}>
            <PasscodeLockIllustration width={wp(160)} height={hp(125)} />
            <Text color={`${colorMode}.secondaryText`}>{settings.passcodeHCModalDesc}</Text>
          </Box>
        )}
      />
      <ModalWrapper
        visible={showConfirmSeedModal}
        onSwipeComplete={() => setShowConfirmSeedModal(false)}
        position="center"
      >
        <HealthCheckComponent
          closeBottomSheet={() => {
            setShowConfirmSeedModal(false);
            if (backupMethod === BackupType.SEED) {
              dispatch(seedBackedConfirmed(false));
            }
          }}
          type={backupMethod}
          password={backup.password}
          hint={backup.hint}
          words={primaryMnemonic.split(' ')}
          onConfirmed={(password) => {
            if (backupMethod === BackupType.SEED) {
              setShowConfirmSeedModal(false);
              dispatch(seedBackedConfirmed(true));
              setConfirmPasscode(true);
            }
          }}
        />
      </ModalWrapper>
      <KeeperModal
        visible={confirmPasscode}
        closeOnOverlayClick={false}
        close={() => {
          setConfirmPasscode(false);
        }}
        title={settings.changePasscode}
        subTitleWidth={wp(240)}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        Content={() => (
          <ConfirmPasscode
            setConfirmPasscodeModal={setConfirmPasscode}
            oldPassword={oldPassword}
            onCredsChange={() => setCredsChanged('changed')}
          />
        )}
      />
      <KeeperModal
        visible={RKHealthCheckModal}
        close={() => setRKHealthCheckModal(false)}
        title={settings.RKHealthCheckTitle}
        subTitle={settings.RKHealthCheckSubtitle}
        subTitleWidth={wp(300)}
        modalBackground={`${colorMode}.primaryBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.modalGreenTitle`}
        showCloseIcon={false}
        buttonText={common.goToBackup}
        buttonCallback={() => {
          setBackupModalVisible(true);
          setRKHealthCheckModal(false);
        }}
        secondaryButtonText={common.cancel}
        secondaryCallback={() => setRKHealthCheckModal(false)}
        Content={() => (
          <Box style={styles.RKContentCotainer}>
            <Text color={`${colorMode}.primaryText`}>{settings.RKHealthCheckDesc}</Text>
          </Box>
        )}
      />
      <KeeperModal
        visible={backupModalVisible}
        close={() => setBackupModalVisible(false)}
        title={settings.RKBackupTitle}
        subTitle={settings.RKBackupSubTitle}
        subTitleWidth={wp(300)}
        modalBackground={`${colorMode}.primaryBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.modalGreenTitle`}
        showCloseIcon={false}
        secondaryButtonText={common.cancel}
        secondaryCallback={() => setBackupModalVisible(false)}
        secButtonTextColor={`${colorMode}.greenText`}
        buttonText={common.backupNow}
        buttonCallback={() => {
          setBackupModalVisible(false);
          navigation.dispatch(
            CommonActions.navigate('ExportSeed', {
              seed: primaryMnemonic,
              next: true,
              parentScreen: PRIVACYANDDISPLAY,
              oldPasscode: oldPassword,
            })
          );
        }}
        Content={BackupModalContent}
      />
    </ScreenWrapper>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    marginTop: hp(35),
    gap: 50,
    width: '95%',
    alignSelf: 'center',
  },
  note: {
    position: 'absolute',
    bottom: 50,
    width: '95%',
    alignSelf: 'center',
  },
  cta: {
    borderRadius: 10,
    width: wp(120),
    height: hp(45),
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 13,
    letterSpacing: 1,
    color: 'white',
  },
  errorText: {
    fontSize: 11,
    fontWeight: '400',
    textAlign: 'right',
    fontStyle: 'italic',
  },
  RKContentCotainer: {
    marginBottom: hp(10),
  },
  PasscodeHCModal: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 30,
  },
  settingsCTA: {
    borderRadius: 10,
    width: 'auto',
    marginLeft: wp(15),
    paddingHorizontal: wp(10),
    height: hp(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsCTAText: {
    fontSize: 10,
  },
});
export default PrivacyAndDisplay;
