import React, { useContext, useEffect, useState, useCallback } from 'react';
import { Alert, NativeModules, StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import { Box, Pressable, ScrollView, useColorMode } from 'native-base';
import { getCloudBackupData, uploadData } from 'src/nativemodules/Cloud';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import BackupIcon from 'src/assets/images/svgs/backup.svg';
import Twitter from 'src/assets/images/svgs/Twitter.svg';
import Telegram from 'src/assets/images/svgs/Telegram.svg';
import CurrencyTypeSwitch from 'src/components/Switch/CurrencyTypeSwitch';
import HeaderTitle from 'src/components/HeaderTitle';
import LinkIcon from 'src/assets/icons/link.svg';
import { LocalizationContext } from 'src/common/content/LocContext';
import LoginMethod from 'src/common/data/enums/LoginMethod';
import ReactNativeBiometrics from 'react-native-biometrics';
import ScreenWrapper from 'src/components/ScreenWrapper';
import SettingsCard from 'src/components/SettingComponent/SettingsCard';
import SettingsSwitchCard from 'src/components/SettingComponent/SettingsSwitchCard';
import openLink from 'src/utils/OpenLink';
import RestClient, { TorStatus } from 'src/core/services/rest/RestClient';
import { setTorEnabled } from 'src/store/reducers/settings';
import { changeLoginMethod } from '../../store/sagaActions/login';
import TorModalMap from './TorModalMap';
import { useAppDispatch, useAppSelector } from '../../store/hooks';

const RNBiometrics = new ReactNativeBiometrics();
const { GoogleDrive } = NativeModules;

function AppSettings({ navigation }) {
  const { colorMode } = useColorMode();
  const [darkMode, setDarkMode] = useState(false);
  const { appId } = useAppSelector((state) => state.storage);
  const { backupMethod } = useAppSelector((state) => state.bhr);

  const { loginMethod }: { loginMethod: LoginMethod } = useAppSelector((state) => state.settings);
  const dispatch = useAppDispatch();
  const [sensorType, setSensorType] = useState('Biometrics');
  const { translations, formatString } = useContext(LocalizationContext);
  const { common } = translations;
  const { settings } = translations;
  const [showTorModal, setShowTorModal] = useState(false);
  const [torStatus, settorStatus] = useState<TorStatus>(RestClient.getTorStatus());

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
      <Box backgroundColor="#E3BE96" py={0.5} px={1.5} borderRadius={10}>
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
        Alert.alert('Biometrics not enabled', 'Plese go to setting and enable it');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const changeThemeMode = () => {
    setDarkMode(!darkMode);
  };

  const backup = async () => {
    try {
      const res = await uploadData(appId, {
        encData: 'vavadv',
      });
      console.log('RESSS', res);
    } catch (error) {
      console.log(error);
    }
  };

  const doanload = async () => {
    try {
      const res = await getCloudBackupData();
      console.log('CLOUD DATA', JSON.stringify(res));
    } catch (error) {
      console.log(error);
    }
  };

  function Option({ title, subTitle, onPress, Icon }) {
    return (
      <Pressable
        flexDirection="row"
        alignItems="center"
        onPress={onPress}
        backgroundColor="light.primaryBackground"
        style={styles.appBackupWrapper}
      >
        {Icon && (
          <Box style={styles.appBackupIconWrapper}>
            {/* { Notification indicator } */}
            {backupMethod === null && (
              <Box
                bg="light.indicator"
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
        <Box w="70%">
          <Text style={styles.appSettingTitle}>{`App ${common.settings}`}</Text>
          <Text style={styles.appSettingSubTitle}>For the vault and wallets</Text>
        </Box>
        <Box style={styles.currentTypeSwitchWrapper}>
          <CurrencyTypeSwitch />
        </Box>
      </Box>
      <Box flex={1} position="relative">
        <ScrollView
          overScrollMode="never"
          bounces={false}
          flex={1}
          pb={20}
          showsVerticalScrollIndicator={false}
          py={3}
          marginBottom={hp(20)}
        >
          <Option
            title="App Backup"
            subTitle="Recovery Phrases health check is due"
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

        <Box style={styles.socialMediaLinkWrapper} backgroundColor="light.ReceiveBackground">
          <Box style={styles.socialMediaLinkWrapper2}>
            <Pressable onPress={() => openLink('https://t.me/bitcoinkeeper')}>
              <Box style={styles.telTweetLinkWrapper} backgroundColor="light.primaryBackground">
                <Box style={styles.telTweetLinkWrapper2}>
                  <Telegram />
                  <Box style={{ marginLeft: wp(10) }}>
                    <Text color="light.textColor2" style={styles.telTweetLinkTitle}>
                      Keeper Telegram
                    </Text>
                  </Box>
                </Box>
                <Box style={styles.linkIconWrapper}>
                  <LinkIcon />
                </Box>
              </Box>
            </Pressable>
            <Pressable onPress={() => openLink('https://twitter.com/bitcoinKeeper_')}>
              <Box style={styles.telTweetLinkWrapper} backgroundColor="light.primaryBackground">
                <Box style={styles.telTweetLinkWrapper2}>
                  <Twitter />
                  <Box style={{ marginLeft: wp(10) }}>
                    <Text color="light.textColor2" style={styles.telTweetLinkTitle}>
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
            <Box style={styles.bottomLinkWrapper} bg="light.primaryBackground">
              <Pressable onPress={() => openLink('http://www.bitcoinkeeper.app/')}>
                <Text style={styles.bottomLinkText} color={`${colorMode}.textColor2`}>
                  {common.FAQs}
                </Text>
              </Pressable>
              <Text color="light.textColor2">|</Text>
              <Pressable onPress={() => openLink('http://www.bitcoinkeeper.app/')}>
                <Text style={styles.bottomLinkText} color={`${colorMode}.textColor2`}>
                  {common.TermsConditions}
                </Text>
              </Pressable>
              <Text color="light.textColor2">|</Text>
              <Pressable onPress={() => openLink('http://www.bitcoinkeeper.app/')}>
                <Text style={styles.bottomLinkText} color={`${colorMode}.textColor2`}>
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
