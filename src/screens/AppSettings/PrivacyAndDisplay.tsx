import * as Sentry from '@sentry/react-native';
import React, { useContext, useEffect, useState } from 'react';
import { Box, ScrollView, useColorMode } from 'native-base';
import ReactNativeBiometrics from 'react-native-biometrics';
import ScreenWrapper from 'src/components/ScreenWrapper';
import KeeperHeader from 'src/components/KeeperHeader';
import OptionCard from 'src/components/OptionCard';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import Switch from 'src/components/Switch/Switch';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import LoginMethod from 'src/models/enums/LoginMethod';
import { changeLoginMethod } from 'src/store/sagaActions/login';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import useToastMessage from 'src/hooks/useToastMessage';
import { setThemeMode } from 'src/store/reducers/settings';
import ThemeMode from 'src/models/enums/ThemeMode';
import { StyleSheet } from 'react-native';
import { hp, wp } from 'src/constants/responsive';
import Note from 'src/components/Note/Note';
import { sentryConfig } from 'src/services/sentry';
import useAsync from 'src/hooks/useAsync';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import { useQuery } from '@realm/react';
import { RealmSchema } from 'src/storage/realm/enum';
import dbManager from 'src/storage/realm/dbManager';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import PasscodeVerifyModal from 'src/components/Modal/PasscodeVerify';
import KeeperModal from 'src/components/KeeperModal';
import ModalWrapper from 'src/components/Modal/ModalWrapper';
import HealthCheckComponent from 'src/components/Backup/HealthCheckComponent';
import { BackupType } from 'src/models/enums/BHR';
import { seedBackedConfirmed } from 'src/store/sagaActions/bhr';
import PinInputsView from 'src/components/AppPinInput/PinInputsView';
import KeyPadView from 'src/components/AppNumPad/KeyPadView';
import DeleteIcon from 'src/assets/images/deleteLight.svg';

const RNBiometrics = new ReactNativeBiometrics();

const ConfirmPasscode = () => {
  const [passcode, setPasscode] = useState('');

  const onPressNumber = (text) => {
    let tmpPasscode = passcode;
    if (passcode.length < 4) {
      if (text !== 'x') {
        tmpPasscode += text;
        setPasscode(tmpPasscode);
      }
    }
    if (passcode && text === 'x') {
      setPasscode(passcode.slice(0, -1));
    }
  };
  const onDeletePressed = (text) => {
    setPasscode(passcode.slice(0, passcode.length - 1));
  };

  return (
    <Box>
      <Box>
        Enter a NEW passcode
        <PinInputsView
          backgroundColor={true}
          passCode={passcode}
          passcodeFlag={true}
          borderColor={'transparent'}
          textColor={true}
        />
      </Box>
      <Box>
        Confirm the new passcode
        <PinInputsView
          backgroundColor={true}
          passCode={passcode}
          passcodeFlag={true}
          borderColor={'transparent'}
          textColor={true}
        />
      </Box>
      <KeyPadView
        disabled={false}
        onDeletePressed={onDeletePressed}
        onPressNumber={onPressNumber}
        ClearIcon={<DeleteIcon />}
        keyColor="light.primaryText"
      />
    </Box>
  );
};

function PrivacyAndDisplay() {
  const { colorMode } = useColorMode();
  const dispatch = useAppDispatch();
  const { showToast } = useToastMessage();

  const [sensorType, setSensorType] = useState('Biometrics');
  const [visiblePasscode, setVisiblePassCode] = useState(false);
  const [showConfirmSeedModal, setShowConfirmSeedModal] = useState(false);
  const [confirmPasscode, setConfirmPasscode] = useState(false);

  const { translations, formatString } = useContext(LocalizationContext);
  const { settings, common } = translations;
  const { backupMethod, seedConfirmed } = useAppSelector((state) => state.bhr);
  const { primaryMnemonic, backup }: KeeperApp = useQuery(RealmSchema.KeeperApp).map(
    getJSONFromRealmObject
  )[0];
  const { loginMethod }: { loginMethod: LoginMethod } = useAppSelector((state) => state.settings);
  const { inProgress, start } = useAsync();
  const app: KeeperApp = useQuery(RealmSchema.KeeperApp).map(getJSONFromRealmObject)[0];
  const analyticsEnabled = app.enableAnalytics;

  const toggleSentryReports = async () => {
    if (inProgress) {
      return;
    }
    if (!analyticsEnabled) {
      await start(() => Sentry.init(sentryConfig));
    } else {
      await start(() => Sentry.init({ ...sentryConfig, enabled: false }));
    }
    dbManager.updateObjectById(RealmSchema.KeeperApp, app.id, {
      enableAnalytics: !analyticsEnabled,
    });
  };

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (colorMode === 'dark') {
      dispatch(setThemeMode(ThemeMode.DARK));
    } else {
      dispatch(setThemeMode(ThemeMode.LIGHT));
    }
  }, [colorMode]);

  const init = async () => {
    try {
      const { available, biometryType } = await RNBiometrics.isSensorAvailable();
      if (available) {
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

  const onChangeLoginMethod = async () => {
    try {
      const { available } = await RNBiometrics.isSensorAvailable();
      if (available) {
        if (loginMethod === LoginMethod.PIN) {
          const { keysExist } = await RNBiometrics.biometricKeysExist();
          if (keysExist) {
            await RNBiometrics.createKeys();
          }
          const { publicKey } = await RNBiometrics.createKeys();
          const { success } = await RNBiometrics.simplePrompt({
            promptMessage: 'Confirm your identity',
          });
          if (success) {
            dispatch(changeLoginMethod(LoginMethod.BIOMETRIC, publicKey));
          }
        } else {
          dispatch(changeLoginMethod(LoginMethod.PIN));
        }
      } else {
        showToast(
          'Biometrics not enabled.\nPlease go to setting and enable it',
          <ToastErrorIcon />
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader title={settings.SecurityAndLogin} subtitle={settings.AppLevelSettings} />
      <ScrollView>
        <Box style={styles.wrapper}>
          <Box>
            <OptionCard
              title={sensorType}
              description={formatString(settings.UseBiometricSubTitle, sensorType)}
              callback={() => onChangeLoginMethod()}
              Icon={
                <Switch
                  onValueChange={(value) => onChangeLoginMethod()}
                  value={loginMethod === LoginMethod.BIOMETRIC}
                  testID="switch_biometrics"
                />
              }
            />
            <OptionCard
              title={settings.shareAnalytics}
              description={settings.rememberPasscode}
              Icon={
                <Switch
                  onValueChange={async () => await toggleSentryReports()}
                  value={app.enableAnalytics}
                  testID="switch_darkmode"
                />
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
        title={'Change passcode'}
        subTitleWidth={wp(240)}
        subTitle={'Enter your existing passcode'}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        Content={() => (
          <PasscodeVerifyModal
            useBiometrics
            primaryText={'Confirm'}
            close={() => {
              setVisiblePassCode(false);
            }}
            onSuccess={() => {
              setShowConfirmSeedModal(true);
            }}
          />
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
        close={() => setConfirmPasscode(false)}
        title={'Change passcode'}
        subTitleWidth={wp(240)}
        modalBackground={`${colorMode}.learMoreTextcolor`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        Content={() => <ConfirmPasscode />}
      />
    </ScreenWrapper>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    marginTop: hp(35),
    gap: 50,
  },
  note: {
    position: 'absolute',
    bottom: 50,
    width: '95%',
    alignSelf: 'center',
  },
});
export default PrivacyAndDisplay;
