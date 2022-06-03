import React, { useState, useEffect, useContext } from 'react';
import { Box, Text, ScrollView, StatusBar, useColorMode, Pressable } from 'native-base';
import { SafeAreaView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import SettingsSwitchCard from 'src/components/SettingComponent/SettingsSwitchCard';
import SettingsCard from 'src/components/SettingComponent/SettingsCard';
import { RFValue } from 'react-native-responsive-fontsize';
import Note from 'src/components/Note/Note';

const AppSettings = ({ navigation }: any) => {
  const { colorMode } = useColorMode();
  const [isBiometicSupported, setIsBiometicSupported] = useState(false);
  const [versionModalVisible, setVersionModalVisible] = useState(false);

  const onChangeLoginMethod = async () => {};
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#F7F2EC',
      }}
    >
      <StatusBar backgroundColor={'#2F2F2F'} barStyle="dark-content" />
      <Box mx={5} my={10}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name={'chevron-back-outline'} size={25} color={'#000'} />
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
          <SettingsSwitchCard
            title={'Use Biometrics'}
            description={'Lorem ipsum dolor sit amet,'}
            my={2}
            bgColor={`${colorMode}.backgroundColor2`}
            onSwitchToggle={(value: any) => onChangeLoginMethod()}
            // value={loginMethod === LoginMethod.BIOMETRIC}
            value={true}
          />
          <SettingsSwitchCard
            title={'Dark Mode'}
            description={'Lorem ipsum dolor sit amet'}
            my={2}
            bgColor={`${colorMode}.backgroundColor2`}
            // onSwitchToggle={(value: any) => changeThemeMode()}
            // value={themeMode === UiMode.DARK}
          />
          <SettingsCard
            title={'Version History'}
            description={'Lorem ipsum dolor sit amet'}
            my={2}
            bgColor={`${colorMode}.backgroundColor2`}
            icon={false}
            onPress={() => setVersionModalVisible(true)}
          />
          <SettingsCard
            title={'Language & Country'}
            description={'Lorem ipsum dolor sit amet'}
            my={2}
            bgColor={`${colorMode}.backgroundColor2`}
            icon={false}
            onPress={() => navigation.navigate('LangaugeAndCurrency')}
          />
          <SettingsCard
            title={'Keeper Community Telegram Group'}
            description={'Questions, feedback and more'}
            my={2}
            bgColor={`${colorMode}.backgroundColor2`}
            icon={true}
            // onPress={() => openLink('https://t.me/HexaWallet')}
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
