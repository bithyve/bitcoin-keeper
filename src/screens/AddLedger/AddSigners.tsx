import { Alert, NativeModules, Platform, SafeAreaView, TouchableOpacity } from 'react-native';
import { Box, Pressable, ScrollView, StatusBar, Text, useColorMode } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import { getCloudBackupData, uploadData } from 'src/nativemodules/Cloud';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import { useAppDispatch, useAppSelector } from '../../store/hooks';

import BackupIcon from 'src/assets/images/svgs/backup.svg';
import CurrencyTypeSwitch from 'src/components/Switch/CurrencyTypeSwitch';
import HeaderTitle from 'src/components/HeaderTitle';
import Header from 'src/components/Header';
import LinkIcon from 'src/assets/icons/link.svg';
import { LocalizationContext } from 'src/common/content/LocContext';
import LoginMethod from 'src/common/data/enums/LoginMethod';
import Note from 'src/components/Note/Note';
import { RFValue } from 'react-native-responsive-fontsize';
import ReactNativeBiometrics from 'react-native-biometrics';
import SettingsCard from 'src/components/SettingComponent/SettingsCard';
import SettingsSwitchCard from 'src/components/SettingComponent/SettingsSwitchCard';
import { changeLoginMethod } from '../../store/sagaActions/login';
import openLink from 'src/utils/OpenLink';
import { useNavigation } from '@react-navigation/native';
import TsIcon from 'src/assets/icons/icon_vault_mac.svg';
import ColdCardIcon from 'src/assets/icons/coldCardIcon.svg';
import Buttons from './Buttons';
import CustomGreenButton from 'src/components/CustomButton/CustomGreenButton';

const AddSigners = () => {
  const navigtaion = useNavigation();

  const SignersCard = (props) => {
    return (
      <Box
        flexDirection={'row'}
        justifyContent={'space-evenly'}
        alignItems={'center'}
        mx={7}
        p={3}
        borderRadius={10}
        {...props}
      >
        <Box flex={0.1} justifyContent={'center'} alignItems={'center'} mr={wp(20)}>
          {props.iconLeft}
        </Box>
        <Box flex={0.9}>
          <Text
            color={'#041513'}
            fontWeight={200}
            fontSize={RFValue(13)}
            letterSpacing={1.04}
            fontFamily={'body'}
          >
            {props.title}
          </Text>
          <Text
            color={'#4F5955'}
            fontFamily={'body'}
            fontWeight={200}
            letterSpacing={0.36}
            fontSize={RFValue(12)}
          >
            {props.description}
          </Text>
        </Box>
        <Pressable>
          <Box flex={1} justifyContent={'center'} alignItems={'center'} ml={wp(10)}>
            {<RemoveIcon />}
          </Box>
        </Pressable>
      </Box>
    );
  };

  const RemoveIcon = () => {
    return (
      <Box
        backgroundColor={'#FAC48B'}
        height={hp(30)}
        width={wp(85)}
        borderRadius={'3'}
        justifyContent={'center'}
        alignItems={'center'}
      >
        <Text
          color={'#4F5955'}
          fontFamily={'body'}
          fontWeight={200}
          letterSpacing={0.36}
          fontSize={RFValue(11)}
        >
          Remove
        </Text>
      </Box>
    );
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
        <Header
          title={'Add Signers'}
          subtitle={'Lorem ipsum dolor sit amet'}
          //   onPressHandler={() => navigtaion.goBack()}
        />
      </Box>
      <Box flex={1}>
        <ScrollView
          overScrollMode="never"
          bounces={false}
          flex={1}
          pb={20}
          showsVerticalScrollIndicator={false}
          py={1}
        >
          <Box paddingX={wp(5)}>
            <SignersCard
              title={'TapSigner'}
              description={'Added on 12 January 2022'}
              my={2}
              iconLeft={<TsIcon />}
              iconRight={<RemoveIcon />}
            />
            <SignersCard
              title={'ColdCard'}
              description={'Added on 12 January 2022'}
              my={2}
              iconLeft={<ColdCardIcon />}
              iconRight={<RemoveIcon />}
            />
            <SignersCard
              title={'Trezor'}
              description={'Added on 12 January 2022'}
              my={2}
              iconLeft={<TsIcon />}
              iconRight={<RemoveIcon />}
            />
            <SignersCard
              title={'Ledger'}
              description={'Added on 12 January 2022'}
              my={2}
              iconLeft={<TsIcon />}
              iconRight={<RemoveIcon />}
            />
            <SignersCard
              title={'Mobile Device'}
              description={'Added on 12 January 2022'}
              my={2}
              iconLeft={<TsIcon />}
              iconRight={<RemoveIcon />}
            />
          </Box>
        </ScrollView>
        <Box
          alignSelf={'flex-end'}
          flex={0.1}
          flexDirection={'row'}
          mx={wp(10)}
          alignItems={'center'}
          justifyContent={'center'}
        >
          <TouchableOpacity>
            <Text
              mx={'7%'}
              fontSize={13}
              fontFamily={'body'}
              fontWeight={'300'}
              letterSpacing={1}
              color={'#073E39'}
            >
              Cancel
            </Text>
          </TouchableOpacity>
          <CustomGreenButton value={'Next'} />
        </Box>
      </Box>
    </SafeAreaView>
  );
};

export default AddSigners;
