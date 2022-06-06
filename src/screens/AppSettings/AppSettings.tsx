import React, { useState, useEffect } from 'react';
import { Box, Text, ScrollView, StatusBar, useColorMode, Pressable } from 'native-base';
import { SafeAreaView, TouchableOpacity } from 'react-native';
import ReactNativeBiometrics from 'react-native-biometrics';
import SettingsSwitchCard from 'src/components/SettingComponent/SettingsSwitchCard';
import SettingsCard from 'src/components/SettingComponent/SettingsCard';
import { RFValue } from 'react-native-responsive-fontsize';
import Note from 'src/components/Note/Note';
import LoginMethod from 'src/common/data/enums/LoginMethod';
import { useDispatch, useSelector } from 'react-redux';
import { changeLoginMethod } from '../../store/actions/login';
import BackIcon from 'src/assets/icons/back.svg';

const AppSettings = ({ navigation }) => {
  const { colorMode } = useColorMode();
  const [isBiometicSupported, setIsBiometicSupported] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const { loginMethod }: { loginMethod: LoginMethod } = useSelector((state) => state.settings);
  const dispatch = useDispatch();

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
          <Text fontSize={RFValue(20)}>Settings</Text>
          <Text fontSize={RFValue(12)}>Lorem ipsum dolor sit amet </Text>
        </Box>
        <Box alignItems={'center'} justifyContent={'center'} w={'30%'}>
          <Text>Switch</Text>
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
              title={'Use Biometrics'}
              description={'Lorem ipsum dolor sit amet,'}
              my={2}
              bgColor={`${colorMode}.backgroundColor2`}
              onSwitchToggle={(value: any) => onChangeLoginMethod()}
              value={loginMethod === LoginMethod.BIOMETRIC}
            />
          )}

          <SettingsSwitchCard
            title={'Dark Mode'}
            description={'Lorem ipsum dolor sit amet'}
            my={2}
            bgColor={`${colorMode}.backgroundColor2`}
            onSwitchToggle={(value: any) => changeThemeMode()}
            value={darkMode}
          />
          <SettingsCard
            title={'Version History'}
            description={'Lorem ipsum dolor sit amet'}
            my={2}
            bgColor={`${colorMode}.backgroundColor2`}
            icon={false}
            onPress={() => console.log('pressed')}
          />
          <SettingsCard
            title={'Language & Country'}
            description={'Lorem ipsum dolor sit amet'}
            my={2}
            bgColor={`${colorMode}.backgroundColor2`}
            icon={false}
            onPress={() => console.log('pressed')}
          />
          <SettingsCard
            title={'Keeper Community Telegram Group'}
            description={'Questions, feedback and more'}
            my={2}
            bgColor={`${colorMode}.backgroundColor2`}
            icon={true}
            onPress={() => console.log('pressed')}
          />
        </ScrollView>
        <Box flex={0.3} justifyContent={'flex-end'} mb={5}>
          <Note
            title={'Note'}
            subtitle={
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et '
            }
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
                FAQ’s
              </Text>
            </Pressable>
            <Text fontSize={RFValue(13)} fontFamily={'body'} color={`${colorMode}.gray2`}>
              |
            </Text>
            <Pressable>
              <Text fontSize={RFValue(13)} fontFamily={'body'} color={`${colorMode}.gray2`}>
                Terms and Conditions
              </Text>
            </Pressable>
            <Text fontSize={RFValue(13)} fontFamily={'body'} color={`${colorMode}.gray2`}>
              |
            </Text>
            <Pressable>
              <Text fontSize={RFValue(13)} fontFamily={'body'} color={`${colorMode}.gray2`}>
                Privacy Policy
              </Text>
            </Pressable>
          </Box>
        </Box>
      </Box>
    </SafeAreaView>
  );
};
export default AppSettings;
