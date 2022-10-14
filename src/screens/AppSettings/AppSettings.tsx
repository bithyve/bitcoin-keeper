import React, { useContext, useEffect, useState, useCallback } from 'react';
import { Alert, NativeModules } from 'react-native';
import { Box, Pressable, ScrollView, Text, useColorMode } from 'native-base';
import { getCloudBackupData, uploadData } from 'src/nativemodules/Cloud';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import BackupIcon from 'src/assets/images/svgs/backup.svg';
import Twitter from 'src/assets/images/svgs/Twitter.svg';
import Telegram from 'src/assets/images/svgs/Telegram.svg';
import CurrencyTypeSwitch from 'src/components/Switch/CurrencyTypeSwitch';
import TorModalMap from './TorModalMap';
import HeaderTitle from 'src/components/HeaderTitle';
import LinkIcon from 'src/assets/icons/link.svg';
import { LocalizationContext } from 'src/common/content/LocContext';
import LoginMethod from 'src/common/data/enums/LoginMethod';
import { RFValue } from 'react-native-responsive-fontsize';
import ReactNativeBiometrics from 'react-native-biometrics';
import ScreenWrapper from 'src/components/ScreenWrapper';
import SettingsCard from 'src/components/SettingComponent/SettingsCard';
import SettingsSwitchCard from 'src/components/SettingComponent/SettingsSwitchCard';
import { changeLoginMethod } from '../../store/sagaActions/login';
import openLink from 'src/utils/OpenLink';
import RestClient, { TorStatus } from 'src/core/services/rest/RestClient';
import { setTorEnabled } from 'src/store/reducers/settings';

const RNBiometrics = new ReactNativeBiometrics();
const GoogleDrive = NativeModules.GoogleDrive;

