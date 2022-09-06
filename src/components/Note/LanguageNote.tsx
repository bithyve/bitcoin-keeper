import React from 'react';
import { Box, Text, useColorMode } from 'native-base';
import ArrowIcon from 'src/assets/images/icon_arrow.svg';
import { hp } from 'src/common/data/responsiveness/responsive';

const LanguageNote = (props) => {
  const { colorMode } = useColorMode();

  return (
    <Box bg={`light.lightYellow`} mx={5} p={3} height={hp(82)} justifyContent={'center'}>
      <Box opacity={1}>
        <Text
          fontSize={14}
          fontFamily={'body'}
          color={`light.lightBlack`}
          letterSpacing={1.12}
          fontWeight={200}
        >
          {props.title}
        </Text>
      </Box>
      <Box flexDirection={'row'}>
        <Text
          fontSize={12}
          width={80}
          fontWeight={200}
          fontFamily={'body'}
          color={`light.GreyText`}
          letterSpacing={0.6}
        >
          {props.subtitle}
        </Text>
        <ArrowIcon marginTop={5} />
      </Box>
    </Box >
  );
};

export default LanguageNote;
