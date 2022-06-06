import React from 'react';
import { Box, Text, useColorMode } from 'native-base';
import Switch from '../../components/Switch/Switch';

const SettingsSwitchCard = (props) => {
  const { colorMode } = useColorMode();

  return (
    <Box
      bg={props.bgColor ? props.bgColor : `${colorMode}.white`}
      flexDirection={'row'}
      justifyContent={'space-evenly'}
      mx={7}
      p={3}
      borderRadius={10}
      {...props}
    >
      <Box flex={0.8}>
        <Text color={`${colorMode}.gray1`} fontFamily={'body'} fontWeight={'bold'} fontSize={13}>
          {props.title}
        </Text>
        <Text color={`${colorMode}.gray2`} fontFamily={'body'} fontSize={11}>
          {props.description}
        </Text>
      </Box>
      <Box flex={0.2} justifyContent={'center'} alignItems={'center'}>
        <Switch onValueChange={(value) => props.onSwitchToggle(value)} value={props.value} />
      </Box>
    </Box>
  );
};

export default SettingsSwitchCard;
