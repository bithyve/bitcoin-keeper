import React from 'react';
import { Box, Text, useColorMode } from 'native-base';

const Note = (props) => {
  const { colorMode } = useColorMode();

  return (
    <Box bg={`${colorMode}.offWhite`} mx={7} p={3}>
      <Box opacity={1}>
        <Text fontSize={14} fontFamily={'body'} color={`${colorMode}.red1`}>
          {props.title}
        </Text>
      </Box>
      <Box>
        <Text fontSize={12} fontFamily={'body'} color={`${colorMode}.gray4`}>
          {props.subtitle}
        </Text>
      </Box>
    </Box>
  );
};

export default Note;
