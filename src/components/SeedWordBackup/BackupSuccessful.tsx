import React, { useContext } from 'react';
import { Box, Text } from 'native-base';
import { TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { LocalizationContext } from 'src/common/content/LocContext';
import Illustration from 'src/assets/images/illustration.svg';
import CustomGreenButton from '../CustomButton/CustomGreenButton';
import { useNavigation } from '@react-navigation/native';

const BackupSuccessful = (props) => {
  const { translations } = useContext(LocalizationContext);
  const BackupWallet = translations['BackupWallet'];
  const navigation = useNavigation();

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
          {props.title}
        </Text>
        <Text fontSize={RFValue(13)} color={'light.lightBlack'} fontFamily={'body'}>
          {props.subTitle}
        </Text>
      </Box>
      <Box alignItems={'center'} my={5}>
        <Illustration />
      </Box>
      <Box p={10}>
        <Text>{props.paragraph}</Text>
      </Box>
      <Box alignItems={'flex-end'} px={10} mb={5}>
        <CustomGreenButton
          onPress={() => {
            // props.confirmBtnPress();
            navigation.navigate('NewHome');
          }}
          value={BackupWallet.home}
        />
      </Box>
    </Box>
  );
};
export default BackupSuccessful;
