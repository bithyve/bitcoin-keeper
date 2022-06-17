import React from 'react';
import { Box, Text } from 'native-base';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { RFValue } from 'react-native-responsive-fontsize';
import CustomGreenButton from 'src/components/CustomButton/CustomGreenButton';

import Illustration from 'src/assets/images/illustration.svg';

const ResetPassSuccess = (props) => {
  function onPressProceed() {}

  return (
    <Box bg={'#F7F2EC'} p={10} borderRadius={10}>
      <TouchableOpacity onPress={() => props.closeBottomSheet()}>
        <Box
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
      <Text fontSize={RFValue(19)} color={'light.lightBlack'}>
        Reset Successful!
      </Text>
      <Text fontSize={RFValue(13)} color={'light.textColor2'}>
        Lorem ipsum dolor sit amet, consectetur eiusmod tempor
      </Text>
      <Box alignItems={'center'} my={10}>
        <Illustration />
      </Box>
      <Text fontSize={RFValue(13)} color={'light.textColor2'} my={5}>
        commodo consequat. Duis aute irure dolor in reprehenderit in
      </Text>
      <Box alignSelf={'flex-end'}>
        <CustomGreenButton
          onPress={() => props.closeBottomSheet()}
          value={'Login'}
          disabled={false}
        />
      </Box>
    </Box>
  );
};
export default ResetPassSuccess;
