import React, { useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import { Box, Pressable, ScrollView, useColorMode } from 'native-base';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import BackupIcon from 'src/assets/images/backup.svg';
import Twitter from 'src/assets/images/Twitter.svg';
import Telegram from 'src/assets/images/Telegram.svg';
import CurrencyTypeSwitch from 'src/components/Switch/CurrencyTypeSwitch';
import HeaderTitle from 'src/components/HeaderTitle';
import LinkIcon from 'src/assets/images/link.svg';
import { LocalizationContext } from 'src/common/content/LocContext';
import LoginMethod from 'src/common/data/enums/LoginMethod';
import ReactNativeBiometrics from 'react-native-biometrics';
import ScreenWrapper from 'src/components/ScreenWrapper';
import SettingsCard from 'src/components/SettingComponent/SettingsCard';
import SettingsSwitchCard from 'src/components/SettingComponent/SettingsSwitchCard';
import openLink from 'src/utils/OpenLink';
import RestClient, { TorStatus } from 'src/core/services/rest/RestClient';
import { setTorEnabled } from 'src/store/reducers/settings';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { BackupAction, BackupHistory } from 'src/common/data/enums/BHR';
import moment from 'moment';

import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { getBackupDuration } from 'src/common/utilities';
import useToastMessage from 'src/hooks/useToastMessage';
import { changeLoginMethod } from '../../store/sagaActions/login';
import TorModalMap from './TorModalMap';
import { useAppDispatch, useAppSelector } from '../../store/hooks';

const RNBiometrics = new ReactNativeBiometrics();

function AppSettings({ navigation }) {
  const { colorMode } = useColorMode();
  const [darkMode, setDarkMode] = useState(false);
  const { backupMethod } = useAppSelector((state) => state.bhr);
  const { useQuery } = useContext(RealmWrapperContext);
  const data: BackupHistory = useQuery(RealmSchema.BackupHistory);

  const { loginMethod }: { loginMethod: LoginMethod } = useAppSelector((state) => state.settings);
  const dispatch = useAppDispatch();
  const { showToast } = useToastMessage();

  const [sensorType, setSensorType] = useState('Biometrics');
  const { translations, formatString } = useContext(LocalizationContext);
  const { common } = translations;
  const { settings } = translations;
  const backupWalletStrings = translations.BackupWallet;

  const [showTorModal, setShowTorModal] = useState(false);
  const [torStatus, settorStatus] = useState<TorStatus>(RestClient.getTorStatus());

  const backupHistory = useMemo(() => data.sorted('date', true), [data]);
  const backupSubTitle = useMemo(() => {
    if (backupMethod === null) {
      return 'Backup your Recovery Phrase';
    }
    if (backupHistory[0].title === BackupAction.SEED_BACKUP_CONFIRMED) {
      const lastBackupDate = moment(backupHistory[0].date);
      const today = moment(moment().unix());
      const remainingDays = getBackupDuration() - lastBackupDate.diff(today, 'seconds');
      if (remainingDays > 0) {
        return `Recovery Health check due in ${Math.floor(remainingDays / 86400)} days`;
      }
      return 'Recovery Health check is due';
    }
    return backupWalletStrings[backupHistory[0].title];
  }, [backupHistory, backupMethod]);

  const onChangeTorStatus = (status: TorStatus, message) => {
    settorStatus(status);
  };

  useEffect(() => {
    RestClient.subToTorStatus(onChangeTorStatus);
    return () => {
      RestClient.unsubscribe(onChangeTorStatus);
    };
  }, []);

  useEffect(() => {
    init();
  }, []);

  const RenderTorStatus = useCallback(
    () => (
      <Box backgroundColor="light.lightAccent" py={0.5} px={1.5} borderRadius={10}>
        <Text fontSize={11}>{torStatus}</Text>
      </Box>
    ),
    [torStatus]
  );

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
    setDarkMode(!darkMode);
  };

  function Option({ title, subTitle, onPress, Icon }) {
    return (
      <Pressable
        flexDirection="row"
        alignItems="center"
        onPress={onPress}
        backgroundColor="light.primaryBackground"
        style={styles.appBackupWrapper}
        testID={`btn_${title.replace(/ /g, '_')}}`}
      >
        {Icon && (
          <Box style={styles.appBackupIconWrapper}>
            {/* { Notification indicator } */}
            {backupMethod === null && (
              <Box
                backgroundColor="light.indicator"
                borderColor="light.white"
                style={styles.notificationIndicator}
              />
            )}
            <BackupIcon />
          </Box>
        )}
        <Box style={{ marginLeft: wp(20) }}>
          <Text color="light.primaryText" style={styles.appBackupTitle}>
            {title}
          </Text>
          <Text color="light.GreyText" style={styles.appBackupSubTitle}>
            {subTitle}
          </Text>
        </Box>
      </Pressable>
    );
  }

  const onPressTor = () => {
    if (torStatus === TorStatus.OFF || torStatus === TorStatus.ERROR) {
      setShowTorModal(true);
      RestClient.setUseTor(true);
      dispatch(setTorEnabled(true));
    } else {
      RestClient.setUseTor(false);
      dispatch(setTorEnabled(false));
      setShowTorModal(false);
    }
  };

  return (
    <ScreenWrapper barStyle="dark-content">
      <HeaderTitle />
      <Box style={styles.appSettingTitleWrapper}>
        <Box width="70%">
          <Text style={styles.appSettingTitle}>{`App ${common.settings}`}</Text>
          <Text style={styles.appSettingSubTitle}>For the Vault and wallets</Text>
        </Box>
        <Box style={styles.currentTypeSwitchWrapper}>
          <CurrencyTypeSwitch />
        </Box>
      </Box>
      <Box flex={1} position="relative" py={3}>
        <ScrollView
          style={{
            marginBottom: hp(75),
          }}
          showsVerticalScrollIndicator={false}
        >
          <Option
            title="App Backup"
            subTitle={backupSubTitle}
            onPress={() => {
              navigation.navigate('BackupWallet');
            }}
            Icon
          />
          <SettingsSwitchCard
            title={sensorType}
            description={formatString(settings.UseBiometricSubTitle, sensorType)}
            my={1}
            bgColor={`${colorMode}.backgroundColor2`}
            onSwitchToggle={() => onChangeLoginMethod()}
            value={loginMethod === LoginMethod.BIOMETRIC}
          />

          {/* <SettingsSwitchCard
            title={settings.DarkMode}
            description={settings.DarkModeSubTitle}
            my={1}
            bgColor={`${colorMode}.backgroundColor2`}
            onSwitchToggle={() => changeThemeMode()}
            value={darkMode}
          /> */}
          <SettingsCard
            title={settings.nodeSettings}
            description={settings.nodeSettingsSubtitle}
            my={1}
            bgColor={`${colorMode}.backgroundColor2`}
            icon={false}
            onPress={() => navigation.navigate('NodeSettings')}
          />
          <SettingsCard
            title={settings.VersionHistory}
            description={settings.VersionHistorySubTitle}
            my={1}
            bgColor={`${colorMode}.backgroundColor2`}
            icon={false}
            onPress={() => navigation.navigate('AppVersionHistory')}
          />
          <SettingsSwitchCard
            title="Tor"
            description="Tor daemon settings"
            my={1}
            bgColor={`${colorMode}.backgroundColor2`}
            icon={false}
            onSwitchToggle={onPressTor}
            renderStatus={
              torStatus === TorStatus.OFF || torStatus === TorStatus.CONNECTED
                ? null
                : RenderTorStatus
            }
            value={torStatus === TorStatus.CONNECTED}
          />
          <SettingsCard
            title={settings.LanguageCountry}
            description={settings.LanguageCountrySubTitle}
            my={1}
            bgColor={`${colorMode}.backgroundColor2`}
            icon={false}
            onPress={() => navigation.navigate('ChangeLanguage')}
          />
        </ScrollView>

        <Box style={styles.socialMediaLinkWrapper} backgroundColor="light.secondaryBackground">
          <Box style={styles.socialMediaLinkWrapper2}>
            <Pressable onPress={() => openLink('https://telegram.me/bitcoinkeeper')}>
              <Box style={styles.telTweetLinkWrapper} backgroundColor="light.primaryBackground" testID='view_ KeeperTelegram'>
                <Box style={styles.telTweetLinkWrapper2}>
                  <Telegram />
                  <Box style={{ marginLeft: wp(10) }}>
                    <Text color="light.textColor2" style={styles.telTweetLinkTitle} testID='text_ KeeperTelegram'>
                      Keeper Telegram
                    </Text>
                  </Box>
                </Box>
                <Box style={styles.linkIconWrapper}>
                  <LinkIcon />
                </Box>
              </Box>
            </Pressable>
            <Pressable onPress={() => openLink('https://twitter.com/bitcoinKeeper_')} testID='btn_keeperTwitter'>
              <Box style={styles.telTweetLinkWrapper} backgroundColor="light.primaryBackground" testID='view_keeperTwitter'>
                <Box style={styles.telTweetLinkWrapper2}>
                  <Twitter />
                  <Box style={{ marginLeft: wp(10) }}>
                    <Text color="light.textColor2" style={styles.telTweetLinkTitle} testID='text_keeperTwitter'>
                      Keeper Twitter
                    </Text>
                  </Box>
                </Box>
                <Box style={styles.linkIconWrapper}>
                  <LinkIcon />
                </Box>
              </Box>
            </Pressable>
          </Box>

          <Box style={{ flex: hp(0.15) }}>
            <Box style={styles.bottomLinkWrapper} backgroundColor="light.primaryBackground">
              <Pressable onPress={() => openLink('http://www.bitcoinkeeper.app/')} testID='btn_FAQ'>
                <Text style={styles.bottomLinkText} color={`${colorMode}.textColor2`}>
                  {common.FAQs}
                </Text>
              </Pressable>
              <Text color="light.textColor2">|</Text>
              <Pressable onPress={() => openLink('https://bitcoinkeeper.app/terms-of-service/')} testID='btn_termsCondition'>
                <Text style={styles.bottomLinkText} color={`${colorMode}.textColor2`} testID='text_termsCondition'>
                  {common.TermsConditions}
                </Text>
              </Pressable>
              <Text color="light.textColor2">|</Text>
              <Pressable onPress={() => openLink('https://bitcoinkeeper.app/privacy-policy/')} testID='btn_privacyPolicy'>
                <Text style={styles.bottomLinkText} color={`${colorMode}.textColor2`} testID='text_privacyPolicy'>
                  {common.PrivacyPolicy}
                </Text>
              </Pressable>
            </Box>
          </Box>
        </Box>
      </Box>
      <TorModalMap
        onPressTryAgain={onPressTor}
        visible={showTorModal}
        close={() => setShowTorModal(false)}
      />
    </ScreenWrapper>
  );
}
const styles = StyleSheet.create({
  appBackupWrapper: {
    borderRadius: 10,
    height: hp(116),
    paddingLeft: wp(20),
    width: '100%',
  },
  appBackupIconWrapper: {
    width: wp(40),
    position: 'relative',
  },
  notificationIndicator: {
    height: 10,
    width: 10,
    borderRadius: 10,
    borderWidth: 0.3,
    position: 'absolute',
    right: wp(-2),
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
  },
  appSettingTitleWrapper: {
    marginHorizontal: 5,
    marginBottom: 4,
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
  },
  appSettingTitle: {
    fontSize: 18,
    fontWeight: '400',
    letterSpacing: 1,
  },
  appSettingSubTitle: {
    fontSize: 12,
    fontWeight: '300',
    letterSpacing: 0.6,
  },
  currentTypeSwitchWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '30%',
  },
  socialMediaLinkWrapper: {
    width: wp(340),
    position: 'absolute',
    bottom: -hp(10),
    justifyContent: 'space-evenly',
  },
  socialMediaLinkWrapper2: {
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
    flex: 0.1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomLinkWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    borderRadius: 8,
    padding: 2,
    height: hp(45),
  },
  bottomLinkText: {
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0.79,
  },
});
export default AppSettings;
