import React from 'react';
import { Box, Text, useColorMode } from 'native-base';
import Switch from '../../components/Switch/Switch';

const CountryCard = (props) => {
  const { colorMode } = useColorMode();

  return (
    <Box
      bg={`${colorMode}.white`}
      flexDirection={'row'}
      justifyContent={'space-evenly'}
      mx={7}
      p={3}
      borderRadius={10}
      {...props}
    >
      <Box flex={0.8}>
        <Text color={'#00715B'} letterSpacing={1.12} fontFamily={'body'} fontWeight={200} fontSize={16}>
          {props.title}
        </Text>
        <Text color={'#4F5955'} fontFamily={'body'} letterSpacing={0.6} fontWeight={200} fontSize={12}>
          {props.description}
        </Text>
      </Box>
      <Box flex={0.2} justifyContent={'center'} alignItems={'center'}>
        <Switch onValueChange={(value) => props.onSwitchToggle(value)} value={props.value} />
      </Box>
    </Box>
  );
};

export default CountryCard;
