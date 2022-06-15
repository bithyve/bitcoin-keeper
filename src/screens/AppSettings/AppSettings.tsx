import React, { useState, useEffect, useContext } from 'react';
import { Box, Text, ScrollView, StatusBar, useColorMode, Pressable } from 'native-base';
import { SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import ReactNativeBiometrics from 'react-native-biometrics';
import SettingsSwitchCard from 'src/components/SettingComponent/SettingsSwitchCard';
import SettingsCard from 'src/components/SettingComponent/SettingsCard';
import { RFValue } from 'react-native-responsive-fontsize';
import Note from 'src/components/Note/Note';
import LoginMethod from 'src/common/data/enums/LoginMethod';
import { changeLoginMethod } from '../../store/sagaActions/login';
import BackIcon from 'src/assets/icons/back.svg';
import CurrencyTypeSwitch from 'src/components/Switch/CurrencyTypeSwitch';
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/realm/enum';
import { LocalizationContext } from 'src/common/content/LocContext';

const AppSettings = ({ navigation }) => {
  const { colorMode } = useColorMode();
  const [isBiometicSupported, setIsBiometicSupported] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const { loginMethod }: { loginMethod: LoginMethod } = useAppSelector((state) => state.settings);
  const dispatch = useAppDispatch();

  const { translations } = useContext( LocalizationContext )
  const common = translations[ 'common' ]
  const settings = translations[ 'settings' ]

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      const { available, biometryType } = await ReactNativeBiometrics.isSensorAvailable();
      if (available) {
        setIsBiometicSupported(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onChangeLoginMethod = async () => {
    if (loginMethod === LoginMethod.PIN) {
      const { keysExist } = await ReactNativeBiometrics.biometricKeysExist();
      if (keysExist) {
        await ReactNativeBiometrics.createKeys();
      }
      const { publicKey } = await ReactNativeBiometrics.createKeys();
      const { success } = await ReactNativeBiometrics.simplePrompt({
        promptMessage: 'Confirm your identity',
      });
      if (success) {
        dispatch(changeLoginMethod(LoginMethod.BIOMETRIC, publicKey));
      } else {
      }
    } else {
      dispatch(changeLoginMethod(LoginMethod.PIN));
    }
  };
  const changeThemeMode = () => {
    setDarkMode(!darkMode);
  };

  const showSeed = () => {
    try {
      const wallet = dbManager.getObjectByIndex(RealmSchema.KeeperApp, 0)
      console.log()
      Alert.alert('Seed', wallet.toJSON().primaryMnemonic.replace(/ /g, '\n'))
    } catch (error) {
      //
    }
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#F7F2EC',
      }}
    >
      <StatusBar backgroundColor={'#F7F2EC'} barStyle="dark-content" />
      <Box mx={5} my={10}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <BackIcon />
        </TouchableOpacity>
      </Box>
      <Box ml={10} mb={5} flexDirection={'row'} w={'100%'} alignItems={'center'}>
        <Box w={'60%'}>
          <Text fontSize={RFValue(20)}>{common.settings}</Text>
          <Text fontSize={RFValue(12)}>{settings.biometricsDesc}</Text>
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
          {isBiometicSupported && (
            <SettingsSwitchCard
              title={settings.UseBiometrics}
              description={settings.biometricsDesc}
              my={2}
              bgColor={`${colorMode}.backgroundColor2`}
              onSwitchToggle={() => onChangeLoginMethod()}
              value={loginMethod === LoginMethod.BIOMETRIC}
            />
          )}

          <SettingsSwitchCard
            title={settings.DarkMode}
            description={settings.biometricsDesc}
            my={2}
            bgColor={`${colorMode}.backgroundColor2`}
            onSwitchToggle={() => changeThemeMode()}
            value={darkMode}
          />
          <SettingsCard
            title={settings.VersionHistory}
            description={settings.biometricsDesc}
            my={2}
            bgColor={`${colorMode}.backgroundColor2`}
            icon={false}
            onPress={() => console.log('pressed')}
          />
          <SettingsCard
            title={settings.LanguageCountry}
            description={settings.biometricsDesc}
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
            onPress={() => console.log('pressed')}
          />
          <Pressable onPress={() => showSeed()}>
            <Text m={5} fontSize={RFValue(13)} fontFamily={'body'} color={`${colorMode}.gray2`}>
              {common.ViewSeed}
              </Text>
          </Pressable>
        </ScrollView>
        <Box flex={0.3} justifyContent={'flex-end'} mb={5}>
          <Note
            title={common.note}
            subtitle={common.desc}
          />
        </Box>
        <Box flex={0.2} justifyContent={'space-evenly'}>
          <Box
            flexDirection={'row'}
            justifyContent={'space-evenly'}
            mx={7}
            borderRadius={8}
            p={2}
            bg={'#EFEFEF'}
          >
            <Pressable>
              <Text fontSize={RFValue(13)} fontFamily={'body'} color={`${colorMode}.gray2`}>
                {common.FAQs}
              </Text>
            </Pressable>
            <Text fontSize={RFValue(13)} fontFamily={'body'} color={`${colorMode}.gray2`}>
              |
            </Text>
            <Pressable>
              <Text fontSize={RFValue(13)} fontFamily={'body'} color={`${colorMode}.gray2`}>
              {common.TermsConditions}
              </Text>
            </Pressable>
            <Text fontSize={RFValue(13)} fontFamily={'body'} color={`${colorMode}.gray2`}>
              |
            </Text>
            <Pressable>
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