const AppSettings = ({ navigation }) => {
  const { colorMode } = useColorMode();
  const [darkMode, setDarkMode] = useState(false);
  const { appId } = useAppSelector((state) => state.storage);
  const { backupMethod } = useAppSelector((state) => state.bhr);

  const { loginMethod }: { loginMethod: LoginMethod } = useAppSelector((state) => state.settings);
  const dispatch = useAppDispatch();
  const [sensorType, setSensorType] = useState('Biometrics');
  const { translations, formatString } = useContext(LocalizationContext);
  const common = translations['common'];
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

  const RenderTorStatus = useCallback(() => {
    return (
      <Box backgroundColor="#E3BE96" py={0.5} px={1.5} borderRadius={10}>
        <Text fontSize={11}>{torStatus}</Text>
      </Box>
    );
  }, [torStatus]);

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

  const Option = ({ title, subTitle, onPress, Icon }) => {
    return (
      <Pressable
        flexDirection={'row'}
        alignItems={'center'}
        onPress={onPress}
        backgroundColor={'light.lightYellow'}
        style={{
          borderRadius: 10,
          height: hp(116),
          paddingLeft: wp(20),
          width: '100%',
        }}
      >
        {Icon && (
          <Box position={'relative'} style={{ width: wp(40) }}>
            {/* { Notification indicator } */}
            {backupMethod === null && (
              <Box
                height={3}
                width={3}
                bg={'light.indicator'}
                borderRadius={10}
                borderColor={'light.white1'}
                borderWidth={0.3}
                position={'absolute'}
                right={wp(-2)}
                zIndex={999}
              />
            )}
            <BackupIcon />
          </Box>
        )}
        <Box style={{ marginLeft: wp(20) }}>
          <Text
            color={'light.lightBlack'}
            fontFamily={'body'}
            fontWeight={200}
            fontSize={RFValue(14)}
            letterSpacing={1.12}
          >
            {title}
          </Text>
          <Text
            color={'light.GreyText'}
            fontFamily={'body'}
            fontWeight={200}
            fontSize={RFValue(12)}
            letterSpacing={0.6}
          >
            {subTitle}
          </Text>
        </Box>
      </Pressable>
    );
  };

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
      <Box mx={'4'} mb={5} flexDirection={'row'} w={'100%'} alignItems={'center'}>
        <Box w={'60%'}>
          <Text fontSize={RFValue(20)} fontWeight={200} letterSpacing={1}>
            {"App " + common.settings}
          </Text>
          <Text fontSize={RFValue(12)} fontWeight={200} letterSpacing={0.6}>
            {'For the vault and wallets'}
          </Text>
        </Box>
        <Box alignItems={'center'} justifyContent={'center'} w={'30%'}>
          <CurrencyTypeSwitch />
        </Box>
      </Box>
      <Box flex={1} position={'relative'}>
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
            title={'App Backup'}
            subTitle={'Seed words health check is due'}
            onPress={() => {
              navigation.navigate('BackupWallet');
            }}
            Icon={true}
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
            title={'Tor'}
            description={'Tor daemon settings'}
            my={1}
            bgColor={`${colorMode}.backgroundColor2`}
            icon={false}
            onSwitchToggle={onPressTor}
            renderStatus={(torStatus === TorStatus.OFF || torStatus === TorStatus.CONNECTED) ? null : RenderTorStatus}
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

        <Box
          width={wp(340)}
          position={'absolute'}
          bottom={-hp(20)}
          backgroundColor={'light.ReceiveBackground'}
        >
          <Box flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'}>
            <Pressable onPress={() => openLink(' https://t.me/bitcoinkeeper')}>
              <Box
                flexDirection={'row'}
                justifyContent={'space-evenly'}
                height={hp(45)}
                width={wp(169)}
                borderRadius={8}
                marginBottom={hp(8)}
                backgroundColor={'light.lightYellow'}
                alignItems={'center'}
              >
                <Box
                  flexDirection={'row'}
                  alignItems={'center'}
                  style={{ marginRight: wp(3) }}

                >
                  <Telegram />
                  <Box style={{ marginLeft: wp(10) }}>
                    <Text
                      color={'light.textColor2'}
                      fontWeight={200}
                      fontSize={RFValue(13)}
                      letterSpacing={0.79}
                      fontFamily={'body'}
                    >
                      Keeper Telegram
                    </Text>
                  </Box>
                </Box>
                <Box
                  flex={0.1}
                  justifyContent={'center'}
                  alignItems={'center'}
                >
                  <LinkIcon />
                </Box>
              </Box>
            </Pressable>
            <Pressable onPress={() => openLink('https://twitter.com/@bitcoinKeeper')}>
              <Box
                flexDirection={'row'}
                justifyContent={'space-evenly'}
                height={hp(45)}
                width={wp(165)}
                borderRadius={8}
                marginBottom={hp(8)}
                backgroundColor={'light.lightYellow'}
                alignItems={'center'}
              >
                <Box
                  flexDirection={'row'}
                  alignItems={'center'}
                  style={{ marginRight: wp(3) }}
                >
                  <Twitter />
                  <Box style={{ marginLeft: wp(10) }}>
                    <Text
                      color={'light.textColor2'}
                      fontWeight={200}
                      fontSize={RFValue(13)}
                      letterSpacing={0.79}
                      fontFamily={'body'}
                    >
                      Keeper Twitter
                    </Text>
                  </Box>
                </Box>
                <Box
                  flex={0.1}
                  justifyContent={'center'}
                  alignItems={'center'}
                >
                  <LinkIcon />
                </Box>
              </Box>
            </Pressable>
          </Box>

          <Box style={{ flex: hp(0.15) }}>
            <Box
              flexDirection={'row'}
              justifyContent={'space-evenly'}
              alignItems={'center'}
              borderRadius={8}
              p={2}
              height={hp(45)}
              bg={'light.lightYellow'}
            >
              <Pressable onPress={() => openLink('https://hexawallet.io/faq/')}>
                <Text
                  fontSize={13}
                  fontWeight={200}
                  letterSpacing={0.79}
                  fontFamily={'body'}
                  color={`${colorMode}.textColor2`}
                >
                  {common.FAQs}
                </Text>
              </Pressable>
              <Text fontFamily={'body'} color={'light.textColor2'}>
                |
              </Text>
              <Pressable onPress={() => openLink('https://hexawallet.io/terms-of-service/')}>
                <Text
                  fontSize={13}
                  fontWeight={200}
                  letterSpacing={0.79}
                  fontFamily={'body'}
                  color={`${colorMode}.textColor2`}
                >
                  {common.TermsConditions}
                </Text>
              </Pressable>
              <Text fontFamily={'body'} color={'light.textColor2'}>
                |
              </Text>
              <Pressable onPress={() => openLink('http://hexawallet.io/privacy-policy')}>
                <Text
                  fontSize={13}
                  fontWeight={200}
                  letterSpacing={0.79}
                  fontFamily={'body'}
                  color={`${colorMode}.textColor2`}
                >
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
};
export default AppSettings;
