import React, { useContext } from 'react';
import { Box, Text } from 'native-base';
import { TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { LocalizationContext } from 'src/common/content/LocContext';
import Illustration from 'src/assets/images/illustration.svg';
import CustomGreenButton from '../CustomButton/CustomGreenButton';

const BackupSuccessful = (props) => {
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
          {BackupWallet.backupSuccessTitle}
        </Text>
        <Text fontSize={RFValue(13)} color={'light.lightBlack'} fontFamily={'body'}>
          {BackupWallet.backupSuccessSubTitle}
        </Text>
      </Box>
      <Box alignItems={'center'} my={5}>
        <Illustration />
      </Box>
      <Box p={10}>
        <Text>{BackupWallet.backupSuccessParagraph}</Text>
      </Box>
      <Box alignItems={'flex-end'} px={10} mb={5}>
        <CustomGreenButton
          onPress={() => {
            props.confirmBtnPress();
          }}
          value={BackupWallet.home}
        />
      </Box>
    </Box>
  );
};
export default BackupSuccessful;
