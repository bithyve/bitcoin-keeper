import React, { useContext, useState, useEffect } from 'react';
import { Box, Text } from 'native-base';
import { TouchableOpacity, Clipboard } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { LocalizationContext } from 'src/common/content/LocContext';
import { hp } from 'src/common/data/responsiveness/responsive';

import CopyIcon from 'src/assets/images/svgs/icon_copy.svg';
import CustomGreenButton from '../CustomButton/CustomGreenButton';

const AppGeneratePass = (props) => {
  const { translations } = useContext(LocalizationContext);
  const BackupWallet = translations['BackupWallet'];
  const common = translations['common'];
  return (
    <Box bg={'#F7F2EC'} borderRadius={10}>
      <TouchableOpacity onPress={() => props.closeBottomSheet()}>
        <Box
          m={5}
          bg={'#E3BE96'}
          borderRadius={32}
          h={8}
          w={8}
          alignItems={'center'}
          justifyContent={'center'}
          alignSelf={'flex-end'}
        >
          <Text fontSize={18} color={'#FFF'}>
            X
          </Text>
        </Box>
      </TouchableOpacity>
      <Box p={10}>
        <Text fontSize={RFValue(19)} color={'light.lightBlack'} fontFamily={'heading'}>
          {BackupWallet.appGeneratePassTitle}
        </Text>
        <Text fontSize={RFValue(13)} color={'light.lightBlack'} fontFamily={'body'}>
          {BackupWallet.appGeneratePassSubTitle}
        </Text>
      </Box>
      {/* {Input Field} */}
      <Box
        alignItems={'center'}
        borderBottomLeftRadius={10}
        borderTopLeftRadius={10}
        marginTop={hp(20)}
      >
        <Box
          flexDirection={'row'}
          width={'80%'}
          alignItems={'center'}
          justifyContent={'space-between'}
          backgroundColor={'light.textInputBackground'}
        >
          <Text width={'80%'} marginLeft={4} noOfLines={1} fontWeight={200}>
            {'lk2j3429-85213-5134=50t-934285623…'}
          </Text>
          <TouchableOpacity
            activeOpacity={0.4}
            onPress={() => {
              Clipboard.setString('lk2j3429-85213-5134=50t-934285623…');
            }}
          >
            <Box
              backgroundColor={'light.copyBackground'}
              padding={3}
              borderTopRightRadius={10}
              borderBottomRightRadius={10}
            >
              <CopyIcon />
            </Box>
          </TouchableOpacity>
        </Box>
      </Box>
      <Box p={10}>
        <Text fontSize={RFValue(13)} color={'light.lightBlack'} fontFamily={'body'}>
          {BackupWallet.appGeneratePassSubTitle}
        </Text>
      </Box>
      <Box px={10} w={'90%'} flexDirection={'row'} alignItems={'center'}>
        <Box w={'15%'}>
          <CopyIcon />
        </Box>
        <Box w={'80%'}>
          <Text fontSize={RFValue(12)} fontWeight={300}>
            Backing up drive
          </Text>
          <Text fontSize={RFValue(12)}>Lorem ipsum dolor sit amet</Text>
        </Box>
      </Box>
      <Box alignItems={'center'} flexDirection={'row'} w={'95%'} py={5}>
        <TouchableOpacity
          onPress={() => props.closeBottomSheet()}
          style={{ width: '60%', paddingLeft: '15%' }}
        >
          <Text fontSize={RFValue(14)} textAlign={'center'}>
            {common.cancel}
          </Text>
        </TouchableOpacity>
        <Box w={'40%'}>
          <CustomGreenButton
            onPress={() => {
              props.confirmBtnPress();
            }}
            value={common.next}
          />
        </Box>
      </Box>
    </Box>
  );
};
export default AppGeneratePass;
