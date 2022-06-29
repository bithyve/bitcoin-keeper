import { Alert, SafeAreaView, TouchableOpacity } from 'react-native';
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

const RNBiometrics = new ReactNativeBiometrics();

const AppSettings = ({ navigation }) => {
  const { colorMode } = useColorMode();
  const [darkMode, setDarkMode] = useState(false);

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

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#F7F2EC',
      }}
    >
      <StatusBar backgroundColor={'#F7F2EC'} barStyle="dark-content" />
      <Box ml={3}>
        <HeaderTitle />
      </Box>
      <Box ml={10} mb={5} flexDirection={'row'} w={'100%'} alignItems={'center'}>
        <Box w={'60%'}>
          <Text fontSize={RFValue(20)}>{common.settings}</Text>
          <Text fontSize={RFValue(12)}>{settings.selectCurrency}</Text>
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
            title={settings.LanguageCountry}
            description={settings.LanguageCountrySubTitle}
            my={2}
            bgColor={`${colorMode}.backgroundColor2`}
            icon={false}
            onPress={() => navigation.navigate('ChangeLanguage')}
          />
          <SettingsCard
            title={settings.KeeperCommunityTelegramGroup}
            description={settings.Questionsfeedbackandmore}
            my={2}
            bgColor={`${colorMode}.backgroundColor2`}
            icon={true}
            onPress={() => openLink('https://t.me/HexaWallet')}
          />
        </ScrollView>
        <Box flex={0.3} justifyContent={'flex-end'} mb={5}>
          <Note title={common.note} subtitle={settings.desc} />
        </Box>
        <Box flex={0.2} mx={7}>
          <Box
            flexDirection={'row'}
            justifyContent={'space-evenly'}
            borderRadius={8}
            p={2}
            bg={'light.lightYellow'}
          >
            <Pressable onPress={() => openLink('https://hexawallet.io/faq/')}>
              <Text fontSize={RFValue(13)} fontFamily={'body'} color={`${colorMode}.gray2`}>
                {common.FAQs}
              </Text>
            </Pressable>
            <Text fontFamily={'body'} color={'light.textColor2'}>
              |
            </Text>
            <Pressable onPress={() => openLink('https://hexawallet.io/terms-of-service/')}>
              <Text fontSize={RFValue(13)} fontFamily={'body'} color={`${colorMode}.gray2`}>
                {common.TermsConditions}
              </Text>
            </Pressable>
            <Text fontFamily={'body'} color={'light.textColor2'}>
              |
            </Text>
            <Pressable onPress={() => openLink('http://hexawallet.io/privacy-policy')}>
              <Text fontSize={RFValue(13)} fontFamily={'body'} color={`${colorMode}.gray2`}>
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
