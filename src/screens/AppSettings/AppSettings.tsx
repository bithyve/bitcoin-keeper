import React, { useContext, useEffect, useState, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import { Box, Pressable, ScrollView, useColorMode } from 'native-base';
import { hp, wp } from 'src/constants/responsive';
import AppBackupIcon from 'src/assets/images/app_backup.svg';
import SettingsIcon from 'src/assets/images/settings_white.svg';
import FaqIcon from 'src/assets/images/faq.svg';
import WalletIcon from 'src/assets/images/daily_wallet.svg';
import Twitter from 'src/assets/images/Twitter.svg';
import Telegram from 'src/assets/images/Telegram.svg';
import KeeperHeader from 'src/components/KeeperHeader';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import LoginMethod from 'src/models/enums/LoginMethod';
import ThemeMode from 'src/models/enums/ThemeMode';
import ReactNativeBiometrics from 'react-native-biometrics';
import ScreenWrapper from 'src/components/ScreenWrapper';
import openLink from 'src/utils/OpenLink';
import { RealmSchema } from 'src/storage/realm/enum';
import { BackupHistory } from 'src/models/enums/BHR';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import useToastMessage from 'src/hooks/useToastMessage';
import { setSatsEnabled, setThemeMode } from 'src/store/reducers/settings';
import { changeLoginMethod } from 'src/store/sagaActions/login';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { useQuery } from '@realm/react';
import OptionCard from 'src/components/OptionCard';
import Switch from 'src/components/Switch/Switch';
import { KEEPER_KNOWLEDGEBASE, KEEPER_WEBSITE_BASE_URL } from 'src/core/config';
import ActionCard from 'src/components/ActionCard';
import NavButton from 'src/components/NavButton';

const RNBiometrics = new ReactNativeBiometrics();

function AppSettings({ navigation }) {
  const { colorMode, toggleColorMode } = useColorMode();
  const { loginMethod, satsEnabled }: { loginMethod: LoginMethod; satsEnabled: boolean } =
    useAppSelector((state) => state.settings);

  const dispatch = useAppDispatch();
  const { showToast } = useToastMessage();

  const [sensorType, setSensorType] = useState('Biometrics');
  const { translations, formatString } = useContext(LocalizationContext);
  const { common, settings } = translations;

  useEffect(() => {
    if (colorMode === 'dark') {
      dispatch(setThemeMode(ThemeMode.DARK));
    } else {
      dispatch(setThemeMode(ThemeMode.LIGHT));
    }
  }, [colorMode]);

  useEffect(() => {
    init();
  }, []);

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

  const changeSatsMode = () => {
    dispatch(setSatsEnabled(!satsEnabled));
  };

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title={`Keeper ${common.settings}`}
        subtitle={settings.settingsSubTitle}
        learnMore
        learnBackgroundColor="light.RussetBrown"
        learnTextColor="light.white"
        icon={<SettingsIcon />}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ alignItems: 'center', paddingTop: 20 }}
      >
        <ScrollView showsHorizontalScrollIndicator={false}>
          <Box style={styles.actionContainer}>
            <ActionCard
              cardName={settings.appBackup}
              icon={<AppBackupIcon />}
              onPress={() => {
                navigation.navigate('BackupWallet');
              }}
              testID={`btn_${settings.appBackup.replace(/ /g, '_')}}`}
            />
            <ActionCard
              cardName={settings.ManageWallets}
              icon={<WalletIcon />}
              onPress={() => navigation.navigate('ManageWallets')}
              testID={`view_${settings.ManageWallets.replace(/ /g, '_')}`}
            />
            <ActionCard
              cardName={common.FAQs}
              icon={<FaqIcon />}
              onPress={() => openLink(`${KEEPER_KNOWLEDGEBASE}knowledge-base/`)}
              testID="btn_FAQ"
            />
          </Box>
        </ScrollView>
        <OptionCard
          title={settings.SatsMode}
          description={settings.satsModeSubTitle}
          callback={() => changeThemeMode()}
          Icon={
            <Switch
              value={satsEnabled}
              onValueChange={() => changeSatsMode()}
              testID="switch_darkmode"
            />
          }
        />
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
        <OptionCard
          title={settings.nodeSettings}
          description={settings.nodeSettingsSubtitle}
          callback={() => navigation.navigate('NodeSettings')}
        />
        <OptionCard
          title={settings.VersionHistory}
          description={settings.VersionHistorySubTitle}
          callback={() => navigation.navigate('AppVersionHistory')}
        />
        <OptionCard
          title={settings.torSettingTitle}
          description={settings.torSettingSubTitle}
          callback={() => navigation.navigate('TorSettings')}
        />
        <OptionCard
          title={settings.LanguageCountry}
          description={settings.LanguageCountrySubTitle}
          callback={() => navigation.navigate('ChangeLanguage')}
        />
      </ScrollView>
      <Box backgroundColor={`${colorMode}.primaryBackground`}>
        <Box
          style={{
            flexDirection: 'row',
            gap: 10,
            justifyContent: 'space-around',
            marginBottom: 10,
          }}
        >
          <NavButton
            icon={<Telegram />}
            heading="Keeper Telegram"
            link="https://telegram.me/bitcoinkeeper"
          />
          <NavButton
            icon={<Twitter />}
            heading="Keeper Twitter"
            link="https://twitter.com/bitcoinKeeper_"
          />
        </Box>
        <Box style={styles.bottomLinkWrapper} backgroundColor={`${colorMode}.primaryBackground`}>
          <Pressable
            onPress={() => openLink(`${KEEPER_KNOWLEDGEBASE}terms-of-service/`)}
            testID="btn_termsCondition"
          >
            <Text
              style={styles.bottomLinkText}
              color={`${colorMode}.textColor2`}
              testID="text_termsCondition"
            >
              {common.TermsConditions}
            </Text>
          </Pressable>
          <Text color={`${colorMode}.textColor2`}>|</Text>
          <Pressable
            onPress={() => openLink(`${KEEPER_WEBSITE_BASE_URL}privacy-policy/`)}
            testID="btn_privacyPolicy"
          >
            <Text
              style={styles.bottomLinkText}
              color={`${colorMode}.textColor2`}
              testID="text_privacyPolicy"
            >
              {common.PrivacyPolicy}
            </Text>
          </Pressable>
        </Box>
      </Box>
    </ScreenWrapper>
  );
}
const styles = StyleSheet.create({
  appBackupWrapper: {
    borderRadius: 10,
    height: hp(116),
    padding: wp(10),
    width: '100%',
    flexDirection: 'row',
    marginBottom: 10,
  },
  appBackupIconWrapper: {
    width: '20%',
    position: 'relative',
  },
  infoWrapper: {
    width: '80%',
  },
  notificationIndicator: {
    height: 10,
    width: 10,
    borderRadius: 10,
    borderWidth: 0.3,
    position: 'absolute',
    right: 18,
    zIndex: 999,
  },
  appBackupTitle: {
    fontWeight: '400',
    fontSize: 14,
    letterSpacing: 1.12,
  },
  appBackupSubTitle: {
    fontWeight: '400',
    fontSize: 12,
    letterSpacing: 0.6,
    width: '100%',
  },
  currentTypeSwitchWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '30%',
  },

  socialMediaLinkWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  telTweetLinkWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    height: hp(45),
    width: wp(166),
    borderRadius: 8,
    marginBottom: hp(8),
    alignItems: 'center',
  },
  telTweetLinkTitle: {
    fontWeight: '400',
    fontSize: 13,
    letterSpacing: 0.79,
  },
  telTweetLinkWrapper2: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: wp(3),
  },
  linkIconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomLinkWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
  },
  bottomLinkText: {
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0.79,
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 5,
  },
});
export default AppSettings;
