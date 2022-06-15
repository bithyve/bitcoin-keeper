import React from 'react';
import { Box, Text, Pressable } from 'native-base';
import LinkIcon from 'src/assets/icons/link.svg';
import RightArrowIcon from 'src/assets/icons/Wallets/icon_arrow.svg';
import { RFValue } from 'react-native-responsive-fontsize';

const SettingsCard = (props) => {
  return (
    <Pressable onPress={() => props.onPress()}>
      <Box
        flexDirection={'row'}
        justifyContent={'space-evenly'}
        mx={7}
        p={3}
        borderRadius={10}
        {...props}
      >
        <Box flex={0.9}>
          <Text color={'#041513'} fontWeight={'bold'} fontSize={RFValue(14)} fontFamily={'body'}>
            {props.title}
          </Text>
          <Text color={'#4F5955'} fontFamily={'body'} fontSize={RFValue(12)}>
            {props.description}
          </Text>
        </Box>
        <Box flex={0.1} justifyContent={'center'} alignItems={'center'}>
          {props.icon ? <LinkIcon /> : <RightArrowIcon />}
        </Box>
      </Box>
    </Pressable>
  );
};

export default SettingsCard;
