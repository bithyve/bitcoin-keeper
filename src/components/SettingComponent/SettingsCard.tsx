import React from 'react';
import { Box, Text, Pressable, Image, useColorMode } from 'native-base';
import Icon from 'react-native-vector-icons/FontAwesome';
import LinkIcon from 'src/assets/icons/link.svg';

const SettingsCard = (props: any) => {
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
        <Box flex={0.9}>
          <Text color={`${colorMode}.gray1`} fontFamily={'body'} fontWeight={'bold'} fontSize={13}>
            {props.title}
          </Text>
          <Text color={`${colorMode}.gray2`} fontFamily={'body'} fontSize={11}>
            {props.description}
          </Text>
        </Box>
        <Box flex={0.1} justifyContent={'center'} alignItems={'center'}>
          {props.icon ? (
            <LinkIcon />
          ) : (
            <Icon name="chevron-right" size={15} color={`${colorMode}.gray2`} />
          )}
        </Box>
      </Box>
    </Pressable>
  );
};

export default SettingsCard;
