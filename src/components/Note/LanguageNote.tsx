import React from 'react';
import { Box, Text, useColorMode } from 'native-base';
import ArrowIcon from 'src/assets/images/icon_arrow.svg';

const LanguageNote = (props) => {
  const { colorMode } = useColorMode();

  return (
    <Box bg={`light.lightYellow`} mx={5} p={3}>
      <Box opacity={1}>
        <Text fontSize={14} fontFamily={'body'} color={`light.lightBlack`}>
          {props.title}
        </Text>
      </Box>
      <Box flexDirection={'row'}>
        <Text fontSize={12} width={80} fontFamily={'body'} color={`light.lightBlack`}>
          {props.subtitle}
        </Text>
        <ArrowIcon marginTop={5}/>
      </Box>
    </Box>
  );
};

export default LanguageNote;
