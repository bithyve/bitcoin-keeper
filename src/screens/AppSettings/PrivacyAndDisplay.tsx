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
import { hp } from 'src/constants/responsive';
import Note from 'src/components/Note/Note';
import { sentryConfig } from 'src/services/sentry';
import useAsync from 'src/hooks/useAsync';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import { useQuery } from '@realm/react';
import { RealmSchema } from 'src/storage/realm/enum';
import dbManager from 'src/storage/realm/dbManager';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';

const RNBiometrics = new ReactNativeBiometrics();

function PrivacyAndDisplay({ navigation }) {
  const { colorMode, toggleColorMode } = useColorMode();
  const dispatch = useAppDispatch();
  const { showToast } = useToastMessage();

  const [sensorType, setSensorType] = useState('Biometrics');
  const { translations, formatString } = useContext(LocalizationContext);
  const { settings, common } = translations;
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

  const changeThemeMode = () => {
    toggleColorMode();
  };

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader title={settings.PrivacyDisplay} subtitle={settings.PrivacyDisplaySubTitle} />
      <ScrollView>
        <Box style={styles.wrapper}>
          <OptionCard
            title={settings.DarkMode}
            description={settings.DarkModeSubTitle}
            callback={() => changeThemeMode()}
            Icon={
              <Switch
                onValueChange={(value) => changeThemeMode()}
                value={colorMode === 'dark'}
                testID="switch_darkmode"
              />
            }
          />
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
              description={settings.analyticsDescription}
              Icon={
                <Switch
                  onValueChange={async () => await toggleSentryReports()}
                  value={app.enableAnalytics}
                  testID="switch_darkmode"
                />
              }
            />
          </Box>
          {/*
            TODO: missing functionality
            */}
          {/* <OptionCard
            title={settings.changePasscode}
            description={settings.changePasscodeDescription}
            callback={() => navigation.navigate('NodeSettings')}
          /> */}
        </Box>
      </ScrollView>
      <Box style={styles.note}>
        <Note
          title={common.note}
          subtitle="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
          subtitleColor="GreyText"
        />
      </Box>
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
