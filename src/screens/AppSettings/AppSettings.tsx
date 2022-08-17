import { Alert, SafeAreaView, Platform, TouchableOpacity, NativeModules } from 'react-native';
import { Box, Pressable, ScrollView, StatusBar, Text, useColorMode } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import CurrencyTypeSwitch from 'src/components/Switch/CurrencyTypeSwitch';
import HeaderTitle from 'src/components/HeaderTitle';
import { LocalizationContext } from 'src/common/content/LocContext';
import LoginMethod from 'src/common/data/enums/LoginMethod';
import Note from 'src/components/Note/Note';
import { RFValue } from 'react-native-responsive-fontsize';
import ReactNativeBiometrics from 'react-native-biometrics';
import SettingsCard from 'src/components/SettingComponent/SettingsCard';
import SettingsSwitchCard from 'src/components/SettingComponent/SettingsSwitchCard';
import { changeLoginMethod } from '../../store/sagaActions/login';
import openLink from 'src/utils/OpenLink';
import { uploadData, getCloudBackupData } from 'src/nativemodules/Cloud';
import { Option } from '../WalletDetailScreen/WalletSettings';
import { wp, hp } from 'src/common/data/responsiveness/responsive';
import LinkIcon from 'src/assets/icons/link.svg';

const RNBiometrics = new ReactNativeBiometrics();
const GoogleDrive = NativeModules.GoogleDrive;

const AppSettings = ({ navigation }) => {
  const { colorMode } = useColorMode();
  const [darkMode, setDarkMode] = useState(false);
  const { appId } = useAppSelector((state) => state.storage);

  const { loginMethod }: { loginMethod: LoginMethod } = useAppSelector((state) => state.settings);
  const dispatch = useAppDispatch();
  const [sensorType, setSensorType] = useState('Biometrics');
  const { translations, formatString } = useContext(LocalizationContext);
  const common = translations['common'];
  const { settings } = translations;

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

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#F7F2EC',
      }}
    >
      <StatusBar backgroundColor={'#F7F2EC'} barStyle="dark-content" />
      <Box ml={3} mt={Platform.OS == 'ios' ? 3 : 10}>
        <HeaderTitle />
      </Box>
      <Box ml={10} mb={5} flexDirection={'row'} w={'100%'} alignItems={'center'}>
        <Box w={'60%'}>
          <Text fontSize={RFValue(20)} fontWeight={200} letterSpacing={1}>{common.settings}</Text>
          <Text fontSize={RFValue(12)} fontWeight={200} letterSpacing={0.6}>{settings.selectCurrency}</Text>
        </Box>
        <Box alignItems={'center'} justifyContent={'center'} w={'30%'}>
          <CurrencyTypeSwitch />
        </Box>
      </Box>
      <Box flex={1}>
        <ScrollView
          overScrollMode="never"
          bounces={false}
          flex={1}
          pb={20}
          showsVerticalScrollIndicator={false}
          py={3}
        >
          <Box borderBottomColor={'light.divider'} borderBottomWidth={0.2} paddingX={wp(25)}>
            <Option
              title={'Wallet Backup'}
              subTitle={'Setup backup for Wallet'}
              onPress={() => {
                navigation.navigate('BackupWallet');
              }}
              Icon={true}
            />
          </Box>
          {/* {isBiometicSupported && ( */}
          <SettingsSwitchCard
            title={sensorType}
            description={formatString(settings.UseBiometricSubTitle, sensorType)}
            my={2}
            bgColor={`${colorMode}.backgroundColor2`}
            onSwitchToggle={() => onChangeLoginMethod()}
            value={loginMethod === LoginMethod.BIOMETRIC}
          />
          {/* )} */}

          <SettingsSwitchCard
            title={settings.DarkMode}
            description={settings.DarkModeSubTitle}
            my={2}
            bgColor={`${colorMode}.backgroundColor2`}
            onSwitchToggle={() => changeThemeMode()}
            value={darkMode}
          />
          <SettingsCard
            title={settings.VersionHistory}
            description={settings.VersionHistorySubTitle}
            my={2}
            bgColor={`${colorMode}.backgroundColor2`}
            icon={false}
            onPress={() => navigation.navigate('AppVersionHistory')}
          />
          <SettingsCard
            title={'Tor'}
            description={'Tor daemon settings'}
            my={2}
            bgColor={`${colorMode}.backgroundColor2`}
            icon={false}
            onPress={() => navigation.navigate('TorSettings')}
          />
          <SettingsCard
            title={settings.LanguageCountry}
            description={settings.LanguageCountrySubTitle}
            my={2}
            bgColor={`${colorMode}.backgroundColor2`}
            icon={false}
            onPress={() => navigation.navigate('ChangeLanguage')}
          />

        </ScrollView>

        <Pressable onPress={() => openLink('https://t.me/HexaWallet')}>
          <Box
            flexDirection={'row'}
            justifyContent={'space-evenly'}
            mx={7}
            p={3}
            height={hp(45)}
            borderRadius={8}
            marginBottom={hp(8)}
            backgroundColor={'light.lightYellow'}
          >
            <Box flex={0.9}>
              <Text
                color={'light.textColor2'}
                fontWeight={200}
                fontSize={RFValue(13)}
                letterSpacing={0.79}
                fontFamily={'body'}
              >
                {settings.KeeperCommunityTelegramGroup}
              </Text>
            </Box>
            <Box flex={0.1} justifyContent={'center'} alignItems={'center'}>
              <LinkIcon />
            </Box>
          </Box>
        </Pressable>

        <Box flex={0.1} mx={7} >
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
                fontSize={RFValue(13)}
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
                fontSize={RFValue(13)}
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
                fontSize={RFValue(13)}
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
    </SafeAreaView>
  );
};
export default AppSettings;
