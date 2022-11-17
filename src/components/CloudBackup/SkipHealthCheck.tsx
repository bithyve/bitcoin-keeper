import React, { useContext } from 'react';
import { Box, Text } from 'native-base';
import { TouchableOpacity } from 'react-native';

import { RFValue } from 'react-native-responsive-fontsize';
import { LocalizationContext } from 'src/common/content/LocContext';
import Buttons from '../Buttons';

const SkipHealthCheck = (props) => {
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
          {BackupWallet.skipHealthCheckTitle}
        </Text>
        <Text fontSize={RFValue(13)} color={'light.lightBlack'} fontFamily={'body'}>
          {BackupWallet.skipHealthCheckSubTitle}
        </Text>
      </Box>
      <Box p={10}>
        <Text fontSize={RFValue(13)} color={'light.lightBlack'} fontFamily={'body'} mb={5} mt={10}>
          {BackupWallet.skipHealthCheckPara01}
        </Text>
        <Text fontSize={RFValue(13)} color={'light.lightBlack'} fontFamily={'body'}>
          {BackupWallet.skipHealthCheckPara02}
        </Text>
      </Box>
      <Buttons
        secondaryText={common.skip}
        secondaryCallback={() => {
          props.closeBottomSheet();
        }}
        primaryText={'Confirm Seeds'}
        primaryCallback={props.confirmBtnPress()}
      />
    </Box>
  );
};
export default SkipHealthCheck;
