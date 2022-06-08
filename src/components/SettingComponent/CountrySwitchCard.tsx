import React from 'react';
import { Box, Text, Pressable, useColorMode } from 'native-base';
import LinkIcon from 'src/assets/icons/link.svg';
import RightArrowIcon from 'src/assets/icons/Wallets/icon_arrow.svg';

const CountrySwitchCard = (props) => {
  const { colorMode } = useColorMode();
  return (
    <Pressable onPress={() => props.onPress()}>
      <Box
        bg={props.bgColor ? props.bgColor : `${colorMode}.backgroundColor2`}
        flexDirection={'row'}
        justifyContent={'space-evenly'}
        mx={7}
        p={3}
        borderRadius={10}
        {...props}
      >
        <Box flex={1.5}>
          <Text color={'#00715B'} fontFamily={'body'} fontWeight={'bold'} fontSize={14}>
            {props.title}
          </Text>
          <Text color={'#4F5955'} fontFamily={'body'} fontSize={12}>
            {props.description}
          </Text>
        </Box>
      </Box>
    </Pressable>
  );
};

export default CountrySwitchCard;
