import React from 'react';
import { Box, Text, useColorMode } from 'native-base';

const CountrySwitchCard = (props) => {
  const { colorMode } = useColorMode();
  return (
    <Box
      bg={`${colorMode}.backgroundColor2`}
      flexDirection={'row'}
      justifyContent={'space-evenly'}
      mx={7}
      p={3}
      borderRadius={10}
      {...props}
    >
      <Box flex={1.5}>
        <Text color={'#00715B'} fontFamily={'body'} fontWeight={200} letterSpacing={1.12} fontSize={14}>
          {props.title}
        </Text>
        <Text color={'#4F5955'} fontFamily={'body'} fontWeight={200} letterSpacing={0.6} fontSize={12}>
          {props.description}
        </Text>
      </Box>
    </Box>
  );
};

export default CountrySwitchCard;
